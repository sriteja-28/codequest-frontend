"use client";

import { useQuery } from "@tanstack/react-query";
import { submissionsApi } from "@/lib/api";
import { statusColor, statusLabel, formatRuntime, formatMemory, timeAgo } from "@/lib/utils";
import { Clock, Code, CheckCircle, XCircle, HardDrive, ChevronRight } from "lucide-react";
import Link from "next/link";
import type { Submission } from "@/types";

export default function SubmissionsPage() {
  const { data: submissions, isLoading } = useQuery({
    queryKey: ["submissions", "history"],
    queryFn: () => submissionsApi.history(), // no slug = all submissions for user
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-slate-700 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-slate-300">
      <div className="max-w-4xl mx-auto px-6 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-slate-100">My Submissions</h1>
          <span className="text-sm text-slate-600">
            {submissions?.length ?? 0} total
          </span>
        </div>

        {/* Empty */}
        {(!submissions || submissions.length === 0) && (
          <div className="flex flex-col items-center justify-center py-24 text-slate-700 gap-2">
            <Code className="w-10 h-10 opacity-20" />
            <p className="text-sm">No submissions yet</p>
            <Link href="/problems" className="text-blue-400 text-xs hover:underline mt-1">
              Start solving problems
            </Link>
          </div>
        )}

        {/* List */}
        <div className="space-y-2">
          {submissions?.map((sub: Submission) => (
            <div
              key={sub.id}
              className="flex items-center justify-between p-4 bg-[#141414] border border-[#1e1e1e] 
                         hover:border-[#2a2a2a] rounded-xl transition-colors group"
            >
              <div className="flex items-center gap-4 min-w-0">
                {/* Status icon */}
                {sub.status === "ACCEPTED"
                  ? <CheckCircle className="w-5 h-5 text-green-400 shrink-0" />
                  : <XCircle    className="w-5 h-5 text-red-400 shrink-0" />
                }

                <div className="min-w-0">
                  {/* Problem title */}
                  <Link
                    href={`/problems/${sub.problem_slug}`}
                    
                    className="text-sm font-semibold text-slate-200 hover:text-blue-400 transition-colors truncate block"
                  >
                    {sub.problem_title} 
                  </Link>

                  {/* Meta row */}
                  <div className="flex items-center gap-4 mt-1 text-xs text-slate-600">
                    <span className={`font-semibold ${statusColor(sub.status)}`}>
                      {statusLabel(sub.status)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Code className="w-3 h-3" />
                      {sub.language}
                    </span>
                    {sub.runtime_ms != null && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatRuntime(sub.runtime_ms)}
                      </span>
                    )}
                    {sub.memory_kb != null && (
                      <span className="flex items-center gap-1">
                        <HardDrive className="w-3 h-3" />
                        {formatMemory(sub.memory_kb)}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Right side */}
              <div className="flex items-center gap-3 shrink-0 ml-4">
                <span className="text-xs text-slate-600">{timeAgo(sub.created_at)}</span>
                <Link
                  href={`/submissions/${sub.id}`}
                  className="flex items-center gap-0.5 text-xs text-slate-500 
                             hover:text-slate-300 transition-colors opacity-0 group-hover:opacity-100"
                >
                  View <ChevronRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}