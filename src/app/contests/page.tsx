"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { Calendar, Users, Trophy } from "lucide-react";
import { api } from "@/lib/api";

export default function ContestsPage() {
  const { data: contests, isLoading } = useQuery({
    queryKey: ["contests"],
    queryFn: async () => {
      const raw = await api.contests.list();
      return raw.map(c => ({
        ...c,
        title: c.name,
        description: c.description_md,
        start_time: c.start_at,
        end_time: c.end_at,
        status: c.status === "upcoming" ? "UPCOMING" :
                c.status === "live" ? "ONGOING" : "ENDED",
        problem_count: c.contest_problems?.length ?? 0,
        participant_count: c.participant_count,
      }));
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-slate-400">Loading contests...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-slate-100">Contests</h1>
        <div className="text-sm text-slate-400">
          {contests?.length || 0} contests available
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {contests?.map((contest) => (
          <Link
            key={contest.id}
            href={`/contests/${contest.slug}`}
            className="block p-6 bg-surface-2 rounded-lg border border-surface-3 hover:border-brand-500/50 transition-colors"
          >
            <div className="flex items-start justify-between mb-4">
              <h2 className="text-xl font-semibold text-slate-100 hover:text-brand-400">
                {contest.title}
              </h2>
              <span className={`px-2 py-1 rounded text-xs font-medium ${
                contest.status === "UPCOMING" ? "text-blue-400 bg-blue-900/20" :
                contest.status === "ONGOING" ? "text-green-400 bg-green-900/20" :
                "text-slate-400 bg-slate-900/20"
              }`}>
                {contest.status}
              </span>
            </div>

            <p className="text-slate-400 mb-4 line-clamp-2">
              {contest.description}
            </p>

            <div className="space-y-2 text-sm text-slate-500">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>Starts: {new Date(contest.start_time).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span>{contest.participant_count} participants</span>
              </div>
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4" />
                <span>{contest.problem_count} problems</span>
              </div>
            </div>
          </Link>
        ))}

        {contests?.length === 0 && (
          <div className="col-span-full text-center py-12">
            <p className="text-slate-400">No contests available yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}