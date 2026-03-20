// "use client";
// import { Users, Code2, Send, Trophy, MessageSquare, TrendingUp, AlertCircle } from "lucide-react";
// import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
// import { useAdminStats } from "@/lib/hooks";
// import { format } from "date-fns";

// function StatCard({ label, value, sub, icon: Icon, color = "text-brand-400" }: any) {
//   return (
//     <div className="card p-5">
//       <div className="flex items-center justify-between mb-3">
//         <span className="text-xs text-slate-500 uppercase tracking-wider">{label}</span>
//         <Icon className={`w-4 h-4 ${color}`} />
//       </div>
//       <div className="text-3xl font-bold text-slate-100 font-display">{value}</div>
//       {sub && <div className="text-xs text-slate-500 mt-1">{sub}</div>}
//     </div>
//   );
// }

// export default function AdminDashboard() {
//   const { data: stats, isLoading } = useAdminStats();

//   if (isLoading) return (
//     <div className="p-6 grid grid-cols-2 lg:grid-cols-4 gap-4">
//       {[1,2,3,4].map(i => <div key={i} className="card h-28 animate-pulse bg-surface-100" />)}
//     </div>
//   );

//   if (!stats) return null;

//   const chartData = stats.submissions.per_day.map(d => ({
//     ...d,
//     day: format(new Date(d.day), "MMM d"),
//   }));

//   return (
//     <div className="p-6">
//       <div className="mb-6">
//         <h1 className="font-display text-2xl font-bold text-slate-100">Dashboard</h1>
//         <p className="text-slate-500 text-sm">Platform health at a glance.</p>
//       </div>

//       {/* KPI cards */}
//       <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
//         <StatCard label="Total Users"      value={stats.users.total.toLocaleString()}       sub={`+${stats.users.new_this_week} this week`}    icon={Users}       color="text-blue-400" />
//         <StatCard label="Pro Users"        value={stats.users.pro.toLocaleString()}         sub={`${stats.users.pro_pct}% of total`}           icon={TrendingUp}  color="text-brand-400" />
//         <StatCard label="Submissions Today" value={stats.submissions.today.toLocaleString()} sub={`${stats.submissions.acceptance_rate_today}% accepted`} icon={Send} color="text-emerald-400" />
//         <StatCard label="Published Problems" value={stats.platform.total_problems}           sub={`${stats.platform.active_contests} live contests`} icon={Code2} color="text-amber-400" />
//       </div>

//       {/* Alerts */}
//       {stats.platform.flagged_comments > 0 && (
//         <div className="card p-4 mb-6 flex items-center gap-3 border-amber-500/30 bg-amber-500/5">
//           <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
//           <div className="flex-1 text-sm text-amber-300">
//             <strong>{stats.platform.flagged_comments} flagged comments</strong> awaiting moderation.
//           </div>
//           <a href="/admin/discussions" className="text-xs text-amber-400 hover:underline">Review →</a>
//         </div>
//       )}

//       {/* Submissions chart */}
//       <div className="card p-5 mb-6">
//         <h2 className="font-display font-semibold text-slate-200 mb-4">Submissions (Last 14 Days)</h2>
//         <ResponsiveContainer width="100%" height={220}>
//           <AreaChart data={chartData}>
//             <defs>
//               <linearGradient id="grad-total" x1="0" y1="0" x2="0" y2="1">
//                 <stop offset="5%" stopColor="#6175f2" stopOpacity={0.25} />
//                 <stop offset="95%" stopColor="#6175f2" stopOpacity={0} />
//               </linearGradient>
//               <linearGradient id="grad-accepted" x1="0" y1="0" x2="0" y2="1">
//                 <stop offset="5%" stopColor="#34d399" stopOpacity={0.25} />
//                 <stop offset="95%" stopColor="#34d399" stopOpacity={0} />
//               </linearGradient>
//             </defs>
//             <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
//             <YAxis tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
//             <Tooltip
//               contentStyle={{ background: "#1e1e27", border: "1px solid #32323c", borderRadius: 8, fontSize: 12 }}
//               labelStyle={{ color: "#94a3b8" }}
//             />
//             <Area type="monotone" dataKey="count"    name="Total"    stroke="#6175f2" fill="url(#grad-total)"    strokeWidth={2} dot={false} />
//             <Area type="monotone" dataKey="accepted" name="Accepted" stroke="#34d399" fill="url(#grad-accepted)" strokeWidth={2} dot={false} />
//           </AreaChart>
//         </ResponsiveContainer>
//       </div>

//       {/* Bottom: plan split */}
//       <div className="grid grid-cols-2 gap-4">
//         <div className="card p-5">
//           <h3 className="font-display font-semibold text-slate-200 mb-3">Plan Distribution</h3>
//           <div className="flex gap-4 mb-3">
//             <div className="text-center flex-1">
//               <div className="text-2xl font-bold text-brand-400">{stats.users.pro}</div>
//               <div className="text-xs text-slate-500">Pro</div>
//             </div>
//             <div className="text-center flex-1">
//               <div className="text-2xl font-bold text-slate-400">{stats.users.free}</div>
//               <div className="text-xs text-slate-500">Free</div>
//             </div>
//           </div>
//           {/* Segmented bar */}
//           <div className="h-2 rounded-full bg-surface-300 overflow-hidden">
//             <div
//               className="h-full bg-brand-600 rounded-full transition-all"
//               style={{ width: `${stats.users.pro_pct}%` }}
//             />
//           </div>
//         </div>

