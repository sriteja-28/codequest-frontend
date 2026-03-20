// "use client";
// import { useEffect } from "react";
// import Link from "next/link";
// import { usePathname, useRouter } from "next/navigation";
// import {
//   LayoutDashboard, Code2, Trophy, Users, MessageSquare,
//   Megaphone, BarChart2, Settings, ChevronRight, LogOut
// } from "lucide-react";
// import { useMe, useLogout } from "@/lib/hooks";
// import { cn } from "@/lib/utils";

// const NAV = [
//   { href: "/admin",             label: "Overview",    icon: LayoutDashboard, exact: true },
//   { href: "/admin/problems",    label: "Problems",    icon: Code2 },
//   { href: "/admin/contests",    label: "Contests",    icon: Trophy },
//   { href: "/admin/users",       label: "Users",       icon: Users },
//   { href: "/admin/discussions", label: "Discussions", icon: MessageSquare },
//   { href: "/admin/ads",         label: "Ads",         icon: Megaphone },
//   { href: "/admin/stats",       label: "Stats",       icon: BarChart2 },
// ];

// export default function AdminLayout({ children }: { children: React.ReactNode }) {
//   const pathname = usePathname();
//   const router = useRouter();
//   const { data: user, isLoading } = useMe();
//   const logout = useLogout();

//   useEffect(() => {
//     if (!isLoading && user && user.role !== "ADMIN") {
//       router.replace("/");
//     }
//     if (!isLoading && !user) {
//       router.replace("/auth/login");
//     }
//   }, [user, isLoading, router]);

//   if (isLoading || !user) return (
//     <div className="flex items-center justify-center h-screen text-slate-500 text-sm">Loading…</div>
//   );

//   return (
//     <div className="flex h-screen overflow-hidden bg-surface">
//       {/* Sidebar */}
//       <aside className="w-56 shrink-0 border-r border-surface-300 flex flex-col bg-surface-50">
//         {/* Logo */}
//         <div className="px-4 py-4 border-b border-surface-300">
//           <Link href="/" className="flex items-center gap-2">
//             <div className="w-7 h-7 rounded-lg bg-brand-600 flex items-center justify-center">
//               <Code2 className="w-4 h-4 text-white" />
//             </div>
//             <div>
//               <div className="text-sm font-bold text-slate-100">CodeQuest</div>
//               <div className="text-xs text-slate-500">Admin</div>
//             </div>
//           </Link>
//         </div>

//         {/* Nav */}
//         <nav className="flex-1 p-3 overflow-y-auto">
//           <div className="flex flex-col gap-0.5">
//             {NAV.map(({ href, label, icon: Icon, exact }) => {
//               const active = exact ? pathname === href : pathname.startsWith(href);
//               return (
//                 <Link
//                   key={href}
//                   href={href}
//                   className={cn(
//                     "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
//                     active
//                       ? "bg-brand-600/15 text-brand-400"
//                       : "text-slate-500 hover:text-slate-200 hover:bg-surface-200"
//                   )}
//                 >
//                   <Icon className="w-4 h-4 shrink-0" />
//                   {label}
//                 </Link>
//               );
//             })}
//           </div>
//         </nav>

//         {/* Bottom: user + logout */}
//         <div className="p-3 border-t border-surface-300">
//           <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-surface-200 text-sm">
//             <div className="w-7 h-7 rounded-full bg-brand-700 flex items-center justify-center text-xs font-bold text-brand-200">
//               {user.username[0].toUpperCase()}
//             </div>
//             <span className="text-slate-300 truncate flex-1">{user.username}</span>
//             <button
//               onClick={async () => { await logout.mutateAsync(); router.push("/auth/login"); }}
//               className="text-slate-500 hover:text-slate-300"
//             >
//               <LogOut className="w-3.5 h-3.5" />
//             </button>
//           </div>
//         </div>
//       </aside>

//       {/* Content */}
//       <main className="flex-1 overflow-y-auto">
//         {children}
//       </main>
//     </div>
//   );
// }


"use client";
import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, Code2, Trophy, Users,
  MessageSquare, Megaphone, BarChart2, LogOut, Zap,
} from "lucide-react";
import { useMe, useLogout } from "@/lib/hooks";
import { cn } from "@/lib/utils";
import { PageSpinner } from "@/components/ui/Spinner";

const NAV = [
  { href: "/admin",             label: "Overview",    icon: LayoutDashboard, exact: true },
  { href: "/admin/problems",    label: "Problems",    icon: Code2 },
  { href: "/admin/contests",    label: "Contests",    icon: Trophy },
  { href: "/admin/users",       label: "Users",       icon: Users },
  { href: "/admin/discussions", label: "Discussions", icon: MessageSquare },
  { href: "/admin/ads",         label: "Ads",         icon: Megaphone },
  { href: "/admin/stats",       label: "Stats",       icon: BarChart2 },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router   = useRouter();
  const { data: user, isLoading } = useMe();
  const logout   = useLogout();

  useEffect(() => {
    if (!isLoading && user && user.role !== "ADMIN") router.replace("/");
    if (!isLoading && !user) router.replace("/auth/login");
  }, [user, isLoading, router]);

  if (isLoading || !user) return <PageSpinner />;

  return (
    <div className="flex h-screen overflow-hidden bg-surface">
      {/* Sidebar */}
      <aside className="w-56 shrink-0 border-r border-surface-300 flex flex-col bg-surface-50">
        {/* Logo */}
        <div className="px-4 py-4 border-b border-surface-300">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-brand-600 flex items-center justify-center">
              <Code2 className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="text-sm font-bold text-slate-100">CodeQuest</div>
              <div className="text-xs text-slate-500">Admin Panel</div>
            </div>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 overflow-y-auto">
          <div className="space-y-0.5">
            {NAV.map(({ href, label, icon: Icon, exact }) => {
              const active = exact ? pathname === href : pathname.startsWith(href);
              return (
                <Link key={href} href={href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    active
                      ? "bg-brand-600/15 text-brand-400"
                      : "text-slate-500 hover:text-slate-200 hover:bg-surface-200"
                  )}>
                  <Icon className="w-4 h-4 shrink-0" />
                  {label}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* User */}
        <div className="p-3 border-t border-surface-300">
          <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-surface-200 text-sm">
            <div className="w-7 h-7 rounded-full bg-brand-700 flex items-center justify-center text-xs font-bold text-brand-200 shrink-0">
              {user.username[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-slate-300 text-xs font-medium truncate">{user.username}</div>
              <div className="text-slate-600 text-xs">Admin</div>
            </div>
            <button
              onClick={() => logout.mutateAsync().then(() => router.push("/auth/login"))}
              className="text-slate-500 hover:text-red-400 transition-colors" title="Logout">
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Content area */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}