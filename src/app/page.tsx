"use client";

import Link from "next/link";
import { useAuthStore } from "@/lib/auth";
import { useProblems, useContests } from "@/lib/hooks";
import {
  Trophy, Code2, ChevronRight, Zap, Flame,
  CheckCircle2, ArrowUpRight, BarChart2, Users,
  BookOpen, Star,
} from "lucide-react";
import type { Problem, Contest } from "@/types";
import { cn } from "@/lib/utils";
import Footer from "@/components/ui/Footer";


export default function HomePage() {
  const user = useAuthStore((s) => s.user);

  const { data: problemsData, isLoading: loadingProblems } = useProblems({ page: 1 });
  const { data: contests, isLoading: loadingContests } = useContests();

  const problems: Problem[] = problemsData?.results ?? [];
  const liveContests = (contests ?? [])
    .filter((c) => c.status === "live" || c.status === "upcoming")
    .slice(0, 3);

  return (
    <>
      <div className="h-full flex flex-col">
        {/* Scrollable content area */}
        <div className="flex-1 overflow-y-auto">

          {/* ── Hero ──────────────────────────────────────────────────── */}
          <section className="border-b border-[#1a1a1a] bg-gradient-to-b from-[#0d0d12] to-[#0a0a0a]">
            <div className="max-w-5xl mx-auto px-6 py-20 flex flex-col items-center text-center">

              <div
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full
                 bg-blue-500/10 border border-blue-500/20
                  text-blue-400 text-xs font-semibold mb-6">
                <Zap className="w-3 h-3" />
                {user?.is_pro ? "Pro Member — All Features Unlocked" : "Free to start · No credit card"}
              </div>

              <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 tracking-tight leading-tight">
                {user ? (
                  <>Welcome back,{" "}<span className="text-blue-400">{user.username}</span></>
                ) : (
                  <>Master{" "}<span className="text-blue-400">Algorithms</span>.<br className="hidden md:block" />Land the Job.</>
                )}
              </h1>

              <p className="text-slate-400 text-lg mb-10 max-w-lg leading-relaxed">
                {user
                  ? `${user.problems_solved} problems solved · ${user.current_streak > 0 ? `🔥 ${user.current_streak}-day streak — keep it up!` : "Start a streak today"}`
                  : "Practice coding problems, compete in real-time contests, and get AI-powered hints — all in one place."
                }
              </p>

              <div className="flex items-center gap-3 flex-wrap justify-center">
                <Link href="/problems"
                  className="inline-flex items-center gap-2 px-7 py-3 rounded-lg
                           bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold
                           transition-colors shadow-lg shadow-blue-900/30">
                  <Code2 className="w-4 h-4" />
                  {user ? "Continue Solving" : "Start Solving Free"}
                </Link>
                {!user?.is_pro && (
                  <Link href="/upgrade"
                    className="inline-flex items-center gap-2 px-7 py-3 rounded-lg
                             border border-[#2a2a2a] hover:border-[#3a3a3a]
                             bg-[#141414] hover:bg-[#1a1a1a]
                             text-slate-300 text-sm font-semibold transition-colors">
                    <Zap className="w-4 h-4 text-yellow-400" /> Upgrade to Pro
                  </Link>
                )}
              </div>
            </div>
          </section>

          {/* ── Stats (authenticated only) ──────────────────────────── */}
          {user && (
            <section className="border-b border-[#1a1a1a]">
              <div className="max-w-5xl mx-auto px-6 py-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { icon: CheckCircle2, label: "Problems Solved", value: user.problems_solved, color: "text-green-400", bg: "bg-green-500/5" },
                  { icon: Flame, label: "Day Streak", value: `${user.current_streak}d`, color: "text-orange-400", bg: "bg-orange-500/5" },
                  { icon: BarChart2, label: "AI Hints / Day", value: `${user.ai_hint_limit}`, color: "text-purple-400", bg: "bg-purple-500/5" },
                  { icon: Zap, label: "Plan", value: user.is_pro ? "Pro ✦" : "Free", color: "text-blue-400", bg: "bg-blue-500/5" },
                ].map(({ icon: Icon, label, value, color, bg }) => (
                  <div key={label} className={cn("border border-[#1e1e1e] rounded-xl p-4", bg)}>
                    <Icon className={cn("w-4 h-4 mb-2", color)} />
                    <div className="text-2xl font-bold text-white font-mono">{value}</div>
                    <div className="text-[11px] text-slate-600 mt-0.5">{label}</div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ── Pitch cards (unauthenticated) ────────────────────────── */}
          {!user && (
            <section className="border-b border-[#1a1a1a]">
              <div className="max-w-5xl mx-auto px-6 py-10 grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { icon: BookOpen, color: "text-blue-400", bg: "bg-blue-500/5", title: "300+ Problems", desc: "From easy warm-ups to hard challenges across all major topic areas." },
                  { icon: Trophy, color: "text-yellow-400", bg: "bg-yellow-500/5", title: "Live Contests", desc: "Compete weekly, earn ratings, and see where you stand on the leaderboard." },
                  { icon: Zap, color: "text-purple-400", bg: "bg-purple-500/5", title: "AI Hints", desc: "Get Socratic hints and complexity analysis — without seeing the full solution." },
                ].map(({ icon: Icon, color, bg, title, desc }) => (
                  <div key={title} className={cn("border border-[#1e1e1e] rounded-xl p-5", bg)}>
                    <Icon className={cn("w-5 h-5 mb-3", color)} />
                    <h3 className="text-sm font-bold text-white mb-1">{title}</h3>
                    <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ── Main content grid ───────────────────────────────────── */}
          <div className="max-w-5xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Problems list */}
            <div className="lg:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-bold text-slate-300 flex items-center gap-2">
                  <Code2 className="w-4 h-4 text-blue-400" /> Problems
                </h2>
                <Link href="/problems"
                  className="flex items-center gap-1 text-xs text-slate-500 hover:text-blue-400 transition-colors">
                  View all <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="bg-[#111] border border-[#1a1a1a] rounded-xl overflow-hidden">
                {loadingProblems ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="h-13 border-b border-[#1a1a1a] last:border-0 animate-pulse p-4">
                      <div className="h-3 bg-[#1a1a1a] rounded w-1/2" />
                    </div>
                  ))
                ) : problems.length === 0 ? (
                  <div className="py-10 text-center text-slate-700 text-sm">No problems yet.</div>
                ) : (
                  problems.slice(0, 8).map((p, idx) => (
                    <Link key={p.slug} href={`/problems/${p.slug}`}
                      className="flex items-center gap-4 px-4 py-3.5 border-b border-[#151515]
                               last:border-0 hover:bg-[#161616] transition-colors group">
                      <span className="text-[11px] text-slate-700 font-mono w-5 tabular-nums text-right shrink-0">
                        {p.number ?? idx + 1}
                      </span>
                      <div className={cn(
                        "w-1.5 h-1.5 rounded-full shrink-0",
                        p.difficulty === "EASY" && "bg-green-500",
                        p.difficulty === "MEDIUM" && "bg-yellow-500",
                        p.difficulty === "HARD" && "bg-red-500",
                      )} />
                      <span className="flex-1 text-sm text-slate-300 group-hover:text-blue-400
                                     transition-colors font-medium truncate">
                        {p.title}
                      </span>
                      <div className="flex items-center gap-3 shrink-0">
                        {p.is_solved && <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />}
                        <span className="text-[11px] text-slate-700 tabular-nums hidden sm:block">
                          {p.acceptance_rate}%
                        </span>
                        <ArrowUpRight className="w-3.5 h-3.5 text-slate-700 group-hover:text-blue-400 transition-colors" />
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-4">

              {/* Contests */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-bold text-slate-300 flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-yellow-500" /> Contests
                  </h2>
                  <Link href="/contests"
                    className="flex items-center gap-1 text-xs text-slate-500 hover:text-blue-400 transition-colors">
                    All <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                {loadingContests ? (
                  <div className="h-28 bg-[#111] border border-[#1a1a1a] rounded-xl animate-pulse" />
                ) : liveContests.length > 0 ? (
                  <div className="space-y-3">
                    {liveContests.map((c: Contest) => (
                      <div key={c.slug}
                        className="bg-[#111] border border-[#1a1a1a] rounded-xl p-4
                                 hover:border-[#252525] transition-colors">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="text-sm font-semibold text-slate-200 leading-tight pr-2 truncate">
                            {c.name}
                          </h3>
                          {c.status === "live" ? (
                            <span className="flex items-center gap-1 text-[10px] text-red-400 font-bold shrink-0">
                              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" /> LIVE
                            </span>
                          ) : (
                            <span className="text-[10px] text-blue-400 font-bold shrink-0">SOON</span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-[11px] text-slate-600 mb-3">
                          <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {c.participant_count}</span>
                          <span>{c.duration_minutes}m</span>
                          {c.is_rated && <span className="text-blue-500">Rated</span>}
                        </div>
                        <Link href={`/contests/${c.slug}`}
                          className="block w-full text-center py-1.5 rounded-lg text-xs font-semibold
                                   bg-blue-600/10 hover:bg-blue-600/20 border border-blue-600/20
                                   text-blue-400 transition-colors">
                          {c.is_registered ? "View" : c.status === "live" ? "Join Now" : "Register"}
                        </Link>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-[#111] border border-[#1a1a1a] rounded-xl p-8 text-center">
                    <Trophy className="w-7 h-7 mx-auto mb-2 text-slate-700" />
                    <p className="text-xs text-slate-600">No upcoming contests</p>
                  </div>
                )}
              </div>

              {/* Auth CTA (guests only) */}
              {!user && (
                <div className="bg-[#111] border border-[#1a1a1a] rounded-xl p-5">
                  <div className="flex items-center gap-2 mb-1">
                    <Star className="w-4 h-4 text-yellow-400" />
                    <h3 className="text-sm font-semibold text-slate-200">Start for free</h3>
                  </div>
                  <p className="text-xs text-slate-600 mb-4 leading-relaxed">
                    Track your progress, earn streaks, and unlock AI hints.
                  </p>
                  <div className="space-y-2">
                    <Link href="/auth/register"
                      className="block w-full text-center py-2 rounded-lg text-xs font-bold
                               bg-blue-600 hover:bg-blue-500 text-white transition-colors">
                      Create free account
                    </Link>
                    <Link href="/auth/login"
                      className="block w-full text-center py-2 rounded-lg text-xs font-semibold
                               bg-[#1a1a1a] hover:bg-[#222] border border-[#2a2a2a]
                               text-slate-400 transition-colors">
                      Sign in
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>


        </div>
      </div>
      <Footer />
    </>
  );
}