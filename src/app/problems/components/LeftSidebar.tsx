"use client";

/**
 * LeftSidebar
 *
 * COLLAPSED (w-12):
 *   - No section headings at all — pure icon rail like LeetCode / NeetCode
 *   - Company favicons top group, divider, topic monospace icons bottom group
 *   - Tooltip on hover showing name + real count
 *   - Active state highlighted
 *
 * EXPANDED (w-52):
 *   - "Companies" heading → favicon + name + real count (sorted by count)
 *   - "Topics" heading → grouped (Data Structures / Algorithms / Patterns)
 *   - Counts computed from allProblems prop (real data, no Tag.problem_count needed)
 *   - "Coming Soon" badge on designated slugs
 */

import { useState, useMemo } from "react";
import {
  ChevronDown, ChevronRight as ChevronRightIcon,
  Building2, Hash, PanelLeftClose, PanelLeftOpen, Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTags } from "@/lib/hooks/index";
import type { Problem } from "@/types";

// ── Company brand metadata ─────────────────────────────────────────────────────
const COMPANY_META: Record<string, { color: string; favicon: string }> = {
  google:     { color: "#4285f4", favicon: "https://www.google.com/favicon.ico" },
  amazon:     { color: "#ff9900", favicon: "https://www.amazon.com/favicon.ico" },
  meta:       { color: "#0866ff", favicon: "https://www.meta.com/favicon.ico" },
  facebook:   { color: "#0866ff", favicon: "https://www.facebook.com/favicon.ico" },
  microsoft:  { color: "#00a4ef", favicon: "https://www.microsoft.com/favicon.ico" },
  apple:      { color: "#555555", favicon: "https://www.apple.com/favicon.ico" },
  netflix:    { color: "#e50914", favicon: "https://www.netflix.com/favicon.ico" },
  uber:       { color: "#09091a", favicon: "https://www.uber.com/favicon.ico" },
  airbnb:     { color: "#ff385c", favicon: "https://www.airbnb.com/favicon.ico" },
  linkedin:   { color: "#0a66c2", favicon: "https://www.linkedin.com/favicon.ico" },
  stripe:     { color: "#635bff", favicon: "https://www.stripe.com/favicon.ico" },
  twitter:    { color: "#1da1f2", favicon: "https://www.twitter.com/favicon.ico" },
  adobe:      { color: "#ff0000", favicon: "https://www.adobe.com/favicon.ico" },
  salesforce: { color: "#00a1e0", favicon: "https://www.salesforce.com/favicon.ico" },
  oracle:     { color: "#f80000", favicon: "https://www.oracle.com/favicon.ico" },
  bloomberg:  { color: "#ff6600", favicon: "https://www.bloomberg.com/favicon.ico" },
  spotify:    { color: "#1db954", favicon: "https://open.spotify.com/favicon.ico" },
  shopify:    { color: "#96bf48", favicon: "https://www.shopify.com/favicon.ico" },
  tiktok:     { color: "#010101", favicon: "https://www.tiktok.com/favicon.ico" },
  coinbase:   { color: "#0052ff", favicon: "https://www.coinbase.com/favicon.ico" },
};

// ── Topic grouping — slug → { group, icon (monospace text) } ──────────────────
const TOPIC_META: Record<string, { group: string; icon: string }> = {
  // Data Structures
  "array":                { group: "Data Structures", icon: "[ ]" },
  "linked-list":          { group: "Data Structures", icon: "→→"  },
  "stack":                { group: "Data Structures", icon: "⊞"   },
  "queue":                { group: "Data Structures", icon: "⊟"   },
  "hash-table":           { group: "Data Structures", icon: "{}"  },
  "tree":                 { group: "Data Structures", icon: "⑂"   },
  "binary-tree":          { group: "Data Structures", icon: "⑂"   },
  "binary-search-tree":   { group: "Data Structures", icon: "⑂"   },
  "trie":                 { group: "Data Structures", icon: "Tr"  },
  "heap":                 { group: "Data Structures", icon: "△"   },
  "graph":                { group: "Data Structures", icon: "◈"   },
  "matrix":               { group: "Data Structures", icon: "▦"   },
  "segment-tree":         { group: "Data Structures", icon: "⑂"   },
  // Algorithms
  "dynamic-programming":  { group: "Algorithms", icon: "✦"  },
  "backtracking":         { group: "Algorithms", icon: "↺"  },
  "binary-search":        { group: "Algorithms", icon: "⌖"  },
  "two-pointers":         { group: "Algorithms", icon: "⇔"  },
  "sliding-window":       { group: "Algorithms", icon: "⊡"  },
  "sorting":              { group: "Algorithms", icon: "≋"  },
  "greedy":               { group: "Algorithms", icon: "$"  },
  "divide-and-conquer":   { group: "Algorithms", icon: "÷"  },
  "bit-manipulation":     { group: "Algorithms", icon: "⊕"  },
  "math":                 { group: "Algorithms", icon: "π"  },
  "depth-first-search":   { group: "Algorithms", icon: "↓"  },
  "breadth-first-search": { group: "Algorithms", icon: "↔"  },
  "recursion":            { group: "Algorithms", icon: "↻"  },
  // Patterns
  "prefix-sum":           { group: "Patterns", icon: "Σ"   },
  "union-find":           { group: "Patterns", icon: "∪"   },
  "topological-sort":     { group: "Patterns", icon: "⊳"   },
  "monotonic-stack":      { group: "Patterns", icon: "↗"   },
  "shortest-path":        { group: "Patterns", icon: "—"   },
  "counting":             { group: "Patterns", icon: "#"   },
  "simulation":           { group: "Patterns", icon: "▷"   },
};

