"use client";

import { Code } from "lucide-react";
import type { Problem } from "@/types";
import SolutionCard from "./SolutionCard";
import { useQuery } from "@tanstack/react-query";
import { problemsApi } from "@/lib/api";

interface Props {
  problem: Problem;
}

export default function SolutionsTab({ problem }: Props) {
  const { data: solutions = [], isLoading } = useQuery({
    queryKey: ["solutions", problem.slug],
    queryFn: () => problemsApi.solutions(problem.slug),
  });

  if (isLoading) {
    return (
      <div className="p-5 flex justify-center py-16">
        <div className="w-5 h-5 border-2 border-[#333] border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (solutions.length === 0) {
    return (
      <div className="p-5">
        <div className="flex flex-col items-center justify-center py-16 text-slate-700 gap-2">
          <Code className="w-8 h-8 opacity-25" />
          <p className="text-sm">No solutions available</p>
          <p className="text-xs opacity-50">Solutions will be added after the contest ends</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-5">
      <div className="space-y-4">
        {solutions.map((sol) => (
          <SolutionCard key={sol.id} solution={sol} />
        ))}
      </div>
    </div>
  );
}