"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { discussApi } from "@/lib/api";
import { useAuth } from "@/lib/hooks";
import { timeAgo } from "@/lib/utils";
import { MessageSquare, Eye, Pin, Lock, ThumbsUp, TrendingUp } from "lucide-react";
import Link from "next/link";
import type { Thread } from "@/types";

export default function DiscussionsPage() {
  const { user } = useAuth();
  const [sortBy, setSortBy] = useState<'recent' | 'popular'>('recent');

  const { data, isLoading } = useQuery({
    queryKey: ["discussions-all", sortBy],
    queryFn: () => discussApi.listAll(),
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
        <div className="text-slate-400">Loading discussions...</div>
      </div>
    );
  }

  // Sort threads
  const sortedThreads = data?.results ? [...data.results].sort((a, b) => {
    if (sortBy === 'popular') {
      return (b.upvote_count || 0) - (a.upvote_count || 0);
    }
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  }) : [];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-100">Discussions</h1>
          <p className="text-slate-400 mt-1">
            {user ? 'Ask questions and share solutions' : 'Login to participate in discussions'}
          </p>
        </div>

        {/* Sort */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSortBy('recent')}
            className={`px-3 py-1.5 rounded text-sm transition-colors ${
              sortBy === 'recent'
                ? 'bg-blue-600 text-white'
                : 'bg-[#1a1a1a] text-slate-400 hover:text-slate-200'
            }`}
          >
            Recent
          </button>
          <button
            onClick={() => setSortBy('popular')}
            className={`px-3 py-1.5 rounded text-sm transition-colors ${
              sortBy === 'popular'
                ? 'bg-blue-600 text-white'
                : 'bg-[#1a1a1a] text-slate-400 hover:text-slate-200'
            }`}
          >
            Popular
          </button>
        </div>
      </div>

      {/* Auth notice */}
      {!user && (
        <div className="mb-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
          <p className="text-sm text-blue-400">
            <Link href="/auth/login" className="underline font-medium">
              Login
            </Link>{' '}
            to create threads, comment, and upvote discussions.
          </p>
        </div>
      )}

      {/* Thread list */}
      <div className="space-y-4">
        {sortedThreads.map((thread: Thread) => (
          <Link
            key={thread.id}
            href={`/discussions/thread/${thread.id}`}
            className="block p-6 bg-[#141414] rounded-lg border border-[#1e1e1e] 
                       hover:border-blue-500/50 transition-colors"
          >
            {/* Badges */}
            {(thread.is_pinned || thread.is_locked) && (
              <div className="flex items-center gap-2 mb-2">
                {thread.is_pinned && (
                  <span className="flex items-center gap-1 px-2 py-0.5 bg-blue-500/10 
                                   text-blue-400 rounded text-xs font-medium">
                    <Pin className="w-3 h-3" /> Pinned
                  </span>
                )}
                {thread.is_locked && (
                  <span className="flex items-center gap-1 px-2 py-0.5 bg-slate-500/10 
                                   text-slate-500 rounded text-xs font-medium">
                    <Lock className="w-3 h-3" /> Locked
                  </span>
                )}
              </div>
            )}

            {/* Title */}
            <h2 className="text-xl font-semibold text-slate-100 hover:text-blue-400 
                           mb-2 transition-colors">
              {thread.title}
            </h2>

            {/* Content preview */}
            <p className="text-slate-400 mb-3 line-clamp-2">
              {thread.content}
            </p>

            {/* Metadata */}
            <div className="flex items-center gap-4 text-sm text-slate-500">
              {/* Author */}
              <span className="flex items-center gap-1.5">
                by {thread.created_by.display_name}
                {thread.created_by.plan === 'PRO' && (
                  <span className="px-1 py-0.5 bg-blue-600 text-white text-xs rounded">
                    PRO
                  </span>
                )}
              </span>
              
              {/* Problem link */}
              <Link 
                href={`/problems/${thread.problem_slug}`}
                className="text-blue-400 hover:underline"
                onClick={(e) => e.stopPropagation()}
              >
                {thread.problem_slug}
              </Link>

              {/* Stats */}
              <div className="flex items-center gap-1">
                <ThumbsUp className="w-4 h-4" />
                {thread.upvote_count}
              </div>

              <div className="flex items-center gap-1">
                <MessageSquare className="w-4 h-4" />
                {thread.comment_count}
              </div>
              
              <div className="flex items-center gap-1">
                <Eye className="w-4 h-4" />
                {thread.views}
              </div>
              
              <span>{timeAgo(thread.created_at)}</span>
            </div>
          </Link>
        ))}

        {sortedThreads.length === 0 && (
          <div className="text-center py-12">
            <p className="text-slate-400">
              No discussions yet. {user ? 'Start a conversation!' : 'Login to start a conversation!'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}