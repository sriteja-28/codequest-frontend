"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { statusColor, timeAgo } from "@/lib/utils";
import { Clock, Code, CheckCircle, XCircle } from "lucide-react";
import Link from "next/link";
import type { Submission } from "@/types";

export default function SubmissionsPage() {
  const { data: submissions, isLoading } = useQuery({
    queryKey: ["submissions"],
    queryFn: () => api.submissions.list(),
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-slate-400">Loading submissions...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-slate-100">My Submissions</h1>
        <div className="text-sm text-slate-400">
          {submissions?.length || 0} submissions
        </div>
      </div>

      <div className="space-y-4">
        {submissions?.map((submission: Submission) => (
          <div
            key={submission.id}
            className="p-6 bg-surface-2 rounded-lg border border-surface-3"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  {submission.status === "ACCEPTED" ? (
                    <CheckCircle className="w-5 h-5 text-green-400" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-400" />
                  )}
                  <span className={`font-medium ${statusColor(submission.status)}`}>
                    {submission.status}
                  </span>
                </div>
                <Link
                  href={`/problems/${submission.problem.slug}`}
                  className="text-slate-100 hover:text-brand-400 font-medium"
                >
                  {submission.problem.title}
                </Link>
              </div>
              <div className="text-sm text-slate-500">
                {timeAgo(submission.created_at)}
              </div>
            </div>

            <div className="mt-4 flex items-center gap-6 text-sm text-slate-400">
              <div className="flex items-center gap-1">
                <Code className="w-4 h-4" />
                {submission.language}
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {submission.runtime_ms ? `${submission.runtime_ms}ms` : "—"}
              </div>
            </div>
          </div>
        ))}

        {submissions?.length === 0 && (
          <div className="text-center py-12">
            <p className="text-slate-400">No submissions yet. Start solving problems!</p>
          </div>
        )}
      </div>
    </div>
  );
}
