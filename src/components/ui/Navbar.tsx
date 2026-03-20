"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Code2, LogOut, Settings, Zap, ChevronDown } from "lucide-react";
import { useAuthStore } from "@/lib/auth";
import { useLogout } from "@/lib/hooks";
import { cn } from "@/lib/utils";
import { useState, useRef, useEffect } from "react";

const NAV_LINKS = [
  { href: "/problems", label: "Problems" },
  { href: "/contests", label: "Contests" },
];

export default function Navbar() {
  const pathname  = usePathname();
  const router    = useRouter();
  const user      = useAuthStore((s) => s.user);
  const logout    = useLogout();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef   = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = async () => {
    setMenuOpen(false);
    await logout.mutateAsync();
    router.push("/auth/login");
  };

  return (
    <nav className="sticky top-0 z-50 h-12 border-b border-[#1a1a1a] bg-[#0f0f13]/95 backdrop-blur-sm flex items-center shrink-0">
      <div className="w-full max-w-screen-2xl mx-auto px-4 flex items-center gap-4">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0 group">
          <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center shadow shadow-blue-900/50">
            <Code2 className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-white text-sm hidden sm:block tracking-tight">
            CodeQuest
          </span>
        </Link>

        {/* Divider */}
        <div className="w-px h-5 bg-[#2a2a2a] hidden sm:block" />

        {/* Nav links */}
        <div className="flex items-center gap-0.5">
          {NAV_LINKS.map(({ href, label }) => {
            const active = pathname === href || pathname.startsWith(href + "/");
            return (
              <Link key={href} href={href}
                className={cn(
                  "px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
                  active
                    ? "text-white bg-[#1e1e2a]"
                    : "text-slate-500 hover:text-slate-200 hover:bg-[#161620]"
                )}>
                {label}
              </Link>
            );
          })}
        </div>

        {/* Spacer */}
        <div className="ml-auto" />

        {/* Right side */}
        {user ? (
          <div className="flex items-center gap-2">

            {/* Plan badge */}
            {user.is_pro ? (
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
                <Zap className="w-3 h-3 fill-yellow-400" /> PRO
              </span>
            ) : (
              <Link href="/upgrade"
                className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 border border-blue-500/20 transition-colors">
                <Zap className="w-3 h-3" /> Upgrade
              </Link>
            )}

            {/* Admin */}
            {user.role === "ADMIN" && (
              <Link href="/admin"
                className="hidden md:flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium text-slate-500 hover:text-slate-200 hover:bg-[#1a1a1a] transition-colors">
                <Settings className="w-3.5 h-3.5" /> Admin
              </Link>
            )}

            {/* User dropdown */}
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen((v) => !v)}
                className="flex items-center gap-1.5 px-2 py-1 rounded-lg hover:bg-[#1a1a1a] transition-colors"
              >
                <div className="w-7 h-7 rounded-full bg-[#1e2030] border border-[#333] flex items-center justify-center text-xs font-bold text-blue-400 shrink-0">
                  {user.username[0].toUpperCase()}
                </div>
                <span className="text-sm text-slate-400 hidden md:block max-w-[90px] truncate">
                  {user.username}
                </span>
                <ChevronDown className={cn(
                  "w-3.5 h-3.5 text-slate-600 transition-transform",
                  menuOpen && "rotate-180"
                )} />
              </button>

              {/* Dropdown */}
              {menuOpen && (
                <div className="absolute right-0 top-full mt-1.5 w-48 bg-[#141414] border border-[#2a2a2a] rounded-xl shadow-2xl shadow-black/50 overflow-hidden z-50">
                  {/* User info */}
                  <div className="px-3 py-2.5 border-b border-[#2a2a2a]">
                    <p className="text-sm font-semibold text-slate-200 truncate">{user.username}</p>
                    <p className="text-xs text-slate-600 truncate">{user.email}</p>
                  </div>

                  {/* Links */}
                  <div className="py-1">
                    <Link href="/profile" onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-sm text-slate-400 hover:text-slate-200 hover:bg-[#1e1e1e] transition-colors">
                      Profile
                    </Link>
                    <Link href="/submissions" onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-sm text-slate-400 hover:text-slate-200 hover:bg-[#1e1e1e] transition-colors">
                      My Submissions
                    </Link>
                    {!user.is_pro && (
                      <Link href="/upgrade" onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 text-sm text-blue-400 hover:bg-[#1e1e1e] transition-colors">
                        <Zap className="w-3.5 h-3.5" /> Upgrade to Pro
                      </Link>
                    )}
                  </div>

                  {/* Logout */}
                  <div className="border-t border-[#2a2a2a] py-1">
                    <button onClick={handleLogout}
                      className="flex items-center gap-2 w-full px-3 py-2 text-sm text-slate-500 hover:text-red-400 hover:bg-[#1e1e1e] transition-colors">
                      <LogOut className="w-3.5 h-3.5" /> Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link href="/auth/login"
              className="px-3 py-1.5 text-sm text-slate-400 hover:text-slate-200 transition-colors">
              Sign in
            </Link>
            <Link href="/auth/register"
              className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition-colors shadow shadow-blue-900/30">
              Get started
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}