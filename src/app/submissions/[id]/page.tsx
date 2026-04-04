"use client";

import { use, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { submissionsApi } from "@/lib/api";
import { statusColor, statusLabel, formatRuntime, formatMemory, timeAgo } from "@/lib/utils";
import { CheckCircle, XCircle, Clock, HardDrive, Code, ChevronLeft } from "lucide-react";

export default function SubmissionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [activeTab, setActiveTab] = useState<"results" | "code">("results");

  const { data: submission, isLoading, isError } = useQuery({
    queryKey: ["submission", id],
    queryFn: () => submissionsApi.get(id),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-slate-700 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (isError || !submission) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center gap-3 text-slate-400">
        <p className="text-lg font-semibold text-slate-200">Submission Not Found</p>
        <p className="text-sm text-slate-600">The submission you're looking for doesn't exist.</p>
        <a href="/problems" className="text-blue-400 text-sm hover:underline mt-2">
          ← Back to Problems
        </a>
      </div>
    );
  }

  const passedCount = submission.results?.filter(r => r.status === "ACCEPTED").length ?? 0;
  const totalCount  = submission.results?.length ?? 0;
  const isAccepted  = submission.status === "ACCEPTED";

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-slate-300">
      <div className="max-w-4xl mx-auto px-6 py-8">

        {/* Back */}
         <a
          href={`/problems/${submission.problem_slug}`}
          className="inline-flex items-center gap-1 text-slate-500 hover:text-slate-300 text-sm mb-6 transition-colors" >
          <ChevronLeft className="w-4 h-4" />
          {submission.problem_title}
        </a>

        {/* Status card */}
        <div className="bg-[#141414] border border-[#1e1e1e] rounded-xl p-6 mb-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              {isAccepted
                ? <CheckCircle className="w-7 h-7 text-green-400 shrink-0" />
                : <XCircle    className="w-7 h-7 text-red-400 shrink-0" />
              }
              <div>
                <div className={`text-xl font-bold ${statusColor(submission.status)}`}>
                  {statusLabel(submission.status)}
                </div>
                <div className="text-slate-500 text-xs uppercase tracking-wide mt-0.5">
                  {submission.language} · {timeAgo(submission.created_at)}
                </div>
              </div>
            </div>

            {totalCount > 0 && (
              <div className="text-right">
                <div className="text-lg font-semibold text-slate-200">
                  {passedCount} / {totalCount}
                </div>
                <div className="text-xs text-slate-600">test cases passed</div>
              </div>
            )}
          </div>

          {/* Runtime + Memory */}
          {(submission.runtime_ms != null || submission.memory_kb != null) && (
            <div className="flex gap-6 mt-4 pt-4 border-t border-[#1e1e1e]">
              {submission.runtime_ms != null && (
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <Clock className="w-4 h-4 text-slate-600" />
                  {formatRuntime(submission.runtime_ms)}
                </div>
              )}
              {submission.memory_kb != null && (
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <HardDrive className="w-4 h-4 text-slate-600" />
                  {formatMemory(submission.memory_kb)}
                </div>
              )}
            </div>
          )}

          {/* Compile / runtime error */}
          {submission.error_message && (
            <div className="mt-4 p-3 bg-red-950/20 border border-red-900/30 rounded-lg">
              <pre className="text-xs text-red-400 font-mono whitespace-pre-wrap">
                {submission.error_message}
              </pre>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="bg-[#141414] border border-[#1e1e1e] rounded-xl overflow-hidden">
          <div className="flex border-b border-[#1e1e1e]">
            {(["results", "code"] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 text-sm font-semibold capitalize transition-colors border-b-2 ${
                  activeTab === tab
                    ? "text-white border-blue-500"
                    : "text-slate-500 border-transparent hover:text-slate-300"
                }`}
              >
                {tab === "results" ? "Test Results" : "Code"}
              </button>
            ))}
          </div>

          <div className="p-5">
            {/* ── Results tab ── */}
            {activeTab === "results" && (
              <div className="space-y-2">
                {totalCount === 0 ? (
                  <p className="text-slate-500 text-sm text-center py-8">
                    No test results available.
                  </p>
                ) : (
                  submission.results.map((r, i) => (
                    <div
                      key={r.id}
                      className={`p-3 rounded-lg border text-sm ${
                        r.status === "ACCEPTED"
                          ? "bg-green-950/10 border-green-900/30"
                          : "bg-red-950/10 border-red-900/30"
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-mono text-xs text-slate-500">
                          Case {i + 1}{r.is_hidden ? " · hidden" : ""}
                        </span>
                        <span className={`text-xs font-semibold ${
                          r.status === "ACCEPTED" ? "text-green-400" : "text-red-400"
                        }`}>
                          {r.status.replace(/_/g, " ")}
                        </span>
                      </div>

                      {/* Only show I/O for visible test cases */}
                      {!r.is_hidden && (
                        <div className="mt-2 space-y-1 font-mono text-xs text-slate-400">
                          {r.actual_output && (
                            <p>
                              Output:{" "}
                              <span className="text-slate-300">{r.actual_output}</span>
                            </p>
                          )}
                          {r.status !== "ACCEPTED" && r.expected_output && (
                            <p>
                              Expected:{" "}
                              <span className="text-slate-300">{r.expected_output}</span>
                            </p>
                          )}
                          {r.error_output && (
                            <pre className="text-red-400 whitespace-pre-wrap mt-1">
                              {r.error_output}
                            </pre>
                          )}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}

            {/* ── Code tab ── */}
            {activeTab === "code" && (
              <div className="flex items-center gap-2 mb-3 text-xs text-slate-500 uppercase tracking-wide">
                <Code className="w-3.5 h-3.5" />
                {submission.language}
              </div>
            )}
            {activeTab === "code" && (
              <div className="bg-[#1a1a1a] border border-[#252525] rounded-lg p-4 overflow-x-auto">
                <pre className="text-sm text-slate-300 font-mono whitespace-pre">
                  {submission.code}
                </pre>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}