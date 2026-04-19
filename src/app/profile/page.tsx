"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Flame, CheckCircle2, Code2, Zap, Edit2, X, Save,
  Calendar, Shield, ChevronRight, Lock, ExternalLink,
  AlertTriangle, RotateCcw, Trash2, BookOpen,
  ChevronDown, ChevronUp, BarChart2, Target, TrendingUp,
  ArrowRight,
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  RadialBarChart, RadialBar, Cell, PieChart, Pie,
} from "recharts";
import Footer from "@/components/ui/Footer";
import Navbar from "@/components/ui/Navbar";
import { PageSpinner } from "@/components/ui/Spinner";
import { useMe, useUpdateMe, useSubmissionHistory } from "@/lib/hooks";
import { statusColor, statusLabel, formatRuntime, timeAgo, cn } from "@/lib/utils";
import type { Submission } from "@/types";

// ─── Helpers ─────────────────────────────────────────────────────────────

function buildHeatmap(subs: Submission[]) {
  const map: Record<string, number> = {};
  for (const s of subs) {
    const d = s.created_at?.slice(0, 10);
    if (d) map[d] = (map[d] || 0) + 1;
  }
  return map;
}

function getYears(subs: Submission[]): number[] {
  const set = new Set<number>();
  const now = new Date().getFullYear();
  set.add(now);
  for (const s of subs) {
    const y = parseInt(s.created_at?.slice(0, 4) ?? "0");
    if (y > 2020) set.add(y);
  }
  return [...set].sort((a, b) => b - a);
}

function calcStreak(subs: Submission[]) {
  const days = [...new Set(subs.map(s => s.created_at?.slice(0, 10)).filter(Boolean))].sort();
  let best = 0, run = 0, prev: Date | null = null;
  for (const d of days) {
    const cur = new Date(d!);
    if (prev && (cur.getTime() - prev.getTime()) === 86400000) run++;
    else run = 1;
    if (run > best) best = run;
    prev = cur;
  }
  return best;
}

// Build 12-month bar data for a given year
function buildMonthlyData(subs: Submission[], year: number) {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const counts = Array(12).fill(0);
  const accepted = Array(12).fill(0);
  for (const s of subs) {
    if (!s.created_at?.startsWith(String(year))) continue;
    const m = parseInt(s.created_at.slice(5, 7)) - 1;
    counts[m]++;
    if (s.status === "ACCEPTED") accepted[m]++;
  }
  return months.map((name, i) => ({ name, total: counts[i], accepted: accepted[i] }));
}

// ─── Heatmap ─────────────────────────────────────────────────────────────

const MONTHS_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function cellColor(n: number) {
  if (n === 0) return "#1a1a1a";
  if (n === 1) return "#1e3a5f";
  if (n <= 3) return "#1d4ed8";
  if (n <= 6) return "#3b82f6";
  return "#60a5fa";
}

