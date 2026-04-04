"use client";

import { Database, Terminal, ChevronDown, Clock, CheckCircle2, XCircle } from "lucide-react";
import { cn, statusColor, formatRuntime, formatMemory, statusLabel } from "@/lib/utils";
import type { Problem, Submission, SubmissionStatus } from "@/types";

interface Props {
  problem: Problem;
  activeTab: "testcase" | "result";
  onTabChange: (tab: "testcase" | "result") => void;
  onClose: () => void;
  submissionData: Submission | undefined;
  currentStatus: SubmissionStatus | null;
  isLoading: boolean;
}

export default function ConsolePanel({
  problem,
  activeTab,
  onTabChange,
  onClose,
  submissionData,
  currentStatus,
  isLoading,
}: Props) {
  const isTerminal = !!currentStatus && !["QUEUED", "RUNNING"].includes(currentStatus);

  return (
    <div className="h-full flex flex-col bg-[#141414] border-t border-[#1e1e1e]">
      {/* Console header */}
      <div className="h-10 shrink-0 flex items-center px-4 gap-4 bg-[#1e1e1e] border-b border-[#252525]">
        {(["testcase", "result"] as const).map((t) => (
          <button
            key={t}
            onClick={() => onTabChange(t)}
            className={cn(
              "flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest border-b-2 py-2.5 transition-colors",
              activeTab === t
                ? "text-blue-400 border-blue-500"
                : "text-slate-600 border-transparent hover:text-slate-400"
            )}
          >
            {t === "testcase" ? (
              <>
                <Database className="w-3 h-3" /> Test Cases
              </>
            ) : (
              <>
                <Terminal className="w-3 h-3" /> Output
              </>
            )}
          </button>
        ))}
        <button
          onClick={onClose}
          className="ml-auto text-slate-600 hover:text-slate-300 transition-colors p-1"
          title="Close console"
        >
          <ChevronDown className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Console body */}
      <div className="flex-1 overflow-y-auto p-4 font-mono text-xs">
        {activeTab === "testcase" && (
          <div className="space-y-4">
            {problem.sample_test_cases && problem.sample_test_cases.length > 0 ? (
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
                    {tc.expected_output && (
                      <>
                        <p className="text-[9px] text-slate-600 mb-1 mt-2">Expected Output</p>
                        <pre className="whitespace-pre-wrap text-slate-200 text-[11px] leading-relaxed">
                          {tc.expected_output}
                        </pre>
                      </>
                    )}
                  </div>
                  {tc.explanation && (
                    <p className="text-[10px] text-slate-600 italic mt-1">{tc.explanation}</p>
                  )}
                </div>
              ))
            ) : (
              <p className="text-slate-600 italic text-[11px]">No sample test cases available.</p>
            )}
          </div>
        )}

        {activeTab === "result" && (
          <div>
            {!currentStatus && !isLoading && (
              <div className="flex flex-col items-center justify-center py-8 text-slate-700 gap-2">
                <Terminal className="w-5 h-5 opacity-30" />
                <p className="text-[11px] italic">Run code to see results</p>
              </div>
            )}

            {(currentStatus === "QUEUED" || currentStatus === "RUNNING" || isLoading) && (
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
                  {currentStatus === "ACCEPTED" ? (
                    <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-400 shrink-0" />
                  )}
                  <span
                    className={cn(
                      "text-base font-bold",
                      currentStatus === "ACCEPTED" ? "text-green-400" : "text-red-400"
                    )}
                  >
                    {statusLabel(currentStatus)}
                  </span>
                </div>

                {submissionData && (
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { label: "Runtime", value: formatRuntime(submissionData.runtime_ms) },
                      { label: "Memory", value: formatMemory(submissionData.memory_kb) },
                    ].map(({ label, value }) => (
                      <div
                        key={label}
                        className="bg-[#1e1e1e] border border-[#252525] rounded-lg p-2.5"
                      >
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
                    

                    {/* //!Testing */}
                    {/* Pill row */}
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {submissionData.results.map((r, i) => (
                        <div
                          key={r.id}
                          className={cn(
                            "w-7 h-7 rounded flex items-center justify-center text-[10px] font-bold border",
                            r.status === "ACCEPTED"
                              ? "bg-green-500/10 text-green-400 border-green-500/20"
                              : "bg-red-500/10 text-red-400 border-red-500/20"
                          )}
                          title={r.is_hidden ? `Hidden #${i + 1}` : `Test ${i + 1}: ${statusLabel(r.status)}`}
                        >{r.is_hidden ? "?" : i + 1}
                        </div>
                      ))}
                    </div>

                    {/* Detail cards — only for failed visible cases */}
                    {submissionData.results
                      .filter((r) => r.status !== "ACCEPTED" && !r.is_hidden)
                      .map((r, i) => (
                        <div
                          key={r.id}
                          className="mb-3 bg-[#1e1e1e] border border-red-900/20 rounded-lg p-3 space-y-2"
                        >
                          <p className="text-[9px] text-red-400 uppercase font-bold tracking-wider">{statusLabel(r.status)} — Test {submissionData.results.indexOf(r) + 1}
                          </p>
                          {r.actual_output !== undefined && (
                            <>
                              <div>
                                <p className="text-[9px] text-slate-600 mb-1">Expected</p>
                                <pre className="text-green-300 text-[11px] leading-relaxed whitespace-pre-wrap">
                                  {r.expected_output}
                                </pre>
                              </div>
                              <div>
                                <p className="text-[9px] text-slate-600 mb-1">Got</p><pre className="text-red-300 text-[11px] leading-relaxed whitespace-pre-wrap">
                                  {r.actual_output}
                                </pre>
                              </div>
                            </>
                          )}
                          {r.error_output && (
                            <pre className="text-[11px] text-orange-300 whitespace-pre-wrap">
                              {r.error_output}
                            </pre>
                          )}
                        </div>))}
                  </div>
                )}



                {submissionData?.error_message && (
                  <pre className="text-[11px] text-red-300 bg-red-950/20 border border-red-900/20 
                                  p-3 rounded-lg overflow-x-auto leading-relaxed whitespace-pre-wrap">
                    {submissionData.error_message}
                  </pre>
                )}

                {submissionData?.id && (
                  <a
                    href={`/submissions/${submissionData.id}`}
                    className="text-[11px] text-blue-400 hover:underline block"
                  >
                    View full submission →
                  </a>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}