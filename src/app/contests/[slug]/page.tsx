"use client";

import { useParams } from "next/navigation";
import { Calendar, Users, Trophy, Clock, CheckCircle } from "lucide-react";

import { PageSpinner } from "@/components/ui/Spinner";
// Import the hooks that you used in your working Leaderboard page
import { useContest, useLeaderboard, useRegisterContest } from "@/lib/hooks/index"; 
import { cn } from "@/lib/utils";

export default function ContestDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  
  // 1. Use the pre-defined hooks from your useQueries file
  const { data: contest, isLoading: contestLoading } = useContest(slug);
  const { data: leaderboard, isLoading: leaderLoading } = useLeaderboard(slug);
  const registration = useRegisterContest();

  if (contestLoading) return <PageSpinner />;
  if (!contest) return <div className="p-20 text-center text-slate-100">Contest Not Found</div>;

  const startTime = new Date(contest.start_at);
  const endTime = new Date(contest.end_at);
  const now = new Date();
  const isOngoing = now >= startTime && now <= endTime;
  const isUpcoming = now < startTime;

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <h1 className="text-3xl font-bold text-slate-100">{contest.name}</h1>
              <span className={cn(
                "px-3 py-1 rounded text-sm font-medium",
                isOngoing ? "text-green-400 bg-green-900/20" : 
                isUpcoming ? "text-blue-400 bg-blue-900/20" : "text-slate-400 bg-slate-900/20"
              )}>
                {contest.status.toUpperCase()}
              </span>
            </div>
            <p className="text-slate-400 text-lg max-w-2xl">{contest.description_md}</p>
          </div>

          {/* Action Button: Uses useRegisterContest mutation */}
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
            {contest.is_registered ? (
              <>
                <CheckCircle className="w-5 h-5" />
                Registered
              </>
            ) : registration.isPending ? (
              "Registering..."
            ) : (
              "Register for Contest"
            )}
          </button>
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
                {contest.contest_problems && contest.contest_problems.length > 0 ? (
                  contest.contest_problems.map((cp, index) => (
                    <div key={cp.id} className="flex items-center justify-between p-4 bg-surface-200/50 border border-surface-300 rounded-lg group hover:border-brand-500/30 transition-colors">
                      <div className="flex items-center gap-4">
                        <span className="text-2xl font-mono font-black text-slate-600 group-hover:text-brand-400">
                          {String.fromCharCode(65 + index)}
                        </span>
                        <div>
                          <div className="text-slate-100 font-medium">{cp.problem.title}</div>
                          <div className="text-slate-500 text-xs uppercase">{cp.problem.difficulty} • {cp.score} pts</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-slate-300 text-sm font-mono">
                          {cp.problem.accepted_submissions}/{cp.problem.total_submissions}
                        </div>
                        <div className="text-[10px] text-slate-500 uppercase">Solved</div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-10 border-2 border-dashed border-surface-300 rounded-xl">
                    <p className="text-slate-500">Problems will be revealed when the contest starts.</p>
                  </div>
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
            
            <div className="space-y-4">
              {leaderLoading ? (
                <div className="animate-pulse space-y-3">
                  {[1, 2, 3].map(i => <div key={i} className="h-10 bg-surface-300 rounded" />)}
                </div>
              ) : leaderboard && leaderboard.length > 0 ? (
                leaderboard.slice(0, 5).map((entry, index) => (
                  <div key={entry.username} className="flex items-center justify-between group">
                    <div className="flex items-center gap-3">
                      <span className={cn(
                        "text-xs font-bold w-5",
                        index === 0 ? "text-yellow-400" : "text-slate-600"
                      )}>
                        #{index + 1}
                      </span>
                      <span className="text-sm text-slate-300 group-hover:text-brand-400 transition-colors">
                        {entry.username}
                      </span>
                    </div>
                    <span className="text-sm font-mono text-brand-400 font-bold">{entry.final_score}</span>
                  </div>
                ))
              ) : (
                <p className="text-slate-500 text-sm italic">No participants yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}