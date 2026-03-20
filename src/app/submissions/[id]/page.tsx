"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { statusColor, formatRuntime, formatMemory, timeAgo } from "@/lib/utils";
import { CheckCircle, XCircle, Clock, HardDrive, Code } from "lucide-react";
import type { Submission } from "@/types";

export default function SubmissionDetailPage({ params }: { params: { id: string } }) {
  const [activeTab, setActiveTab] = useState<"code" | "results">("results");

  const { data: submission, isLoading } = useQuery({
    queryKey: ["submission", params.id],
    queryFn: () => api.submissions.get(params.id),
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-slate-400">Loading submission...</div>
      </div>
    );
  }

  if (!submission) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-100 mb-2">Submission Not Found</h1>
          <p className="text-slate-400">The submission you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          {submission.status === "ACCEPTED" ? (
            <CheckCircle className="w-8 h-8 text-green-400" />
          ) : (
            <XCircle className="w-8 h-8 text-red-400" />
          )}
          <div>
            <h1 className="text-2xl font-bold text-slate-100">{submission.problem.title}</h1>
            <p className="text-slate-400">Submission #{submission.id}</p>
          </div>
        </div>

        <div className="flex items-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <span className={`font-medium ${statusColor(submission.status)}`}>
              {submission.status}
            </span>
          </div>
          <div className="flex items-center gap-1 text-slate-400">
            <Code className="w-4 h-4" />
            {submission.language}
          </div>
          <div className="flex items-center gap-1 text-slate-400">
            <Clock className="w-4 h-4" />
            {formatRuntime(submission.runtime_ms)}
          </div>
          <div className="flex items-center gap-1 text-slate-400">
            <HardDrive className="w-4 h-4" />
            {formatMemory(submission.memory_kb)}
          </div>
          <span className="text-slate-400">{timeAgo(submission.created_at)}</span>
        </div>
      </div>

      <div className="bg-surface-2 rounded-lg border border-surface-3">
        <div className="border-b border-surface-3">
          <div className="flex">
            <button
              onClick={() => setActiveTab("results")}
              className={`px-6 py-3 font-medium text-sm transition-colors ${
                activeTab === "results"
                  ? "text-brand-400 border-b-2 border-brand-400"
                  : "text-slate-400 hover:text-slate-300"
              }`}
            >
              Test Results
            </button>
            <button
              onClick={() => setActiveTab("code")}
              className={`px-6 py-3 font-medium text-sm transition-colors ${
                activeTab === "code"
                  ? "text-brand-400 border-b-2 border-brand-400"
                  : "text-slate-400 hover:text-slate-300"
              }`}
            >
              Code
            </button>
          </div>
        </div>

        <div className="p-6">
          {activeTab === "results" ? (
            <div className="space-y-4">
              {submission.test_results && submission.test_results.length > 0 ? (
                submission.test_results.map((result, index) => (
                  <div key={index} className="p-4 bg-surface-3 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-medium text-slate-100">Test Case {index + 1}</h3>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        result.passed ? "text-green-400 bg-green-900/20" : "text-red-400 bg-red-900/20"
                      }`}>
                        {result.passed ? "PASSED" : "FAILED"}
                      </span>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-slate-400 mb-1">Input</div>
                        <pre className="text-slate-300 bg-surface-1 p-2 rounded text-xs overflow-x-auto">
                          {result.input}
                        </pre>
                      </div>
                      <div>
                        <div className="text-slate-400 mb-1">Expected Output</div>
                        <pre className="text-slate-300 bg-surface-1 p-2 rounded text-xs overflow-x-auto">
                          {result.expected_output}
                        </pre>
                      </div>
                    </div>

                    {!result.passed && result.actual_output && (
                      <div className="mt-4">
                        <div className="text-slate-400 mb-1">Your Output</div>
                        <pre className="text-red-300 bg-surface-1 p-2 rounded text-xs overflow-x-auto">
                          {result.actual_output}
                        </pre>
                      </div>
                    )}

                    {result.error_message && (
                      <div className="mt-4">
                        <div className="text-slate-400 mb-1">Error</div>
                        <pre className="text-red-300 bg-surface-1 p-2 rounded text-xs overflow-x-auto">
                          {result.error_message}
                        </pre>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-slate-400">No test results available.</p>
                </div>
              )}
            </div>
          ) : (
            <div>
              <pre className="text-slate-300 bg-surface-1 p-4 rounded text-sm overflow-x-auto">
                <code>{submission.code}</code>
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
