"use client";

import { useMemo, useState, useEffect } from "react";
import {
  ChevronLeft, ChevronRight, Flame, CheckCircle2, X, Clock, Trophy
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Submission } from "@/types";
import type { Problem } from "@/types";

// ── Countdown ─────────────────────────────────────────────────────────────────
function Countdown() {
  const [t, setT] = useState("");
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const end = new Date();
      end.setHours(23, 59, 59, 999);
      const diff = end.getTime() - now.getTime();
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setT(`${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return <span className="font-mono text-xs text-amber-400 tabular-nums">{t}</span>;
}

// ── Full calendar ─────────────────────────────────────────────────────────────
const MONTH_NAMES = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December"
];
const DAY_ABBR = ["Su","Mo","Tu","We","Th","Fr","Sa"];

interface CalendarProps {
  submissions: Submission[];
}

function FullCalendar({ submissions }: CalendarProps) {
  const today = new Date();
  const [year,  setYear]  = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth()); // 0-based

  // Build solved-day set (any accepted submission)
  const solvedDays = useMemo(() => {
    const set = new Set<string>();
    submissions
      .filter((s) => s.status === "ACCEPTED")
      .forEach((s) => { if (s.created_at) set.add(s.created_at.slice(0, 10)); });
    return set;
  }, [submissions]);

  // submission count per day for tooltip
  const dayCount = useMemo(() => {
    const map: Record<string, number> = {};
    submissions.forEach((s) => {
      const d = s.created_at?.slice(0, 10);
      if (d) map[d] = (map[d] || 0) + 1;
    });
    return map;
  }, [submissions]);

  const todayStr = today.toISOString().slice(0, 10);

  // Navigate
  const prevMonth = () => {
    if (month === 0) { setMonth(11); setYear((y) => y - 1); }
    else setMonth((m) => m - 1);
  };
  const nextMonth = () => {
    if (month === 11) { setMonth(0); setYear((y) => y + 1); }
    else setMonth((m) => m + 1);
  };
  const goToday = () => { setYear(today.getFullYear()); setMonth(today.getMonth()); };

  // Build calendar grid
  const grid = useMemo(() => {
    const firstDay = new Date(year, month, 1).getDay(); // 0=Sun
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells: (null | { day: number; iso: string; isToday: boolean; isPast: boolean })[] = [];

    // leading nulls
    for (let i = 0; i < firstDay; i++) cells.push(null);

    for (let d = 1; d <= daysInMonth; d++) {
      const iso = `${year}-${String(month + 1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
      const dt  = new Date(year, month, d);
      cells.push({
        day: d,
        iso,
        isToday: iso === todayStr,
        isPast: dt <= today,
      });
    }
    return cells;
  }, [year, month, todayStr]);

  // Weeks for display
  const weeks: typeof grid[] = [];
  for (let i = 0; i < grid.length; i += 7) weeks.push(grid.slice(i, i + 7));
  // Pad last week
  while (weeks[weeks.length - 1]?.length < 7) weeks[weeks.length - 1].push(null);

  // Month stats
  const monthStr = `${year}-${String(month + 1).padStart(2,"0")}`;
  const monthSolved = [...solvedDays].filter((d) => d.startsWith(monthStr)).length;
  const monthTotal  = new Date(year, month + 1, 0).getDate();

  const isCurrentMonth = year === today.getFullYear() && month === today.getMonth();
  const isFuture = new Date(year, month) > new Date(today.getFullYear(), today.getMonth());

  return (
    <div className="flex flex-col gap-3">
      {/* Month nav */}
      <div className="flex items-center justify-between">
        <button onClick={prevMonth}
          className="w-7 h-7 flex items-center justify-center rounded-lg
                     text-slate-600 hover:text-slate-300 hover:bg-[#1a1a1a] transition-colors">
          <ChevronLeft className="w-4 h-4" />
        </button>

        <div className="flex flex-col items-center">
          <span className="text-sm font-bold text-slate-200">{MONTH_NAMES[month]}</span>
          <span className="text-[10px] text-slate-600 font-mono">{year}</span>
        </div>

        <button onClick={nextMonth}
          className="w-7 h-7 flex items-center justify-center rounded-lg
                     text-slate-600 hover:text-slate-300 hover:bg-[#1a1a1a] transition-colors">
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-0.5">
        {DAY_ABBR.map((d) => (
          <div key={d} className="text-center text-[9px] text-slate-700 font-bold py-0.5">
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="flex flex-col gap-1">
        {weeks.map((week, wi) => (
          <div key={wi} className="grid grid-cols-7 gap-0.5">
            {week.map((cell, di) => {
              if (!cell) return <div key={di} />;

              const solved  = solvedDays.has(cell.iso);
              const count   = dayCount[cell.iso] ?? 0;
              const isToday = cell.isToday;
              const isPast  = cell.isPast;
              const isFutureDay = !isPast && !isToday;

              return (
                <div
                  key={cell.iso}
                  title={count > 0 ? `${cell.iso}: ${count} submission${count > 1 ? "s" : ""}` : cell.iso}
                  className={cn(
                    "aspect-square flex items-center justify-center rounded-md text-[11px] font-mono relative transition-all",
                    isToday
                      ? "ring-1 ring-indigo-500 ring-offset-1 ring-offset-[#0a0a0a]"
                      : "",
                    isFutureDay ? "opacity-20" : "",
                  )}
                  style={{
                    background: solved
                      ? "#22c55e22"
                      : isPast && !isToday
                      ? "#0f0f0f"
                      : "transparent",
                  }}
                >
                  {/* Day number */}
                  <span className={cn(
                    "text-[10px] font-mono z-10",
                    isToday  ? "text-indigo-400 font-bold" :
                    solved   ? "text-green-400" :
                    isPast   ? "text-slate-700" :
                               "text-slate-800"
                  )}>
                    {cell.day}
                  </span>

                  {/* Solved checkmark overlay */}
                  {solved && (
                    <CheckCircle2
                      className="absolute bottom-0.5 right-0.5 w-2.5 h-2.5 text-green-500"
                      strokeWidth={2.5}
                    />
                  )}

                  {/* X for past days not solved (only current month) */}
                  {!solved && isPast && isCurrentMonth && !isToday && (
                    <X
                      className="absolute bottom-0.5 right-0.5 w-2 h-2 text-slate-800"
                      strokeWidth={3}
                    />
                  )}

                  {/* Today marker if not solved */}
                  {isToday && !solved && (
                    <X
                      className="absolute bottom-0.5 right-0.5 w-2.5 h-2.5 text-red-500/80"
                      strokeWidth={3}
                    />
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Month summary */}
      <div className="flex items-center justify-between pt-1 border-t border-[#1a1a1a]">
        <span className="text-[10px] text-slate-700">
          {monthSolved} day{monthSolved !== 1 ? "s" : ""} solved this month
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

// ── Right Panel ───────────────────────────────────────────────────────────────
interface RightPanelProps {
  submissions: Submission[];
  problems: Problem[];
  currentStreak: number;
  bestStreak: number;
  todaySolved: number;
}

export function RightPanel({
  submissions,
  problems,
  currentStreak,
  bestStreak,
  todaySolved,
}: RightPanelProps) {
  const todayDone = todaySolved > 0;

  // Hardest solved problems (lowest acceptance rate)
  const topHardest = problems
    .filter((p) => p.is_solved)
    .sort((a, b) => a.acceptance_rate - b.acceptance_rate)
    .slice(0, 5);

  return (
    <aside className="w-64 shrink-0 flex flex-col gap-4 sticky top-6 self-start max-h-[calc(100vh-3rem)] overflow-y-auto pl-1 scrollbar-thin">

      {/* ── Streak card ── */}
      <div className="bg-[#0d0d0d] border border-[#1a1a1a] rounded-xl p-4 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className={cn("w-4 h-4", currentStreak > 0 ? "text-orange-400" : "text-slate-700")} />
            <span className="text-sm font-bold text-white">
              {currentStreak}
              <span className="text-slate-600 font-normal text-xs ml-1">day streak</span>
            </span>
          </div>
          <span className="text-[10px] text-slate-600 font-mono">best {bestStreak}d</span>
        </div>

        {/* Today status */}
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#111] border border-[#1e1e1e]">
          {todayDone
            ? <CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0" />
            : <X className="w-3.5 h-3.5 text-red-500/70 shrink-0" />}
          <div className="flex-1 min-w-0">
            <p className="text-[10px] text-slate-400 truncate">
              {todayDone ? `${todaySolved} solved today 🎉` : "Nothing solved yet today"}
            </p>
          </div>
        </div>

        {/* Countdown */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[10px] text-slate-600">
            <Clock className="w-3 h-3" />
            <span>Time left today</span>
          </div>
          <Countdown />
        </div>
      </div>

      {/* ── Full calendar ── */}
      <div className="bg-[#0d0d0d] border border-[#1a1a1a] rounded-xl p-4">
        <FullCalendar submissions={submissions} />
      </div>

      {/* ── Top hardest solved ── */}
      <div className="bg-[#0d0d0d] border border-[#1a1a1a] rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <Trophy className="w-3.5 h-3.5 text-amber-500/70" />
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
                <span className="text-[10px] font-mono text-slate-600 shrink-0">
                  {p.acceptance_rate}%
                </span>
                <span className={cn(
                  "text-[9px] font-bold px-1.5 py-0.5 rounded shrink-0",
                  p.difficulty === "EASY"   ? "text-green-400 bg-green-500/10" :
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