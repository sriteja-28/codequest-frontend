"use client";

import { useEffect, useState } from "react";
import { MessageSquare, Lightbulb, TrendingUp, Clock, ThumbsUp, Eye, CheckCircle } from "lucide-react";
import Link from "next/link";
import { discussApi } from "@/lib/api";
import { useAuth } from "@/lib/hooks";
import { timeAgo } from "@/lib/utils";
import type { Thread } from "@/types";
import CreateThreadModal from "../discuss/Createthreadmodal";

interface Props {
  problemSlug: string;
}

type TabType = "comments" | "solutions";
type SortType = "hot" | "newest" | "top";

export default function DiscussionsTab({ problemSlug }: Props) {
  const { user } = useAuth();
  const [threads, setThreads] = useState<Thread[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>("comments");
  const [sortBy, setSortBy] = useState<SortType>("hot");
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const loadThreads = async () => {
      try {
        setIsLoading(true);
        const data = await discussApi.threads(problemSlug);
        setThreads(data);
      } catch (error) {
        console.error("Failed to load discussions:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadThreads();
  }, [problemSlug]);

  // Filter and sort threads
  const filteredThreads = threads.filter(thread => {
    // Determine if it's a solution by checking title/content keywords
    const isSolution = 
      thread.title.toLowerCase().includes("solution") ||
      thread.title.toLowerCase().includes("approach") ||
      thread.content.toLowerCase().includes("```");
    
    if (activeTab === "solutions") return isSolution;
    return !isSolution; // comments tab shows questions
  });

  const sortedThreads = [...filteredThreads].sort((a, b) => {
    if (sortBy === "hot") {
      // Hot = recent activity + upvotes
      const aScore = (a.upvote_count * 2) + a.comment_count;
      const bScore = (b.upvote_count * 2) + b.comment_count;
      return bScore - aScore;
    } else if (sortBy === "top") {
      return (b.upvote_count || 0) - (a.upvote_count || 0);
    } else {
      // newest
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
  });

  if (isLoading) {
    return (
      <div className="p-5">
        <div className="flex items-center justify-center py-16">
          <div className="w-6 h-6 border-2 border-slate-700 border-t-slate-400 rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  const commentsCount = threads.filter(t => 
    !t.title.toLowerCase().includes("solution") && 
    !t.title.toLowerCase().includes("approach")
  ).length;
  
  const solutionsCount = threads.length - commentsCount;

  return (
    <div className="bg-[#0a0a0a] min-h-[600px]">
      {/* Tabs Header */}
      <div className="border-b border-[#1e1e1e]">
        <div className="flex items-center justify-between px-4">
          {/* Tab Buttons */}
          <div className="flex">
            <button
              onClick={() => setActiveTab("comments")}
              className={`flex items-center gap-2 px-6 py-3 border-b-2 transition-colors ${
                activeTab === "comments"
                  ? "border-blue-500 text-blue-400"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              Comments
              <span className="px-1.5 py-0.5 bg-[#1a1a1a] rounded text-xs">
                {commentsCount}
              </span>
            </button>
            <button
              onClick={() => setActiveTab("solutions")}
              className={`flex items-center gap-2 px-6 py-3 border-b-2 transition-colors ${
                activeTab === "solutions"
                  ? "border-green-500 text-green-400"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              <Lightbulb className="w-4 h-4" />
              Solutions
              <span className="px-1.5 py-0.5 bg-[#1a1a1a] rounded text-xs">
                {solutionsCount}
              </span>
            </button>
          </div>

          {/* Create Button */}
          {user && (
            <button
              onClick={() => setIsModalOpen(true)}
              className={`px-4 py-1.5 rounded text-sm font-medium transition-colors ${
                activeTab === "comments"
                  ? "bg-blue-600 hover:bg-blue-500 text-white"
                  : "bg-green-600 hover:bg-green-500 text-white"
              }`}
            >
              {activeTab === "comments" ? "Ask Question" : "Share Solution"}
            </button>
          )}
        </div>

        {/* Sort Bar */}
        <div className="flex items-center gap-2 px-4 py-2 bg-[#0a0a0a]">
          <button
            onClick={() => setSortBy("hot")}
            className={`flex items-center gap-1 px-3 py-1 rounded text-sm transition-colors ${
              sortBy === "hot"
                ? "bg-[#2a2a2a] text-slate-100"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            Hot
          </button>
          <button
            onClick={() => setSortBy("newest")}
            className={`flex items-center gap-1 px-3 py-1 rounded text-sm transition-colors ${
              sortBy === "newest"
                ? "bg-[#2a2a2a] text-slate-100"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            Newest
          </button>
          <button
            onClick={() => setSortBy("top")}
            className={`flex items-center gap-1 px-3 py-1 rounded text-sm transition-colors ${
              sortBy === "top"
                ? "bg-[#2a2a2a] text-slate-100"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <ThumbsUp className="w-3.5 h-3.5" />
            Top
          </button>
        </div>
      </div>

      {/* Thread List */}
      <div className="divide-y divide-[#1e1e1e]">
        {sortedThreads.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-600">
            {activeTab === "comments" ? (
              <>
                <MessageSquare className="w-12 h-12 mb-3 opacity-25" />
                <p className="text-sm mb-1">No questions yet</p>
                <p className="text-xs opacity-75">Be the first to ask a question</p>
              </>
            ) : (
              <>
                <Lightbulb className="w-12 h-12 mb-3 opacity-25" />
                <p className="text-sm mb-1">No solutions yet</p>
                <p className="text-xs opacity-75">Be the first to share your solution</p>
              </>
            )}
            {user && (
              <button
                onClick={() => setIsModalOpen(true)}
                className={`mt-4 px-4 py-2 rounded text-sm font-medium transition-colors ${
                  activeTab === "comments"
                    ? "bg-blue-600 hover:bg-blue-500 text-white"
                    : "bg-green-600 hover:bg-green-500 text-white"
                }`}
              >
                {activeTab === "comments" ? "Ask Question" : "Share Solution"}
              </button>
            )}
          </div>
        ) : (
          sortedThreads.map((thread) => (
            <Link
              key={thread.id}
              href={`/discuss/thread/${thread.id}`}
              className="block px-4 py-3 hover:bg-[#141414] transition-colors group"
            >
              <div className="flex gap-3">
                {/* Vote count */}
                <div className="flex flex-col items-center gap-0.5 shrink-0">
                  <ThumbsUp className={`w-4 h-4 ${
                    thread.upvote_count > 10 ? "text-blue-400" : "text-slate-600"
                  }`} />
                  <span className={`text-xs font-medium ${
                    thread.upvote_count > 10 ? "text-blue-400" : "text-slate-500"
                  }`}>
                    {thread.upvote_count}
                  </span>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium text-slate-200 group-hover:text-blue-400 
                                 transition-colors truncate flex items-center gap-2">
                    {thread.title}
                    {thread.comments?.some(c => c.is_accepted_answer) && (
                      <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                    )}
                  </h3>
                  
                  <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      {thread.created_by.display_name}
                      {thread.created_by.plan === 'PRO' && (
                        <span className="px-1 bg-blue-600 text-white rounded text-[10px]">
                          PRO
                        </span>
                      )}
                    </span>
                    <span>•</span>
                    <span>{timeAgo(thread.created_at)}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <MessageSquare className="w-3 h-3" />
                      {thread.comment_count}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      {thread.views}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>

      {/* Auth Notice */}
      {!user && sortedThreads.length > 0 && (
        <div className="p-4 border-t border-[#1e1e1e]">
          <div className="p-3 bg-blue-500/5 border border-blue-500/10 rounded text-center">
            <p className="text-sm text-blue-400">
              <Link href="/auth/login" className="underline font-medium">
                Login
              </Link>{' '}
              to ask questions and share solutions
            </p>
          </div>
        </div>
      )}

      {/* Create Modal */}
      <CreateThreadModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        problemSlug={problemSlug}
        defaultType={activeTab === "solutions" ? "solution" : "question"}
      />
    </div>
  );
}