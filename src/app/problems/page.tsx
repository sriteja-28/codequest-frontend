"use client";

import { useState, useMemo } from "react";
import { useProblems, useTags, useSections, useSubmissionHistory, useMe } from "@/lib/hooks/index";
import type { Problem, Section } from "@/types";

import { StatsBar } from "./components/StatsBar";
import { FiltersBar } from "./components/FiltersBar";
import { SectionGroup } from "./components/SectionGroup";

export default function ProblemsPage() {
  const [search, setSearch] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [topic, setTopic] = useState("");
  const [expandAll, setExpandAll] = useState(false);

  // Filtered problems for table
  const { data: response, isLoading } = useProblems({
    search: search || undefined,
    difficulty: difficulty || undefined,
    topic: topic || undefined,
  });

  // All problems for stats (no filters)
  const { data: allResponse } = useProblems({});

  const { data: topicTags } = useTags("TOPIC");
  const { data: sections } = useSections();
  const { data: allHistory } = useSubmissionHistory();
  const { data: user } = useMe();

  const problems: Problem[] = response?.results ?? [];
  const allProblems: Problem[] = allResponse?.results ?? [];
  const totalCount = allResponse?.count ?? 0;

  // Group problems by section
  const sectionMap = useMemo(() => {
    const map = new Map<string, { meta: Section; problems: Problem[] }>();

    // Seed in section order from the sections API
    (sections ?? []).forEach((s) => {
      map.set(s.name, { meta: s, problems: [] });
    });

    // Assign problems to sections
    problems.forEach((p) => {
      const key = p.section?.name ?? "__unsectioned__";
      if (!map.has(key)) {
        map.set(key, {
          meta: p.section ?? {
            id: -1,
            name: key,
            display_name: "Other",
            icon: "📂",
            order_index: 999,
          },
          problems: [],
        });
      }
      map.get(key)!.problems.push(p);
    });

    // Remove empty sections when a search/filter is active
    if (search || difficulty || topic) {
      for (const [k, v] of map) {
        if (v.problems.length === 0) map.delete(k);
      }
    }

    return map;
  }, [problems, sections, search, difficulty, topic]);

  // Today's accepted submissions count
  const todayStr = new Date().toISOString().slice(0, 10);
  const todaySolved = (allHistory ?? []).filter(
    (s) => s.status === "ACCEPTED" && s.created_at?.startsWith(todayStr)
  ).length;

  const handleReset = () => {
    setSearch("");
    setDifficulty("");
    setTopic("");
  };

  // Loading skeletons
  if (isLoading && allProblems.length === 0) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-7 h-7 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-600 text-xs">Loading problems…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <div className="max-w-5xl mx-auto px-4 py-8">

        {/* ── Stats header ── */}
        <StatsBar
          problems={allProblems}
          total={totalCount}
          submissions={allHistory ?? []}
          currentStreak={user?.current_streak ?? 0}
          bestStreak={(user as any)?.best_streak ?? 0}
          todaySolved={todaySolved}
        />

        {/* ── Section title ── */}
        <h1 className="text-2xl font-extrabold text-white mb-5 tracking-tight">
          Problems
          <span className="ml-3 text-sm font-normal text-slate-600">
            {response?.count ?? 0} total
          </span>
        </h1>

        {/* ── Filters ── */}
        <FiltersBar
          search={search}
          difficulty={difficulty}
          topic={topic}
          topicTags={topicTags}
          onSearch={setSearch}
          onDifficulty={setDifficulty}
          onTopic={setTopic}
          onReset={handleReset}
          expandAll={expandAll}
          onToggleExpand={() => setExpandAll((v) => !v)}
        />

        {/* ── Sections ── */}
        {isLoading ? (
          <div className="flex flex-col gap-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-12 bg-[#0d0d0d] border border-[#1a1a1a] rounded-xl animate-pulse"
                style={{ opacity: 1 - i * 0.12 }}
              />
            ))}
          </div>
        ) : sectionMap.size === 0 ? (
          <div className="text-center py-20 border-2 border-dashed border-[#1a1a1a] rounded-2xl">
            <p className="text-slate-600 text-sm">No problems match your filters.</p>
            <button
              onClick={handleReset}
              className="mt-3 text-indigo-400 hover:text-indigo-300 text-xs hover:underline"
            >
              Reset filters
            </button>
          </div>
        ) : (
          <div className="flex flex-col">
            {[...sectionMap.entries()].map(([key, { meta, problems: sProblems }], idx) => (
              <SectionGroup
                key={key}
                name={meta.name}
                displayName={meta.display_name}
                icon={meta.icon}
                problems={sProblems}
                // Open first section by default, or all if expandAll, or any with matches
                defaultOpen={
                  expandAll ||
                  idx === 0 ||
                  (!!search || !!difficulty || !!topic)
                }
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}