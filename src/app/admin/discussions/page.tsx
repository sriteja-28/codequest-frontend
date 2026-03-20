// "use client";
// import { Flag, EyeOff, Trash2, CheckCircle } from "lucide-react";
// import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
// import { adminApi } from "@/lib/api";
// import { timeAgo } from "@/lib/utils";

// export default function AdminDiscussionsPage() {
//   const qc = useQueryClient();
//   const { data, isLoading } = useQuery({
//     queryKey: ["flagged-comments"],
//     queryFn: () => adminApi.flaggedComments().then(r => r.data),
//   });

//   const moderate = useMutation({
//     mutationFn: ({ id, action }: { id: number; action: "hide" | "clear" }) =>
//       adminApi.moderateComment(id, action === "hide" ? { is_hidden: true } : { is_flagged: false }),
//     onSuccess: () => qc.invalidateQueries({ queryKey: ["flagged-comments"] }),
//   });

//   const comments = data?.flagged_comments ?? [];

//   return (
//     <div className="p-6">
//       <div className="mb-6">
//         <h1 className="font-display text-2xl font-bold text-slate-100">Discussion Moderation</h1>
//         <p className="text-slate-500 text-sm">{comments.length} flagged comment{comments.length !== 1 ? "s" : ""} awaiting review</p>
//       </div>

//       {comments.length === 0 && !isLoading && (
//         <div className="card py-16 text-center">
//           <CheckCircle className="w-10 h-10 text-emerald-400 mx-auto mb-3" />
//           <p className="text-slate-400 font-medium">All clear!</p>
//           <p className="text-slate-500 text-sm">No flagged comments.</p>
//         </div>
//       )}

//       <div className="flex flex-col gap-3">
//         {comments.map((c: any) => (
//           <div key={c.id} className="card p-4 border-amber-500/20">
//             <div className="flex items-start justify-between gap-4">
//               <div className="flex-1 min-w-0">
//                 <div className="flex items-center gap-2 mb-2">
//                   <Flag className="w-3.5 h-3.5 text-amber-400 shrink-0" />
//                   <span className="text-xs text-amber-400 font-medium">Flagged</span>
//                   <span className="text-xs text-slate-500">by <strong className="text-slate-400">{c.created_by}</strong></span>
//                   <span className="text-xs text-slate-600 ml-auto">{timeAgo(c.created_at)}</span>
//                 </div>
//                 <div className="text-sm text-slate-300 bg-surface-200 rounded-lg p-3 font-mono text-xs leading-relaxed">
//                   {c.body_preview}
//                   {c.body_preview?.length >= 200 && <span className="text-slate-500">…</span>}
//                 </div>
//                 <div className="mt-2 text-xs text-slate-500">
//                   In thread on problem: <a href={`/discuss/${c.problem_slug}`} className="text-brand-400 hover:underline">{c.problem_slug}</a>
//                 </div>
//               </div>

//               <div className="flex flex-col gap-2 shrink-0">
//                 <button
//                   onClick={() => moderate.mutate({ id: c.id, action: "hide" })}
//                   className="btn-danger text-xs flex items-center gap-1.5"
//                 >
//                   <EyeOff className="w-3.5 h-3.5" /> Hide
//                 </button>
//                 <button
//                   onClick={() => moderate.mutate({ id: c.id, action: "clear" })}
//                   className="btn-ghost text-xs flex items-center gap-1.5 text-emerald-400"
//                 >
//                   <CheckCircle className="w-3.5 h-3.5" /> Clear Flag
//                 </button>
//               </div>
//             </div>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// } 

"use client";
import { CheckCircle2, EyeOff, Flag } from "lucide-react";
import { useFlaggedComments, useModerateComment } from "@/lib/hooks";
import { PageSpinner } from "@/components/ui/Spinner";
import EmptyState from "@/components/ui/EmptyState";
import { timeAgo } from "@/lib/utils";
import Link from "next/link";

export default function AdminDiscussionsPage() {
  const { data, isLoading } = useFlaggedComments();
  const moderate            = useModerateComment();

  const comments = data?.flagged_comments ?? [];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-slate-100">Discussion Moderation</h1>
        <p className="text-slate-500 text-sm">
          {isLoading ? "Loading…" : `${comments.length} flagged comment${comments.length !== 1 ? "s" : ""} awaiting review`}
        </p>
      </div>

      {isLoading && <PageSpinner />}

      {!isLoading && comments.length === 0 && (
        <EmptyState icon={CheckCircle2} title="All clear!" description="No flagged comments to review." />
      )}

      <div className="space-y-3">
        {comments.map((c) => (
          <div key={c.id} className="card p-4 border-amber-500/20 bg-amber-500/3">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="flex-1 min-w-0">
                {/* Meta */}
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <Flag className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span className="text-xs text-amber-400 font-medium">Flagged</span>
                  <span className="text-xs text-slate-500">
                    by <strong className="text-slate-400">{c.created_by}</strong>
                  </span>
                  <span className="text-xs text-slate-600 ml-auto">{timeAgo(c.created_at)}</span>
                </div>

                {/* Preview */}
                <div className="bg-surface-200 rounded-lg p-3 text-xs font-mono text-slate-300 leading-relaxed">
                  {c.body_preview}
                  {c.body_preview?.length >= 200 && <span className="text-slate-500">…</span>}
                </div>

                {/* Link to problem */}
                <div className="mt-2 text-xs text-slate-500">
                  Problem:{" "}
                  <Link href={`/discuss/${c.problem_slug}`} className="text-brand-400 hover:underline">
                    {c.problem_slug}
                  </Link>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-2 shrink-0">
                <button
                  onClick={() => moderate.mutate({ id: c.id, data: { is_hidden: true } })}
                  disabled={moderate.isPending}
                  className="btn-danger text-xs flex items-center gap-1.5">
                  <EyeOff className="w-3.5 h-3.5" /> Hide Comment
                </button>
                <button
                  onClick={() => moderate.mutate({ id: c.id, data: { is_flagged: false } })}
                  disabled={moderate.isPending}
                  className="btn-ghost text-xs flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Clear Flag
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}