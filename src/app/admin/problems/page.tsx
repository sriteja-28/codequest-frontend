// "use client";
// import { useState } from "react";
// import { Plus, Edit2, Eye, EyeOff, Search, Tag } from "lucide-react";
// import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
// import { adminApi, api } from "@/lib/api";
// import { difficultyColor, timeAgo, cn } from "@/lib/utils";

// function useAdminProblems(search?: string) {
//   return useQuery({
//     queryKey: ["admin-problems", search],
//     queryFn: () => api.get("/problems/admin/problems/", { params: { search } }).then(r => r.data),
//   });
// }

// function useTogglePublished() {
//   const qc = useQueryClient();
//   return useMutation({
//     mutationFn: ({ slug, is_published }: { slug: string; is_published: boolean }) =>
//       api.patch(`/problems/admin/problems/${slug}/`, { is_published }),
//     onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-problems"] }),
//   });
// }

// export default function AdminProblemsPage() {
//   const [search, setSearch] = useState("");
//   const [editSlug, setEditSlug] = useState<string | null>(null);
//   const { data, isLoading } = useAdminProblems(search);
//   const toggle = useTogglePublished();
//   const problems = data?.results ?? data ?? [];

//   return (
//     <div className="p-6">
//       <div className="flex items-center justify-between mb-6">
//         <div>
//           <h1 className="font-display text-2xl font-bold text-slate-100">Problems</h1>
//           <p className="text-slate-500 text-sm">{problems.length} total</p>
//         </div>
//         <a href="/admin/problems/new" className="btn-primary text-sm">
//           <Plus className="w-4 h-4" /> New Problem
//         </a>
//       </div>

//       {/* Search */}
//       <div className="relative mb-4 max-w-sm">
//         <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
//         <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search problems…" className="input pl-9" />
//       </div>

//       <div className="card overflow-hidden">
//         <table className="w-full text-sm">
//           <thead>
//             <tr className="border-b border-surface-300">
//               <th className="text-left px-4 py-3 text-xs text-slate-500">#</th>
//               <th className="text-left px-4 py-3 text-xs text-slate-500">Title</th>
//               <th className="text-left px-4 py-3 text-xs text-slate-500 hidden md:table-cell">Difficulty</th>
//               <th className="text-left px-4 py-3 text-xs text-slate-500 hidden lg:table-cell">Section</th>
//               <th className="text-left px-4 py-3 text-xs text-slate-500 hidden lg:table-cell">Updated</th>
//               <th className="text-right px-4 py-3 text-xs text-slate-500">Actions</th>
//             </tr>
//           </thead>
//           <tbody className="divide-y divide-surface-300">
//             {isLoading && Array.from({ length: 6 }).map((_, i) => (
//               <tr key={i}><td colSpan={6} className="px-4 py-3"><div className="h-4 bg-surface-200 rounded animate-pulse" /></td></tr>
//             ))}
//             {problems.map((p: any) => (
//               <tr key={p.slug} className="hover:bg-surface-50 transition-colors">
//                 <td className="px-4 py-3 text-slate-500 text-xs">{p.number ?? "—"}</td>
//                 <td className="px-4 py-3">
//                   <div className="font-medium text-slate-200">{p.title}</div>
//                   <div className="text-xs text-slate-500 mt-0.5">{p.slug}</div>
//                 </td>
//                 <td className="px-4 py-3 hidden md:table-cell">
//                   <span className={`text-xs font-medium ${difficultyColor(p.difficulty)}`}>
//                     {p.difficulty}
//                   </span>
//                 </td>
//                 <td className="px-4 py-3 hidden lg:table-cell text-xs text-slate-500">
//                   {p.section?.display_name ?? "—"}
//                 </td>
//                 <td className="px-4 py-3 hidden lg:table-cell text-xs text-slate-500">
//                   {timeAgo(p.updated_at)}
//                 </td>
//                 <td className="px-4 py-3">
//                   <div className="flex items-center gap-2 justify-end">
//                     <button
//                       onClick={() => toggle.mutate({ slug: p.slug, is_published: !p.is_published })}
//                       className={cn("btn-ghost text-xs p-1.5", p.is_published ? "text-emerald-400" : "text-slate-500")}
//                       title={p.is_published ? "Published — click to unpublish" : "Draft — click to publish"}
//                     >
//                       {p.is_published ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
//                     </button>
//                     <a href={`/admin/problems/${p.slug}`} className="btn-ghost text-xs p-1.5">
//                       <Edit2 className="w-4 h-4" />
//                     </a>
//                   </div>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//         {!isLoading && problems.length === 0 && (
//           <div className="py-12 text-center text-slate-500 text-sm">No problems found.</div>
//         )}
//       </div>
//     </div>
//   );
// }


