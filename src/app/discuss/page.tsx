"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { timeAgo } from "@/lib/utils";
import { MessageSquare, ThumbsUp, Eye } from "lucide-react";
import Link from "next/link";
import type { Discussion } from "@/types";

export default function DiscussPage() {
  const { data: discussions, isLoading } = useQuery({
    queryKey: ["discussions"],
    queryFn: () => api.discussions.list(),
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-slate-400">Loading discussions...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-slate-100">Discussions</h1>
        <div className="text-sm text-slate-400">
          {discussions?.length || 0} discussions
        </div>
      </div>

      <div className="space-y-4">
        {discussions?.map((discussion: Discussion) => (
          <Link
            key={discussion.id}
            href={`/discuss/${discussion.id}`}
            className="block p-6 bg-surface-2 rounded-lg border border-surface-3 hover:border-brand-500/50 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-slate-100 hover:text-brand-400 mb-2">
                  {discussion.title}
                </h2>
                <p className="text-slate-400 mb-3 line-clamp-2">
                  {discussion.content}
                </p>
                <div className="flex items-center gap-4 text-sm text-slate-500">
                  <span>by {discussion.author.display_name}</span>
                  <div className="flex items-center gap-1">
                    <MessageSquare className="w-4 h-4" />
                    {discussion.reply_count} replies
                  </div>
                  <div className="flex items-center gap-1">
                    <ThumbsUp className="w-4 h-4" />
                    {discussion.upvote_count} upvotes
                  </div>
                  <div className="flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    {discussion.view_count} views
                  </div>
                  <span>{timeAgo(discussion.created_at)}</span>
                </div>
              </div>
            </div>
          </Link>
        ))}

        {discussions?.length === 0 && (
          <div className="text-center py-12">
            <p className="text-slate-400">No discussions yet. Start a conversation!</p>
          </div>
        )}
      </div>
    </div>
  );
}