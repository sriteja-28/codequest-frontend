"use client";

import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  Zap, Lightbulb, ChevronDown, Plus, TrendingUp,
  Building2, Tag as TagIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Problem } from "@/types";

interface Props {
  problem: Problem;
}

export default function DescriptionTab({ problem }: Props) {
  const [showTopics, setShowTopics] = useState(false);
  const [showCompanies, setShowCompanies] = useState(false);
  const [showHints, setShowHints] = useState(false);
  const [revealedHints, setRevealedHints] = useState(0);

  const topicsRef = useRef<HTMLDivElement>(null);
  const companiesRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (topicsRef.current && !topicsRef.current.contains(e.target as Node)) {
        setShowTopics(false);
      }
      if (companiesRef.current && !companiesRef.current.contains(e.target as Node)) {
        setShowCompanies(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const topicTags = problem.tags?.filter((t) => t.tag_type === "TOPIC") ?? [];
  const companyTags = problem.tags?.filter((t) => t.tag_type === "COMPANY") ?? [];
  const availableHints = problem.hints?.filter((h) => h.available) ?? [];

  return (
    <div className="p-5 space-y-5">
      {/* Title + Tags */}
      <div>
        <h1 className="text-xl font-bold text-white mb-3 leading-tight">
          {problem.title}
        </h1>

        <div className="flex items-center gap-2 flex-wrap mb-4">
          {/* Difficulty */}
          <span
            className={cn(
              "text-xs font-bold px-2.5 py-1 rounded-full cursor-default",
              problem.difficulty === "EASY" && "bg-green-500/10 text-green-400",
              problem.difficulty === "MEDIUM" && "bg-yellow-500/10 text-yellow-400",
              problem.difficulty === "HARD" && "bg-red-500/10 text-red-400"
            )}
          >
            {problem.difficulty[0] + problem.difficulty.slice(1).toLowerCase()}
          </span>

          {/* Topics dropdown */}
          {topicTags.length > 0 && (
            <div className="relative" ref={topicsRef}>
              <button
                onClick={() => {
                  setShowTopics((v) => !v);
                  setShowCompanies(false);
                }}
                className={cn(
                  "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border transition-colors",
                  showTopics
                    ? "bg-[#2a2a2a] border-[#444] text-slate-200"
                    : "bg-[#1e1e1e] border-[#2a2a2a] text-slate-400 hover:border-[#444] hover:text-slate-200"
                )}
              >
                <TagIcon className="w-3 h-3" />
                Topics
                <ChevronDown
                  className={cn("w-3 h-3 transition-transform", showTopics && "rotate-180")}
                />
              </button>

              {showTopics && (
                <div className="absolute top-full left-0 mt-1.5 z-50 bg-[#1a1a1a] border border-[#2a2a2a] 
                                rounded-xl shadow-2xl shadow-black/60 p-3 min-w-[200px]">
                  <p className="text-[9px] text-slate-600 uppercase font-bold tracking-wider mb-2.5">
                    Topics
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {topicTags.map((t) => (
                      <span
                        key={t.id}
                        className="text-[11px] px-2.5 py-1 rounded-full bg-[#252525] text-slate-300 border border-[#333]"
                      >
                        {t.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Company Tags dropdown */}
          {companyTags.length > 0 && (
            <div className="relative" ref={companiesRef}>
              <button
                onClick={() => {
                  setShowCompanies((v) => !v);
                  setShowTopics(false);
                }}
                className={cn(
                  "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border transition-colors",
                  showCompanies
                    ? "bg-[#2a2a2a] border-[#444] text-slate-200"
                    : "bg-[#1e1e1e] border-[#2a2a2a] text-slate-400 hover:border-[#444] hover:text-slate-200"
                )}
              >
                <Building2 className="w-3 h-3" />
                Companies
                <ChevronDown
                  className={cn("w-3 h-3 transition-transform", showCompanies && "rotate-180")}
                />
              </button>

              {showCompanies && (
                <div className="absolute top-full left-0 mt-1.5 z-50 bg-[#1a1a1a] border border-[#2a2a2a] 
                                rounded-xl shadow-2xl shadow-black/60 p-3 min-w-[220px]">
                  <p className="text-[9px] text-slate-600 uppercase font-bold tracking-wider mb-2.5">
                    Companies
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {companyTags.map((t) => (
                      <span
                        key={t.id}
                        className="text-[11px] px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-300 border border-blue-500/20"
                      >
                        {t.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {problem.number && (
            <span className="text-[10px] text-slate-700 font-mono ml-auto shrink-0">
              #{problem.number}
            </span>
          )}
        </div>

        {/* Acceptance Rate */}
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-slate-600" />
            <span className="text-slate-500">Acceptance:</span>
            <span className="text-slate-300 font-semibold">{problem.acceptance_rate}%</span>
          </div>
        </div>
      </div>

      {/* Problem statement */}
      <div
        className="prose prose-invert prose-sm max-w-none
                   prose-p:text-slate-300 prose-p:leading-relaxed
                   prose-strong:text-white
                   prose-code:text-blue-300 prose-code:bg-[#1e2030] prose-code:px-1.5 prose-code:py-0.5 
                   prose-code:rounded prose-code:text-[11px] prose-code:before:content-none prose-code:after:content-none
                   prose-pre:bg-[#1a1a2e] prose-pre:border prose-pre:border-[#2a2a3a] prose-pre:text-slate-300 
                   prose-pre:text-[11px] prose-pre:leading-relaxed
                   prose-ul:text-slate-300 prose-ol:text-slate-300 prose-li:text-slate-300
                   prose-h2:text-slate-200 prose-h2:text-base prose-h2:font-bold prose-h2:mt-5"
      >
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {problem.statement_md ?? ""}
        </ReactMarkdown>
      </div>

      {/* Recommended Complexity */}
      {(problem.time_complexity_average || problem.space_complexity) && (
        <div className="border border-[#2a2a2a] bg-[#1a1a1a] rounded-xl p-4 space-y-3">
          <p className="flex items-center gap-2 text-xs font-bold text-slate-400">
            <Zap className="w-4 h-4 text-yellow-500" />
            Recommended Time & Space Complexity
          </p>
          <p className="text-sm text-slate-300 leading-relaxed">
            You should aim for a solution with{" "}
            <code className="text-blue-300 bg-[#1e2030] px-1.5 py-0.5 rounded text-xs">
              {problem.time_complexity_average}
            </code>{" "}
            time and{" "}
            <code className="text-purple-300 bg-[#1e2030] px-1.5 py-0.5 rounded text-xs">
              {problem.space_complexity}
            </code>{" "}
            space.
          </p>
          {problem.complexity_notes_md && (
            <p className="text-xs text-slate-500 italic">{problem.complexity_notes_md}</p>
          )}
        </div>
      )}

      {/* Hints */}
      {availableHints.length > 0 && (
        <div className="border border-[#2a2a2a] bg-[#1a1a1a] rounded-xl p-4 space-y-3">
          <button
            onClick={() => setShowHints((v) => !v)}
            className="flex items-center justify-between w-full group"
          >
            <span className="flex items-center gap-2 text-xs font-bold text-slate-400">
              <Lightbulb className="w-4 h-4 text-yellow-500" />
              Hints ({availableHints.length})
            </span>
            <ChevronDown
              className={cn(
                "w-4 h-4 text-slate-600 transition-transform group-hover:text-slate-400",
                showHints && "rotate-180"
              )}
            />
          </button>

          {showHints && (
            <div className="space-y-2">
              {availableHints.slice(0, revealedHints + 1).map((hint, i) => (
                <div key={hint.index} className="bg-[#1e1e1e] border border-[#2a2a2a] rounded-lg p-3">
                  <p className="text-[10px] text-slate-600 uppercase font-bold mb-1.5">
                    Hint {hint.index}
                  </p>
                  <p className="text-xs text-slate-300 leading-relaxed">{hint.content}</p>
                </div>
              ))}
              {revealedHints < availableHints.length - 1 && (
                <button
                  onClick={() => setRevealedHints((v) => v + 1)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-[#252525] hover:bg-[#2e2e2e] 
                             border border-[#333] text-slate-300 rounded text-xs font-semibold transition-colors"
                >
                  <Plus className="w-3 h-3" />
                  Reveal Next Hint
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}