"use client";

import { Search, X, LayoutList, List } from "lucide-react";
import { cn } from "@/lib/utils";

const DIFFS = ["", "EASY", "MEDIUM", "HARD"] as const;

const DIFF_ACTIVE: Record<string, string> = {
  "":     "bg-[#1e1e1e] text-white",
  EASY:   "bg-green-500/15 text-green-400 border border-green-500/20",
  MEDIUM: "bg-amber-500/15 text-amber-400 border border-amber-500/20",
  HARD:   "bg-red-500/15   text-red-400   border border-red-500/20",
};

const DIFF_LABELS: Record<string, string> = {
  "": "All", EASY: "Easy", MEDIUM: "Med", HARD: "Hard",
};

interface FiltersBarProps {
  search: string;
  difficulty: string;
  hasFilters: boolean;
  onSearch: (v: string) => void;
  onDifficulty: (v: string) => void;
  onReset: () => void;
  expandAll: boolean;
  onToggleExpand: () => void;
}

export function FiltersBar({
  search, difficulty, hasFilters,
  onSearch, onDifficulty, onReset,
  expandAll, onToggleExpand,
}: FiltersBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-2 mb-4">
      {/* Search */}
      <div className="relative flex-1 min-w-40 max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-700 pointer-events-none" />
        <input
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          placeholder="Search problems…"
          className="w-full pl-8 pr-7 py-1.5 bg-[#0f0f0f] border border-[#1a1a1a] rounded-lg
                     text-xs text-slate-300 placeholder:text-slate-700
                     focus:outline-none focus:border-indigo-500/40 transition-colors"
        />
        {search && (
          <button onClick={() => onSearch("")}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-700 hover:text-slate-400">
            <X className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Difficulty */}
      <div className="flex items-center gap-0.5 bg-[#0f0f0f] border border-[#1a1a1a] rounded-lg p-0.5">
        {DIFFS.map((d) => (
          <button key={d} onClick={() => onDifficulty(d === difficulty ? "" : d)}
            className={cn(
              "px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all",
              difficulty === d ? DIFF_ACTIVE[d] : "text-slate-700 hover:text-slate-400"
            )}>
            {DIFF_LABELS[d]}
          </button>
        ))}
      </div>

      {/* Reset — shown when any filter active including sidebar */}
      {hasFilters && (
        <button onClick={onReset}
          className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs text-slate-600
                     hover:text-slate-300 border border-[#1a1a1a] bg-[#0f0f0f] transition-colors">
          <X className="w-3 h-3" /> Reset all
        </button>
      )}

      {/* Expand all */}
      <button onClick={onToggleExpand}
        className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs
                   text-slate-600 hover:text-slate-300 border border-[#1a1a1a]
                   bg-[#0f0f0f] transition-colors">
        {expandAll ? <List className="w-3.5 h-3.5" /> : <LayoutList className="w-3.5 h-3.5" />}
        {expandAll ? "Collapse" : "Expand all"}
      </button>
    </div>
  );
}