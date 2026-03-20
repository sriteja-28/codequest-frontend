"use client";
import { cn, difficultyLabel, statusLabel } from "@/lib/utils";
import type { Difficulty, SubmissionStatus, Plan } from "@/types";

export function DifficultyBadge({ difficulty }: { difficulty: Difficulty }) {
  return (
    <span className={cn(
      "inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold",
      difficulty === "EASY"   && "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
      difficulty === "MEDIUM" && "bg-amber-500/10 text-amber-400 border border-amber-500/20",
      difficulty === "HARD"   && "bg-red-500/10 text-red-400 border border-red-500/20",
    )}>
      {difficultyLabel(difficulty)}
    </span>
  );
}

export function PlanBadge({ plan }: { plan: Plan }) {
  return (
    <span className={cn(
      "inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold",
      plan === "PRO"
        ? "bg-brand-500/10 text-brand-400 border border-brand-500/20"
        : "bg-slate-500/10 text-slate-400 border border-slate-500/20",
    )}>
      {plan === "PRO" ? "⚡ Pro" : "Free"}
    </span>
  );
}

export function StatusBadge({ status }: { status: SubmissionStatus }) {
  const color =
    status === "ACCEPTED"      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
    status === "WRONG_ANSWER"  ? "bg-red-500/10 text-red-400 border-red-500/20" :
    status === "RUNTIME_ERROR" ? "bg-orange-500/10 text-orange-400 border-orange-500/20" :
    status === "COMPILE_ERROR" ? "bg-orange-500/10 text-orange-400 border-orange-500/20" :
    status === "TIME_LIMIT"    ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/20" :
    status === "MEMORY_LIMIT"  ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/20" :
    status === "RUNNING"       ? "bg-brand-500/10 text-brand-400 border-brand-500/20" :
                                 "bg-slate-500/10 text-slate-400 border-slate-500/20";
  return (
    <span className={cn("inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold border", color)}>
      {status === "RUNNING" && <span className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-pulse mr-1.5" />}
      {statusLabel(status)}
    </span>
  );
}

export function ContestStatusBadge({ status }: { status: string }) {
  return (
    <span className={cn(
      "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold",
      status === "live"     && "bg-emerald-500/15 text-emerald-400",
      status === "upcoming" && "bg-blue-500/15 text-blue-400",
      status === "ended"    && "bg-slate-500/15 text-slate-500",
    )}>
      {status === "live" && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />}
      {status.toUpperCase()}
    </span>
  );
}