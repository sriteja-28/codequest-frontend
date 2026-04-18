"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ChevronDown, ChevronRight, CheckCircle2, Circle,
  Lock, Trophy, Star,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Problem } from "@/types";

// ── Difficulty badge ──────────────────────────────────────────────────────────
const DIFF: Record<string, { label: string; color: string }> = {
  EASY:   { label: "Easy",   color: "text-green-400" },
  MEDIUM: { label: "Medium", color: "text-amber-400" },
  HARD:   { label: "Hard",   color: "text-red-400"   },
};

// ── Individual problem row ────────────────────────────────────────────────────
function ProblemRow({ problem, rank }: { problem: Problem; rank: number }) {
  const diff   = DIFF[problem.difficulty] ?? DIFF.EASY;
  const solved = problem.is_solved;
  const isPro  = problem.visibility === "PRO";

  return (
    <Link
      href={`/problems/${problem.slug}`}
      className={cn(
        "group grid items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-100",
        "hover:bg-[#161616]",
        solved ? "opacity-90" : ""
      )}
      style={{ gridTemplateColumns: "20px 36px 1fr 70px 80px 72px" }}
    >
      {/* Solved icon */}
      <div className="flex items-center justify-center">
        {solved ? (
          <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
        ) : (
          <Circle className="w-3.5 h-3.5 text-slate-800 group-hover:text-slate-600 transition-colors" />
        )}
      </div>

      {/* Rank */}
      <span className="text-slate-700 font-mono text-xs tabular-nums text-right">{rank}</span>

      {/* Title */}
      <span
        className={cn(
          "text-sm font-medium truncate transition-colors",
          solved
            ? "text-slate-500 group-hover:text-green-400"
            : "text-slate-300 group-hover:text-white"
        )}
      >
        {problem.title}
        {isPro && (
          <span className="ml-2 inline-flex items-center gap-0.5 text-[9px] font-bold
                           px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400
                           border border-indigo-500/20 align-middle">
            <Lock className="w-2 h-2" /> PRO
          </span>
        )}
      </span>

      {/* Difficulty */}
      <span className={cn("text-xs font-semibold", diff.color)}>{diff.label}</span>

      {/* Acceptance */}
      <div className="flex items-center gap-1 justify-end">
        <Trophy className="w-3 h-3 text-amber-500/40 shrink-0" />
        <span className="text-xs text-slate-600 font-mono tabular-nums">
          {problem.acceptance_rate}%
        </span>
      </div>

      {/* Solution badge */}
      <div className="flex justify-end">
        {problem.solutions && problem.solutions.length > 0? (
          <span className="text-[10px] px-2 py-0.5 rounded-full border border-blue-500/20
                           bg-blue-500/8 text-blue-400 font-semibold">
            Solution
          </span>
        ) : (
          <span className="text-[10px] text-slate-800">—</span>
        )}
      </div>
    </Link>
  );
}

// ── Section header progress bar ───────────────────────────────────────────────
function SectionProgress({
  solved,
  total,
  color,
}: {
  solved: number;
  total: number;
  color: string;
}) {
  const pct = total ? (solved / total) * 100 : 0;
  return (
    <div className="flex items-center gap-2">
      <div className="w-16 h-1 bg-[#1a1a1a] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
      <span className="text-[10px] font-mono text-slate-600 tabular-nums">
        {solved}/{total}
      </span>
    </div>
  );
}

// ── SectionGroup (exported) ───────────────────────────────────────────────────
interface SectionGroupProps {
  name: string;
  displayName: string;
  icon?: string;
  problems: Problem[];
  defaultOpen?: boolean;
}

// Pick accent color per section based on solve rate
function sectionColor(pct: number) {
  if (pct === 0)   return "#334155";
  if (pct < 0.33)  return "#f59e0b";
  if (pct < 0.66)  return "#6366f1";
  return "#22c55e";
}

export function SectionGroup({
  name,
  displayName,
  icon,
  problems,
  defaultOpen = false,
}: SectionGroupProps) {
  const [open, setOpen] = useState(defaultOpen);

  const solved = problems.filter((p) => p.is_solved).length;
  const total  = problems.length;
  const pct    = total ? solved / total : 0;
  const color  = sectionColor(pct);

  return (
    <div className="border border-[#1a1a1a] rounded-xl overflow-hidden mb-2">
      {/* ── Section header ── */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-3 px-4 py-3.5 bg-[#0d0d0d]
                   hover:bg-[#111] transition-colors text-left group"
      >
        {/* Chevron */}
        <div className="shrink-0 w-4 h-4 flex items-center justify-center text-slate-600 group-hover:text-slate-400 transition-colors">
          {open
            ? <ChevronDown className="w-3.5 h-3.5" />
            : <ChevronRight className="w-3.5 h-3.5" />}
        </div>

        {/* Icon + name */}
        <span className="text-base mr-1">{icon}</span>
        <span className="flex-1 text-sm font-bold text-slate-200 group-hover:text-white transition-colors">
          {displayName}
        </span>

        {/* Progress */}
        <SectionProgress solved={solved} total={total} color={color} />

        {/* Solved pill */}
        <span
          className="text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0"
          style={{
            background: `${color}18`,
            color,
            border: `1px solid ${color}30`,
          }}
        >
          {solved}/{total}
        </span>
      </button>

      {/* ── Column headers (shown when open) ── */}
      {open && (
        <>
          <div
            className="grid items-center gap-3 px-4 py-1.5 bg-[#0a0a0a] border-t border-[#131313]"
            style={{ gridTemplateColumns: "20px 36px 1fr 70px 80px 72px" }}
          >
            <div />
            <span className="text-[9px] text-slate-700 uppercase tracking-wider text-right">
              #
            </span>
            <span className="text-[9px] text-slate-700 uppercase tracking-wider">Problem</span>
            <span className="text-[9px] text-slate-700 uppercase tracking-wider">Diff</span>
            <span className="text-[9px] text-slate-700 uppercase tracking-wider text-right">
              Acceptance
            </span>
            <span className="text-[9px] text-slate-700 uppercase tracking-wider text-right">
              Solution
            </span>
          </div>

          {/* ── Problem rows ── */}
          <div className="bg-[#0a0a0a] border-t border-[#131313] pb-1">
            {problems.map((problem, i) => (
              <ProblemRow
                key={problem.id}
                problem={problem}
                rank={problem.number ?? i + 1}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}