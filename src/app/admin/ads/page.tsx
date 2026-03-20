// "use client";
// import { useState } from "react";
// import { Plus, Edit2, ToggleLeft, ToggleRight } from "lucide-react";
// import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
// import { api } from "@/lib/api";
// import { timeAgo, cn } from "@/lib/utils";
// import { format } from "date-fns";

// function useAdminAds() {
//   return useQuery({
//     queryKey: ["admin-ads"],
//     queryFn: async () => {
//       const [placements, creatives] = await Promise.all([
//         api.get("/layout/admin/placements/").then(r => r.data),
//         api.get("/layout/admin/creatives/").then(r => r.data),
//       ]);
//       return { placements: placements.results ?? placements, creatives: creatives.results ?? creatives };
//     },
//   });
// }

// export default function AdminAdsPage() {
//   const { data, isLoading } = useAdminAds();
//   const qc = useQueryClient();

//   const toggleCreative = useMutation({
//     mutationFn: ({ id, is_active }: { id: number; is_active: boolean }) =>
//       api.patch(`/layout/admin/creatives/${id}/`, { is_active }),
//     onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-ads"] }),
//   });

//   const placements = data?.placements ?? [];
//   const creatives = data?.creatives ?? [];

//   return (
//     <div className="p-6">
//       <div className="flex items-center justify-between mb-6">
//         <div>
//           <h1 className="font-display text-2xl font-bold text-slate-100">Ad Management</h1>
//           <p className="text-slate-500 text-sm">{placements.length} placements · {creatives.length} creatives</p>
//         </div>
//       </div>

//       {/* Placements */}
//       <div className="mb-8">
//         <h2 className="font-display font-semibold text-slate-300 mb-3 text-sm uppercase tracking-wider">Ad Placements</h2>
//         <div className="card divide-y divide-surface-300">
//           {placements.map((p: any) => (
//             <div key={p.id} className="px-4 py-3 flex items-center gap-4">
//               <div className={cn("w-2 h-2 rounded-full shrink-0", p.is_active ? "bg-emerald-400" : "bg-slate-600")} />
//               <div className="flex-1">
//                 <div className="text-sm font-medium text-slate-200">{p.key}</div>
//                 <div className="text-xs text-slate-500">{p.position} · max {p.max_per_page}/page</div>
//               </div>
//               <span className="text-xs text-slate-500">{p.description}</span>
//             </div>
//           ))}
//           {placements.length === 0 && (
//             <div className="py-8 text-center text-slate-500 text-sm">No placements configured.</div>
//           )}
//         </div>
//       </div>

//       {/* Creatives */}
//       <div>
//         <h2 className="font-display font-semibold text-slate-300 mb-3 text-sm uppercase tracking-wider">Ad Creatives</h2>
//         <div className="card divide-y divide-surface-300">
//           {creatives.map((c: any) => (
//             <div key={c.id} className="px-4 py-4 flex items-start gap-4">
//               <div className={cn("w-2 h-2 rounded-full shrink-0 mt-2", c.is_active ? "bg-emerald-400" : "bg-slate-600")} />
//               <div className="flex-1 min-w-0">
//                 <div className="flex items-center gap-2 mb-1">
//                   <span className="text-sm font-medium text-slate-200">{c.name}</span>
//                   <span className={cn("text-xs px-1.5 py-0.5 rounded", c.plan_target === "FREE" ? "bg-slate-500/10 text-slate-400" : "bg-brand-500/10 text-brand-400")}>
//                     {c.plan_target}
//                   </span>
//                   <span className="text-xs text-slate-600">priority: {c.priority}</span>
//                 </div>
//                 <div className="text-xs text-slate-500">
//                   {format(new Date(c.start_at), "MMM d")} → {format(new Date(c.end_at), "MMM d, yyyy")}
//                 </div>
//                 {c.link_url && (
//                   <a href={c.link_url} target="_blank" rel="noopener noreferrer" className="text-xs text-brand-400 hover:underline mt-0.5 block truncate max-w-xs">
//                     {c.link_url}
//                   </a>
//                 )}
//               </div>
//               <button
//                 onClick={() => toggleCreative.mutate({ id: c.id, is_active: !c.is_active })}
//                 className={cn("shrink-0", c.is_active ? "text-emerald-400" : "text-slate-600")}
//                 title={c.is_active ? "Deactivate" : "Activate"}
//               >
//                 {c.is_active ? <ToggleRight className="w-6 h-6" /> : <ToggleLeft className="w-6 h-6" />}
//               </button>
//             </div>
//           ))}
//           {creatives.length === 0 && (
//             <div className="py-8 text-center text-slate-500 text-sm">No ad creatives yet.</div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }

