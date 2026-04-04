"use client";

import { useState } from "react";
import { ChevronRight, Database, X, TrendingUp } from "lucide-react";
import { useSubmissionHistory } from "@/lib/hooks";
import { statusColor, formatRuntime, statusLabel } from "@/lib/utils";
import type { Submission, Problem } from "@/types";

interface Props {
  problemSlug: string;
  problem: Problem;  
}

function ComplexityModal({ problem, onClose }: { problem: Problem; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-[#141414] border border-[#252525] rounded-xl w-full max-w-md shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#1e1e1e]">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-semibold text-slate-200">Complexity Analysis</span>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Time complexity */}
          <div>
            <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-2">
              Time Complexity
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: "Best",    value: problem.time_complexity_best },
                { label: "Average", value: problem.time_complexity_average },
                { label: "Worst",   value: problem.time_complexity_worst },
              ].map(({ label, value }) => (
                <div key={label} className="bg-[#1a1a1a] border border-[#252525] rounded-lg p-3 text-center">
                  <div className="text-[10px] text-slate-600 mb-1">{label}</div>
                  <div className="text-sm font-bold text-blue-400 font-mono">
                    {value || "—"}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Space complexity */}
          <div>
            <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-2">
              Space Complexity
            </div>
            <div className="bg-[#1a1a1a] border border-[#252525] rounded-lg p-3 text-center">
              <div className="text-lg font-bold text-teal-400 font-mono">
                {problem.space_complexity || "—"}
              </div>
            </div>
          </div>

          {/* Notes */}
          {problem.complexity_notes_md && (
            <div className="bg-[#1a1a1a] border border-[#252525] rounded-lg p-3">
              <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-2">Notes</div>
              <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">
                {problem.complexity_notes_md}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SubmissionsTab({ problemSlug, problem }: Props) {
  const { data: history, isLoading } = useSubmissionHistory(problemSlug);
  const [showComplexity, setShowComplexity] = useState(false);

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
    <>
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
                {sub.language} · {formatRuntime(sub.runtime_ms)} ·{" "}
                {new Date(sub.created_at).toLocaleDateString()}
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setShowComplexity(true)}
                className="text-xs text-blue-400 hover:text-blue-300 opacity-0 
                           group-hover:opacity-100 transition-opacity"
              >
                Analyze Complexity
              </button>
              <a
                href={`/submissions/${sub.id}`}
                className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-300" >
                View <ChevronRight className="w-3 h-3" />
              </a>
            </div>
          </div>
        ))}
      </div>

      {showComplexity && (
        <ComplexityModal problem={problem} onClose={() => setShowComplexity(false)} />
      )}
    </>
  );
}