"use client";
import { useState } from "react";
import { Plus, Edit2, Eye, EyeOff, Search } from "lucide-react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosClient } from "@/lib/api";
import { DifficultyBadge } from "@/components/ui/Badge";
import { timeAgo, cn } from "@/lib/utils";

function useAdminProblems(search?: string) {
  return useQuery({
    queryKey: ["admin", "problems", search],
    queryFn: () => axiosClient.get("/problems/admin/problems/", { params: { search } }).then((r) => r.data),
  });
}

export default function AdminProblemsPage() {
  const [search, setSearch] = useState("");
  const qc = useQueryClient();
  const { data, isLoading } = useAdminProblems(search || undefined);

  const toggle = useMutation({
    mutationFn: ({ slug, is_published }: { slug: string; is_published: boolean }) =>
      axiosClient.patch(`/problems/admin/problems/${slug}/`, { is_published }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "problems"] }),
  });

  const problems = data?.results ?? data ?? [];

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-100">Problems</h1>
          <p className="text-slate-500 text-sm">{problems.length} total</p>
        </div>
        <button className="btn-primary text-sm">
          <Plus className="w-4 h-4" /> New Problem
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-4 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <input value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by title or slug…" className="input pl-9" />
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-surface-300 text-xs text-slate-500">
              <th className="text-left px-4 py-3 w-10">#</th>
              <th className="text-left px-4 py-3">Title</th>
              <th className="text-left px-4 py-3 hidden md:table-cell">Difficulty</th>
              <th className="text-left px-4 py-3 hidden lg:table-cell">Section</th>
              <th className="text-left px-4 py-3 hidden lg:table-cell">Updated</th>
              <th className="text-center px-4 py-3">Status</th>
              <th className="text-right px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-300">
            {isLoading && Array.from({ length: 8 }).map((_, i) => (
              <tr key={i}><td colSpan={7} className="px-4 py-3"><div className="h-4 bg-surface-200 rounded animate-pulse" /></td></tr>
            ))}
            {problems.map((p: any) => (
              <tr key={p.slug} className="hover:bg-surface-50 transition-colors">
                <td className="px-4 py-3 text-slate-600 text-xs tabular-nums">{p.number ?? "—"}</td>
                <td className="px-4 py-3">
                  <div className="font-medium text-slate-200 text-sm">{p.title}</div>
                  <div className="text-xs text-slate-500">{p.slug}</div>
                </td>
                <td className="px-4 py-3 hidden md:table-cell">
                  <DifficultyBadge difficulty={p.difficulty} />
                </td>
                <td className="px-4 py-3 hidden lg:table-cell text-xs text-slate-500">
                  {p.section?.display_name ?? "—"}
                </td>
                <td className="px-4 py-3 hidden lg:table-cell text-xs text-slate-500">
                  {timeAgo(p.updated_at)}
                </td>
                <td className="px-4 py-3 text-center">
                  <span className={cn(
                    "text-xs px-2 py-0.5 rounded font-medium",
                    p.is_published
                      ? "bg-emerald-500/10 text-emerald-400"
                      : "bg-slate-500/10 text-slate-500"
                  )}>
                    {p.is_published ? "Published" : "Draft"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1 justify-end">
                    <button
                      onClick={() => toggle.mutate({ slug: p.slug, is_published: !p.is_published })}
                      className="p-1.5 text-slate-500 hover:text-slate-200 hover:bg-surface-200 rounded transition-colors"
                      title={p.is_published ? "Unpublish" : "Publish"}>
                      {p.is_published ? <Eye className="w-4 h-4 text-emerald-400" /> : <EyeOff className="w-4 h-4" />}
                    </button>
                    <Link href={`/admin/problems/${p.slug}`}
                      className="p-1.5 text-slate-500 hover:text-slate-200 hover:bg-surface-200 rounded transition-colors">
                      <Edit2 className="w-4 h-4" />
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!isLoading && problems.length === 0 && (
          <div className="py-12 text-center text-slate-500 text-sm">No problems found.</div>
        )}
      </div>
    </div>
  );
}