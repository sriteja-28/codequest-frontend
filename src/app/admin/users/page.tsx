// "use client";
// import { useState } from "react";
// import { Search, Shield, Zap, Ban, ChevronDown } from "lucide-react";
// import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
// import { adminApi } from "@/lib/api";
// import { timeAgo, cn } from "@/lib/utils";

// export default function AdminUsersPage() {
//   const [search, setSearch] = useState("");
//   const [planFilter, setPlanFilter] = useState("");
//   const qc = useQueryClient();

//   const { data, isLoading } = useQuery({
//     queryKey: ["admin-users-list", search, planFilter],
//     queryFn: () => adminApi.users({ search, ...(planFilter ? { plan: planFilter } : {}) }).then(r => r.data),
//   });

//   const updateUser = useMutation({
//     mutationFn: ({ id, data }: { id: number; data: Record<string, unknown> }) =>
//       adminApi.updateUser(id, data),
//     onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-users-list"] }),
//   });

//   const changePlan = useMutation({
//     mutationFn: ({ userId, plan }: { userId: number; plan: string }) =>
//       adminApi.changePlan(userId, plan, 30),
//     onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-users-list"] }),
//   });

//   const users = data?.results ?? data ?? [];

//   return (
//     <div className="p-6">
//       <div className="mb-6">
//         <h1 className="font-display text-2xl font-bold text-slate-100">Users</h1>
//         <p className="text-slate-500 text-sm">{data?.count ?? users.length} total users</p>
//       </div>

//       {/* Filters */}
//       <div className="flex gap-3 mb-4">
//         <div className="relative flex-1 max-w-sm">
//           <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
//           <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by email or username…" className="input pl-9" />
//         </div>
//         <select value={planFilter} onChange={e => setPlanFilter(e.target.value)} className="input w-auto text-xs">
//           <option value="">All Plans</option>
//           <option value="FREE">Free</option>
//           <option value="PRO">Pro</option>
//         </select>
//       </div>

//       <div className="card overflow-hidden">
//         <table className="w-full text-sm">
//           <thead>
//             <tr className="border-b border-surface-300">
//               <th className="text-left px-4 py-3 text-xs text-slate-500">User</th>
//               <th className="text-left px-4 py-3 text-xs text-slate-500 hidden md:table-cell">Role</th>
//               <th className="text-left px-4 py-3 text-xs text-slate-500">Plan</th>
//               <th className="text-left px-4 py-3 text-xs text-slate-500 hidden lg:table-cell">Solved</th>
//               <th className="text-left px-4 py-3 text-xs text-slate-500 hidden lg:table-cell">Joined</th>
//               <th className="text-right px-4 py-3 text-xs text-slate-500">Actions</th>
//             </tr>
//           </thead>
//           <tbody className="divide-y divide-surface-300">
//             {isLoading && Array.from({ length: 8 }).map((_, i) => (
//               <tr key={i}><td colSpan={6} className="px-4 py-3"><div className="h-4 bg-surface-200 rounded animate-pulse" /></td></tr>
//             ))}
//             {users.map((u: any) => (
//               <tr key={u.id} className={cn("hover:bg-surface-50 transition-colors", u.is_banned && "opacity-50")}>
//                 <td className="px-4 py-3">
//                   <div className="flex items-center gap-2">
//                     <div className="w-8 h-8 rounded-full bg-surface-300 flex items-center justify-center text-xs font-bold text-slate-400 shrink-0">
//                       {u.username[0].toUpperCase()}
//                     </div>
//                     <div>
//                       <div className="font-medium text-slate-200">{u.username}</div>
//                       <div className="text-xs text-slate-500">{u.email}</div>
//                     </div>
//                   </div>
//                 </td>
//                 <td className="px-4 py-3 hidden md:table-cell">
//                   <span className={cn(
//                     "text-xs px-2 py-0.5 rounded font-medium",
//                     u.role === "ADMIN" ? "bg-brand-500/10 text-brand-400" : "bg-surface-200 text-slate-400"
//                   )}>
//                     {u.role}
//                   </span>
//                 </td>
//                 <td className="px-4 py-3">
//                   <span className={u.plan === "PRO" ? "badge-pro" : "badge-free"}>
//                     {u.plan === "PRO" ? "⚡ Pro" : "Free"}
//                   </span>
//                 </td>
//                 <td className="px-4 py-3 hidden lg:table-cell text-slate-400 text-xs tabular-nums">
//                   {u.problems_solved}
//                 </td>
//                 <td className="px-4 py-3 hidden lg:table-cell text-slate-500 text-xs">
//                   {timeAgo(u.created_at)}
//                 </td>
//                 <td className="px-4 py-3">
//                   <div className="flex items-center gap-1 justify-end">
//                     {/* Plan toggle */}
//                     <button
//                       onClick={() => changePlan.mutate({ userId: u.id, plan: u.plan === "PRO" ? "FREE" : "PRO" })}
//                       className="btn-ghost text-xs p-1.5"
//                       title={u.plan === "PRO" ? "Downgrade to Free" : "Upgrade to Pro (30 days)"}
//                     >
//                       <Zap className={cn("w-4 h-4", u.plan === "PRO" ? "text-brand-400" : "text-slate-500")} />
//                     </button>
//                     {/* Ban toggle */}
//                     <button
//                       onClick={() => updateUser.mutate({ id: u.id, data: { is_banned: !u.is_banned } })}
//                       className="btn-ghost text-xs p-1.5"
//                       title={u.is_banned ? "Unban user" : "Ban user"}
//                     >
//                       <Ban className={cn("w-4 h-4", u.is_banned ? "text-red-400" : "text-slate-500")} />
//                     </button>
//                   </div>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//         {!isLoading && users.length === 0 && (
//           <div className="py-12 text-center text-slate-500 text-sm">No users found.</div>
//         )}
//       </div>
//     </div>
//   );
// }


