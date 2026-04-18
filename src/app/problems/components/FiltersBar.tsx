"use client";

import { Search, X, LayoutList, List } from "lucide-react";
import { cn } from "@/lib/utils";

const DIFFS = ["", "EASY", "MEDIUM", "HARD"] as const;

const DIFF_ACTIVE: Record<string, string> = {
  "":     "bg-slate-700 text-white",
  EASY:   "bg-green-500/15 text-green-400 border border-green-500/25",
  MEDIUM: "bg-amber-500/15 text-amber-400 border border-amber-500/25",
  HARD:   "bg-red-500/15   text-red-400   border border-red-500/25",
};

const DIFF_LABELS: Record<string, string> = {
  "":     "All",
  EASY:   "Easy",
  MEDIUM: "Medium",
  HARD:   "Hard",
};

interface FiltersBarProps {
  search: string;
  difficulty: string;
  topic: string;
  topicTags?: { slug: string; name: string }[];
  onSearch: (v: string) => void;
  onDifficulty: (v: string) => void;
  onTopic: (v: string) => void;
  onReset: () => void;
  expandAll: boolean;
  onToggleExpand: () => void;
}

export function FiltersBar({
  search, difficulty, topic,
  topicTags,
  onSearch, onDifficulty, onTopic, onReset,
  expandAll, onToggleExpand,
}: FiltersBarProps) {
  const hasFilters = search || difficulty || topic;

  return (
    <div className="flex flex-wrap items-center gap-2 mb-5">
      {/* Search */}
      <div className="relative flex-1 min-w-48 max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-600 pointer-events-none" />
        <input
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          placeholder="Search problems…"
          className="w-full pl-8 pr-8 py-2 bg-[#0f0f0f] border border-[#1a1a1a] rounded-xl
                     text-xs text-slate-300 placeholder:text-slate-700
                     focus:outline-none focus:border-indigo-500/40 transition-colors"
        />
        {search && (
          <button onClick={() => onSearch("")}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-700 hover:text-slate-400">
            <X className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Difficulty pills */}
      <div className="flex items-center gap-0.5 bg-[#0f0f0f] border border-[#1a1a1a] rounded-xl p-1">
        {DIFFS.map((d) => (
          <button key={d} onClick={() => onDifficulty(d)}
            className={cn(
              "px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all duration-100",
              difficulty === d ? DIFF_ACTIVE[d] : "text-slate-700 hover:text-slate-400"
            )}>
            {DIFF_LABELS[d]}
          </button>
        ))}
      </div>

      {/* Topic */}
      <select value={topic} onChange={(e) => onTopic(e.target.value)}
        className="px-3 py-2 bg-[#0f0f0f] border border-[#1a1a1a] rounded-xl
                   text-xs text-slate-500 focus:outline-none focus:border-indigo-500/40
                   transition-colors cursor-pointer">
        <option value="">All Topics</option>
        {topicTags?.map((t) => (
          <option key={t.slug} value={t.slug}>{t.name}</option>
        ))}
      </select>

      {/* Reset */}
      {hasFilters && (
        <button onClick={onReset}
          className="flex items-center gap-1 px-2.5 py-2 rounded-xl text-xs text-slate-600
                     hover:text-slate-300 border border-[#1a1a1a] hover:border-[#222]
                     bg-[#0f0f0f] transition-colors">
          <X className="w-3 h-3" /> Reset
        </button>
      )}

      {/* Expand / Collapse all */}
      <button onClick={onToggleExpand}
        className="ml-auto flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs
                   text-slate-500 hover:text-slate-300 border border-[#1a1a1a]
                   hover:border-[#222] bg-[#0f0f0f] transition-colors">
        {expandAll ? <List className="w-3.5 h-3.5" /> : <LayoutList className="w-3.5 h-3.5" />}
        {expandAll ? "Collapse all" : "Expand all"}
      </button>
    </div>
  );
}