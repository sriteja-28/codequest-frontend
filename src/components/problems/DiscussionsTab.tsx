"use client";

import { useEffect, useState } from "react";
import { MessageSquare, Pin, Lock, Eye, MessageCircle } from "lucide-react";
import Link from "next/link";
import { discussApi } from "@/lib/api";
import type { Thread } from "@/types";

interface Props {
  problemSlug: string;
}

export default function DiscussionsTab({ problemSlug }: Props) {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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

  if (isLoading) {
    return (
      <div className="p-5">
        <div className="flex items-center justify-center py-16">
          <div className="w-6 h-6 border-2 border-slate-700 border-t-slate-400 rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (threads.length === 0) {
    return (
      <div className="p-5">
        <div className="flex flex-col items-center justify-center py-16 text-slate-700 gap-2">
          <MessageSquare className="w-8 h-8 opacity-25" />
          <p className="text-sm">No discussions yet</p>
          <p className="text-xs opacity-50">Be the first to start a discussion</p>
          {/* ✅ FIXED: Link to global discussions or implement create modal */}
          <Link
            href="/discussions"
            className="mt-3 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-semibold transition-colors"
          >
            Browse All Discussions
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-2">
      {/* ✅ REMOVED: "View All" link - tab already shows everything */}
      <div className="mb-3">
        <p className="text-xs text-slate-500">
          {threads.length} {threads.length === 1 ? "discussion" : "discussions"}
        </p>
      </div>

      {threads.map((thread) => (
        <Link
          key={thread.id}
          href={`/discuss/thread/${thread.id}`} 
          className="block p-3 rounded-lg bg-[#1a1a1a] border border-[#252525] 
                     hover:border-[#333] transition-colors group"
        >
          <div className="flex items-start gap-2">
            {/* Thread icon */}
            <div className="mt-0.5 shrink-0">
              {thread.is_pinned ? (
                <Pin className="w-4 h-4 text-blue-400" />
              ) : thread.is_locked ? (
                <Lock className="w-4 h-4 text-slate-600" />
              ) : (
                <MessageCircle className="w-4 h-4 text-slate-600" />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-slate-200 group-hover:text-blue-400 transition-colors truncate">
                {thread.title}
              </h3>
              <div className="flex items-center gap-3 mt-1 text-[10px] text-slate-600">
                <span>{thread.created_by.display_name}</span>
                <span>·</span>
                <span>{new Date(thread.created_at).toLocaleDateString()}</span>
                <span className="flex items-center gap-1">
                  <Eye className="w-3 h-3" />
                  {thread.views}
                </span>
                <span className="flex items-center gap-1">
                  <MessageCircle className="w-3 h-3" />
                  {thread.comment_count}
                </span>
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}