//         <div className="card p-5">
//           <h3 className="font-display font-semibold text-slate-200 mb-3">Quick Links</h3>
//           <div className="flex flex-col gap-2">
//             {[
//               { href: "/admin/discussions", label: `${stats.platform.flagged_comments} flagged comments`, icon: MessageSquare },
//               { href: "/admin/users", label: `${stats.users.total} total users`, icon: Users },
//               { href: "/admin/contests", label: `${stats.platform.active_contests} live contests`, icon: Trophy },
//             ].map(({ href, label, icon: Icon }) => (
//               <a key={href} href={href} className="flex items-center gap-2 text-sm text-slate-400 hover:text-slate-200 transition-colors">
//                 <Icon className="w-4 h-4" /> {label}
//               </a>
//             ))}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }


"use client";
import Link from "next/link";
import { Users, Code2, Send, Trophy, AlertCircle, TrendingUp } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { useAdminStats } from "@/lib/hooks";
import { PageSpinner } from "@/components/ui/Spinner";
import { format } from "date-fns";

function KpiCard({ label, value, sub, icon: Icon, color = "text-brand-400" }: any) {
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-slate-500 uppercase tracking-wider">{label}</span>
        <Icon className={`w-4 h-4 ${color}`} />
      </div>
      <div className="text-3xl font-bold font-display text-slate-100">{value}</div>
      {sub && <div className="text-xs text-slate-500 mt-1">{sub}</div>}
    </div>
  );
}


export default function AdminDashboardPage() {
  const { data: stats, isLoading } = useAdminStats();

  if (isLoading) return <PageSpinner />;
  if (!stats)    return null;

  const chartData = stats.submissions.per_day.map((d) => ({
    ...d,
    day: format(new Date(d.day), "MMM d"),
  }));

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-slate-100">Dashboard</h1>
        <p className="text-slate-500 text-sm">Platform health at a glance.</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KpiCard label="Total Users"       value={stats.users.total.toLocaleString()}           sub={`+${stats.users.new_this_week} this week`}                 icon={Users}      color="text-blue-400"    />
        <KpiCard label="Pro Users"         value={stats.users.pro.toLocaleString()}             sub={`${stats.users.pro_pct}% conversion`}                      icon={TrendingUp}  color="text-brand-400"   />
        <KpiCard label="Submissions Today" value={stats.submissions.today.toLocaleString()}     sub={`${stats.submissions.acceptance_rate_today}% accepted`}    icon={Send}        color="text-emerald-400" />
        <KpiCard label="Problems Live"     value={stats.platform.total_problems}                sub={`${stats.platform.active_contests} active contests`}       icon={Code2}       color="text-amber-400"   />
      </div>

      {/* Alert */}
      {stats.platform.flagged_comments > 0 && (
        <div className="card p-4 mb-6 flex items-center gap-3 border-amber-500/30 bg-amber-500/5">
          <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
          <p className="flex-1 text-sm text-amber-300">
            <strong>{stats.platform.flagged_comments}</strong> flagged comments awaiting moderation.
          </p>
          <Link href="/admin/discussions" className="text-xs text-amber-400 hover:underline shrink-0">Review →</Link>
        </div>
      )}

      {/* Submissions chart */}
      <div className="card p-5 mb-6">
        <h2 className="font-display font-semibold text-slate-200 mb-4">Submissions — Last 14 Days</h2>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="g-total"    x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#6175f2" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#6175f2" stopOpacity={0}   />
              </linearGradient>
              <linearGradient id="g-accepted" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#34d399" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#34d399" stopOpacity={0}   />
              </linearGradient>
            </defs>
            <XAxis dataKey="day"     tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
            <YAxis                   tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ background: "#1e1e27", border: "1px solid #32323c", borderRadius: 8, fontSize: 12 }} labelStyle={{ color: "#94a3b8" }} />
            <Area type="monotone" dataKey="count"    name="Total"    stroke="#6175f2" fill="url(#g-total)"    strokeWidth={2} dot={false} />
            <Area type="monotone" dataKey="accepted" name="Accepted" stroke="#34d399" fill="url(#g-accepted)" strokeWidth={2} dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Bottom cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Plan split */}
        <div className="card p-5">
          <h3 className="font-display font-semibold text-slate-200 mb-4">Plan Distribution</h3>
          <div className="flex gap-6 mb-4">
            <div className="text-center flex-1">
              <div className="text-2xl font-bold text-brand-400 font-display">{stats.users.pro}</div>
              <div className="text-xs text-slate-500">Pro</div>
            </div>
            <div className="text-center flex-1">
              <div className="text-2xl font-bold text-slate-400 font-display">{stats.users.free}</div>
              <div className="text-xs text-slate-500">Free</div>
            </div>
          </div>
          <div className="h-2 rounded-full bg-surface-300 overflow-hidden">
            <div className="h-full bg-brand-600 rounded-full transition-all" style={{ width: `${stats.users.pro_pct}%` }} />
          </div>
          <p className="text-xs text-slate-500 mt-2">{stats.users.pro_pct}% pro conversion</p>
        </div>

        {/* Quick actions */}
        <div className="card p-5">
          <h3 className="font-display font-semibold text-slate-200 mb-4">Quick Links</h3>
          <div className="space-y-2">
            {[
              { href: "/admin/discussions", label: `${stats.platform.flagged_comments} flagged comments`,   icon: AlertCircle },
              { href: "/admin/users",       label: `${stats.users.total} total users`,                      icon: Users        },
              { href: "/admin/contests",    label: `${stats.platform.active_contests} active contests`,     icon: Trophy       },
              { href: "/admin/problems",    label: `${stats.platform.total_problems} published problems`,   icon: Code2        },
            ].map(({ href, label, icon: Icon }) => (
              <Link key={href} href={href}
                className="flex items-center gap-2.5 text-sm text-slate-400 hover:text-slate-100 transition-colors p-2 rounded-lg hover:bg-surface-100">
                <Icon className="w-4 h-4 text-slate-500" />
                {label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}