const GROUP_ORDER = ["Data Structures", "Algorithms", "Patterns"];
const COMING_SOON_COMPANY = new Set(["tiktok", "coinbase", "shopify"]);
const COMING_SOON_TOPIC   = new Set(["segment-tree", "shortest-path"]);

// ── Favicon with error fallback ───────────────────────────────────────────────
function Favicon({ slug, name, size = 14 }: { slug: string; name: string; size?: number }) {
  const meta = COMPANY_META[slug.toLowerCase()];
  const [errored, setErrored] = useState(false);

  if (meta?.favicon && !errored) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={meta.favicon}
        alt={name}
        width={size}
        height={size}
        className="rounded-[3px] object-contain shrink-0"
        style={{ width: size, height: size }}
        onError={() => setErrored(true)}
      />
    );
  }
  return (
    <div
      className="rounded-full shrink-0"
      style={{ width: size - 2, height: size - 2, background: meta?.color ?? "#475569" }}
    />
  );
}

// ── Props ─────────────────────────────────────────────────────────────────────
interface LeftSidebarProps {
  activeTopic:   string;
  activeCompany: string;
  onTopicClick:   (slug: string) => void;
  onCompanyClick: (slug: string) => void;
  /** All problems (unfiltered) — used to compute real per-tag problem counts */
  allProblems: Problem[];
}

