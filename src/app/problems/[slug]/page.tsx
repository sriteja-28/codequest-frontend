"use client";

import { useState, useEffect, use, useRef } from "react";
import Editor from "@monaco-editor/react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

/**
 * allotment — written by a VS Code contributor to port VS Code's
 * SplitView to React. Gives the exact same panel drag-resize feel.
 * No prop confusion: just `vertical` boolean, no "direction" vs "orientation".
 *
 * npm install allotment
 * import "allotment/dist/style.css"  ← required, add to globals.css or layout
 */
import { Allotment } from "allotment";

import {
  Play, Send, Clock, Terminal, Database,
  ChevronRight, RotateCcw, CheckCircle2, XCircle,
  Zap, Info, ChevronLeft, ChevronDown, ChevronUp,
  Building2, Tag as TagIcon,
} from "lucide-react";

import { useProblem, useSubmitCode, useSubmissionHistory, useSubmission } from "@/lib/hooks";
import { submissionWS } from "@/lib/ws";
import { statusColor, formatRuntime, formatMemory, statusLabel, cn } from "@/lib/utils";
import type { Submission, SubmissionStatus, Language } from "@/types";

// ─── Constants ───────────────────────────────────────────────────────────────

const MONACO_LANG: Record<Language, string> = {
  python: "python", cpp: "cpp", java: "java", javascript: "javascript",
};
const LANG_LABELS: Record<Language, string> = {
  python: "Python 3", cpp: "C++ 17", java: "Java 17", javascript: "JavaScript",
};
const FALLBACK_STARTER: Record<Language, string> = {
  python:     `import sys\n\ndef solution():\n    # Write your solution here\n    pass\n\nif __name__ == "__main__":\n    data = sys.stdin.read().strip()\n    print(solution())\n`,
  cpp:        `#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    // Write your solution here\n    return 0;\n}\n`,
  java:       `import java.util.*;\n\npublic class Solution {\n    public static void main(String[] args) {\n        // Write your solution here\n    }\n}\n`,
  javascript: `process.stdin.resume();\nprocess.stdin.setEncoding("utf8");\nlet _in = "";\nprocess.stdin.on("data", d => _in += d);\nprocess.stdin.on("end", () => {\n    // Write your solution here\n});\n`,
};

// ─── Component ───────────────────────────────────────────────────────────────

