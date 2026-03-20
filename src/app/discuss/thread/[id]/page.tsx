"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { timeAgo } from "@/lib/utils";
import { MessageSquare, ThumbsUp, Eye, Reply } from "lucide-react";
import type { DiscussionAuthor, Comment } from "@/types";

export default function DiscussionDetailPage({ params }: { params: { id: string } }) {
  const { data: discussion, isLoading } = useQuery({
    queryKey: ["discussion", params.id],
    queryFn: () => api.discussions.get(params.id),
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-slate-400">Loading discussion...</div>
      </div>
    );
  }

  if (!discussion) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-100 mb-2">Discussion Not Found</h1>
          <p className="text-slate-400">The discussion you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Discussion Header */}
      <div className="bg-surface-2 rounded-lg border border-surface-3 p-6 mb-8">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-slate-100 mb-2">{discussion.title}</h1>
            <div className="flex items-center gap-4 text-sm text-slate-400">
              <span>by {discussion.author.display_name}</span>
              <span>{timeAgo(discussion.created_at)}</span>
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm text-slate-500">
            <div className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              {discussion.view_count}
            </div>
            <div className="flex items-center gap-1">
              <ThumbsUp className="w-4 h-4" />
              {discussion.upvote_count}
            </div>
            <div className="flex items-center gap-1">
              <MessageSquare className="w-4 h-4" />
              {discussion.reply_count}
            </div>
          </div>
        </div>
        <div className="prose prose-invert max-w-none">
          <div dangerouslySetInnerHTML={{ __html: discussion.content }} />
        </div>
      </div>

      {/* Comments/Replies */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-slate-100">Replies</h2>

        {discussion.comments && discussion.comments.length > 0 ? (
          discussion.comments.map((comment: Comment) => (
            <div key={comment.id} className="bg-surface-2 rounded-lg border border-surface-3 p-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center text-sm font-medium text-white">
                  {comment.author.display_name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-medium text-slate-100">{comment.author.display_name}</span>
                    <span className="text-sm text-slate-400">{timeAgo(comment.created_at)}</span>
                  </div>
                  <div className="text-slate-300">
                    {comment.content}
                  </div>
                  <div className="flex items-center gap-4 mt-3">
                    <button className="flex items-center gap-1 text-sm text-slate-400 hover:text-slate-300">
                      <ThumbsUp className="w-4 h-4" />
                      {comment.upvote_count}
                    </button>
                    <button className="flex items-center gap-1 text-sm text-slate-400 hover:text-slate-300">
                      <Reply className="w-4 h-4" />
                      Reply
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <p className="text-slate-400">No replies yet. Be the first to comment!</p>
          </div>
        )}
      </div>
    </div>
  );
}