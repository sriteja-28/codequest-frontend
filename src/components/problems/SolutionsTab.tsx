"use client";

import ReactMarkdown from "react-markdown";
import { Code } from "lucide-react";
import type { Problem } from "@/types";

interface Props {
  problem: Problem;
}

export default function SolutionsTab({ problem }: Props) {
  const solutions = problem.solutions ?? [];

  if (solutions.length === 0) {
    return (
      <div className="p-5">
        <div className="flex flex-col items-center justify-center py-16 text-slate-700 gap-2">
          <Code className="w-8 h-8 opacity-25" />
          <p className="text-sm">No solutions available</p>
          <p className="text-xs opacity-50">Solutions will be added after the contest ends</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-5">
      <div className="space-y-4">
        {solutions.map((sol) => (
          <div key={sol.id} className="border border-[#2a2a2a] bg-[#1a1a1a] rounded-xl p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h3 className="text-sm font-bold text-white mb-1">{sol.title}</h3>
                {sol.is_official && (
                  <span className="inline-block text-[10px] px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    Official Solution
                  </span>
                )}
              </div>
              <div className="flex gap-2 text-xs shrink-0 ml-3">
                <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  {sol.time_complexity}
                </span>
                <span className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20">
                  {sol.space_complexity}
                </span>
              </div>
            </div>

            {/* Approach summary */}
            <div
              className="prose prose-invert prose-sm max-w-none 
                         prose-p:text-slate-300 prose-p:text-xs prose-p:leading-relaxed
                         prose-code:text-blue-300 prose-code:bg-[#1e2030] prose-code:px-1.5 prose-code:py-0.5 
                         prose-code:rounded prose-code:text-[11px] prose-code:before:content-none prose-code:after:content-none
                         prose-ul:text-slate-300 prose-ol:text-slate-300 prose-li:text-xs
                         prose-strong:text-white"
            >
              <ReactMarkdown>{sol.approach_summary_md}</ReactMarkdown>
            </div>

            {/* Locked overlay for PRO solutions */}
            {sol.is_locked && (
              <div className="mt-3 p-3 bg-slate-900/50 border border-slate-800 rounded-lg flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-brand-500/10 flex items-center justify-center shrink-0">
                  <span className="text-brand-400 text-sm">🔒</span>
                </div>
                <div className="flex-1">
                  <p className="text-xs font-semibold text-slate-200">Pro Feature</p>
                  <p className="text-xs text-slate-500">Upgrade to view full code implementation</p>
                </div>
                <a
                  href="/upgrade"
                  className="px-3 py-1.5 bg-brand-600 hover:bg-brand-500 text-white rounded text-xs font-semibold transition-colors shrink-0"
                >
                  Upgrade
                </a>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}