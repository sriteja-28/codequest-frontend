"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Trophy } from "lucide-react";
import Navbar from "@/components/ui/Navbar";
import { PageSpinner } from "@/components/ui/Spinner";
import { useLeaderboard, useContest } from "@/lib/hooks";
import { leaderboardWS } from "@/lib/ws";
import { cn } from "@/lib/utils";
import type { LeaderboardEntry } from "@/types";

export default function LeaderboardPage() {
  const { slug }          = useParams<{ slug: string }>();
  const { data: contest } = useContest(slug);
  const { data: initial, isLoading } = useLeaderboard(slug);
  const [entries,      setEntries]      = useState<LeaderboardEntry[]>([]);
  const [wsConnected,  setWsConnected]  = useState(false);

  useEffect(() => {
    if (initial) setEntries(initial);
  }, [initial]);

  useEffect(() => {
    if (!slug) return;
    const ws  = leaderboardWS(slug);
    ws.connect();
    const off = ws.on((msg) => {
      if (msg.type === "connected")          setWsConnected(true);
      if (msg.type === "leaderboard_update") setEntries(msg.entries as LeaderboardEntry[]);
    });
    return () => { off(); ws.close(); };
  }, [slug]);

  const medal = (rank: number | null) => {
    if (rank === 1) return "🥇";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    return rank ?? "—";
  };

  return (
    <>
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="flex items-center gap-3 mb-8 flex-wrap">
          <Link href={`/contests/${slug}`} className="p-2 text-slate-500 hover:text-slate-200 hover:bg-surface-100 rounded-lg transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="flex-1">
            <h1 className="font-display text-2xl font-bold text-slate-100">Leaderboard</h1>
            {contest && <p className="text-slate-500 text-sm">{contest.name}</p>}
          </div>
          {/* Live indicator */}
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <div className={cn("w-2 h-2 rounded-full", wsConnected ? "bg-emerald-400 animate-pulse" : "bg-slate-600")} />
            {wsConnected ? "Live updates" : "Connecting…"}
          </div>
        </div>

        {isLoading && <PageSpinner />}

        {/* Podium (top 3) */}
        {entries.length >= 3 && (
          <div className="grid grid-cols-3 gap-3 mb-8">
            {[entries[1], entries[0], entries[2]].map((e, pi) => {
              const isFirst = pi === 1;
              const medals  = ["🥈","🥇","🥉"];
              return (
                <div key={e.username} className={cn(
                  "card p-4 text-center flex flex-col items-center gap-2 transition-all",
                  isFirst && "border-amber-500/30 bg-amber-500/5 -mt-3 pb-5 shadow-lg shadow-amber-900/10"
                )}>
                  <div className="text-3xl">{medals[pi]}</div>
                  <div className="w-10 h-10 rounded-full bg-brand-800 flex items-center justify-center text-sm font-bold text-brand-200">
                    {(e.display_name || e.username)[0].toUpperCase()}
                  </div>
                  <div className="text-sm font-medium text-slate-200 truncate max-w-full">{e.username}</div>
                  <div className={cn("text-lg font-bold", isFirst ? "text-amber-400" : "text-brand-400")}>
                    {e.final_score}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Full table */}
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-surface-300 text-xs text-slate-500">
                <th className="text-center px-4 py-3 w-16">Rank</th>
                <th className="text-left px-4 py-3">Participant</th>
                <th className="text-right px-4 py-3">Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-300">
              {entries.map((e) => (
                <tr key={e.username}
                  className={cn(
                    "hover:bg-surface-50 transition-colors",
                    e.is_disqualified && "opacity-40 line-through"
                  )}>
                  <td className="px-4 py-3 text-center text-lg">
                    {typeof medal(e.rank) === "string" ? medal(e.rank) : (
                      <span className="text-slate-500 text-sm tabular-nums">{medal(e.rank)}</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-surface-300 flex items-center justify-center text-xs font-bold text-slate-300 shrink-0">
                        {(e.display_name || e.username)[0].toUpperCase()}
                      </div>
                      <div>
                        <div className="font-medium text-slate-200 text-sm">{e.username}</div>
                        {e.display_name && <div className="text-xs text-slate-500">{e.display_name}</div>}
                      </div>
                      {e.is_disqualified && (
                        <span className="text-xs text-red-400 bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20">DQ</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-brand-400 tabular-nums">
                    {e.final_score}
                  </td>
                </tr>
              ))}
              {entries.length === 0 && !isLoading && (
                <tr><td colSpan={3} className="py-12 text-center text-slate-500 text-sm">
                  No participants yet. Be the first to register!
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}