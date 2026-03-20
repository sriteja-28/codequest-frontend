// "use client";
// import { useState } from "react";
// import { Trophy, Plus, Users, Clock } from "lucide-react";
// import { useQuery } from "@tanstack/react-query";
// import { api } from "@/lib/api";
// import { cn, timeAgo } from "@/lib/utils";
// import { format } from "date-fns";

// export default function AdminContestsPage() {
//   const { data, isLoading } = useQuery({
//     queryKey: ["admin-contests"],
//     queryFn: () => api.get("/contests/admin/contests/").then(r => r.data),
//   });

//   const contests = data?.results ?? data ?? [];

//   return (
//     <div className="p-6">
//       <div className="flex items-center justify-between mb-6">
//         <div>
//           <h1 className="font-display text-2xl font-bold text-slate-100">Contests</h1>
//           <p className="text-slate-500 text-sm">{contests.length} total</p>
//         </div>
//         <button className="btn-primary text-sm"><Plus className="w-4 h-4" /> New Contest</button>
//       </div>

//       <div className="flex flex-col gap-3">
//         {isLoading && Array.from({ length: 4 }).map((_, i) => (
//           <div key={i} className="card h-20 animate-pulse bg-surface-100" />
//         ))}
//         {contests.map((c: any) => (
//           <div key={c.slug} className="card p-5 flex items-center gap-5">
//             <div className={cn(
//               "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
//               c.status === "live" ? "bg-emerald-500/10" : c.status === "upcoming" ? "bg-blue-500/10" : "bg-surface-200"
//             )}>
//               <Trophy className={cn("w-5 h-5", c.status === "live" ? "text-emerald-400" : c.status === "upcoming" ? "text-blue-400" : "text-slate-500")} />
//             </div>
//             <div className="flex-1 min-w-0">
//               <div className="flex items-center gap-2 mb-1">
//                 <span className="font-semibold text-slate-200">{c.name}</span>
//                 <span className={cn(
//                   "text-xs px-2 py-0.5 rounded font-medium",
//                   c.status === "live" ? "text-emerald-400 bg-emerald-500/10" :
//                   c.status === "upcoming" ? "text-blue-400 bg-blue-500/10" : "text-slate-500 bg-surface-200"
//                 )}>
//                   {c.status?.toUpperCase()}
//                 </span>
//                 {c.is_rated && <span className="badge-pro text-xs">Rated</span>}
//               </div>
//               <div className="flex items-center gap-4 text-xs text-slate-500">
//                 <span><Clock className="w-3 h-3 inline mr-1" />{format(new Date(c.start_at), "MMM d, yyyy h:mm a")}</span>
//                 <span>{c.duration_minutes}m</span>
//               </div>
//             </div>
//             <a href={`/contests/${c.slug}`} className="btn-ghost text-xs">View →</a>
//             <a href={`/admin/contests/${c.slug}`} className="btn-ghost text-xs">Edit →</a>
//           </div>
//         ))}
//         {!isLoading && contests.length === 0 && (
//           <div className="card py-12 text-center text-slate-500 text-sm">No contests yet.</div>
//         )}
//       </div>
//     </div>
//   );
// }


"use client";
import { Plus, Trophy } from "lucide-react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { axiosClient } from "@/lib/api";
import { ContestStatusBadge } from "@/components/ui/Badge";
import { PageSpinner } from "@/components/ui/Spinner";
import EmptyState from "@/components/ui/EmptyState";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

export default function AdminContestsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "contests"],
    queryFn: () => axiosClient.get("/contests/admin/contests/").then((r) => r.data),
  });

  const contests = data?.results ?? data ?? [];

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-100">Contests</h1>
          <p className="text-slate-500 text-sm">{contests.length} total</p>
        </div>
        <button className="btn-primary text-sm">
          <Plus className="w-4 h-4" /> New Contest
        </button>
      </div>

      {isLoading && <PageSpinner />}

      {!isLoading && contests.length === 0 && (
        <EmptyState icon={Trophy} title="No contests yet" description="Create your first contest to get started." />
      )}

      <div className="space-y-3">
        {contests.map((c: any) => (
          <div key={c.slug} className="card p-5 flex items-center gap-4 flex-wrap">
            <div className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
              c.status === "live"     ? "bg-emerald-500/10" :
              c.status === "upcoming" ? "bg-blue-500/10"    : "bg-surface-200"
            )}>
              <Trophy className={cn("w-5 h-5",
                c.status === "live"     ? "text-emerald-400" :
                c.status === "upcoming" ? "text-blue-400"    : "text-slate-500"
              )} />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="font-semibold text-slate-200 truncate">{c.name}</span>
                <ContestStatusBadge status={c.status} />
                {c.is_rated && <span className="text-xs text-brand-400 bg-brand-500/10 px-1.5 py-0.5 rounded border border-brand-500/20">Rated</span>}
              </div>
              <div className="text-xs text-slate-500">
                {format(new Date(c.start_at), "MMM d, yyyy · h:mm a")} · {c.duration_minutes}m
              </div>
            </div>

            <div className="flex gap-2 shrink-0">
              <Link href={`/contests/${c.slug}`} className="btn-ghost text-xs">View</Link>
              <Link href={`/contests/${c.slug}/leaderboard`} className="btn-ghost text-xs">Leaderboard</Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}