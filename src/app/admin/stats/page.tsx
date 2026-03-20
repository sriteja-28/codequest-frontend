// "use client";
// import { useAdminStats } from "@/lib/hooks";
// import { useQuery } from "@tanstack/react-query";
// import { adminApi } from "@/lib/api";
// import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

// export default function AdminStatsPage() {
//   const { data: overview } = useAdminStats();
//   const { data: problemStats } = useQuery({
//     queryKey: ["admin-stats-problems"],
//     queryFn: () => adminApi.statsProblems().then(r => r.data),
//   });

//   const DIFF_COLORS: Record<string, string> = { EASY: "#34d399", MEDIUM: "#fbbf24", HARD: "#f87171" };

//   return (
//     <div className="p-6">
//       <div className="mb-6">
//         <h1 className="font-display text-2xl font-bold text-slate-100">Statistics</h1>
//         <p className="text-slate-500 text-sm">Platform-wide analytics</p>
//       </div>

//       {/* Problems acceptance rates */}
//       <div className="card p-5 mb-6">
//         <h2 className="font-display font-semibold text-slate-200 mb-4">Problem Acceptance Rates (Top 20)</h2>
//         {problemStats?.problems ? (
//           <ResponsiveContainer width="100%" height={280}>
//             <BarChart data={problemStats.problems.slice(0, 20)} layout="vertical">
//               <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} unit="%" />
//               <YAxis type="category" dataKey="title" width={180} tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
//               <Tooltip
//                 contentStyle={{ background: "#1e1e27", border: "1px solid #32323c", borderRadius: 8, fontSize: 12 }}
//                 formatter={(v: any) => [`${v}%`, "Acceptance"]}
//               />
//               <Bar dataKey="acceptance_rate" radius={[0, 4, 4, 0]}>
//                 {problemStats.problems.slice(0, 20).map((p: any) => (
//                   <Cell key={p.slug} fill={DIFF_COLORS[p.difficulty] ?? "#6175f2"} fillOpacity={0.8} />
//                 ))}
//               </Bar>
//             </BarChart>
//           </ResponsiveContainer>
//         ) : (
//           <div className="h-64 flex items-center justify-center text-slate-500 text-sm">Loading…</div>
//         )}
//       </div>

//       {/* User growth */}
//       {overview && (
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//           {[
//             { label: "Total Submissions", value: overview.submissions.total.toLocaleString() },
//             { label: "Total Users", value: overview.users.total.toLocaleString() },
//             { label: "Pro Conversion", value: `${overview.users.pro_pct}%` },
//           ].map(s => (
//             <div key={s.label} className="card p-5 text-center">
//               <div className="text-3xl font-bold font-display text-brand-400 mb-1">{s.value}</div>
//               <div className="text-xs text-slate-500">{s.label}</div>
//             </div>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// }

"use client";
import { useAdminStats, useAdminProblemStats } from "@/lib/hooks";
import { PageSpinner } from "@/components/ui/Spinner";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  Cell, AreaChart, Area,
} from "recharts";
import { format } from "date-fns";

const DIFF_COLORS: Record<string, string> = {
  EASY: "#34d399", MEDIUM: "#fbbf24", HARD: "#f87171",
};

export default function AdminStatsPage() {
  const { data: overview,      isLoading: l1 } = useAdminStats();
  const { data: problemStats,  isLoading: l2 } = useAdminProblemStats();

  if (l1 || l2) return <div className="p-6"><PageSpinner /></div>;

  const chartData = overview?.submissions.per_day.map((d) => ({
    ...d,
    day: format(new Date(d.day), "MMM d"),
  })) ?? [];

  const topProblems = problemStats?.problems?.slice(0, 20) ?? [];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-slate-100">Statistics</h1>
        <p className="text-slate-500 text-sm">Platform-wide analytics</p>
      </div>

      {/* Summary stats */}
      {overview && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { label: "Total Submissions",   value: overview.submissions.total.toLocaleString(), color: "text-brand-400"   },
            { label: "Total Users",         value: overview.users.total.toLocaleString(),        color: "text-blue-400"   },
            { label: "Pro Conversion Rate", value: `${overview.users.pro_pct}%`,                 color: "text-emerald-400" },
          ].map((s) => (
            <div key={s.label} className="card p-5 text-center">
              <div className={`text-3xl font-bold font-display mb-1 ${s.color}`}>{s.value}</div>
              <div className="text-xs text-slate-500">{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Submission trend */}
      {chartData.length > 0 && (
        <div className="card p-5">
          <h2 className="font-display font-semibold text-slate-200 mb-4">Submission Trend (Last 14 Days)</h2>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="s-total"    x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#6175f2" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6175f2" stopOpacity={0}   />
                </linearGradient>
                <linearGradient id="s-accepted" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#34d399" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#34d399" stopOpacity={0}   />
                </linearGradient>
              </defs>
              <XAxis dataKey="day"     tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
              <YAxis                   tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: "#1e1e27", border: "1px solid #32323c", borderRadius: 8, fontSize: 12 }} labelStyle={{ color: "#94a3b8" }} />
              <Area type="monotone" dataKey="count"    name="Total"    stroke="#6175f2" fill="url(#s-total)"    strokeWidth={2} dot={false} />
              <Area type="monotone" dataKey="accepted" name="Accepted" stroke="#34d399" fill="url(#s-accepted)" strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Problem acceptance rates */}
      {topProblems.length > 0 && (
        <div className="card p-5">
          <h2 className="font-display font-semibold text-slate-200 mb-4">Problem Acceptance Rates (Top 20)</h2>
          <ResponsiveContainer width="100%" height={Math.max(200, topProblems.length * 26)}>
            <BarChart data={topProblems} layout="vertical">
              <XAxis type="number" domain={[0, 100]} unit="%" tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="title" width={180} tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: "#1e1e27", border: "1px solid #32323c", borderRadius: 8, fontSize: 12 }}
                formatter={(v: any) => [`${v}%`, "Acceptance"]}
              />
              <Bar dataKey="acceptance_rate" radius={[0, 4, 4, 0]}>
                {topProblems.map((p: any) => (
                  <Cell key={p.slug} fill={DIFF_COLORS[p.difficulty] ?? "#6175f2"} fillOpacity={0.8} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          {/* Legend */}
          <div className="flex items-center gap-4 mt-4 text-xs text-slate-500">
            {Object.entries(DIFF_COLORS).map(([d, color]) => (
              <div key={d} className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-sm" style={{ background: color, opacity: 0.8 }} />
                {d[0] + d.slice(1).toLowerCase()}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}