export function LeftSidebar({
  activeTopic, activeCompany,
  onTopicClick, onCompanyClick,
  allProblems,
}: LeftSidebarProps) {
  const [collapsed,        setCollapsed]        = useState(false);
  const [showAllCompanies, setShowAllCompanies] = useState(false);
  const [openGroups,       setOpenGroups]       = useState<Record<string, boolean>>({
    "Data Structures": true, Algorithms: false, Patterns: false,
  });

  const { data: companyTags } = useTags("COMPANY");
  const { data: topicTags }   = useTags("TOPIC");

  // ── Real counts from allProblems (no API field needed) ───────────────────────
  const companyCounts = useMemo<Record<string, number>>(() => {
    const map: Record<string, number> = {};
    for (const p of allProblems) {
      for (const t of p.tags ?? []) {
        if (t.tag_type === "COMPANY") map[t.slug] = (map[t.slug] ?? 0) + 1;
      }
    }
    return map;
  }, [allProblems]);

  const topicCounts = useMemo<Record<string, number>>(() => {
    const map: Record<string, number> = {};
    for (const p of allProblems) {
      for (const t of p.tags ?? []) {
        if (t.tag_type === "TOPIC") map[t.slug] = (map[t.slug] ?? 0) + 1;
      }
    }
    return map;
  }, [allProblems]);

  const companies = useMemo(() =>
    [...(companyTags ?? [])]
      .map((t) => ({ ...t, count: companyCounts[t.slug] ?? 0 }))
      .sort((a, b) => b.count - a.count),
  [companyTags, companyCounts]);

  const topicGroups = useMemo(() => {
    const groups: Record<string, { slug: string; name: string; count: number; icon: string; comingSoon: boolean }[]> = {};
    const ungrouped: { slug: string; name: string; count: number; icon: string; comingSoon: boolean }[] = [];

    for (const t of (topicTags ?? [])) {
      const key  = t.slug ?? t.name.toLowerCase().replace(/ /g, "-");
      const meta = TOPIC_META[key];
      const entry = {
        slug: t.slug,
        name: t.name,
        count: topicCounts[t.slug] ?? 0,
        icon: meta?.icon ?? "#",
        comingSoon: COMING_SOON_TOPIC.has(t.slug),
      };
      if (meta?.group) {
        if (!groups[meta.group]) groups[meta.group] = [];
        groups[meta.group].push(entry);
      } else {
        ungrouped.push(entry);
      }
    }
    for (const g of Object.keys(groups)) {
      groups[g].sort((a, b) => b.count - a.count);
    }
    const result = GROUP_ORDER
      .filter((g) => groups[g]?.length > 0)
      .map((g) => ({ group: g, items: groups[g] }));
    if (ungrouped.length > 0) {
      result.push({ group: "Other", items: ungrouped.sort((a, b) => b.count - a.count) });
    }
    return result;
  }, [topicTags, topicCounts]);

  const visibleCompanies = showAllCompanies ? companies : companies.slice(0, 5);
  const toggleGroup = (g: string) => setOpenGroups((p) => ({ ...p, [g]: !p[g] }));
  const allTopicItems = topicGroups.flatMap((g) => g.items);

  // ════════════════════════════════════════════════════════════════════════════
  // COLLAPSED — pure icon rail, NO headings, just icons + tooltips
  // ════════════════════════════════════════════════════════════════════════════
  if (collapsed) {
    return (
      <aside
        className="w-12 shrink-0 flex flex-col items-center sticky top-6 self-start
                   max-h-[calc(100vh-3rem)] overflow-y-auto pb-6"
      >
        {/* Expand button */}
        <button
          onClick={() => setCollapsed(false)}
          title="Expand sidebar"
          className="w-8 h-8 flex items-center justify-center rounded-lg mb-4
                     text-slate-700 hover:text-slate-400 hover:bg-[#111] transition-all"
        >
          <PanelLeftOpen className="w-4 h-4" />
        </button>

        {/* ── Company icons — no heading ── */}
        <div className="flex flex-col items-center gap-1">
          {companies.filter(c => !COMING_SOON_COMPANY.has(c.slug)).slice(0, 9).map((c) => {
            const isActive = activeCompany === c.slug;
            return (
              <button
                key={c.slug}
                onClick={() => onCompanyClick(c.slug)}
                title={`${c.name} · ${c.count} problems`}
                className={cn(
                  "w-8 h-8 flex items-center justify-center rounded-lg border transition-all",
                  isActive
                    ? "bg-[#1a1a1a] border-indigo-500/40 shadow-[0_0_8px_#6366f133]"
                    : "border-transparent hover:bg-[#111] hover:border-[#1e1e1e]"
                )}
              >
                <Favicon slug={c.slug} name={c.name} size={16} />
              </button>
            );
          })}
        </div>

        {/* Thin divider */}
        <div className="w-5 h-px bg-[#1e1e1e] my-3" />

        {/* ── Topic icons — no heading ── */}
        <div className="flex flex-col items-center gap-1">
          {allTopicItems.filter(t => !t.comingSoon).slice(0, 12).map((t) => {
            const isActive = activeTopic === t.slug;
            return (
              <button
                key={t.slug}
                onClick={() => onTopicClick(isActive ? "" : t.slug)}
                title={`${t.name} · ${t.count} problems`}
                className={cn(
                  "w-8 h-8 flex items-center justify-center rounded-lg border transition-all",
                  "text-[10px] font-bold font-mono leading-none",
                  isActive
                    ? "bg-indigo-500/10 border-indigo-500/25 text-indigo-400"
                    : "border-transparent text-slate-700 hover:text-slate-300 hover:bg-[#111] hover:border-[#1e1e1e]"
                )}
              >
                {t.icon}
              </button>
            );
          })}
        </div>
      </aside>
    );
  }

  // ════════════════════════════════════════════════════════════════════════════
  // EXPANDED
  // ════════════════════════════════════════════════════════════════════════════
  return (
    <aside
      className="w-52 shrink-0 flex flex-col gap-4 sticky top-6 self-start
                 max-h-[calc(100vh-3rem)] overflow-y-auto pr-1"
    >
      {/* Top row */}
      <div className="flex items-center justify-between px-1">
        <span className="text-[10px] font-bold text-slate-700 uppercase tracking-widest">
          Browse
        </span>
        <button
          onClick={() => setCollapsed(true)}
          title="Collapse sidebar"
          className="w-6 h-6 flex items-center justify-center rounded-md
                     text-slate-700 hover:text-slate-400 hover:bg-[#111] transition-all"
        >
          <PanelLeftClose className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* ── COMPANIES ── */}
      <section>
        <div className="flex items-center gap-1.5 px-1 mb-1.5">
          <Building2 className="w-3 h-3 text-slate-600" />
          <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">
            Companies
          </span>
        </div>

        <div className="flex flex-col gap-0.5">
          {visibleCompanies.map((c) => {
            const isActive = activeCompany === c.slug;
            const isSoon   = COMING_SOON_COMPANY.has(c.slug.toLowerCase());
            return (
              <button
                key={c.slug}
                onClick={() => !isSoon && onCompanyClick(c.slug)}
                disabled={isSoon}
                className={cn(
                  "flex items-center gap-2 px-2 py-1.5 rounded-lg text-left transition-all group",
                  isActive
                    ? "bg-[#161616] border border-[#252525]"
                    : isSoon
                    ? "opacity-40 cursor-not-allowed"
                    : "hover:bg-[#111] cursor-pointer"
                )}
              >
                <Favicon slug={c.slug} name={c.name} size={14} />
                <span className={cn(
                  "flex-1 text-xs truncate",
                  isActive ? "text-white font-semibold" : "text-slate-500 group-hover:text-slate-300"
                )}>
                  {c.name}
                </span>
                {isSoon ? (
                  <span className="flex items-center gap-0.5 text-[8px] font-bold px-1 py-0.5
                                   rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/15 shrink-0">
                    <Sparkles className="w-2 h-2" /> Soon
                  </span>
                ) : (
                  <span className={cn(
                    "text-[10px] font-mono shrink-0 tabular-nums",
                    isActive ? "text-slate-400" : "text-slate-700 group-hover:text-slate-500"
                  )}>
                    {c.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {companies.length > 5 && (
          <button
            onClick={() => setShowAllCompanies((v) => !v)}
            className="mt-1 flex items-center gap-1 px-2 text-[10px] text-slate-700
                       hover:text-slate-400 transition-colors"
          >
            {showAllCompanies
              ? <><ChevronDown className="w-3 h-3" /> Show less</>
              : <><ChevronRightIcon className="w-3 h-3" /> +{companies.length - 5} more</>}
          </button>
        )}
      </section>

      <div className="h-px bg-[#191919] mx-1" />

      {/* ── TOPICS ── */}
      <section className="pb-4">
        <div className="flex items-center gap-1.5 px-1 mb-1.5">
          <Hash className="w-3 h-3 text-slate-600" />
          <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">
            Topics
          </span>
        </div>

        {topicGroups.map(({ group, items }) => (
          <div key={group} className="mb-1">
            <button
              onClick={() => toggleGroup(group)}
              className="w-full flex items-center gap-1.5 px-1 py-0.5 text-[9px] font-bold
                         text-slate-700 hover:text-slate-500 uppercase tracking-widest transition-colors"
            >
              {openGroups[group]
                ? <ChevronDown className="w-2.5 h-2.5" />
                : <ChevronRightIcon className="w-2.5 h-2.5" />}
              {group}
            </button>

            {openGroups[group] && (
              <div className="flex flex-col gap-0.5 mt-0.5">
                {items.map((t) => {
                  const isActive = activeTopic === t.slug;
                  return (
                    <button
                      key={t.slug}
                      onClick={() => !t.comingSoon && onTopicClick(isActive ? "" : t.slug)}
                      disabled={t.comingSoon}
                      className={cn(
                        "flex items-center gap-2 px-2 py-1.5 rounded-lg text-left transition-all group",
                        isActive
                          ? "bg-indigo-500/10 border border-indigo-500/15"
                          : t.comingSoon
                          ? "opacity-40 cursor-not-allowed"
                          : "hover:bg-[#111] cursor-pointer"
                      )}
                    >
                      <span className={cn(
                        "w-5 text-center text-[10px] font-bold font-mono shrink-0 leading-none",
                        isActive ? "text-indigo-400" : "text-slate-700 group-hover:text-slate-500"
                      )}>
                        {t.icon}
                      </span>
                      <span className={cn(
                        "flex-1 text-xs truncate",
                        isActive ? "text-indigo-300 font-semibold" : "text-slate-500 group-hover:text-slate-300"
                      )}>
                        {t.name}
                      </span>
                      {t.comingSoon ? (
                        <span className="flex items-center gap-0.5 text-[8px] font-bold px-1 py-0.5
                                         rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/15 shrink-0">
                          <Sparkles className="w-2 h-2" /> Soon
                        </span>
                      ) : (
                        <span className={cn(
                          "text-[10px] font-mono shrink-0 tabular-nums",
                          isActive ? "text-indigo-400" : "text-slate-700 group-hover:text-slate-500"
                        )}>
                          {t.count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </section>
    </aside>
  );
} 