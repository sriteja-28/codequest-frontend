"use client";

import { useParams } from "next/navigation";
import { Calendar, Clock, Trophy, CheckCircle } from "lucide-react";
import { PageSpinner } from "@/components/ui/Spinner";
import { useContest, useLeaderboard, useRegisterContest } from "@/lib/hooks/index";
import { cn } from "@/lib/utils";
import Link from "next/link";

export default function ContestDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: contest, isLoading: contestLoading } = useContest(slug);
  const { data: leaderboard, isLoading: leaderLoading } = useLeaderboard(slug);
  const registration = useRegisterContest();

  if (contestLoading) return <PageSpinner />;
  if (!contest) return <div className="p-20 text-center text-slate-100">Contest Not Found</div>;

  const startTime = new Date(contest.start_at);
  const now = new Date();
  const isOngoing = contest.status === "live";
  const isUpcoming = contest.status === "upcoming";
  const isEnded = contest.status === "ended";

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <h1 className="text-3xl font-bold text-slate-100">{contest.name}</h1>
            <span className={cn(
              "px-3 py-1 rounded text-sm font-medium",
              isOngoing ? "text-green-400 bg-green-900/20" :
              isUpcoming ? "text-blue-400 bg-blue-900/20" :
              "text-slate-400 bg-slate-900/20"
            )}>
              {contest.status.toUpperCase()}
            </span>
          </div>
          <p className="text-slate-400 text-lg max-w-2xl">{contest.description_md}</p>
        </div>

        <div className="flex flex-col items-end gap-2">
          {/* Register button — hidden after contest ends */}
          {!isEnded && (
            <button
              disabled={contest.is_registered || registration.isPending}
              onClick={() => registration.mutate(slug)}
              className={cn(
                "flex items-center gap-2 px-6 py-3 rounded-lg font-bold transition-all",
                contest.is_registered
                  ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 cursor-default"
                  : "bg-brand-500 hover:bg-brand-600 text-white shadow-lg shadow-brand-500/20"
              )}
            >
              {contest.is_registered
                ? <><CheckCircle className="w-5 h-5" />Registered</>
                : registration.isPending ? "Registering..." : "Register for Contest"
              }
            </button>
          )}
          {registration.error && (
            <p className="text-red-400 text-sm">
              {(registration.error as any)?.response?.data?.detail ?? "Registration failed"}
            </p>
          )}
          {/* View leaderboard link */}
          <Link
            href={`/contests/${slug}/leaderboard`}
            className="text-xs text-slate-500 hover:text-brand-400 transition-colors"
          >
            View full leaderboard →
          </Link>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          {/* Stats Card */}
          <div className="bg-surface-100 rounded-xl border border-surface-300 p-6 grid grid-cols-2 gap-6">
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-brand-400" />
              <div>
                <p className="text-xs text-slate-500 uppercase font-semibold">Start Time</p>
                <p className="text-slate-200 text-sm">{startTime.toLocaleString()}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-brand-400" />
              <div>
                <p className="text-xs text-slate-500 uppercase font-semibold">Duration</p>
                <p className="text-slate-200 text-sm">{contest.duration_minutes} minutes</p>
              </div>
            </div>
          </div>

          {/* Problems Section */}
          <div className="bg-surface-100 rounded-xl border border-surface-300 p-6">
            <h2 className="text-xl font-semibold text-slate-100 mb-6">Problems</h2>
            <div className="space-y-3">
              {isUpcoming ? (
                <div className="text-center py-10 border-2 border-dashed border-surface-300 rounded-xl">
                  <div className="text-4xl mb-3">🔒</div>
                  <p className="text-slate-500">Problems will be revealed when the contest starts.</p>
                </div>
              ) : contest.contest_problems && contest.contest_problems.length > 0 ? (
                contest.contest_problems.map((cp, index) => (
                  <Link
                    key={cp.id}
                    href={`/contests/${slug}/problems/${cp.problem.slug}`}
                    className={cn(
                      "flex items-center justify-between p-4 border rounded-lg group transition-colors",
                      cp.user_solved
                        ? "bg-emerald-500/5 border-emerald-500/30 hover:border-emerald-400/50"
                        : "bg-surface-200/50 border-surface-300 hover:border-brand-500/30"
                    )}
                  >
                    <div className="flex items-center gap-4">
                      {/* Problem letter */}
                      <span className={cn(
                        "text-2xl font-mono font-black w-8",
                        cp.user_solved ? "text-emerald-400" : "text-slate-600 group-hover:text-brand-400"
                      )}>
                        {String.fromCharCode(65 + index)}
                      </span>

                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-slate-100 font-medium">{cp.problem.title}</span>
                          {cp.user_solved && (
                            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 
                                           border border-emerald-500/20 px-1.5 py-0.5 rounded">
                              SOLVED
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-500 uppercase mt-0.5">
                          <span>{cp.problem.difficulty}</span>
                          <span>•</span>
                          <span>{cp.score} pts</span>
                          {/* Wrong attempts shown in red */}
                          {!cp.user_solved && cp.user_wrong_attempts > 0 && (
                            <>
                              <span>•</span>
                              <span className="text-red-400">
                                {cp.user_wrong_attempts} wrong
                              </span>
                            </>
                          )}
                          {/* Solve time shown in green */}
                          {cp.user_solve_time !== null && (
                            <>
                              <span>•</span>
                              <span className="text-emerald-400">{cp.user_solve_time}m</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-slate-300 text-sm font-mono">
                        {cp.contest_accepted}/{cp.contest_total}
                      </div>
                      <div className="text-[10px] text-slate-500 uppercase">Solved</div>
                    </div>
                  </Link>
                ))
              ) : (
                <p className="text-slate-500 text-center py-8">No problems added yet.</p>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar Leaderboard Preview */}
        <div className="bg-surface-100 rounded-xl border border-surface-300 p-6 h-fit">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-slate-100">Leaderboard</h2>
            <Trophy className="w-5 h-5 text-yellow-500" />
          </div>

          <div className="space-y-3">
            {leaderLoading ? (
              <div className="animate-pulse space-y-3">
                {[1, 2, 3].map(i => <div key={i} className="h-10 bg-surface-300 rounded" />)}
              </div>
            ) : leaderboard && leaderboard.length > 0 ? (
              <>
                {leaderboard.slice(0, 5).map((entry, index) => (
                  <div key={entry.username} className="flex items-center justify-between group">
                    <div className="flex items-center gap-3">
                      <span className={cn(
                        "text-sm font-bold w-6 text-center",
                        index === 0 ? "text-yellow-400" :
                        index === 1 ? "text-slate-400" :
                        index === 2 ? "text-amber-600" :
                        "text-slate-600"
                      )}>
                        {index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : `#${index + 1}`}
                      </span>
                      <span className="text-sm text-slate-300 group-hover:text-brand-400 transition-colors truncate max-w-[120px]">
                        {entry.username}
                      </span>
                    </div>
                    <span className="text-sm font-mono text-brand-400 font-bold">{entry.final_score}</span>
                  </div>
                ))}
                <Link
                  href={`/contests/${slug}/leaderboard`}
                  className="block text-center text-xs text-slate-500 hover:text-brand-400 transition-colors pt-2 border-t border-surface-300 mt-2"
                >
                  View all {contest.participant_count} participants →
                </Link>
              </>
            ) : (
              <p className="text-slate-500 text-sm italic text-center py-4">No participants yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}