"use client";
import { ToggleLeft, ToggleRight } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosClient } from "@/lib/api";
import { PageSpinner } from "@/components/ui/Spinner";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

function useAdminAds() {
  return useQuery({
    queryKey: ["admin", "ads"],
    queryFn: async () => {
      const [p, c] = await Promise.all([
        axiosClient.get("/layout/admin/placements/").then((r) => r.data),
        axiosClient.get("/layout/admin/creatives/").then((r) => r.data),
      ]);
      return { placements: p.results ?? p, creatives: c.results ?? c };
    },
  });
}

export default function AdminAdsPage() {
  const qc                  = useQueryClient();
  const { data, isLoading } = useAdminAds();

  const toggleCreative = useMutation({
    mutationFn: ({ id, is_active }: { id: number; is_active: boolean }) =>
      axiosClient.patch(`/layout/admin/creatives/${id}/`, { is_active }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "ads"] }),
  });

  if (isLoading) return <div className="p-6"><PageSpinner /></div>;

  const placements = data?.placements ?? [];
  const creatives  = data?.creatives  ?? [];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-slate-100">Ad Management</h1>
        <p className="text-slate-500 text-sm">{placements.length} placements · {creatives.length} creatives</p>
      </div>

      {/* Placements */}
      <div className="mb-8">
        <h2 className="font-display font-semibold text-slate-300 text-sm uppercase tracking-wider mb-3">Placements</h2>
        <div className="card divide-y divide-surface-300">
          {placements.map((p: any) => (
            <div key={p.id} className="px-4 py-3 flex items-center gap-3">
              <div className={cn("w-2 h-2 rounded-full shrink-0", p.is_active ? "bg-emerald-400" : "bg-slate-600")} />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-slate-200">{p.key}</div>
                <div className="text-xs text-slate-500">{p.position} · max {p.max_per_page}/page</div>
              </div>
              <span className="text-xs text-slate-500 hidden sm:block truncate max-w-[200px]">{p.description}</span>
            </div>
          ))}
          {placements.length === 0 && <div className="py-8 text-center text-slate-500 text-sm">No placements.</div>}
        </div>
      </div>

      {/* Creatives */}
      <div>
        <h2 className="font-display font-semibold text-slate-300 text-sm uppercase tracking-wider mb-3">Creatives</h2>
        <div className="card divide-y divide-surface-300">
          {creatives.map((c: any) => (
            <div key={c.id} className="px-4 py-4 flex items-start gap-3">
              <div className={cn("w-2 h-2 rounded-full shrink-0 mt-2", c.is_active ? "bg-emerald-400" : "bg-slate-600")} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="text-sm font-medium text-slate-200">{c.name}</span>
                  <span className={cn(
                    "text-xs px-1.5 py-0.5 rounded",
                    c.plan_target === "FREE" ? "bg-slate-500/10 text-slate-400" : "bg-brand-500/10 text-brand-400"
                  )}>
                    {c.plan_target}
                  </span>
                  <span className="text-xs text-slate-600">priority: {c.priority}</span>
                </div>
                <div className="text-xs text-slate-500">
                  {format(new Date(c.start_at), "MMM d")} → {format(new Date(c.end_at), "MMM d, yyyy")}
                </div>
                {c.link_url && (
                  <a href={c.link_url} target="_blank" rel="noopener noreferrer"
                    className="text-xs text-brand-400 hover:underline mt-0.5 block truncate max-w-xs">
                    {c.link_url}
                  </a>
                )}
              </div>
              <button
                onClick={() => toggleCreative.mutate({ id: c.id, is_active: !c.is_active })}
                className={cn("shrink-0 transition-colors", c.is_active ? "text-emerald-400" : "text-slate-600 hover:text-slate-400")}
                title={c.is_active ? "Deactivate" : "Activate"}>
                {c.is_active ? <ToggleRight className="w-6 h-6" /> : <ToggleLeft className="w-6 h-6" />}
              </button>
            </div>
          ))}
          {creatives.length === 0 && <div className="py-8 text-center text-slate-500 text-sm">No creatives.</div>}
        </div>
      </div>
    </div>
  );
}