"use client";

import { useMemo, useEffect, useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { Flame, X, CheckCircle2, Clock } from "lucide-react";
import type { Problem } from "@/types";
import type { Submission } from "@/types";

interface StatsBarProps {
  problems: Problem[];
  total: number;
  submissions?: Submission[];
  currentStreak?: number;
  bestStreak?: number;
  todaySolved?: number; // submissions today
}

// ── Countdown clock ─────────────────────────────────────────────────────────
function DayCountdown() {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    const tick = () => {
      const now  = new Date();
      const end  = new Date();
      end.setHours(23, 59, 59, 999);
      const diff = end.getTime() - now.getTime();
      const h  = Math.floor(diff / 3600000);
      const m  = Math.floor((diff % 3600000) / 60000);
      const s  = Math.floor((diff % 60000) / 1000);
      setTimeLeft(
        `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
      );
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return <span className="font-mono text-xs text-slate-500 tabular-nums">{timeLeft}</span>;
}

// ── Mini streak calendar (last 5 weeks, Mon–Sun) ─────────────────────────────
function StreakCalendar({ submissions }: { submissions: Submission[] }) {
  const calData = useMemo(() => {
    // Build solved-day set
    const solvedDays = new Set(
      submissions
        .filter((s) => s.status === "ACCEPTED")
        .map((s) => s.created_at?.slice(0, 10))
        .filter(Boolean)
    );

    // Build last 35 days (5 weeks), starting from Monday
    const days: { iso: string; solved: boolean; isToday: boolean; future: boolean }[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Rewind to last Monday
    const dayOfWeek = today.getDay(); // 0=Sun
    const mondayOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    const start = new Date(today);
    start.setDate(start.getDate() - mondayOffset - 28); // 4 weeks back from this Monday

    for (let i = 0; i < 35; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      const iso = d.toISOString().slice(0, 10);
      days.push({
        iso,
        solved: solvedDays.has(iso),
        isToday: d.getTime() === today.getTime(),
        future: d > today,
      });
    }
    return days;
  }, [submissions]);

  const weeks = useMemo(() => {
    const w: typeof calData[] = [];
    for (let i = 0; i < calData.length; i += 7) w.push(calData.slice(i, i + 7));
    return w;
  }, [calData]);

  const DAY_LABELS = ["M", "T", "W", "T", "F", "S", "S"];

  return (
    <div className="flex gap-1.5">
      {/* Day labels column */}
      <div className="flex flex-col gap-1 pt-0">
        {DAY_LABELS.map((d, i) => (
          <div key={i} className="w-3 h-3 flex items-center justify-center">
            <span className="text-[7px] text-slate-700 font-medium">{d}</span>
          </div>
        ))}
      </div>

      {/* Weeks */}
      {weeks.map((week, wi) => (
        <div key={wi} className="flex flex-col gap-1">
          {week.map((day) => (
            <div
              key={day.iso}
              title={`${day.iso}${day.solved ? " ✓ solved" : ""}`}
              className="w-3 h-3 rounded-[2px] relative"
              style={{
                background: day.future
                  ? "transparent"
                  : day.solved
                  ? "#22c55e"
                  : "#1a1a1a",
                outline: day.isToday ? "1px solid #6366f1" : "none",
                outlineOffset: "1px",
              }}
            >
              {day.isToday && !day.solved && (
                <X
                  className="absolute inset-0 w-full h-full text-red-500/70"
                  strokeWidth={3}
                />
              )}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

// ── Main StatsBar ────────────────────────────────────────────────────────────
const SEGMENTS = [
  { key: "EASY",   label: "Easy", color: "#22c55e" },
  { key: "MEDIUM", label: "Med",  color: "#f59e0b" },
  { key: "HARD",   label: "Hard", color: "#ef4444" },
] as const;

export function StatsBar({
  problems,
  total,
  submissions = [],
  currentStreak = 0,
  bestStreak = 0,
  todaySolved = 0,
}: StatsBarProps) {
  const stats = useMemo(() =>
    SEGMENTS.map((s) => {
      const group  = problems.filter((p) => p.difficulty === s.key);
      const solved = group.filter((p) => p.is_solved).length;
      return { ...s, solved, total: group.length };
    }),
  [problems]);

  const totalSolved = problems.filter((p) => p.is_solved).length;

  const easyData = [
    { value: stats[0].solved,                               fill: "#22c55e" },
    { value: Math.max(0, stats[0].total - stats[0].solved), fill: "#22c55e14" },
  ];
  const medData = [
    { value: stats[1].solved,                               fill: "#f59e0b" },
    { value: Math.max(0, stats[1].total - stats[1].solved), fill: "#f59e0b14" },
  ];
  const hardData = [
    { value: stats[2].solved,                               fill: "#ef4444" },
    { value: Math.max(0, stats[2].total - stats[2].solved), fill: "#ef444414" },
  ];

  const todayDone = todaySolved > 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-[auto_1fr_auto] gap-6 mb-8 items-start">

      {/* ── Left: Donut + stats ── */}
      <div className="flex items-center gap-6">
        {/* Stacked donut */}
        <div className="relative w-[120px] h-[120px] shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={hardData} cx="50%" cy="50%"
                innerRadius={52} outerRadius={58}
                startAngle={90} endAngle={-270}
                dataKey="value" stroke="none">
                {hardData.map((d, i) => <Cell key={i} fill={d.fill} />)}
              </Pie>
              <Pie data={medData} cx="50%" cy="50%"
                innerRadius={38} outerRadius={44}
                startAngle={90} endAngle={-270}
                dataKey="value" stroke="none">
                {medData.map((d, i) => <Cell key={i} fill={d.fill} />)}
              </Pie>
              <Pie data={easyData} cx="50%" cy="50%"
                innerRadius={24} outerRadius={30}
                startAngle={90} endAngle={-270}
                dataKey="value" stroke="none">
                {easyData.map((d, i) => <Cell key={i} fill={d.fill} />)}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-2xl font-bold text-white leading-none">{totalSolved}</span>
            <span className="text-[9px] text-slate-600 mt-0.5">/ {total}</span>
          </div>
        </div>

        {/* Difficulty bars */}
        <div className="flex flex-col gap-2.5">
          {stats.map((s) => {
            const pct = s.total ? Math.round((s.solved / s.total) * 100) : 0;
            return (
              <div key={s.key} className="flex items-center gap-2.5 min-w-[180px]">
                <span className="text-[11px] font-bold w-8 shrink-0" style={{ color: s.color }}>
                  {s.label}
                </span>
                <div className="flex-1 h-1.5 bg-[#1a1a1a] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${pct}%`,
                      background: s.color,
                      boxShadow: s.solved > 0 ? `0 0 6px ${s.color}88` : "none",
                    }}
                  />
                </div>
                <span className="text-[11px] font-mono tabular-nums shrink-0 w-12 text-right">
                  <span style={{ color: s.color }}>{s.solved}</span>
                  <span className="text-slate-700">/{s.total}</span>
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Center: Streak calendar ── */}
      <div className="flex flex-col gap-3 px-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className={`w-4 h-4 ${currentStreak > 0 ? "text-orange-400" : "text-slate-700"}`} />
            <span className="text-xs font-bold text-slate-300">
              {currentStreak}
              <span className="text-slate-600 font-normal"> day streak</span>
            </span>
            <span className="text-slate-700 text-xs">·</span>
            <span className="text-[10px] text-slate-600">best {bestStreak}d</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="w-3 h-3 text-slate-700" />
            <DayCountdown />
            <span className="text-[10px] text-slate-700">left today</span>
          </div>
        </div>

        <StreakCalendar submissions={submissions} />

        <div className="flex items-center gap-1.5">
          {todayDone ? (
            <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
          ) : (
            <X className="w-3.5 h-3.5 text-red-500/70" />
          )}
          <span className="text-[10px] text-slate-600">
            {todayDone
              ? `${todaySolved} solved today — streak safe!`
              : "Solve a problem to keep your streak"}
          </span>
        </div>
      </div>

      {/* ── Right: Acceptance leaderboard pill ── */}
      <div className="flex flex-col gap-2 bg-[#0f0f0f] border border-[#1e1e1e] rounded-xl p-4 min-w-[160px]">
        <span className="text-[10px] text-slate-600 uppercase tracking-widest font-bold">
          Top Acceptance
        </span>
        {problems
          .filter((p) => p.is_solved)
          .sort((a, b) => a.acceptance_rate - b.acceptance_rate) // hardest solved first
          .slice(0, 4)
          .map((p) => (
            <div key={p.id} className="flex items-center justify-between gap-2">
              <span className="text-[11px] text-slate-400 truncate max-w-[100px]">{p.title}</span>
              <span className="text-[11px] font-mono text-slate-500 shrink-0">{p.acceptance_rate}%</span>
            </div>
          ))}
        {problems.filter((p) => p.is_solved).length === 0 && (
          <span className="text-[10px] text-slate-700 italic">Solve problems to see stats</span>
        )}
      </div>
    </div>
  );
}