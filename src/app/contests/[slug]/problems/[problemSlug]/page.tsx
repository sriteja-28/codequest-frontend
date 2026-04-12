"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Allotment } from "allotment";
import {
  Maximize2, Minimize2, Play, Send, ChevronDown,
  ChevronUp, Sparkles, ArrowLeft, Bug,
} from "lucide-react";

import CodeEditor from "@/components/editor/CodeEditor";
import EditorToolbar from "@/components/problems/EditorToolbar";
import DescriptionTab from "@/components/problems/DescriptionTab";
import SolutionsTab from "@/components/problems/SolutionsTab";
import SubmissionsTab from "@/components/problems/SubmissionsTab";
import DiscussionsTab from "@/components/problems/DiscussionsTab";
import ConsolePanel from "@/components/problems/ConsolePanel";

import { useProblem, useSubmitCode, useSubmission, useRunCode, useContest } from "@/lib/hooks";
import { useQueryClient } from "@tanstack/react-query";
import { submissionWS } from "@/lib/ws";
import { cn } from "@/lib/utils";
import type { Language, SubmissionStatus } from "@/types";

export default function ContestProblemPage() {
  const { slug, problemSlug } = useParams<{ slug: string; problemSlug: string }>();

  const [language, setLanguage] = useState<Language>("python");
  const [code, setCode] = useState("");
  const [leftTab, setLeftTab] = useState<"description" | "solutions" | "submissions" | "discussions">("description");
  const [consoleTab, setConsoleTab] = useState<"testcase" | "result">("testcase");
  const [consoleOpen, setConsoleOpen] = useState(true);
  const [submissionId, setSubmissionId] = useState<string | null>(null);
  const [liveStatus, setLiveStatus] = useState<SubmissionStatus | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [fontSize, setFontSize] = useState(14);
  const [tabSize, setTabSize] = useState(4);
  const [keyBinding, setKeyBinding] = useState<"standard" | "vim">("standard");
  const [enableIntelliSense, setEnableIntelliSense] = useState(true);
  const [enableAutoComplete, setEnableAutoComplete] = useState(true);
  const [enableAIFeatures, setEnableAIFeatures] = useState(true);
  const [showCelebration, setShowCelebration] = useState(true);
  const [cursorLine, setCursorLine] = useState(1);
  const [cursorCol, setCursorCol] = useState(1);
  const [layoutKey, setLayoutKey] = useState(0);

  const { data: contest, isLoading: contestLoading } = useContest(slug);
  const { data: problem, isLoading: problemLoading } = useProblem(problemSlug);
  const submitMutation = useSubmitCode();
  const runMutation = useRunCode();
  const { data: submissionData } = useSubmission(submissionId ?? "", !!submissionId);
  const queryClient = useQueryClient();
  const saveTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const isLive = contest?.status === "live";
  const isEnded = contest?.status === "ended";

  // Load starter code — contest-scoped localStorage key
  useEffect(() => {
    if (!problem) return;
    const field = `starter_code_${language}` as keyof typeof problem;
    let starter = problem[field] as string | undefined;
    if (!starter?.trim()) {
      const fallbacks: Record<Language, string> = {
        python: `def solution():\n    pass\n`,
        cpp: `#include <bits/stdc++.h>\nusing namespace std;\nint main() {\n    return 0;\n}\n`,
        java: `public class Solution {\n    public void solve() {}\n}\n`,
        javascript: `function solution() {}\n`,
      };
      starter = fallbacks[language];
    }
    const saved = localStorage.getItem(`code:contest:${slug}:${problemSlug}:${language}`);
    setCode(saved ?? starter);
  }, [problemSlug, language, problem?.id]); // eslint-disable-line

  // Save code
  useEffect(() => {
    if (!problem || !code) return;
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      localStorage.setItem(`code:contest:${slug}:${problemSlug}:${language}`, code);
    }, 500);
    return () => clearTimeout(saveTimer.current);
  }, [code, slug, problemSlug, language, problem]);

  // WebSocket for submission status
  useEffect(() => {
    if (!submissionId) return;
    const ws = submissionWS(submissionId);
    ws.connect();
    const off = ws.on((msg) => {
      if (msg.type === "status_update") {
        const status = msg.status as SubmissionStatus;
        setLiveStatus(status);
        if (!["QUEUED", "RUNNING"].includes(status)) {
          queryClient.invalidateQueries({ queryKey: ["submission", submissionId] });
          queryClient.invalidateQueries({ queryKey: ["submissions", "history", problemSlug] });
          // Refresh contest data to update solved state on problems list
          queryClient.invalidateQueries({ queryKey: ["contest", slug] });
        }
      }
    });
    return () => { off(); ws.close(); };
  }, [submissionId, queryClient, problemSlug, slug]);

  // Fullscreen
  useEffect(() => {
    const fn = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", fn);
    return () => document.removeEventListener("fullscreenchange", fn);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen();
    else document.exitFullscreen();
  };

  const handleRun = async () => {
    setLiveStatus(null);
    setConsoleOpen(true);
    if (submissionId) queryClient.removeQueries({ queryKey: ["submission", submissionId] });
    setSubmissionId(null);
    try {
      const res = await runMutation.mutateAsync({ problem_slug: problemSlug, code, language });
      if (res.submission_id) {
        setSubmissionId(res.submission_id);
        setLiveStatus("QUEUED");
        setConsoleTab("result");
      }
    } catch (e) { console.error("Run failed:", e); }
  };

  const handleSubmit = async () => {
    // Block submission if contest ended
    if (isEnded) return;

    setConsoleTab("result");
    setConsoleOpen(true);
    setSubmissionId(null);
    setLiveStatus(null);
    if (submissionId) queryClient.removeQueries({ queryKey: ["submission", submissionId] });
    try {
      const res = await submitMutation.mutateAsync({
        problem_slug: problemSlug,
        code,
        language,
        contest: contest?.id,
      });
      setSubmissionId(res.submission_id);
      setLiveStatus("QUEUED");
    } catch (e) { console.error("Submit failed:", e); }
  };

  const handleResetCode = () => {
    if (!problem) return;
    const key = `starter_code_${language}` as keyof typeof problem;
    setCode((problem[key] as string | undefined) || "");
  };

  const handleResetLayout = () => {
    setFontSize(14); setTabSize(4); setKeyBinding("standard");
    setEnableIntelliSense(true); setEnableAutoComplete(true);
    setEnableAIFeatures(true); setShowCelebration(true);
    setConsoleOpen(true); setLeftTab("description"); setConsoleTab("testcase");
    setLayoutKey(p => p + 1);
  };

  const currentStatus = submissionData?.status ?? liveStatus;

  // Available tabs — solutions locked during live contest
  const tabs = ["description", "solutions", "submissions", "discussions"] as const;

  if (contestLoading || problemLoading) return (
    <div className="h-full min-h-screen bg-[#0a0a0a] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 border-2 border-[#333] border-t-blue-500 rounded-full animate-spin" />
        <span className="text-slate-500 text-sm font-mono">Loading workspace…</span>
      </div>
    </div>
  );

  if (!problem) return (
    <div className="h-full min-h-screen bg-[#0a0a0a] flex items-center justify-center text-slate-400">
      Problem not found.
    </div>
  );

  return (
    <div className="h-full flex flex-col bg-[#0a0a0a] text-slate-300 overflow-hidden">
      {!isFullscreen && (
        <header className="h-12 shrink-0 border-b border-[#1e1e1e] bg-[#141414] flex items-center justify-between px-4 z-30">
          <div className="flex items-center gap-3 text-sm min-w-0">
            <Link
              href={`/contests/${slug}`}
              className="flex items-center gap-1 text-slate-500 hover:text-slate-200 transition-colors shrink-0"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">{contest?.name ?? "Contest"}</span>
            </Link>
            <span className="text-[#2a2a2a] hidden sm:block">|</span>
            <span className="text-slate-200 font-semibold truncate">{problem.title}</span>
            {/* Ended badge */}
            {isEnded && (
              <span className="text-xs text-slate-500 bg-slate-800 border border-slate-700 px-2 py-0.5 rounded">
                Contest Ended
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Timer — only show during live */}
            {contest && isLive && <ContestTimer endAt={contest.end_at} />}
            <button className="flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs text-slate-500 hover:text-slate-200 hover:bg-[#252525] transition-colors">
              <Bug className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Report Bug</span>
            </button>
            <button onClick={toggleFullscreen} className="p-1.5 rounded text-slate-500 hover:text-slate-200 hover:bg-[#252525] transition-colors">
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>
        </header>
      )}

      <main className="flex-1 overflow-hidden">
        <Allotment key={layoutKey} defaultSizes={[40, 60]}>
          <Allotment.Pane minSize={280}>
            <div className="h-full flex flex-col bg-[#141414] border-r border-[#1e1e1e]">
              {/* Tabs */}
              <div className="flex shrink-0 border-b border-[#1e1e1e] bg-[#1a1a1a] overflow-x-auto">
                {tabs.map((t) => (
                  <button
                    key={t}
                    onClick={() => setLeftTab(t)}
                    className={cn(
                      "px-4 py-3 text-xs font-semibold capitalize border-b-2 transition-colors whitespace-nowrap relative",
                      leftTab === t
                        ? "text-white border-blue-500 bg-[#141414]"
                        : "text-slate-600 border-transparent hover:text-slate-300 hover:bg-[#1e1e1e]"
                    )}
                  >
                    {t}
                    {/* Lock icon on solutions during live */}
                    {t === "solutions" && isLive && (
                      <span className="ml-1 text-slate-600">🔒</span>
                    )}
                  </button>
                ))}
              </div>

              {/* Tab content */}
              <div className="flex-1 overflow-y-auto">
                {leftTab === "description" && <DescriptionTab problem={problem} />}

                {leftTab === "solutions" && isLive && (
                  <div className="flex flex-col items-center justify-center h-full gap-3 p-8 text-center">
                    <div className="text-5xl">🔒</div>
                    <p className="text-slate-300 font-semibold">Solutions are locked</p>
                    <p className="text-slate-500 text-sm">
                      Editorial and solutions unlock after the contest ends.
                    </p>
                  </div>
                )}
                {leftTab === "solutions" && !isLive && <SolutionsTab problem={problem} />}

                {leftTab === "submissions" && (
                  <SubmissionsTab problemSlug={problemSlug} problem={problem} />
                )}
                {leftTab === "discussions" && <DiscussionsTab problemSlug={problemSlug} />}
              </div>
            </div>
          </Allotment.Pane>

          <Allotment.Pane minSize={380}>
            <div className="h-full flex flex-col">
              <div className="flex-1 overflow-hidden">
                <Allotment vertical defaultSizes={consoleOpen ? [70, 30] : [100]} snap>
                  <Allotment.Pane minSize={120}>
                    <div className="h-full flex flex-col bg-[#1e1e1e]">
                      <EditorToolbar
                        language={language} onLanguageChange={setLanguage}
                        fontSize={fontSize} onFontSizeChange={setFontSize}
                        tabSize={tabSize} onTabSizeChange={setTabSize}
                        keyBinding={keyBinding} onKeyBindingChange={setKeyBinding}
                        enableIntelliSense={enableIntelliSense} onIntelliSenseChange={setEnableIntelliSense}
                        enableAutoComplete={enableAutoComplete} onAutoCompleteChange={setEnableAutoComplete}
                        enableAIFeatures={enableAIFeatures} onAIFeaturesChange={setEnableAIFeatures}
                        showCelebration={showCelebration} onCelebrationChange={setShowCelebration}
                        onResetCode={handleResetCode} onResetLayout={handleResetLayout}
                      />
                      <div className="flex-1 overflow-hidden relative">
                        <CodeEditor
                          value={code} language={language} onChange={setCode}
                          onCursorChange={(line, col) => { setCursorLine(line); setCursorCol(col); }}
                          fontSize={fontSize} tabSize={tabSize}
                          enableIntelliSense={enableIntelliSense}
                          enableAutoComplete={enableAutoComplete}
                        />
                        <div className="absolute bottom-2 right-3 text-[10px] text-slate-600 font-mono bg-[#1a1a1a] px-2 py-1 rounded border border-[#2a2a2a]">
                          Ln {cursorLine}, Col {cursorCol}
                        </div>
                      </div>
                    </div>
                  </Allotment.Pane>

                  {consoleOpen && (
                    <Allotment.Pane minSize={60} snap>
                      <ConsolePanel
                        problem={problem} activeTab={consoleTab}
                        onTabChange={setConsoleTab} onClose={() => setConsoleOpen(false)}
                        submissionData={submissionData} currentStatus={currentStatus}
                        isLoading={submitMutation.isPending || runMutation.isPending}
                      />
                    </Allotment.Pane>
                  )}
                </Allotment>
              </div>

              {/* Action bar */}
              <div className="h-12 shrink-0 border-t border-[#1e1e1e] flex items-center justify-between px-4 bg-[#141414] z-10">
                <button
                  onClick={() => setConsoleOpen(v => !v)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold border transition-colors",
                    consoleOpen
                      ? "bg-[#252525] border-[#333] text-slate-300 hover:bg-[#2e2e2e]"
                      : "bg-[#1a1a1a] border-[#252525] text-slate-500 hover:text-slate-300 hover:border-[#333]"
                  )}
                >
                  {consoleOpen
                    ? <><ChevronDown className="w-3 h-3" /> Console</>
                    : <><ChevronUp className="w-3 h-3" /> Console</>
                  }
                </button>

                <div className="flex items-center gap-2">
                  {enableAIFeatures && isLive && (
                    <button className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-purple-600/20 to-blue-600/20 hover:from-purple-600/30 hover:to-blue-600/30 border border-purple-500/30 text-purple-300 rounded text-xs font-semibold transition-colors">
                      <Sparkles className="w-3 h-3" /> Hint
                    </button>
                  )}

                  <button
                    onClick={handleRun}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#252525] hover:bg-[#2e2e2e] border border-[#333] text-slate-300 rounded text-xs font-semibold transition-colors"
                  >
                    <Play className="w-3 h-3 fill-current" /> Run
                  </button>

                  {/* Submit blocked after contest ends */}
                  {isEnded ? (
                    <div className="flex items-center gap-1.5 px-5 py-1.5 bg-[#1a1a1a] border border-[#333] text-slate-600 rounded text-xs font-bold cursor-not-allowed">
                      Contest Ended
                    </div>
                  ) : (
                    <button
                      onClick={handleSubmit}
                      disabled={submitMutation.isPending}
                      className="flex items-center gap-1.5 px-5 py-1.5 bg-green-600 hover:bg-green-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded text-xs font-bold transition-colors shadow shadow-green-900/30"
                    >
                      <Send className="w-3 h-3" />
                      {submitMutation.isPending ? "Submitting…" : "Submit"}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </Allotment.Pane>
        </Allotment>
      </main>
    </div>
  );
}

// Countdown timer
function ContestTimer({ endAt }: { endAt: string }) {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    const update = () => {
      const diff = new Date(endAt).getTime() - Date.now();
      if (diff <= 0) { setTimeLeft("Ended"); return; }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTimeLeft(`${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`);
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [endAt]);

  const isLow = new Date(endAt).getTime() - Date.now() < 5 * 60 * 1000;

  return (
    <div className={cn(
      "px-3 py-1 rounded font-mono text-xs font-bold border",
      isLow
        ? "text-red-400 border-red-500/30 bg-red-500/10 animate-pulse"
        : "text-slate-400 border-[#333] bg-[#1a1a1a]"
    )}>
      ⏱ {timeLeft}
    </div>
  );
}