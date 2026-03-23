"use client";

import { ChevronRight, Database } from "lucide-react";
import { useSubmissionHistory } from "@/lib/hooks";
import { statusColor, formatRuntime, statusLabel } from "@/lib/utils";
import type { Submission } from "@/types";

interface Props {
  problemSlug: string;
}

export default function SubmissionsTab({ problemSlug }: Props) {
  const { data: history, isLoading } = useSubmissionHistory(problemSlug);

  if (isLoading) {
    return (
      <div className="p-5">
        <div className="flex items-center justify-center py-16">
          <div className="w-6 h-6 border-2 border-slate-700 border-t-slate-400 rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (!history || history.length === 0) {
    return (
      <div className="p-5">
        <div className="flex flex-col items-center justify-center py-16 text-slate-700 gap-2">
          <Database className="w-8 h-8 opacity-25" />
          <p className="text-sm">No submissions yet</p>
          <p className="text-xs opacity-50">Submit your code to see history</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-2">
      {history.map((sub: Submission) => (
        <div
          key={sub.id}
          className="flex items-center justify-between p-3 rounded-lg bg-[#1a1a1a] 
                     border border-[#252525] hover:border-[#333] transition-colors group"
        >
          <div className="flex-1 min-w-0">
            <div className={`text-sm font-semibold ${statusColor(sub.status)}`}>
              {statusLabel(sub.status)}
            </div>
            <div className="text-[10px] text-slate-600 mt-0.5 uppercase tracking-wide">
              {sub.language} · {formatRuntime(sub.runtime_ms)} · {new Date(sub.created_at).toLocaleDateString()}
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button className="text-xs text-blue-400 hover:underline opacity-0 group-hover:opacity-100 transition-opacity">
              Analyze Complexity
            </button>
            <a
              href={`/submissions/${sub.id}`}
              className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-300"
            >
              View <ChevronRight className="w-3 h-3" />
            </a>
          </div>
        </div>
      ))}
    </div>
  );
}