"use client";

import { useState, useMemo } from "react";
import { useProblems, useSections, useSubmissionHistory, useMe } from "@/lib/hooks/index";
import type { Problem, Section } from "@/types";

import { LeftSidebar } from "./components/LeftSidebar";
import { DonutArc } from "./components/DonutArc";
import { FiltersBar } from "./components/FiltersBar";
import { SectionGroup } from "./components/SectionGroup";
import { RightPanel } from "./components/RightPanel";

export default function ProblemsPage() {
  const [search, setSearch] = useState("");
  const [difficulty, setDifficulty] = useState("");
  // topic = topic slug (sidebar or filter bar), company = company slug (sidebar only)
  // Selecting one clears the other
  const [topic, setTopic] = useState("");
  const [company, setCompany] = useState("");
  const [expandAll, setExpandAll] = useState<boolean | undefined>(undefined);

  // Filtered problems for the section list
  const { data: response, isLoading } = useProblems({
    search: search || undefined,
    difficulty: difficulty || undefined,
    topic: topic || undefined,
    ...(company ? { company } : {}),
  });

  // ALL problems (unfiltered) — used by LeftSidebar for real tag counts & DonutArc
  const { data: allResponse } = useProblems({});

  const { data: sections } = useSections();
  const { data: allHistory } = useSubmissionHistory();
  const { data: user } = useMe();

  const problems: Problem[] = response?.results ?? [];
  const allProblems: Problem[] = allResponse?.results ?? [];
  const totalCount = allResponse?.count ?? 0;

  // Group filtered problems by section (preserving API order)
  const sectionMap = useMemo(() => {
    const map = new Map<string, { meta: Section; problems: Problem[] }>();

    (sections ?? []).forEach((s) => {
      map.set(s.name, { meta: s, problems: [] });
    });

    problems.forEach((p) => {
      const key = p.section?.name ?? "__other__";
      if (!map.has(key)) {
        map.set(key, {
          meta: p.section ?? {
            id: -1, name: key, display_name: "Other",
            icon: "📂", order_index: 999,
          },
          problems: [],
        });
      }
      map.get(key)!.problems.push(p);
    });

    if (search || difficulty || topic || company) {
      for (const [k, v] of map) {
        if (v.problems.length === 0) map.delete(k);
      }
    }
    return map;
  }, [problems, sections, search, difficulty, topic, company]);

  const todayStr = new Date().toISOString().slice(0, 10);
  const todaySolved = (allHistory ?? []).filter(
    (s) => s.status === "ACCEPTED" && s.created_at?.startsWith(todayStr)
  ).length;

  const handleReset = () => {
    setSearch(""); setDifficulty(""); setTopic(""); setCompany("");
  };

  const handleCompanyClick = (slug: string) => {
    setCompany((prev) => prev === slug ? "" : slug);
    setTopic("");
  };
  const handleTopicClick = (slug: string) => {
    setTopic((prev) => prev === slug ? "" : slug);
    setCompany("");
  };
  const handleToggleExpand = () =>
    setExpandAll((prev) => prev === true ? false : true);

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <div className="max-w-[1400px] mx-auto px-4 py-6">
        <div className="flex gap-5">

          {/* LEFT */}
          <LeftSidebar
            activeTopic={topic}
            activeCompany={company}
            onTopicClick={handleTopicClick}
            onCompanyClick={handleCompanyClick}
            allProblems={allProblems}
          />

          {/* CENTER */}
          <main className="flex-1 min-w-0 flex flex-col gap-4">
            <div className="bg-[#0d0d0d] border border-[#191919] rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-xl font-extrabold text-white tracking-tight">Problems</h1>
                <span className="text-[10px] text-slate-700 font-mono">{totalCount} total</span>
              </div>
              {allProblems.length > 0 && (
                <DonutArc problems={allProblems} total={totalCount} />
              )}
            </div>

            <FiltersBar
              search={search}
              difficulty={difficulty}
              hasFilters={!!(search || difficulty || topic || company)}
              onSearch={setSearch}
              onDifficulty={setDifficulty}
              onReset={handleReset}
              expandAll={expandAll === true}
              onToggleExpand={handleToggleExpand}
            />

            {isLoading ? (
              <div className="flex flex-col gap-1.5">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i}
                    className="h-11 bg-[#0c0c0c] border border-[#191919] rounded-xl animate-pulse"
                    style={{ opacity: 1 - i * 0.1 }}
                  />
                ))}
              </div>
            ) : sectionMap.size === 0 ? (
              <div className="text-center py-16 border-2 border-dashed border-[#191919] rounded-2xl">
                <p className="text-slate-600 text-sm">No problems match your filters.</p>
                <button onClick={handleReset}
                  className="mt-3 text-indigo-400 hover:text-indigo-300 text-xs hover:underline">
                  Reset filters
                </button>
              </div>
            ) : (
              <div className="flex flex-col">
                {[...sectionMap.entries()].map(([key, { meta, problems: sp }]) => (
                  <SectionGroup
                    key={key}
                    name={meta.name}
                    displayName={meta.display_name}
                    icon={meta.icon}
                    problems={sp}
                    forceOpen={expandAll}
                  />
                ))}
              </div>
            )}
          </main>

          {/* RIGHT */}
          <RightPanel
            submissions={allHistory ?? []}
            problems={allProblems}
            currentStreak={user?.current_streak ?? 0}
            bestStreak={user?.best_streak ?? 0}  
            todaySolved={todaySolved}
            userCreatedAt={user?.created_at}
          />
        </div>
      </div>
    </div>
  );
}