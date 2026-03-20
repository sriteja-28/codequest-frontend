"use client";

import Link from "next/link";
import { useState } from "react";
import { Trophy, Users, ChevronRight, Search } from "lucide-react";
import { useProblems, useTags, useSections } from "@/lib/hooks/index";
import { difficultyColor, cn } from "@/lib/utils";
import type { Problem } from "@/types";

const DIFFS = ["", "EASY", "MEDIUM", "HARD"] as const;

export default function ProblemsPage() {
  const [search,     setSearch]     = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [section,    setSection]    = useState("");
  const [topic,      setTopic]      = useState("");

  // useProblems returns PaginatedResponse<Problem> directly
  const { data: response, isLoading } = useProblems({
    search:     search     || undefined,
    difficulty: difficulty || undefined,
    section:    section    || undefined,
    topic:      topic      || undefined,
  });

  const { data: sections }   = useSections();
  const { data: topicTags }  = useTags("TOPIC");

  // ✅ Bug fixed: response IS the PaginatedResponse — results holds the array
  const problems: Problem[] = response?.results ?? [];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
          <div className="text-slate-400 font-medium">Loading problems...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">

      {/* Header */}
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-4xl font-extrabold text-white tracking-tight">Problems</h1>
          <p className="text-slate-400 mt-1">Master your coding skills with our curated challenges.</p>
        </div>
        <div className="px-4 py-2 bg-slate-900 border border-slate-800 rounded-full text-sm font-semibold text-brand-400">
          {response?.count ?? 0} Total Challenges
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-48 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search problems…"
            className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-brand-500" />
        </div>

        {/* Difficulty */}
        <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-xl p-1">
          {DIFFS.map((d) => (
            <button key={d} onClick={() => setDifficulty(d)}
              className={cn(
                "px-3 py-1 rounded-lg text-xs font-bold transition-colors",
                difficulty === d
                  ? "bg-slate-700 text-white"
                  : "text-slate-500 hover:text-slate-300"
              )}>
              {d || "All"}
            </button>
          ))}
        </div>

        {/* Section */}
        <select value={section} onChange={(e) => setSection(e.target.value)}
          className="px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-sm text-slate-400 focus:outline-none focus:border-brand-500">
          <option value="">All Sections</option>
          {sections?.map((s) => (
            <option key={s.name} value={s.name}>{s.icon} {s.display_name}</option>
          ))}
        </select>

        {/* Topic */}
        <select value={topic} onChange={(e) => setTopic(e.target.value)}
          className="px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-sm text-slate-400 focus:outline-none focus:border-brand-500">
          <option value="">All Topics</option>
          {topicTags?.map((t) => (
            <option key={t.slug} value={t.slug}>{t.name}</option>
          ))}
        </select>
      </div>

      {/* Problem list */}
      <div className="grid gap-3">
        {problems.map((problem) => (
          <Link key={problem.id} href={`/problems/${problem.slug}`}
            className="group block p-5 bg-slate-900/40 hover:bg-slate-900/80 border border-slate-800 hover:border-brand-500/50 rounded-xl transition-all duration-200">

            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                {/* Title row */}
                <div className="flex items-center gap-3 mb-2 flex-wrap">
                  <span className="text-slate-500 font-mono text-sm tabular-nums shrink-0">
                    #{problem.number ?? problem.id}
                  </span>
                  <h2 className="text-lg font-bold text-slate-100 group-hover:text-brand-400 transition-colors truncate">
                    {problem.title}
                  </h2>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider shrink-0 ${difficultyColor(problem.difficulty)}`}>
                    {problem.difficulty}
                  </span>
                  {problem.visibility === "PRO" && (
                    <span className="text-[10px] text-brand-400 bg-brand-500/10 px-2 py-0.5 rounded border border-brand-500/20 shrink-0">
                      Pro
                    </span>
                  )}
                </div>

                {/* ✅ Bug fixed: statement_md is NOT in the list API response.
                    Use topic tags as the description preview instead — they ARE in the list response. */}
                <p className="text-slate-500 text-sm mb-3">
                  {problem.tags?.filter(t => t.tag_type === "TOPIC").map(t => t.name).join(" · ") || "—"}
                </p>

                {/* Stats */}
                <div className="flex items-center gap-5 text-xs font-medium text-slate-500 flex-wrap">
                  <div className="flex items-center gap-1.5">
                    <Trophy className="w-3.5 h-3.5 text-amber-500/80" />
                    <span className="text-slate-300">{problem.acceptance_rate}%</span>
                    <span className="hidden sm:inline">Acceptance</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-blue-500/80" />
                    <span className="text-slate-300">{problem.accepted_submissions.toLocaleString()}</span>
                    <span className="hidden sm:inline">Solved</span>
                  </div>
                  {problem.section && (
                    <div className="px-2 py-0.5 bg-slate-800 rounded text-slate-400 text-[10px] uppercase tracking-tight">
                      {problem.section.icon} {problem.section.display_name}
                    </div>
                  )}
                  {problem.is_solved && (
                    <span className="text-emerald-400 text-[10px] font-bold">✓ Solved</span>
                  )}
                </div>
              </div>

              <div className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center group-hover:bg-brand-500/10 group-hover:text-brand-400 transition-colors ml-4 shrink-0">
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>
          </Link>
        ))}

        {problems.length === 0 && (
          <div className="text-center py-20 bg-slate-900/20 border-2 border-dashed border-slate-800 rounded-2xl">
            <Trophy className="w-12 h-12 text-slate-700 mx-auto mb-4" />
            <p className="text-slate-400 font-medium">No problems match your filters.</p>
            <button onClick={() => { setSearch(""); setDifficulty(""); setSection(""); setTopic(""); }}
              className="mt-3 text-brand-400 hover:underline text-sm">
              Reset filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
