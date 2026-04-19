"use client";

import { useMemo, useState, useEffect } from "react";
import {
  ChevronLeft, ChevronRight, Flame, CheckCircle2, X, Clock, Trophy,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Submission } from "@/types";
import type { Problem } from "@/types";

// ── Streak helpers (same logic as profile page) ───────────────────────────────
function calcBestStreak(subs: Submission[]): number {
  const acceptedDays = [
    ...new Set(
      subs
        .filter((s) => s.status === "ACCEPTED")
        .map((s) => s.created_at?.slice(0, 10))
        .filter(Boolean)
    ),
  ].sort() as string[];

  let best = 0, run = 0;
  let prev: Date | null = null;

  for (const d of acceptedDays) {
    const cur = new Date(d);
    if (prev && cur.getTime() - prev.getTime() === 86_400_000) {
      run++;
    } else {
      run = 1;
    }
    if (run > best) best = run;
    prev = cur;
  }
  return best;
}

function calcCurrentStreak(subs: Submission[]): number {
  const acceptedDays = [
    ...new Set(
      subs
        .filter((s) => s.status === "ACCEPTED")
        .map((s) => s.created_at?.slice(0, 10))
        .filter(Boolean)
    ),
  ].sort().reverse() as string[]; // newest first

  if (acceptedDays.length === 0) return 0;

  const todayStr = new Date().toISOString().slice(0, 10);
  const yesterdayStr = new Date(Date.now() - 86_400_000).toISOString().slice(0, 10);

  // Streak only counts if solved today or yesterday
  if (acceptedDays[0] !== todayStr && acceptedDays[0] !== yesterdayStr) return 0;

  let streak = 1;
  for (let i = 1; i < acceptedDays.length; i++) {
    const prev = new Date(acceptedDays[i - 1]);
    const cur = new Date(acceptedDays[i]);
    if (prev.getTime() - cur.getTime() === 86_400_000) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

// ── Live countdown to midnight ────────────────────────────────────────────────
function Countdown() {
  const [t, setT] = useState("");
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const end = new Date();
      end.setHours(23, 59, 59, 999);
      const diff = end.getTime() - now.getTime();
      const h = Math.floor(diff / 3_600_000);
      const m = Math.floor((diff % 3_600_000) / 60_000);
      const s = Math.floor((diff % 60_000) / 1_000);
      setT(
        `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
      );
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return <span className="font-mono text-xs text-amber-400 tabular-nums">{t}</span>;
}

// ── Full month calendar ───────────────────────────────────────────────────────
const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const DAY_ABBR = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

interface FullCalendarProps {
  submissions: Submission[];
  userCreatedAt?: string;
}

function FullCalendar({ submissions, userCreatedAt }: FullCalendarProps) {
  const today = useMemo(() => new Date(), []);

  // Determine earliest allowed month based on user enrollment
  const { earliestYear, earliestMonth } = useMemo(() => {
    if (!userCreatedAt) {
      // Default to 6 months ago if no enrollment date provided
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      return {
        earliestYear: sixMonthsAgo.getFullYear(),
        earliestMonth: sixMonthsAgo.getMonth(),
      };
    }
    const enrollDate = new Date(userCreatedAt);
    return {
      earliestYear: enrollDate.getFullYear(),
      earliestMonth: enrollDate.getMonth(),
    };
  }, [userCreatedAt]);

  // Determine latest allowed month (next month from today)
  const { latestYear, latestMonth } = useMemo(() => {
    const nextMonth = new Date(today);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    return {
      latestYear: nextMonth.getFullYear(),
      latestMonth: nextMonth.getMonth(),
    };
  }, [today]);

  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());

  const solvedDays = useMemo(() => {
    const set = new Set<string>();
    submissions
      .filter((s) => s.status === "ACCEPTED")
      .forEach((s) => { if (s.created_at) set.add(s.created_at.slice(0, 10)); });
    return set;
  }, [submissions]);

  const dayCount = useMemo(() => {
    const map: Record<string, number> = {};
    submissions.forEach((s) => {
      const d = s.created_at?.slice(0, 10);
      if (d) map[d] = (map[d] || 0) + 1;
    });
    return map;
  }, [submissions]);

  const todayStr = useMemo(() => today.toISOString().slice(0, 10), [today]);

  // Check if navigation is allowed
  const canGoPrev = useMemo(() => {
    if (month === 0) {
      return year > earliestYear || (year === earliestYear && earliestMonth < 11);
    }
    return year > earliestYear || (year === earliestYear && month > earliestMonth);
  }, [year, month, earliestYear, earliestMonth]);

  const canGoNext = useMemo(() => {
    if (month === 11) {
      return year < latestYear || (year === latestYear && latestMonth > 0);
    }
    return year < latestYear || (year === latestYear && month < latestMonth);
  }, [year, month, latestYear, latestMonth]);

  const prevMonth = () => {
    if (!canGoPrev) return;
    if (month === 0) { setMonth(11); setYear((y) => y - 1); }
    else setMonth((m) => m - 1);
  };

  const nextMonth = () => {
    if (!canGoNext) return;
    if (month === 11) { setMonth(0); setYear((y) => y + 1); }
    else setMonth((m) => m + 1);
  };

  const goToday = () => { setYear(today.getFullYear()); setMonth(today.getMonth()); };

  const grid = useMemo(() => {
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells: (null | { day: number; iso: string; isToday: boolean; isPast: boolean; isBeforeEnrollment: boolean })[] = [];

    for (let i = 0; i < firstDay; i++) cells.push(null);

    const enrollmentDate = userCreatedAt ? new Date(userCreatedAt) : null;

    for (let d = 1; d <= daysInMonth; d++) {
      const iso = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      const dt = new Date(year, month, d);
      const isBeforeEnrollment = enrollmentDate ? dt < enrollmentDate : false;

      cells.push({
        day: d,
        iso,
        isToday: iso === todayStr,
        isPast: dt <= today,
        isBeforeEnrollment,
      });
    }
    return cells;
  }, [year, month, todayStr, today, userCreatedAt]);

  // Build weeks, pad last row
  const weeks = useMemo(() => {
    const w: typeof grid[] = [];
    for (let i = 0; i < grid.length; i += 7) w.push(grid.slice(i, i + 7));
    while ((w[w.length - 1]?.length ?? 0) < 7) w[w.length - 1].push(null);
    return w;
  }, [grid]);

  const monthStr = `${year}-${String(month + 1).padStart(2, "0")}`;
  const monthSolved = [...solvedDays].filter((d) => d.startsWith(monthStr)).length;
  const isCurrentMonth = year === today.getFullYear() && month === today.getMonth();
  const isFutureMonth = new Date(year, month) > new Date(today.getFullYear(), today.getMonth());

  return (
    <div className="flex flex-col gap-2">
      {/* Nav row */}
      <div className="flex items-center justify-between">
        <button
          onClick={prevMonth}
          disabled={!canGoPrev}
          className={cn(
            "w-7 h-7 flex items-center justify-center rounded-lg transition-colors",
            canGoPrev
              ? "text-slate-600 hover:text-slate-300 hover:bg-[#1a1a1a] cursor-pointer"
              : "text-slate-800 cursor-not-allowed opacity-30"
          )}
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <div className="text-center">
          <p className="text-sm font-bold text-slate-200 leading-tight">{MONTH_NAMES[month]}</p>
          <p className="text-[10px] text-slate-600 font-mono">{year}</p>
        </div>
        <button
          onClick={nextMonth}
          disabled={!canGoNext}
          className={cn(
            "w-7 h-7 flex items-center justify-center rounded-lg transition-colors",
            canGoNext
              ? "text-slate-600 hover:text-slate-300 hover:bg-[#1a1a1a] cursor-pointer"
              : "text-slate-800 cursor-not-allowed opacity-30"
          )}
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7">
        {DAY_ABBR.map((d) => (
          <div key={d} className="text-center text-[9px] text-slate-700 font-bold pb-1">{d}</div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="flex flex-col gap-0.5">
        {weeks.map((week, wi) => (
          <div key={wi} className="grid grid-cols-7 gap-0.5">
            {week.map((cell, di) => {
              if (!cell) return <div key={di} className="aspect-square" />;

              const solved = solvedDays.has(cell.iso);
              const count = dayCount[cell.iso] ?? 0;
              const isFutureDay = !cell.isPast && !cell.isToday;
              const isDisabled = cell.isBeforeEnrollment;

              return (
                <div
                  key={cell.iso}
                  title={
                    isDisabled
                      ? "Before enrollment"
                      : count > 0
                        ? `${count} submission${count > 1 ? "s" : ""}`
                        : cell.iso
                  }
                  className={cn(
                    "aspect-square rounded-md relative flex items-center justify-center transition-all",
                    cell.isToday ? "ring-1 ring-indigo-500 ring-offset-1 ring-offset-[#0a0a0a]" : "",
                    isFutureDay || isDisabled ? "opacity-20" : "",
                  )}
                  style={{
                    background: isDisabled
                      ? "transparent"
                      : solved
                        ? "#22c55e20"
                        : cell.isPast && !cell.isToday
                          // ? "#0f0f0f"
                          ? "#ef444420"   // red background
                          : "transparent",
                  }}
                >
                  <span className={cn(
                    "text-[10px] font-mono leading-none",
                    isDisabled ? "text-slate-900" :
                      cell.isToday ? "text-indigo-400 font-bold" :
                        solved ? "text-green-400" :
                          cell.isPast ? "text-slate-700" :
                            "text-slate-800"
                  )}>
                    {cell.day}
                  </span>

                  {/* ✓ solved marker */}
                  {solved && !isDisabled && (
                    <CheckCircle2
                      className="absolute bottom-0.5 right-0.5 w-2.5 h-2.5 text-green-500"
                      strokeWidth={2.5}
                    />
                  )}

                  {/* ✗ past unsolved (current month only) */}
                  {!solved && !isDisabled && cell.isPast && isCurrentMonth && !cell.isToday && (
                    <X className="absolute bottom-0.5 right-0.5 w-2 h-2 text-red-600" strokeWidth={3} />
                  )}

                  {/* ✗ today unsolved */}
                  {cell.isToday && !solved && !isDisabled && (
                    <X className="absolute bottom-0.5 right-0.5 w-2.5 h-2.5 text-red-600" strokeWidth={3} />
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-1.5 border-t border-[#1a1a1a]">
        <span className="text-[10px] text-slate-700">
          {monthSolved} day{monthSolved !== 1 ? "s" : ""} solved
          {!isCurrentMonth && !isFutureMonth ? ` in ${MONTH_NAMES[month].slice(0, 3)}` : " this month"}
        </span>
        {!isCurrentMonth && (
          <button onClick={goToday}
            className="text-[10px] text-indigo-400 hover:text-indigo-300 transition-colors">
            Today ↩
          </button>
        )}
      </div>
    </div>
  );
}

// ── RightPanel ────────────────────────────────────────────────────────────────
interface RightPanelProps {
  submissions: Submission[];
  problems: Problem[];
  /** Pass user.current_streak from useMe() if available, we'll also compute locally */
  currentStreak?: number;
  bestStreak: number;
  todaySolved: number;
  /** User's enrollment date (created_at) - determines earliest month to show */
  userCreatedAt?: string;
}

export function RightPanel({
  submissions,
  problems,
  currentStreak: externalCurrentStreak,
  bestStreak,
  todaySolved,
  userCreatedAt,
}: RightPanelProps) {
  // Compute both streaks from submission history (reliable, doesn't depend on API field)
  // const bestStreak = useMemo(() => calcBestStreak(submissions), [submissions]);
  const localCurrent = useMemo(() => calcCurrentStreak(submissions), [submissions]);

  // Prefer API value if provided and > 0, otherwise use locally computed
  const currentStreak = (externalCurrentStreak ?? 0) > 0
    ? externalCurrentStreak!
    : localCurrent;

  const todayDone = todaySolved > 0;

  // Hardest solved = lowest acceptance rate among solved problems
  const topHardest = useMemo(() =>
    problems
      .filter((p) => p.is_solved)
      .sort((a, b) => a.acceptance_rate - b.acceptance_rate)
      .slice(0, 5),
    [problems]);

  return (
    <aside className="w-64 shrink-0 flex flex-col gap-3 sticky top-6 self-start
                      max-h-[calc(100vh-3rem)] overflow-y-auto pl-1 scrollbar-thin">

      {/* ── Streak card ── */}
      <div className="bg-[#0d0d0d] border border-[#1a1a1a] rounded-xl p-4 flex flex-col gap-3">
        {/* Streak numbers */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className={cn("w-4 h-4", currentStreak > 0 ? "text-orange-400" : "text-slate-700")} />
            <div>
              <span className="text-lg font-bold text-white font-mono">{currentStreak}</span>
              <span className="text-xs text-slate-600 ml-1">day streak</span>
            </div>
          </div>
          <div className="text-right flex items-center gap-1.5">
            <div>
              <p className="text-[10px] text-slate-600">Best</p>
              <p className="text-sm font-bold text-slate-400 font-mono">{bestStreak}d</p>
            </div>
            <Trophy className="w-3.5 h-3.5 text-amber-500/60 mb-0.5" />
          </div>
        </div>

        {/* Today status pill */}
        <div className={cn(
          "flex items-center gap-2 px-3 py-2 rounded-lg border",
          todayDone ? "bg-green-500/5 border-green-500/15" : "bg-[#111] border-[#1e1e1e]"
        )}>
          {todayDone
            ? <CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0" />
            : <X className="w-3.5 h-3.5 text-red-500/60 shrink-0" />}
          <p className="text-[10px] text-slate-400 truncate">
            {todayDone ? `${todaySolved} solved today 🎉` : "Nothing solved yet today"}
          </p>
        </div>

        {/* Countdown */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Clock className="w-3 h-3 text-slate-700" />
            <span className="text-[10px] text-slate-600">Time left today</span>
          </div>
          <Countdown />
        </div>
      </div>

      {/* ── Calendar ── */}
      <div className="bg-[#0d0d0d] border border-[#1a1a1a] rounded-xl p-4">
        <FullCalendar submissions={submissions} userCreatedAt={userCreatedAt} />
      </div>

      {/* ── Hardest solved ── */}
      <div className="bg-[#0d0d0d] border border-[#1a1a1a] rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <Trophy className="w-3.5 h-3.5 text-amber-500/60" />
          <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">
            Hardest Solved
          </span>
        </div>

        {topHardest.length === 0 ? (
          <p className="text-[10px] text-slate-700 italic">Solve problems to see stats</p>
        ) : (
          <div className="flex flex-col gap-2">
            {topHardest.map((p) => (
              <div key={p.id} className="flex items-center gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] text-slate-400 truncate">{p.title}</p>
                </div>
                <span className="text-[10px] font-mono text-slate-600 shrink-0 tabular-nums">
                  {p.acceptance_rate}%
                </span>
                <span className={cn(
                  "text-[9px] font-bold px-1.5 py-0.5 rounded shrink-0",
                  p.difficulty === "EASY" ? "text-green-400 bg-green-500/10" :
                    p.difficulty === "MEDIUM" ? "text-amber-400 bg-amber-500/10" :
                      "text-red-400   bg-red-500/10"
                )}>
                  {p.difficulty[0]}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </aside>
  );
}