function Heatmap({ subs, year }: { subs: Submission[]; year: number }) {
  const map = useMemo(() => buildHeatmap(subs), [subs]);
  const jan1 = new Date(year, 0, 1);
  const pad = jan1.getDay(); // Sun=0
  const start = new Date(jan1.getTime() - pad * 86400000);
  const weeks: { iso: string; count: number; inYear: boolean }[][] = [];
  let cur = new Date(start);

  for (let w = 0; w < 53; w++) {
    const week = [];
    for (let d = 0; d < 7; d++) {
      const iso = cur.toISOString().slice(0, 10);
      const inYear = cur.getFullYear() === year;
      week.push({ iso, count: inYear ? (map[iso] || 0) : -1, inYear });
      cur = new Date(cur.getTime() + 86400000);
    }
    weeks.push(week);
    if (cur.getFullYear() > year && cur.getMonth() > 0) break;
  }

  // Month label positions
  const labels: { label: string; wi: number }[] = [];
  weeks.forEach((wk, wi) => {
    const first = wk.find(c => c.inYear);
    if (first) {
      const m = new Date(first.iso).getMonth();
      if (!labels.find(l => l.label === MONTHS_SHORT[m])) labels.push({ label: MONTHS_SHORT[m], wi });
    }
  });

  const activeDays = Object.entries(map).filter(([k]) => k.startsWith(String(year)) && map[k] > 0).length;

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] text-slate-600">{activeDays} active days in {year}</span>
        <div className="flex items-center gap-1.5 text-[9px] text-slate-700">
          <span>Less</span>
          {[0, 1, 3, 5, 7].map(n => (
            <div key={n} className="w-2.5 h-2.5 rounded-sm" style={{ background: cellColor(n) }} />
          ))}
          <span>More</span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div style={{ minWidth: 680 }}>
          {/* Month labels */}
          <div className="flex mb-0.5 pl-6">
            {labels.map(({ label, wi }) => (
              <div key={label} className="text-[9px] text-slate-600 absolute"
                style={{ position: "relative", marginLeft: wi === 0 ? 0 : wi * 12 - (labels[labels.indexOf(labels.find(l => l.label === label)!) - 1]?.wi ?? 0) * 12 }}>
                {label}
              </div>
            ))}
          </div>

          <div className="flex gap-0.5">
            {/* Day labels */}
            <div className="flex flex-col gap-0.5 mr-1 justify-around" style={{ paddingTop: 2 }}>
              {["M", "W", "F"].map(d => (
                <div key={d} className="text-[8px] text-slate-700 h-5 flex items-center">{d}</div>
              ))}
            </div>

            {weeks.map((wk, wi) => (
              <div key={wi} className="flex flex-col gap-0.5">
                {wk.map((cell, di) => (
                  <div key={di}
                    title={cell.inYear ? `${cell.iso}: ${cell.count} submission${cell.count !== 1 ? "s" : ""}` : ""}
                    className="w-[10px] h-[10px] rounded-[2px] transition-colors cursor-default"
                    style={{ background: cell.count < 0 ? "transparent" : cellColor(cell.count) }}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Donut chart for status breakdown ────────────────────────────────────

function StatusDonut({ accepted, wrong, runtime, other }: {
  accepted: number; wrong: number; runtime: number; other: number;
}) {
  const total = accepted + wrong + runtime + other || 1;
  const data = [
    { name: "Accepted", value: accepted, fill: "#22c55e" },
    { name: "Wrong Answer", value: wrong, fill: "#ef4444" },
    { name: "Runtime Error", value: runtime, fill: "#f97316" },
    { name: "Other", value: other, fill: "#475569" },
  ].filter(d => d.value > 0);

  const pct = Math.round((accepted / total) * 100);

  return (
    <div className="flex items-center gap-5">
      <div className="relative w-24 h-24 shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} cx="50%" cy="50%" innerRadius={28} outerRadius={44}
              dataKey="value" stroke="none">
              {data.map((d, i) => <Cell key={i} fill={d.fill} />)}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-lg font-bold text-white">{pct}%</span>
          <span className="text-[8px] text-slate-600">accepted</span>
        </div>
      </div>

      <div className="space-y-1.5 flex-1">
        {data.map(d => (
          <div key={d.name} className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-sm shrink-0" style={{ background: d.fill }} />
            <span className="text-[11px] text-slate-500 flex-1">{d.name}</span>
            <span className="text-[11px] text-slate-400 tabular-nums font-mono">
              {d.value}
            </span>
            <span className="text-[10px] text-slate-600 w-10 text-right tabular-nums">
              {Math.round((d.value / total) * 100)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Progress section ─────────────────────────────────────────────────────

const TOPICS = [
  { name: "Arrays & Hashing", total: 9, tag: "Array" },
  { name: "Two Pointers", total: 5, tag: "Two Pointers" },
  { name: "Sliding Window", total: 6, tag: "Sliding Window" },
  { name: "Binary Search", total: 7, tag: "Binary Search" },
  { name: "Linked List", total: 11, tag: "Linked List" },
  { name: "Stack", total: 7, tag: "Stack" },
  { name: "Trees", total: 15, tag: "Tree" },
  { name: "Dynamic Programming", total: 20, tag: "Dynamic Programming" },
  { name: "Graphs", total: 13, tag: "Graph" },
  { name: "Greedy", total: 8, tag: "Greedy" },
];

function ProgressSection({ accepted }: { accepted: Submission[] }) {
  const [showAll, setShowAll] = useState(false);
  const PREVIEW = 4;

  const solvedByTag = useMemo(() => {
    const slugs: Record<string, Set<string>> = {};
    for (const s of accepted) {
      // approximate — count problem as solved for its section
      const slug = s.problem_slug;
      if (!slugs["all"]) slugs["all"] = new Set();
      slugs["all"].add(slug);
    }
    return slugs;
  }, [accepted]);

  const totalSolved = solvedByTag["all"]?.size ?? 0;
  const visible = showAll ? TOPICS : TOPICS.slice(0, PREVIEW);

  return (
    <div className="bg-[#111] border border-[#1e1e1e] rounded-2xl overflow-hidden">
      <div className="px-5 py-4 border-b border-[#1e1e1e] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-blue-400" />
          <h2 className="text-sm font-bold text-slate-200">Your Progress</h2>
        </div>
        <span className="text-xs text-slate-600">{totalSolved} solved</span>
      </div>

      <div className="p-5 space-y-3">
        {visible.map(({ name, total }) => {
          // With current data we don't track per-topic, so show 0/total
          // When backend exposes /api/users/me/progress/ hook this up
          const done = 0;
          const pct = total ? Math.round((done / total) * 100) : 0;

          return (
            <div key={name} className="flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs text-slate-400 truncate">{name}</span>
                  <span className="text-[10px] text-slate-600 font-mono ml-2 shrink-0">
                    {done}/{total}
                  </span>
                </div>
                <div className="h-1.5 bg-[#1a1a1a] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-600 to-blue-400 rounded-full transition-all duration-500"
                    style={{ width: pct ? `${pct}%` : "0%" }}
                  />
                </div>
              </div>
              <span className={cn(
                "text-[10px] font-mono w-8 text-right shrink-0",
                pct > 0 ? "text-blue-400" : "text-slate-700"
              )}>
                {pct}%
              </span>
            </div>
          );
        })}
      </div>

      <div className="px-5 pb-4">
        <button
          onClick={() => setShowAll(v => !v)}
          className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg
                     border border-[#1e1e1e] text-xs text-slate-600 hover:text-slate-300
                     hover:border-[#2a2a2a] hover:bg-[#141414] transition-colors"
        >
          {showAll ? (
            <><ChevronUp className="w-3.5 h-3.5" /> Show less</>
          ) : (
            <><ChevronDown className="w-3.5 h-3.5" /> Show {TOPICS.length - PREVIEW} more</>
          )}
        </button>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────

export default function ProfilePage() {
  const { data: user, isLoading } = useMe();
  const { data: allHistory } = useSubmissionHistory();
  const updateMe = useUpdateMe();

  const [editing, setEditing] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [saveError, setSaveError] = useState("");
  const [saving, setSaving] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [deleteInput, setDeleteInput] = useState("");
  const [showReset, setShowReset] = useState(false);

  const history: Submission[] = allHistory ?? [];
  const years = useMemo(() => getYears(history), [history]);
  const [selYear, setSelYear] = useState<number>(() => new Date().getFullYear());

  const yearSubs = useMemo(() => history.filter(s => s.created_at?.startsWith(String(selYear))), [history, selYear]);
  const accepted = useMemo(() => history.filter(s => s.status === "ACCEPTED"), [history]);
  // const best        = useMemo(() => calcStreak(history), [history]);
  const monthly = useMemo(() => buildMonthlyData(history, selYear), [history, selYear]);
  const uniqueSolved = new Set(accepted.map(s => s.problem_slug)).size;

  // Status breakdown
  const wrong = history.filter(s => s.status === "WRONG_ANSWER").length;
  const runtime = history.filter(s => s.status === "RUNTIME_ERROR").length;
  const other = history.filter(s => !["ACCEPTED", "WRONG_ANSWER", "RUNTIME_ERROR"].includes(s.status)).length;

  const startEdit = () => {
    if (!user) return;
    setDisplayName(user.display_name || "");
    setBio(user.bio || "");
    setSaveError("");
    setEditing(true);
  };

  const saveEdit = async () => {
    setSaving(true);
    setSaveError("");
    try {
      await updateMe.mutateAsync({ display_name: displayName, bio });
      setEditing(false);
    } catch {
      setSaveError("Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) return <div className="h-full flex flex-col">
    {/* <Navbar /> */}
    <div className="flex-1 flex items-center justify-center"><PageSpinner /></div></div>;

  if (!user) {
    return (
      <div className="h-full flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center bg-[#0a0a0a]">
          <div className="text-center">
            <Lock className="w-10 h-10 text-slate-700 mx-auto mb-3" />
            <p className="text-slate-400 mb-4">Sign in to view your profile.</p>
            <Link href="/auth/login" className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition-colors">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const best = user.best_streak;
  const initials = (user.display_name || user.username)
    .split(" ").map((w: string) => w[0]).join("").toUpperCase().slice(0, 2);

  return (
    <div className="h-full flex flex-col">
      {/* <Navbar /> */}
      <div className="flex-1 overflow-y-auto bg-[#0a0a0a]">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-5">

            {/* ══════════════════════════════════════════════════════
                LEFT COLUMN — Square profile card + edit + stats
            ══════════════════════════════════════════════════════ */}
            <div className="space-y-4">

              {/* Profile card */}
              <div className="bg-[#111] border border-[#1e1e1e] rounded-2xl overflow-hidden">

                {/* Banner gradient */}
                <div className="h-20 bg-gradient-to-br from-blue-900/60 via-indigo-900/40 to-[#111]" />

                {/* Avatar — square, overlaps banner */}
                <div className="px-5 pb-5">
                  <div className="relative -mt-10 mb-4">
                    <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-700
                                    flex items-center justify-center text-2xl font-bold text-white
                                    border-4 border-[#111] shadow-lg">
                      {initials}
                    </div>
                    {user.is_pro && (
                      <span className="absolute -bottom-1 -right-1 flex items-center gap-0.5
                                       bg-gradient-to-r from-yellow-400 to-amber-500
                                       text-black text-[9px] font-black px-1.5 py-0.5 rounded-full">
                        <Zap className="w-2.5 h-2.5" /> PRO
                      </span>
                    )}
                  </div>

                  {editing ? (
                    <div className="space-y-3">
                      <div>
                        <label className="text-[10px] text-slate-600 uppercase font-bold tracking-wider block mb-1">
                          Display Name
                        </label>
                        <input
                          value={displayName}
                          onChange={(e) => setDisplayName(e.target.value)}
                          className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-2
                                     text-sm text-slate-200 focus:outline-none focus:border-blue-500/50 transition-colors"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-600 uppercase font-bold tracking-wider block mb-1">Bio</label>
                        <textarea
                          value={bio}
                          onChange={(e) => setBio(e.target.value)}
                          rows={3}
                          className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-2
                                     text-sm text-slate-200 resize-none focus:outline-none focus:border-blue-500/50 transition-colors"
                        />
                      </div>
                      {saveError && <p className="text-xs text-red-400">{saveError}</p>}
                      <div className="flex gap-2">
                        <button onClick={saveEdit} disabled={saving}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg
                                     bg-blue-600 hover:bg-blue-500 disabled:opacity-50
                                     text-white text-xs font-bold transition-colors">
                          <Save className="w-3.5 h-3.5" /> {saving ? "Saving…" : "Save"}
                        </button>
                        <button onClick={() => setEditing(false)}
                          className="px-3 py-2 rounded-lg bg-[#1a1a1a] border border-[#2a2a2a]
                                     text-slate-400 text-xs font-semibold hover:bg-[#222] transition-colors">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <h1 className="text-lg font-bold text-white truncate">
                          {user.display_name || user.username}
                        </h1>
                        {user.role === "ADMIN" && (
                          <span className="flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5
                                           rounded-full bg-purple-500/15 text-purple-400 border border-purple-500/20 shrink-0">
                            <Shield className="w-2.5 h-2.5" /> Admin
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mb-2">@{user.username}</p>
                      {user.bio
                        ? <p className="text-xs text-slate-500 leading-relaxed mb-3">{user.bio}</p>
                        : <p className="text-xs text-slate-700 italic mb-3">No bio yet.</p>}
                      <p className="text-[10px] text-slate-600 flex items-center gap-1 mb-4">
                        <Calendar className="w-3 h-3" />
                        Joined {new Date(user.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                      </p>
                      <button onClick={startEdit}
                        className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl
                                   bg-[#1a1a1a] hover:bg-[#222] border border-[#2a2a2a]
                                   text-slate-400 hover:text-slate-200 text-xs font-semibold transition-colors">
                        <Edit2 className="w-3.5 h-3.5" /> Edit Profile
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Quick stats grid */}
              <div className="grid grid-cols-2 gap-2.5">
                {[
                  { icon: CheckCircle2, label: "Solved", value: uniqueSolved, color: "text-green-400", bg: "from-green-500/5" },
                  { icon: Flame, label: "Streak", value: `${user.current_streak}d`, color: "text-orange-400", bg: "from-orange-500/5" },
                  { icon: Target, label: "Best Streak", value: `${best}d`, color: "text-blue-400", bg: "from-blue-500/5" },
                  { icon: TrendingUp, label: "Submissions", value: history.length, color: "text-purple-400", bg: "from-purple-500/5" },
                ].map(({ icon: Icon, label, value, color, bg }) => (
                  <div key={label}
                    className={cn(
                      "bg-gradient-to-br border border-[#1e1e1e] rounded-xl p-3",
                      bg, "to-[#111]"
                    )}>
                    <Icon className={cn("w-3.5 h-3.5 mb-2", color)} />
                    <div className={cn("text-xl font-bold font-mono", color)}>{value}</div>
                    <div className="text-[10px] text-slate-600 mt-0.5">{label}</div>
                  </div>
                ))}
              </div>

              {/* Status donut */}
              {history.length > 0 && (
                <div className="bg-[#111] border border-[#1e1e1e] rounded-2xl p-4">
                  <p className="text-xs font-bold text-slate-400 mb-3 flex items-center gap-2">
                    <BarChart2 className="w-3.5 h-3.5 text-blue-400" /> Submission Breakdown
                  </p>
                  <StatusDonut
                    accepted={accepted.length}
                    wrong={wrong}
                    runtime={runtime}
                    other={other}
                  />
                </div>
              )}

              {/* Plan */}
              <div className={cn(
                "border rounded-2xl p-4",
                user.is_pro ? "bg-gradient-to-br from-yellow-500/8 to-[#111] border-yellow-500/20" : "bg-[#111] border-[#1e1e1e]"
              )}>
                <div className="flex items-center gap-3 mb-3">
                  <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center",
                    user.is_pro ? "bg-yellow-500/10" : "bg-[#1a1a1a]")}>
                    <Zap className={cn("w-4 h-4", user.is_pro ? "text-yellow-400" : "text-slate-600")} />
                  </div>
                  <div>
                    <p className={cn("text-xs font-bold", user.is_pro ? "text-yellow-400" : "text-slate-300")}>
                      {user.is_pro ? "Pro Plan" : "Free Plan"}
                    </p>
                    <p className="text-[10px] text-slate-600">
                      {user.ai_hint_limit} hints · {user.ai_chat_limit} chats/day
                    </p>
                  </div>
                </div>
                {!user.is_pro && (
                  <Link href="/upgrade"
                    className="flex items-center justify-center gap-1.5 py-2 rounded-lg
                               bg-gradient-to-r from-yellow-500/15 to-amber-500/10
                               border border-yellow-500/20 text-yellow-400 text-xs font-bold
                               hover:from-yellow-500/25 hover:to-amber-500/20 transition-all">
                    <Zap className="w-3.5 h-3.5" /> Upgrade to Pro
                  </Link>
                )}
              </div>
            </div>

            {/* ══════════════════════════════════════════════════════
                RIGHT COLUMN — Activity, submissions, progress, danger
            ══════════════════════════════════════════════════════ */}
            <div className="space-y-4">

              {/* Activity chart card */}
              <div className="bg-[#111] border border-[#1e1e1e] rounded-2xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-blue-400" /> Activity
                  </h2>

                  {/* Year selector */}
                  <select
                    value={selYear}
                    onChange={(e) => setSelYear(Number(e.target.value))}
                    className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-2.5 py-1
                               text-xs text-slate-300 focus:outline-none focus:border-blue-500/40 transition-colors"
                  >
                    {years.map(y => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>

                {/* Monthly area chart */}
                <div className="mb-4">
                  <ResponsiveContainer width="100%" height={130}>
                    <AreaChart data={monthly} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="gTotal" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.3} />
                          <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="gAccepted" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#22c55e" stopOpacity={0.3} />
                          <stop offset="100%" stopColor="#22c55e" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#475569" }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 10, fill: "#475569" }} axisLine={false} tickLine={false} allowDecimals={false} />
                      <Tooltip
                        contentStyle={{ background: "#141414", border: "1px solid #1e1e1e", borderRadius: 10, fontSize: 12 }}
                        labelStyle={{ color: "#94a3b8" }}
                        cursor={{ stroke: "#333" }}
                      />
                      <Area type="monotone" dataKey="total" name="Total" stroke="#3b82f6" fill="url(#gTotal)" strokeWidth={1.5} dot={false} />
                      <Area type="monotone" dataKey="accepted" name="Accepted" stroke="#22c55e" fill="url(#gAccepted)" strokeWidth={1.5} dot={false} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                {/* Heatmap */}
                <Heatmap subs={history} year={selYear} />
              </div>

              {/* Recent Submissions */}
              <div className="bg-[#111] border border-[#1e1e1e] rounded-2xl overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b border-[#1e1e1e]">
                  <h2 className="text-sm font-bold text-slate-200">Recent Submissions</h2>
                  <Link href="/submissions"
                    className="flex items-center gap-1 text-[11px] text-blue-400 hover:underline">
                    View all <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>

                {history.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 gap-2 text-slate-700">
                    <Code2 className="w-7 h-7 opacity-25" />
                    <p className="text-sm">No submissions yet.</p>
                    <Link href="/problems" className="text-xs text-blue-400 hover:underline flex items-center gap-1 mt-1">
                      Browse problems <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                ) : (
                  <div className="divide-y divide-[#141414]">
                    {history.slice(0, 8).map((sub) => (
                      <Link key={sub.id} href={`/submissions/${sub.id}`}
                        className="flex items-center gap-3 px-5 py-3 hover:bg-[#161616] transition-colors group">
                        <div className={cn(
                          "w-1.5 h-1.5 rounded-full shrink-0",
                          sub.status === "ACCEPTED" ? "bg-green-500" : "bg-red-500"
                        )} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-slate-300 truncate group-hover:text-blue-400 transition-colors">
                            {sub.problem_title}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className={cn("text-[10px] font-semibold", statusColor(sub.status))}>
                              {statusLabel(sub.status)}
                            </span>
                            <span className="text-[10px] text-slate-600 uppercase">{sub.language}</span>
                            {sub.runtime_ms && (
                              <span className="text-[10px] text-slate-600">{formatRuntime(sub.runtime_ms)}</span>
                            )}
                          </div>
                        </div>
                        <span className="text-[10px] text-slate-600 shrink-0">{timeAgo(sub.created_at)}</span>
                        <ExternalLink className="w-3.5 h-3.5 text-slate-700 group-hover:text-blue-400 transition-colors shrink-0" />
                      </Link>
                    ))}
                  </div>
                )}

                {history.length > 8 && (
                  <div className="px-5 py-3 border-t border-[#141414]">
                    <Link href="/submissions"
                      className="flex items-center justify-center gap-1.5 py-2 rounded-lg
                                 border border-[#1e1e1e] text-xs text-slate-600 hover:text-slate-300
                                 hover:border-[#2a2a2a] hover:bg-[#141414] transition-colors w-full">
                      View all {history.length} submissions <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                )}
              </div>

              {/* Progress */}
              <ProgressSection accepted={accepted} />

              {/* Danger Zone */}
              <div className="bg-[#111] border border-[#1e1e1e] rounded-2xl overflow-hidden">
                <div className="px-5 py-4 border-b border-[#1e1e1e]">
                  <h2 className="text-sm font-bold text-slate-300 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-400" /> Danger Zone
                  </h2>
                </div>

                {/* Reset code */}
                <div className="px-5 py-4 border-b border-[#141414] flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-300 flex items-center gap-2 mb-0.5">
                      <RotateCcw className="w-3.5 h-3.5 text-slate-500" /> Reset All Code
                    </p>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Reset all saved code back to default starter code for every problem.
                    </p>
                  </div>
                  {showReset ? (
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs text-orange-400">Sure?</span>
                      <button onClick={() => setShowReset(false)}
                        className="px-3 py-1.5 rounded text-xs font-bold bg-orange-600 hover:bg-orange-500 text-white">
                        Yes
                      </button>
                      <button onClick={() => setShowReset(false)}
                        className="px-3 py-1.5 rounded text-xs font-semibold bg-[#1a1a1a] border border-[#2a2a2a] text-slate-400 hover:bg-[#222]">
                        No
                      </button>
                    </div>
                  ) : (
                    <button onClick={() => setShowReset(true)}
                      className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-[#1a1a1a]
                                 hover:bg-[#222] border border-[#2a2a2a] text-slate-400 hover:text-slate-200 transition-colors shrink-0">
                      Reset All Code
                    </button>
                  )}
                </div>

                {/* Delete account */}
                <div className="px-5 py-4 flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-red-400 flex items-center gap-2 mb-0.5">
                      <Trash2 className="w-3.5 h-3.5" /> Delete Account
                    </p>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Permanently delete your account and all data. Cannot be undone.
                    </p>
                  </div>
                  {showDelete ? (
                    <div className="flex flex-col gap-2 min-w-[200px] shrink-0">
                      <p className="text-[10px] text-red-400">
                        Type <strong className="font-mono">{user.username}</strong> to confirm:
                      </p>
                      <input
                        value={deleteInput}
                        onChange={(e) => setDeleteInput(e.target.value)}
                        placeholder={user.username}
                        className="bg-[#1a1a1a] border border-red-900/40 rounded px-3 py-1.5
                                   text-xs text-slate-200 focus:outline-none focus:border-red-500/50"
                      />
                      <div className="flex gap-2">
                        <button disabled={deleteInput !== user.username}
                          className="flex-1 py-1.5 rounded text-xs font-bold bg-red-700 hover:bg-red-600
                                     disabled:opacity-40 disabled:cursor-not-allowed text-white transition-colors">
                          Delete
                        </button>
                        <button onClick={() => { setShowDelete(false); setDeleteInput(""); }}
                          className="px-3 py-1.5 rounded text-xs font-semibold bg-[#1a1a1a]
                                     border border-[#2a2a2a] text-slate-400 hover:bg-[#222] transition-colors">
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button onClick={() => setShowDelete(true)}
                      className="px-4 py-1.5 rounded-lg text-xs font-semibold shrink-0
                                 bg-red-950/30 hover:bg-red-900/40 border border-red-900/40
                                 text-red-400 transition-colors">
                      Delete Account
                    </button>
                  )}
                </div>
              </div>

            </div>
          </div>
        </div>

        <Footer />
      </div>
    </div>
  );
}