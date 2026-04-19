"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronDown, ChevronRight, CheckCircle2, Circle, Lock, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Problem } from "@/types";

const DIFF: Record<string, { label: string; color: string }> = {
  EASY:   { label: "Easy",   color: "text-green-400"  },
  MEDIUM: { label: "Medium", color: "text-amber-400"  },
  HARD:   { label: "Hard",   color: "text-red-400"    },
};

function ProblemRow({ problem, rank }: { problem: Problem; rank: number }) {
  const diff   = DIFF[problem.difficulty] ?? DIFF.EASY;
  const solved = problem.is_solved;
  const isPro  = problem.visibility === "PRO";

  return (
    <Link
      href={`/problems/${problem.slug}`}
      className="group grid items-center gap-3 px-4 py-2 rounded-lg hover:bg-[#141414] transition-colors"
      style={{ gridTemplateColumns: "18px 32px 1fr 64px 72px" }}
    >
      {/* Solved */}
      <div className="flex items-center justify-center">
        {solved
          ? <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
          : <Circle className="w-3.5 h-3.5 text-slate-800 group-hover:text-slate-600 transition-colors" />}
      </div>

      {/* # */}
      <span className="text-slate-700 font-mono text-[11px] tabular-nums text-right">{rank}</span>

      {/* Title */}
      <span className={cn(
        "text-sm truncate transition-colors",
        solved
          ? "text-slate-500 group-hover:text-green-400"
          : "text-slate-300 group-hover:text-white"
      )}>
        {problem.title}
        {isPro && (
          <span className="ml-2 inline-flex items-center gap-0.5 text-[9px] font-bold
                           px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400
                           border border-indigo-500/20 align-middle">
            <Lock className="w-2 h-2" /> PRO
          </span>
        )}
      </span>

      {/* Diff */}
      <span className={cn("text-xs font-semibold", diff.color)}>{diff.label}</span>

      {/* Acceptance */}
      <div className="flex items-center gap-1 justify-end">
        <Trophy className="w-3 h-3 text-amber-500/30 shrink-0" />
        <span className="text-[11px] text-slate-600 font-mono tabular-nums">
          {problem.acceptance_rate}%
        </span>
      </div>
    </Link>
  );
}

function sectionAccentColor(pct: number) {
  if (pct === 0)   return "#334155";
  if (pct < 0.33)  return "#f59e0b";
  if (pct < 0.8)   return "#6366f1";
  return "#22c55e";
}

interface SectionGroupProps {
  name: string;
  displayName: string;
  icon?: string;
  problems: Problem[];
  forceOpen?: boolean; // controlled by expand-all
}

export function SectionGroup({ displayName, icon, problems, forceOpen }: SectionGroupProps) {
  const [open, setOpen] = useState(false);

  // Sync with expand-all toggle
  useEffect(() => {
    if (forceOpen !== undefined) setOpen(forceOpen);
  }, [forceOpen]);

  const solved = problems.filter((p) => p.is_solved).length;
  const total  = problems.length;
  const pct    = total ? solved / total : 0;
  const color  = sectionAccentColor(pct);
  const barPct = total ? (solved / total) * 100 : 0;

  return (
    <div className="border border-[#191919] rounded-xl overflow-hidden mb-1.5">
      {/* Header */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-3 px-4 py-3 bg-[#0c0c0c]
                   hover:bg-[#111] transition-colors text-left group"
      >
        <div className="shrink-0 text-slate-700 group-hover:text-slate-500 transition-colors">
          {open
            ? <ChevronDown className="w-3.5 h-3.5" />
            : <ChevronRight className="w-3.5 h-3.5" />}
        </div>

        {icon && <span className="text-sm shrink-0">{icon}</span>}

        <span className="flex-1 text-sm font-bold text-slate-300 group-hover:text-white transition-colors">
          {displayName}
        </span>

        {/* Mini progress bar */}
        <div className="w-20 h-1 bg-[#1a1a1a] rounded-full overflow-hidden shrink-0">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${barPct}%`, background: color }}
          />
        </div>

        {/* Count pill */}
        <span
          className="text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 font-mono"
          style={{ background: `${color}18`, color, border: `1px solid ${color}28` }}
        >
          {solved}/{total}
        </span>
      </button>

      {/* Problems */}
      {open && (
        <>
          <div
            className="grid items-center gap-3 px-4 py-1 bg-[#090909] border-t border-[#141414]"
            style={{ gridTemplateColumns: "18px 32px 1fr 64px 72px" }}
          >
            <div /><div />
            <span className="text-[9px] text-slate-800 uppercase tracking-wider">Problem</span>
            <span className="text-[9px] text-slate-800 uppercase tracking-wider">Diff</span>
            <span className="text-[9px] text-slate-800 uppercase tracking-wider text-right">Accept</span>
          </div>

          <div className="bg-[#090909] border-t border-[#141414] pb-1">
            {problems.map((p, i) => (
              <ProblemRow key={p.id} problem={p} rank={p.number ?? i + 1} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}