export default function ProblemDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);

  const [language,      setLanguage]      = useState<Language>("python");
  const [code,          setCode]          = useState("");
  const [activeTab,     setActiveTab]     = useState<"description" | "submissions">("description");
  const [consoleTab,    setConsoleTab]    = useState<"testcase" | "result">("testcase");
  const [consoleOpen,   setConsoleOpen]   = useState(true);
  const [showTopics,    setShowTopics]    = useState(false);
  const [showCompanies, setShowCompanies] = useState(false);
  const [submissionId,  setSubmissionId]  = useState<string | null>(null);
  const [liveStatus,    setLiveStatus]    = useState<SubmissionStatus | null>(null);

  const topicsRef    = useRef<HTMLDivElement>(null);
  const companiesRef = useRef<HTMLDivElement>(null);

  const { data: problem, isLoading } = useProblem(slug);
  const { data: history }            = useSubmissionHistory(slug);
  const submitMutation               = useSubmitCode();
  const { data: submissionData }     = useSubmission(submissionId ?? "", !!submissionId);

  // Close tag popovers on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (topicsRef.current    && !topicsRef.current.contains(e.target as Node))    setShowTopics(false);
      if (companiesRef.current && !companiesRef.current.contains(e.target as Node)) setShowCompanies(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Seed editor with per-language starter code
  useEffect(() => {
    if (!problem) return;
    const key     = `starter_code_${language}` as keyof typeof problem;
    const starter = (problem[key] as string | undefined) || FALLBACK_STARTER[language];
    setCode(starter);
  }, [problem?.slug, language]); // eslint-disable-line react-hooks/exhaustive-deps

  // WebSocket live status
  useEffect(() => {
    if (!submissionId) return;
    const ws  = submissionWS(submissionId);
    ws.connect();
    const off = ws.on((msg) => {
      if (msg.type === "status_update") setLiveStatus(msg.status as SubmissionStatus);
    });
    return () => { off(); ws.close(); };
  }, [submissionId]);

  const handleSubmit = async () => {
    setConsoleTab("result");
    setConsoleOpen(true);
    setSubmissionId(null);
    setLiveStatus(null);
    try {
      const res = await submitMutation.mutateAsync({ problem_slug: slug, code, language });
      setSubmissionId(res.submission_id);
      setLiveStatus("QUEUED");
    } catch {}
  };

  const currentStatus = liveStatus ?? submissionData?.status ?? null;
  const isTerminal    = !!currentStatus && !["QUEUED", "RUNNING"].includes(currentStatus);

  // ── Loading states ─────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-[#333] border-t-blue-500 rounded-full animate-spin" />
          <span className="text-slate-500 text-sm font-mono">Loading workspace…</span>
        </div>
      </div>
    );
  }
  if (!problem) {
    return (
      <div className="h-screen bg-[#0a0a0a] flex items-center justify-center text-slate-400">
        Problem not found.
      </div>
    );
  }

  const topicTags   = problem.tags?.filter((t) => t.tag_type === "TOPIC")   ?? [];
  const companyTags = problem.tags?.filter((t) => t.tag_type === "COMPANY") ?? [];

  // ── Main render ───────────────────────────────────────────────────────────
  return (
    <div className="h-screen flex flex-col bg-[#0a0a0a] text-slate-300 overflow-hidden">

      {/* ── Top bar ─────────────────────────────────────────────────────── */}
      <header className="h-11 shrink-0 border-b border-[#1e1e1e] bg-[#141414]
                         flex items-center justify-between px-4 z-20">
        <div className="flex items-center gap-3 text-sm min-w-0">
          <a href="/problems"
            className="flex items-center gap-1 text-slate-500 hover:text-slate-200 transition-colors shrink-0">
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Problems</span>
          </a>
          <span className="text-[#2a2a2a] hidden sm:block">|</span>
          <span className="text-slate-200 font-medium truncate">{problem.title}</span>
        </div>
        <button
          onClick={() => {
            const key = `starter_code_${language}` as keyof typeof problem;
            setCode((problem[key] as string | undefined) || FALLBACK_STARTER[language]);
          }}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded text-xs
                     text-slate-500 hover:text-slate-200 hover:bg-[#252525] transition-colors shrink-0"
          title="Reset to starter code"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Reset</span>
        </button>
      </header>

      {/* ── Main horizontal split ────────────────────────────────────────── */}
      <main className="flex-1 overflow-hidden">
        {/*
         * Allotment: no "direction" or "orientation" prop needed.
         * Horizontal by default. `defaultSizes` = percentages, must sum to 100.
         * The drag handle appears automatically between panes — no separate
         * handle component needed. Style via CSS var --separator-border.
         */}
        <Allotment defaultSizes={[40, 60]}>

          {/* ──── LEFT PANE: Problem description (40%) ─────────────────── */}
          <Allotment.Pane minSize={260}>
            <div className="h-full flex flex-col bg-[#141414] border-r border-[#1e1e1e]">

              {/* Tabs */}
              <div className="flex shrink-0 border-b border-[#1e1e1e]">
                {(["description", "submissions"] as const).map((t) => (
                  <button key={t} onClick={() => setActiveTab(t)}
                    className={cn(
                      "px-5 py-2.5 text-xs font-semibold capitalize border-b-2 transition-colors",
                      activeTab === t
                        ? "text-white border-blue-500"
                        : "text-slate-600 border-transparent hover:text-slate-300 hover:bg-[#1a1a1a]"
                    )}>
                    {t}
                  </button>
                ))}
              </div>

              <div className="flex-1 overflow-y-auto">
                {activeTab === "description" ? (
                  <div className="p-5 space-y-5">

                    {/* Title */}
                    <div>
                      <h1 className="text-xl font-bold text-white mb-3 leading-tight">
                        {problem.title}
                      </h1>

                      {/* NeetCode-style tag row: Easy · Topics ▾ · Company Tags ▾ */}
                      <div className="flex items-center gap-2 flex-wrap">

                        {/* Difficulty pill */}
                        <span className={cn(
                          "text-xs font-bold px-2.5 py-1 rounded-full cursor-default",
                          problem.difficulty === "EASY"   && "bg-green-500/10 text-green-400",
                          problem.difficulty === "MEDIUM" && "bg-yellow-500/10 text-yellow-400",
                          problem.difficulty === "HARD"   && "bg-red-500/10 text-red-400",
                        )}>
                          {problem.difficulty[0] + problem.difficulty.slice(1).toLowerCase()}
                        </span>

                        {/* Topics dropdown */}
                        {topicTags.length > 0 && (
                          <div className="relative" ref={topicsRef}>
                            <button
                              onClick={() => { setShowTopics(v => !v); setShowCompanies(false); }}
                              className={cn(
                                "flex items-center gap-1.5 px-2.5 py-1 rounded-full",
                                "text-xs font-semibold border transition-colors",
                                showTopics
                                  ? "bg-[#2a2a2a] border-[#444] text-slate-200"
                                  : "bg-[#1e1e1e] border-[#2a2a2a] text-slate-400 hover:border-[#444] hover:text-slate-200"
                              )}>
                              <TagIcon className="w-3 h-3" />
                              Topics
                              <ChevronDown className={cn("w-3 h-3 transition-transform", showTopics && "rotate-180")} />
                            </button>

                            {showTopics && (
                              <div className="absolute top-full left-0 mt-1.5 z-50
                                              bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl
                                              shadow-2xl shadow-black/60 p-3 min-w-[200px]">
                                <p className="text-[9px] text-slate-600 uppercase font-bold tracking-wider mb-2.5">
                                  Topics
                                </p>
                                <div className="flex flex-wrap gap-1.5">
                                  {topicTags.map((t) => (
                                    <span key={t.id}
                                      className="text-[11px] px-2.5 py-1 rounded-full
                                                 bg-[#252525] text-slate-300 border border-[#333]">
                                      {t.name}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Company Tags dropdown */}
                        {companyTags.length > 0 && (
                          <div className="relative" ref={companiesRef}>
                            <button
                              onClick={() => { setShowCompanies(v => !v); setShowTopics(false); }}
                              className={cn(
                                "flex items-center gap-1.5 px-2.5 py-1 rounded-full",
                                "text-xs font-semibold border transition-colors",
                                showCompanies
                                  ? "bg-[#2a2a2a] border-[#444] text-slate-200"
                                  : "bg-[#1e1e1e] border-[#2a2a2a] text-slate-400 hover:border-[#444] hover:text-slate-200"
                              )}>
                              <Building2 className="w-3 h-3" />
                              Company Tags
                              <ChevronDown className={cn("w-3 h-3 transition-transform", showCompanies && "rotate-180")} />
                            </button>

                            {showCompanies && (
                              <div className="absolute top-full left-0 mt-1.5 z-50
                                              bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl
                                              shadow-2xl shadow-black/60 p-3 min-w-[220px]">
                                <p className="text-[9px] text-slate-600 uppercase font-bold tracking-wider mb-2.5">
                                  Companies
                                </p>
                                <div className="flex flex-wrap gap-1.5">
                                  {companyTags.map((t) => (
                                    <span key={t.id}
                                      className="text-[11px] px-2.5 py-1 rounded-full
                                                 bg-blue-500/10 text-blue-300 border border-blue-500/20">
                                      {t.name}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {problem.number && (
                          <span className="text-[10px] text-slate-700 font-mono ml-auto shrink-0">
                            #{problem.number}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Problem statement */}
                    <div className="
                      prose prose-invert prose-sm max-w-none
                      prose-p:text-slate-300 prose-p:leading-relaxed
                      prose-strong:text-white
                      prose-code:text-blue-300 prose-code:bg-[#1e2030]
                      prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-[11px]
                      prose-code:before:content-none prose-code:after:content-none
                      prose-pre:bg-[#1a1a2e] prose-pre:border prose-pre:border-[#2a2a3a]
                      prose-pre:text-slate-300 prose-pre:text-[11px] prose-pre:leading-relaxed
                      prose-ul:text-slate-300 prose-ol:text-slate-300 prose-li:text-slate-300
                      prose-h2:text-slate-200 prose-h2:text-base prose-h2:font-bold prose-h2:mt-5
                    ">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {problem.statement_md ?? ""}
                      </ReactMarkdown>
                    </div>

                    {/* Complexity */}
                    {(problem.time_complexity_average || problem.space_complexity) && (
                      <div className="border-t border-[#1e1e1e] pt-4 space-y-3">
                        <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                          <Zap className="w-3 h-3 text-yellow-500" /> Expected Complexity
                        </p>
                        <div className="grid grid-cols-2 gap-2">
                          {[
                            { label: "Time",  value: problem.time_complexity_average, color: "text-blue-400"   },
                            { label: "Space", value: problem.space_complexity,        color: "text-purple-400" },
                          ].map(({ label, value, color }) =>
                            value ? (
                              <div key={label} className="bg-[#1e1e1e] border border-[#252525] rounded-lg p-3">
                                <p className="text-[9px] uppercase tracking-widest text-slate-600 font-bold mb-1">{label}</p>
                                <p className={`text-xs font-mono font-bold ${color}`}>{value}</p>
                              </div>
                            ) : null
                          )}
                        </div>
                        {problem.complexity_notes_md && (
                          <p className="text-[11px] text-slate-600 italic leading-relaxed">
                            {problem.complexity_notes_md}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Environment */}
                    <div className="border-t border-[#1e1e1e] pt-4 pb-6">
                      <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-600 mb-3">
                        <Info className="w-3 h-3" /> Environment
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { label: "Time Limit",   value: "10 seconds" },
                          { label: "Memory Limit", value: "256 MB"     },
                        ].map(({ label, value }) => (
                          <div key={label} className="bg-[#1e1e1e] border border-[#252525] rounded p-2.5">
                            <p className="text-[10px] text-slate-600">{label}</p>
                            <p className="text-[11px] text-slate-300 font-mono mt-0.5">{value}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                ) : (
                  /* Submission history */
                  <div className="p-4 space-y-2">
                    {history?.length ? (
                      history.map((sub: Submission) => (
                        <a key={sub.id} href={`/submissions/${sub.id}`}
                          className="flex items-center justify-between p-3 rounded-lg
                                     bg-[#1a1a1a] border border-[#252525]
                                     hover:border-[#333] transition-colors block">
                          <div>
                            <div className={`text-sm font-semibold ${statusColor(sub.status)}`}>
                              {statusLabel(sub.status)}
                            </div>
                            <div className="text-[10px] text-slate-600 mt-0.5 uppercase tracking-wide">
                              {sub.language} · {formatRuntime(sub.runtime_ms)}
                            </div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-slate-600" />
                        </a>
                      ))
                    ) : (
                      <div className="flex flex-col items-center justify-center py-16 text-slate-700 gap-2">
                        <Database className="w-8 h-8 opacity-25" />
                        <p className="text-sm">No submissions yet</p>
                        <p className="text-xs opacity-50">Submit your code to see history</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </Allotment.Pane>

          {/* ──── RIGHT PANE: Editor + Console (60%) ───────────────────── */}
          <Allotment.Pane minSize={380}>
            <div className="h-full flex flex-col">

              {/*
               * Vertical split inside the right pane.
               * `vertical` prop = true.
               * Console can be collapsed to minSize with `snap`.
               */}
              <div className="flex-1 overflow-hidden">
                <Allotment
                  vertical
                  defaultSizes={consoleOpen ? [70, 30] : [100]}
                  snap
                >
                  {/* ── Editor (70%) ── */}
                  <Allotment.Pane minSize={120}>
                    <div className="h-full flex flex-col bg-[#1e1e1e]">

                      {/* Language tabs */}
                      <div className="h-10 shrink-0 flex items-center px-3 bg-[#252525] border-b border-[#1e1e1e]">
                        <div className="flex items-center gap-0.5 bg-[#1a1a1a] rounded-md p-0.5">
                          {(Object.keys(LANG_LABELS) as Language[]).map((lang) => (
                            <button key={lang} onClick={() => setLanguage(lang)}
                              className={cn(
                                "px-3 py-1 rounded text-[11px] font-semibold transition-colors",
                                language === lang
                                  ? "bg-[#2e2e2e] text-white"
                                  : "text-slate-600 hover:text-slate-300"
                              )}>
                              {LANG_LABELS[lang]}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Monaco */}
                      <div className="flex-1 overflow-hidden">
                        <Editor
                          height="100%"
                          language={MONACO_LANG[language]}
                          theme="vs-dark"
                          value={code}
                          onChange={(v) => setCode(v ?? "")}
                          options={{
                            minimap:              { enabled: false },
                            fontSize:             13,
                            lineNumbers:          "on",
                            scrollBeyondLastLine: false,
                            automaticLayout:      true,
                            tabSize:              4,
                            padding:              { top: 12, bottom: 12 },
                            fontFamily:           '"JetBrains Mono", "Fira Code", Menlo, monospace',
                            fontLigatures:        true,
                            renderLineHighlight:  "line",
                            wordWrap:             "off",
                            suggest:              { showSnippets: true },
                            quickSuggestions:     true,
                          }}
                        />
                      </div>
                    </div>
                  </Allotment.Pane>

                  {/* ── Console (30%) — only rendered when open ── */}
                  {consoleOpen && (
                    <Allotment.Pane minSize={60} snap>
                      <div className="h-full flex flex-col bg-[#141414] border-t border-[#1e1e1e]">

                        {/* Console header */}
                        <div className="h-9 shrink-0 flex items-center px-4 gap-4 bg-[#1e1e1e] border-b border-[#252525]">
                          {(["testcase", "result"] as const).map((t) => (
                            <button key={t} onClick={() => setConsoleTab(t)}
                              className={cn(
                                "flex items-center gap-1.5 text-[10px] font-bold uppercase",
                                "tracking-widest border-b-2 py-2 transition-colors",
                                consoleTab === t
                                  ? "text-blue-400 border-blue-500"
                                  : "text-slate-600 border-transparent hover:text-slate-400"
                              )}>
                              {t === "testcase"
                                ? <><Database className="w-3 h-3" /> Test Cases</>
                                : <><Terminal className="w-3 h-3" /> Output</>}
                            </button>
                          ))}
                          <button
                            onClick={() => setConsoleOpen(false)}
                            className="ml-auto text-slate-600 hover:text-slate-300 transition-colors p-1"
                            title="Close console"
                          >
                            <ChevronDown className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Console body */}
                        <div className="flex-1 overflow-y-auto p-4 font-mono text-xs">

                          {/* Test cases */}
                          {consoleTab === "testcase" && (
                            <div className="space-y-4">
                              {problem.sample_test_cases?.length ? (
                                problem.sample_test_cases.map((tc, idx) => (
                                  <div key={tc.id}>
                                    <p className="text-[10px] text-slate-600 uppercase tracking-wider font-bold mb-1.5">
                                      Case {idx + 1}
                                    </p>
                                    <div className="bg-[#1e1e1e] border border-[#252525] rounded-lg p-3">
                                      <p className="text-[9px] text-slate-600 mb-1">Input</p>
                                      <pre className="whitespace-pre-wrap text-slate-200 text-[11px] leading-relaxed">
                                        {tc.input_data}
                                      </pre>
                                    </div>
                                    {tc.explanation && (
                                      <p className="text-[10px] text-slate-600 italic mt-1">{tc.explanation}</p>
                                    )}
                                  </div>
                                ))
                              ) : (
                                <p className="text-slate-600 italic text-[11px]">No sample test cases.</p>
                              )}
                            </div>
                          )}

                          {/* Result */}
                          {consoleTab === "result" && (
                            <div>
                              {!currentStatus && !submitMutation.isPending && (
                                <div className="flex flex-col items-center justify-center py-8 text-slate-700 gap-2">
                                  <Terminal className="w-5 h-5 opacity-30" />
                                  <p className="text-[11px] italic">Submit your code to see results</p>
                                </div>
                              )}

                              {(currentStatus === "QUEUED" || currentStatus === "RUNNING" || submitMutation.isPending) && (
                                <div className="flex items-center gap-3 text-blue-400 py-2">
                                  <Clock className="w-4 h-4 animate-spin" />
                                  <span className="text-[11px] font-bold uppercase tracking-widest">
                                    {currentStatus === "RUNNING" ? "Running…" : "Queued…"}
                                  </span>
                                </div>
                              )}

                              {isTerminal && currentStatus && (
                                <div className="space-y-3">
                                  <div className="flex items-center gap-2">
                                    {currentStatus === "ACCEPTED"
                                      ? <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0" />
                                      : <XCircle      className="w-5 h-5 text-red-400   shrink-0" />}
                                    <span className={cn(
                                      "text-base font-bold",
                                      currentStatus === "ACCEPTED" ? "text-green-400" : "text-red-400"
                                    )}>
                                      {statusLabel(currentStatus)}
                                    </span>
                                  </div>

                                  {submissionData && (
                                    <div className="grid grid-cols-2 gap-2">
                                      {[
                                        { label: "Runtime", value: formatRuntime(submissionData.runtime_ms) },
                                        { label: "Memory",  value: formatMemory(submissionData.memory_kb)   },
                                      ].map(({ label, value }) => (
                                        <div key={label} className="bg-[#1e1e1e] border border-[#252525] rounded-lg p-2.5">
                                          <p className="text-[9px] text-slate-600 uppercase font-bold mb-1">{label}</p>
                                          <p className="text-slate-100 text-sm font-bold">{value}</p>
                                        </div>
                                      ))}
                                    </div>
                                  )}

                                  {submissionData?.results && submissionData.results.length > 0 && (
                                    <div>
                                      <p className="text-[9px] text-slate-600 uppercase font-bold mb-2 tracking-wider">
                                        Test Cases
                                      </p>
                                      <div className="flex flex-wrap gap-1.5">
                                        {submissionData.results.map((r, i) => (
                                          <div key={r.id}
                                            className={cn(
                                              "w-7 h-7 rounded flex items-center justify-center text-[10px] font-bold border",
                                              r.status === "ACCEPTED"
                                                ? "bg-green-500/10 text-green-400 border-green-500/20"
                                                : "bg-red-500/10   text-red-400   border-red-500/20"
                                            )}
                                            title={r.is_hidden ? `Hidden #${i+1}` : `Test ${i+1}: ${statusLabel(r.status)}`}>
                                            {r.is_hidden ? "?" : i + 1}
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}

                                  {submissionData?.error_message && (
                                    <pre className="text-[11px] text-red-300 bg-red-950/20 border border-red-900/20 p-3 rounded-lg overflow-x-auto leading-relaxed">
                                      {submissionData.error_message}
                                    </pre>
                                  )}

                                  {submissionId && (
                                    <a href={`/submissions/${submissionId}`}
                                      className="text-[11px] text-blue-400 hover:underline block">
                                      View full submission →
                                    </a>
                                  )}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </Allotment.Pane>
                  )}
                </Allotment>
              </div>

              {/* ── Sticky action bar — always visible ── */}
              <div className="h-12 shrink-0 border-t border-[#1e1e1e]
                              flex items-center justify-between px-4 bg-[#141414] z-10">
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
                    : <><ChevronUp   className="w-3 h-3" /> Console</>}
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => { setConsoleTab("testcase"); setConsoleOpen(true); }}
                    className="flex items-center gap-1.5 px-3 py-1.5
                               bg-[#252525] hover:bg-[#2e2e2e] border border-[#333]
                               text-slate-300 rounded text-xs font-semibold transition-colors"
                  >
                    <Play className="w-3 h-3 fill-current" /> Run
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={submitMutation.isPending}
                    className="flex items-center gap-1.5 px-5 py-1.5
                               bg-green-600 hover:bg-green-500
                               disabled:opacity-50 disabled:cursor-not-allowed
                               text-white rounded text-xs font-bold
                               transition-colors shadow shadow-green-900/30"
                  >
                    <Send className="w-3 h-3" />
                    {submitMutation.isPending ? "Submitting…" : "Submit"}
                  </button>
                </div>
              </div>
            </div>
          </Allotment.Pane>

        </Allotment>
      </main>
    </div>
  );
}