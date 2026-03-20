"use client";

import Link from "next/link";
import { Code2, Github, Twitter } from "lucide-react";

const LINKS = [
  {
    heading: "Platform",
    items: [
      { label: "Problems",   href: "/problems"  },
      { label: "Contests",   href: "/contests"  },
      { label: "Leaderboard",href: "/contests"  },
      { label: "Discuss",    href: "/problems"  },
    ],
  },
  {
    heading: "Account",
    items: [
      { label: "Sign In",    href: "/auth/login"    },
      { label: "Register",   href: "/auth/register" },
      { label: "Profile",    href: "/profile"       },
      { label: "Upgrade",    href: "/upgrade"       },
    ],
  },
  {
    heading: "Company",
    items: [
      { label: "About",      href: "#" },
      { label: "Blog",       href: "#" },
      { label: "Privacy",    href: "#" },
      { label: "Terms",      href: "#" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="border-t border-[#1a1a1a] bg-[#0a0a0a]">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">

          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4 w-fit">
              <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center">
                <Code2 className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-white text-sm tracking-tight">CodeQuest</span>
            </Link>
            <p className="text-xs text-slate-600 leading-relaxed max-w-[180px]">
              Master algorithms and data structures through practice and AI coaching.
            </p>
            <div className="flex items-center gap-3 mt-5">
              <a href="#" className="text-slate-600 hover:text-slate-300 transition-colors">
                <Github className="w-4 h-4" />
              </a>
              <a href="#" className="text-slate-600 hover:text-slate-300 transition-colors">
                <Twitter className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Link columns */}
          {LINKS.map(({ heading, items }) => (
            <div key={heading}>
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-600 mb-3">
                {heading}
              </h3>
              <ul className="space-y-2">
                {items.map(({ label, href }) => (
                  <li key={label}>
                    <Link href={href}
                      className="text-xs text-slate-500 hover:text-slate-300 transition-colors">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="border-t border-[#1a1a1a] pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[11px] text-slate-700">
            © {new Date().getFullYear()} CodeQuest. All rights reserved.
          </p>
          <div className="flex items-center gap-1 text-[11px] text-slate-700">
            <span className="text-blue-500/50">⬡</span>
            Built for developers, by developers.
          </div>
        </div>
      </div>
    </footer>
  );
}