"use client";
import { useState } from "react";
import { Search, Zap, Ban, ShieldCheck } from "lucide-react";
import { useAdminUsers, useUpdateUser, useChangePlan } from "@/lib/hooks";
import { PlanBadge } from "@/components/ui/Badge";
import { timeAgo, cn } from "@/lib/utils";

export default function AdminUsersPage() {
  const [search,    setSearch]    = useState("");
  const [planFilter,setPlanFilter]= useState("");

  const { data, isLoading } = useAdminUsers({
    ...(search     ? { search }     : {}),
    ...(planFilter ? { plan: planFilter } : {}),
  });

  const updateUser = useUpdateUser();
  const changePlan = useChangePlan();

  // const users = data?.results ?? data ?? [];
  const users = data?.results ?? [];
  const total = data?.count ?? users.length;

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-slate-100">Users</h1>
        <p className="text-slate-500 text-sm">{total} total</p>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-4 flex-wrap">
        <div className="relative flex-1 min-w-48 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by email or username…" className="input pl-9" />
        </div>
        <select value={planFilter} onChange={(e) => setPlanFilter(e.target.value)} className="input w-auto text-xs">
          <option value="">All Plans</option>
          <option value="FREE">Free</option>
          <option value="PRO">Pro</option>
        </select>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-surface-300 text-xs text-slate-500">
              <th className="text-left px-4 py-3">User</th>
              <th className="text-left px-4 py-3 hidden md:table-cell">Role</th>
              <th className="text-left px-4 py-3">Plan</th>
              <th className="text-right px-4 py-3 hidden sm:table-cell">Solved</th>
              <th className="text-left px-4 py-3 hidden lg:table-cell">Joined</th>
              <th className="text-right px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-300">
            {isLoading && Array.from({ length: 8 }).map((_, i) => (
              <tr key={i}><td colSpan={6} className="px-4 py-3"><div className="h-4 bg-surface-200 rounded animate-pulse" /></td></tr>
            ))}
            {users.map((u: any) => (
              <tr key={u.id} className={cn("hover:bg-surface-50 transition-colors", u.is_banned && "opacity-50")}>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-surface-300 flex items-center justify-center text-xs font-bold text-slate-400 shrink-0">
                      {u.username[0].toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="font-medium text-slate-200 text-sm truncate">{u.username}</div>
                      <div className="text-xs text-slate-500 truncate">{u.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 hidden md:table-cell">
                  <span className={cn(
                    "text-xs px-2 py-0.5 rounded font-medium",
                    u.role === "ADMIN" ? "bg-brand-500/10 text-brand-400" : "bg-surface-200 text-slate-400"
                  )}>
                    {u.role}
                  </span>
                </td>
                <td className="px-4 py-3"><PlanBadge plan={u.plan} /></td>
                <td className="px-4 py-3 text-right hidden sm:table-cell text-slate-400 text-xs tabular-nums">
                  {u.problems_solved}
                </td>
                <td className="px-4 py-3 hidden lg:table-cell text-xs text-slate-500">{timeAgo(u.created_at)}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1 justify-end">
                    {/* Toggle Pro */}
                    <button
                      onClick={() => changePlan.mutate({ userId: u.id, plan: u.plan === "PRO" ? "FREE" : "PRO", days: 30 })}
                      title={u.plan === "PRO" ? "Downgrade to Free" : "Grant Pro (30 days)"}
                      className="p-1.5 rounded hover:bg-surface-200 transition-colors">
                      <Zap className={cn("w-4 h-4", u.plan === "PRO" ? "text-brand-400" : "text-slate-500")} />
                    </button>
                    {/* Ban / Unban */}
                    <button
                      onClick={() => updateUser.mutate({ id: u.id, data: { is_banned: !u.is_banned } })}
                      title={u.is_banned ? "Unban" : "Ban"}
                      className="p-1.5 rounded hover:bg-surface-200 transition-colors">
                      {u.is_banned
                        ? <ShieldCheck className="w-4 h-4 text-emerald-400" />
                        : <Ban className="w-4 h-4 text-slate-500 hover:text-red-400 transition-colors" />}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!isLoading && users.length === 0 && (
          <div className="py-12 text-center text-slate-500 text-sm">No users found.</div>
        )}
      </div>
    </div>
  );
}