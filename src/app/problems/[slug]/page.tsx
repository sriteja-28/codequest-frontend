"use client";

import { useState, useEffect, use, useRef } from "react";
import { Allotment } from "allotment";
import {
  ChevronLeft, Bug, Maximize2, Minimize2, Play, Send, ChevronDown,
  ChevronUp, Sparkles, AlertCircle, Clock, Zap, Server, ChevronRight
} from "lucide-react";

import CodeEditor from "@/components/editor/CodeEditor";
import EditorToolbar from "@/components/problems/EditorToolbar";
import DescriptionTab from "@/components/problems/DescriptionTab";
import SolutionsTab from "@/components/problems/SolutionsTab";
import SubmissionsTab from "@/components/problems/SubmissionsTab";
import DiscussionsTab from "@/components/problems/DiscussionsTab";
import ConsolePanel from "@/components/problems/ConsolePanel";

import { useProblem, useSubmitCode, useSubmission, useRunCode, useAuth } from "@/lib/hooks";
import { useQueryClient } from "@tanstack/react-query";
import { submissionWS } from "@/lib/ws";
import { cn } from "@/lib/utils";
import type { Language, SubmissionStatus } from "@/types";
import { useRouter } from "next/navigation";

export default function ProblemDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const router = useRouter();
  const { user } = useAuth();

  // State management
  const [language, setLanguage] = useState<Language>("python");
  const [code, setCode] = useState("");
  const [leftTab, setLeftTab] = useState<"description" | "solutions" | "submissions" | "discussions">("description");
  const [consoleTab, setConsoleTab] = useState<"testcase" | "result">("testcase");
  const [consoleOpen, setConsoleOpen] = useState(true);
  const [submissionId, setSubmissionId] = useState<string | null>(null);
  const [liveStatus, setLiveStatus] = useState<SubmissionStatus | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // ✅ Rate limiting state
  const [rateLimitError, setRateLimitError] = useState<string | null>(null);
  const [queueError, setQueueError] = useState<{
    message: string;
    queueDepth: number;
    estimatedWait: number;
  } | null>(null);
  const [countdown, setCountdown] = useState(0);

  // Editor settings
  const [fontSize, setFontSize] = useState(14);
  const [tabSize, setTabSize] = useState(4);
  const [keyBinding, setKeyBinding] = useState<"standard" | "vim">("standard");
  const [enableIntelliSense, setEnableIntelliSense] = useState(true);
  const [enableAutoComplete, setEnableAutoComplete] = useState(true);
  const [enableAIFeatures, setEnableAIFeatures] = useState(true);
  const [showCelebration, setShowCelebration] = useState(true);

  // Cursor position tracking
  const [cursorLine, setCursorLine] = useState(1);
  const [cursorCol, setCursorCol] = useState(1);

  // Layout reset refs
  const [layoutKey, setLayoutKey] = useState(0);

  // API hooks
  const { data: problem, isLoading } = useProblem(slug);
  const submitMutation = useSubmitCode();
  const runMutation = useRunCode();
  const { data: submissionData } = useSubmission(submissionId ?? "", !!submissionId);
  const queryClient = useQueryClient();

  // Load starter code when problem or language changes
  useEffect(() => {
    if (!problem) return;

    const starterCodeField = `starter_code_${language}` as keyof typeof problem;
    let starterCode = problem[starterCodeField] as string | undefined;

    if (!starterCode || starterCode.trim() === "") {
      const fallbacks: Record<Language, string> = {
        python: `def solution():\n    pass\n`,
        cpp: `#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    return 0;\n}\n`,
        java: `public class Solution {\n    public void solve() {}\n}\n`,
        javascript: `function solution() {}\n`,
      };
      starterCode = fallbacks[language];
    }

    // Check localStorage FIRST, fall back to starter
    const saved = localStorage.getItem(`code:${slug}:${language}`);
    setCode(saved ?? starterCode);

  }, [slug, language, problem?.id]);

  // Save code on every keystroke (debounced)
  const saveTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => {
    if (!problem) return;
    if (!code) return;

    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      localStorage.setItem(`code:${slug}:${language}`, code);
    }, 500);
    return () => clearTimeout(saveTimer.current);
  }, [code, slug, language, problem]);

  // ✅ Countdown timer for rate limits
  useEffect(() => {
    if (countdown <= 0) {
      setRateLimitError(null);
      return;
    }

    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          setRateLimitError(null);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [countdown]);

  // WebSocket for live submission status
  useEffect(() => {
    if (!submissionId) return;
    const ws = submissionWS(submissionId);
    ws.connect();
    const off = ws.on((msg) => {
      if (msg.type === "status_update") {
        const status = msg.status as SubmissionStatus;
        setLiveStatus(status);
        const terminal = !["QUEUED", "RUNNING"].includes(status);
        if (terminal) {
          queryClient.invalidateQueries({ queryKey: ["submission", submissionId] });
          queryClient.invalidateQueries({ queryKey: ["submissions", "history", slug] });


          // refresh problems list so is_solved updates everywhere
          if (status === "ACCEPTED") {
            queryClient.invalidateQueries({ queryKey: ["problems"] });  // all problems queries
            queryClient.invalidateQueries({ queryKey: ["me"] });        // update problems_solved count
          }
        }
      }
    });
    return () => { off(); ws.close(); };
  }, [submissionId, queryClient, slug]);

  // Fullscreen toggle
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  // ✅ Handle Run with rate limiting
  const handleRun = async () => {
    setLiveStatus(null);
    setConsoleOpen(true);
    setConsoleTab("testcase");
    setRateLimitError(null);
    setQueueError(null);

    if (submissionId) {
      queryClient.removeQueries({ queryKey: ["submission", submissionId] });
    }
    setSubmissionId(null);

    try {
      const res = await runMutation.mutateAsync({
        problem_slug: slug,
        code,
        language
      });

      if (res.submission_id) {
        setSubmissionId(res.submission_id);
        setLiveStatus("QUEUED");
        setConsoleTab("result");
      }
    } catch (error: any) {
      console.error("Run code failed:", error);

      // ✅ Handle rate limit (429)
      if (error.response?.status === 429) {
        const retryAfter = parseInt(error.response.headers['retry-after'] || '60');
        const detail = error.response.data?.detail || 'Rate limit exceeded for Run';
        setRateLimitError(detail);
        setCountdown(retryAfter);
      }
      // ✅ Handle queue overload (503)
      else if (error.response?.status === 503) {
        const data = error.response.data;
        setQueueError({
          message: data.error || 'Judge system overloaded',
          queueDepth: data.queue_depth || 0,
          estimatedWait: data.estimated_wait_seconds || 0,
        });
      }
    }
  };

  // ✅ Handle Submit with rate limiting
  const handleSubmit = async () => {
    setConsoleTab("result");
    setConsoleOpen(true);
    setSubmissionId(null);
    setLiveStatus(null);
    setRateLimitError(null);
    setQueueError(null);

    if (submissionId) {
      queryClient.removeQueries({ queryKey: ["submission", submissionId] });
    }

    try {
      const res = await submitMutation.mutateAsync({
        problem_slug: slug,
        code,
        language,
      });

      setSubmissionId(res.submission_id);
      setLiveStatus("QUEUED");
    } catch (error: any) {
      console.error("Submission failed:", error);

      // ✅ Handle rate limit (429)
      if (error.response?.status === 429) {
        const retryAfter = parseInt(error.response.headers['retry-after'] || '60');
        const detail = error.response.data?.detail || 'Submission limit reached';
        setRateLimitError(detail);
        setCountdown(retryAfter);
      }
      // ✅ Handle queue overload (503)
      else if (error.response?.status === 503) {
        const data = error.response.data;
        setQueueError({
          message: data.error || 'Judge system overloaded',
          queueDepth: data.queue_depth || 0,
          estimatedWait: data.estimated_wait_seconds || 0,
        });
      }
    }
  };

  const handleResetCode = () => {
    if (!problem) return;
    const key = `starter_code_${language}` as keyof typeof problem;
    setCode((problem[key] as string | undefined) || `class Solution {\n    // Write your solution here\n}`);
  };

  const handleResetLayout = () => {
    setFontSize(14);
    setTabSize(4);
    setKeyBinding("standard");
    setEnableIntelliSense(true);
    setEnableAutoComplete(true);
    setEnableAIFeatures(true);
    setShowCelebration(true);
    setConsoleOpen(true);
    setLeftTab("description");
    setConsoleTab("testcase");
    setLayoutKey(prev => prev + 1);
  };

  const currentStatus = (() => {
    if (submissionData?.status) return submissionData.status;
    return liveStatus;
  })();

  // Loading state
  if (isLoading) {
    return (
      <div className="h-full min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-[#333] border-t-blue-500 rounded-full animate-spin" />
          <span className="text-slate-500 text-sm font-mono">Loading workspace…</span>
        </div>
      </div>
    );
  }

  if (!problem) {
    return (
      <div className="h-full min-h-screen bg-[#0a0a0a] flex items-center justify-center text-slate-400">
        Problem not found.
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-[#0a0a0a] text-slate-300 overflow-hidden">
      {/* Top bar */}
      {!isFullscreen && (
        <header className="h-12 shrink-0 border-b border-[#1e1e1e] bg-[#141414] flex items-center justify-between px-4 z-30">

          <div className="flex items-center gap-3 text-sm min-w-0">
            <a
              href="/problems"
              className="flex items-center gap-1 text-slate-500 hover:text-slate-200 transition-colors shrink-0"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Problems</span>
            </a>
            <span className="text-[#2a2a2a] hidden sm:block">|</span>
            <span className="text-slate-200 font-semibold truncate">{problem.title}</span>


            <div className="flex items-center gap-1 ml-2 shrink-0">
              <button
                onClick={() => problem.prev_slug && router.push(`/problems/${problem.prev_slug}`)}
                disabled={!problem.prev_slug}
                title={problem.prev_slug ? "Previous problem" : "No previous problem"}
                className={cn(
                  "w-6 h-6 flex items-center justify-center rounded border transition-colors",
                  problem.prev_slug
                    ? "border-[#2a2a2a] text-slate-400 hover:text-white hover:border-[#444] hover:bg-[#252525]"
                    : "border-[#1e1e1e] text-slate-700 cursor-not-allowed"
                )}
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => problem.next_slug && router.push(`/problems/${problem.next_slug}`)}
                disabled={!problem.next_slug}
                title={problem.next_slug ? "Next problem" : "No next problem"}
                className={cn(
                  "w-6 h-6 flex items-center justify-center rounded border transition-colors",
                  problem.next_slug
                    ? "border-[#2a2a2a] text-slate-400 hover:text-white hover:border-[#444] hover:bg-[#252525]"
                    : "border-[#1e1e1e] text-slate-700 cursor-not-allowed"
                )}
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs text-slate-500 
                         hover:text-slate-200 hover:bg-[#252525] transition-colors"
              title="Report bug"
            >
              <Bug className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Report Bug</span>
            </button>

            <button
              onClick={toggleFullscreen}
              className="p-1.5 rounded text-slate-500 hover:text-slate-200 hover:bg-[#252525] transition-colors"
              title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>
        </header>
      )
      }

      {/* Main content */}
      <main className="flex-1 overflow-hidden">
        <Allotment key={layoutKey} defaultSizes={[40, 60]}>
          {/* LEFT PANE */}
          <Allotment.Pane minSize={280}>
            <div className="h-full flex flex-col bg-[#141414] border-r border-[#1e1e1e]">
              <div className="flex shrink-0 border-b border-[#1e1e1e] bg-[#1a1a1a] overflow-x-auto">
                {(["description", "solutions", "submissions", "discussions"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setLeftTab(t)}
                    className={cn(
                      "px-4 py-3 text-xs font-semibold capitalize border-b-2 transition-colors whitespace-nowrap",
                      leftTab === t
                        ? "text-white border-blue-500 bg-[#141414]"
                        : "text-slate-600 border-transparent hover:text-slate-300 hover:bg-[#1e1e1e]"
                    )}
                  >
                    {t}
                  </button>
                ))}
              </div>

              <div className="flex-1 overflow-y-auto">
                {leftTab === "description" && <DescriptionTab problem={problem} />}
                {leftTab === "solutions" && <SolutionsTab problem={problem} />}
                {leftTab === "submissions" && <SubmissionsTab problemSlug={slug} problem={problem} />}
                {leftTab === "discussions" && <DiscussionsTab problemSlug={slug} />}
              </div>
            </div>
          </Allotment.Pane>

          {/* RIGHT PANE */}
          <Allotment.Pane minSize={380}>
            <div className="h-full flex flex-col">
              <div className="flex-1 overflow-hidden">
                <Allotment vertical defaultSizes={consoleOpen ? [70, 30] : [100]} snap>
                  {/* Editor */}
                  <Allotment.Pane minSize={120}>
                    <div className="h-full flex flex-col bg-[#1e1e1e]">
                      <EditorToolbar
                        language={language}
                        onLanguageChange={setLanguage}
                        fontSize={fontSize}
                        onFontSizeChange={setFontSize}
                        tabSize={tabSize}
                        onTabSizeChange={setTabSize}
                        keyBinding={keyBinding}
                        onKeyBindingChange={setKeyBinding}
                        enableIntelliSense={enableIntelliSense}
                        onIntelliSenseChange={setEnableIntelliSense}
                        enableAutoComplete={enableAutoComplete}
                        onAutoCompleteChange={setEnableAutoComplete}
                        enableAIFeatures={enableAIFeatures}
                        onAIFeaturesChange={setEnableAIFeatures}
                        showCelebration={showCelebration}
                        onCelebrationChange={setShowCelebration}
                        onResetCode={handleResetCode}
                        onResetLayout={handleResetLayout}
                      />

                      {/* ✅ Error Banners */}
                      <div className="px-4 pt-3 space-y-2">
                        {/* Rate Limit Error */}
                        {rateLimitError && (
                          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
                            <div className="flex items-start gap-2">
                              <AlertCircle className="w-4 h-4 text-yellow-400 shrink-0 mt-0.5" />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-yellow-300">{rateLimitError}</p>
                                {countdown > 0 && (
                                  <p className="text-xs text-yellow-400/80 flex items-center gap-1.5 mt-1">
                                    <Clock className="w-3 h-3" />
                                    Try again in {countdown} second{countdown !== 1 ? 's' : ''}
                                  </p>
                                )}

                                {!user?.is_pro && (
                                  <button
                                    onClick={() => router.push('/upgrade')}
                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-blue-600 to-purple-600 
                                               hover:from-blue-500 hover:to-purple-500 text-white text-xs font-semibold 
                                               rounded-lg transition-all mt-2"
                                  >
                                    <Zap className="w-3 h-3" />
                                    Upgrade to PRO for 10x more runs
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Queue Overload Error */}
                        {queueError && (
                          <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-3">
                            <div className="flex items-start gap-2">
                              <Server className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-orange-300">{queueError.message}</p>
                                <p className="text-xs text-orange-400/80 mt-1">
                                  {queueError.queueDepth} submissions in queue ·
                                  Est. wait: {Math.ceil(queueError.estimatedWait / 60)} min
                                </p>
                                <p className="text-xs text-slate-400 mt-2">
                                  Try using the <span className="font-semibold text-orange-300">Run</span> button
                                  to test against sample cases, or wait a few minutes.
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex-1 overflow-hidden relative">
                        <CodeEditor
                          value={code}
                          language={language}
                          onChange={setCode}
                          onCursorChange={(line, col) => {
                            setCursorLine(line);
                            setCursorCol(col);
                          }}
                          fontSize={fontSize}
                          tabSize={tabSize}
                          enableIntelliSense={enableIntelliSense}
                          enableAutoComplete={enableAutoComplete}
                        />

                        <div className="absolute bottom-2 right-3 text-[10px] text-slate-600 font-mono 
                                        bg-[#1a1a1a] px-2 py-1 rounded border border-[#2a2a2a]">
                          Ln {cursorLine}, Col {cursorCol}
                        </div>
                      </div>
                    </div>
                  </Allotment.Pane>

                  {/* Console */}
                  {consoleOpen && (
                    <Allotment.Pane minSize={60} snap>
                      <ConsolePanel
                        problem={problem}
                        activeTab={consoleTab}
                        onTabChange={setConsoleTab}
                        onClose={() => setConsoleOpen(false)}
                        submissionData={submissionData}
                        currentStatus={currentStatus}
                        isLoading={submitMutation.isPending || runMutation.isPending}
                      />
                    </Allotment.Pane>
                  )}
                </Allotment>
              </div>

              {/* Action bar */}
              <div className="h-12 shrink-0 border-t border-[#1e1e1e] flex items-center justify-between px-4 bg-[#141414] z-10">
                <button
                  onClick={() => setConsoleOpen((v) => !v)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold border transition-colors",
                    consoleOpen
                      ? "bg-[#252525] border-[#333] text-slate-300 hover:bg-[#2e2e2e]"
                      : "bg-[#1a1a1a] border-[#252525] text-slate-500 hover:text-slate-300 hover:border-[#333]"
                  )}
                >
                  {consoleOpen ? (
                    <>
                      <ChevronDown className="w-3 h-3" /> Console
                    </>
                  ) : (
                    <>
                      <ChevronUp className="w-3 h-3" /> Console
                    </>
                  )}
                </button>

                <div className="flex items-center gap-2">
                  {enableAIFeatures && (
                    <button
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-purple-600/20 to-blue-600/20 
                                 hover:from-purple-600/30 hover:to-blue-600/30 border border-purple-500/30
                                 text-purple-300 rounded text-xs font-semibold transition-colors"
                    >
                      <Sparkles className="w-3 h-3" />
                      Hint
                    </button>
                  )}

                  {/* ✅ Run button with countdown */}
                  <button
                    onClick={handleRun}
                    disabled={runMutation.isPending || countdown > 0}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold border transition-colors",
                      countdown > 0 || runMutation.isPending
                        ? "bg-[#1a1a1a] border-[#252525] text-slate-600 cursor-not-allowed"
                        : "bg-[#252525] hover:bg-[#2e2e2e] border-[#333] text-slate-300"
                    )}
                  >
                    <Play className="w-3 h-3 fill-current" />
                    {countdown > 0 ? `Wait ${countdown}s` : runMutation.isPending ? 'Running…' : 'Run'}
                  </button>

                  {/* ✅ Submit button with countdown */}
                  <button
                    onClick={handleSubmit}
                    disabled={submitMutation.isPending || countdown > 0}
                    className={cn(
                      "flex items-center gap-1.5 px-5 py-1.5 rounded text-xs font-bold transition-colors shadow",
                      countdown > 0 || submitMutation.isPending
                        ? "bg-slate-600 text-slate-400 cursor-not-allowed shadow-none"
                        : "bg-green-600 hover:bg-green-500 text-white shadow-green-900/30"
                    )}
                  >
                    <Send className="w-3 h-3" />
                    {countdown > 0 ? `Wait ${countdown}s` : submitMutation.isPending ? 'Submitting…' : 'Submit'}
                  </button>
                </div>
              </div>
            </div>
          </Allotment.Pane>
        </Allotment>
      </main>
    </div >
  );
}