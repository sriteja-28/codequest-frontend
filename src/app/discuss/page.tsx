"use client";

import { use, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { discussApi } from "@/lib/api";
import { useAuth } from "@/lib/hooks";
import { timeAgo } from "@/lib/utils";
import { 
  MessageSquare, ThumbsUp, Eye, Reply, Pin, Lock, 
  CheckCircle, Send 
} from "lucide-react";
import Link from "next/link";
import type { Comment } from "@/types";

export default function ThreadDetailPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = use(params);
  const threadId = Number(id);
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [commentText, setCommentText] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [replyingTo, setReplyingTo] = useState<number | null>(null);

  // Fetch thread
  const { data: thread, isLoading: threadLoading } = useQuery({
    queryKey: ["thread", threadId],
    queryFn: () => discussApi.getThread(threadId),
  });

  // Upvote thread mutation
  const upvoteThreadMutation = useMutation({
    mutationFn: () => discussApi.upvoteThread(threadId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["thread", threadId] });
    },
  });

  // Upvote comment mutation
  const upvoteCommentMutation = useMutation({
    mutationFn: (commentId: number) => discussApi.upvoteComment(commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["thread", threadId] });
    },
  });

  // Create comment mutation
  const createCommentMutation = useMutation({
    mutationFn: (data: { body_md: string; parent?: number; isAnonymous: boolean }) =>
      discussApi.createComment(threadId, data.body_md, data.parent, data.isAnonymous),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["thread", threadId] });
      setCommentText("");
      setReplyingTo(null);
      setIsAnonymous(false);
    },
  });

  // Accept answer mutation
  const acceptAnswerMutation = useMutation({
    mutationFn: (commentId: number) => discussApi.acceptAnswer(commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["thread", threadId] });
    },
  });

  if (threadLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
        <div className="text-slate-400">Loading discussion...</div>
      </div>
    );
  }

  if (!thread) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-100 mb-2">Thread Not Found</h1>
          <p className="text-slate-400">This discussion doesn't exist.</p>
        </div>
      </div>
    );
  }

  const handleSubmitComment = () => {
    if (!commentText.trim()) return;
    createCommentMutation.mutate({
      body_md: commentText,
      parent: replyingTo || undefined,
      isAnonymous,
    });
  };

  const renderComment = (comment: Comment, depth = 0) => (
    <div 
      key={comment.id}
      className={`${depth > 0 ? 'ml-12 mt-3' : 'mt-4'}`}
    >
      <div className="bg-[#141414] rounded-lg border border-[#1e1e1e] p-4">
        <div className="flex items-start gap-3">
          {/* Avatar */}
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center 
                          justify-center text-sm font-medium text-white shrink-0">
            {comment.created_by.display_name.charAt(0).toUpperCase()}
          </div>
          
          <div className="flex-1 min-w-0">
            {/* Author & badges */}
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="font-medium text-slate-100">
                {comment.created_by.display_name}
              </span>
              
              {comment.created_by.plan === 'PRO' && (
                <span className="px-1.5 py-0.5 bg-blue-600 text-white text-xs rounded">
                  PRO
                </span>
              )}
              
              {comment.is_accepted_answer && (
                <span className="flex items-center gap-1 px-2 py-0.5 bg-green-500/10 
                               text-green-400 rounded text-xs font-medium">
                  <CheckCircle className="w-3 h-3" /> Accepted Answer
                </span>
              )}
              
              <span className="text-sm text-slate-400">
                {timeAgo(comment.created_at)}
              </span>
            </div>
            
            {/* Content */}
            <div className="text-slate-300 prose prose-sm prose-invert max-w-none mb-3">
              <p className="whitespace-pre-wrap">{comment.body_md}</p>
            </div>
            
            {/* Actions */}
            <div className="flex items-center gap-4">
              {/* Upvote */}
              <button
                onClick={() => user && upvoteCommentMutation.mutate(comment.id)}
                disabled={!user}
                className={`flex items-center gap-1 text-sm transition-colors ${
                  comment.has_upvoted
                    ? 'text-blue-400 font-medium'
                    : 'text-slate-400 hover:text-slate-300'
                } ${!user && 'opacity-50 cursor-not-allowed'}`}
                title={!user ? 'Login to upvote' : ''}
              >
                <ThumbsUp className={`w-4 h-4 ${comment.has_upvoted && 'fill-current'}`} />
                {comment.upvotes}
              </button>
              
              {/* Reply */}
              {user && !thread.is_locked && (
                <button
                  onClick={() => setReplyingTo(comment.id)}
                  className="flex items-center gap-1 text-sm text-slate-400 
                             hover:text-slate-300 transition-colors"
                >
                  <Reply className="w-4 h-4" />
                  Reply
                </button>
              )}

              {/* Accept answer */}
              {user && thread.created_by.id === user.id && !comment.is_accepted_answer && depth === 0 && (
                <button
                  onClick={() => acceptAnswerMutation.mutate(comment.id)}
                  className="flex items-center gap-1 text-sm text-green-400 
                             hover:text-green-300 transition-colors"
                >
                  <CheckCircle className="w-4 h-4" />
                  Accept
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Nested replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-2">
          {comment.replies.map(reply => renderComment(reply, depth + 1))}
        </div>
      )}
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Thread Header */}
      <div className="bg-[#141414] rounded-lg border border-[#1e1e1e] p-6 mb-8">
        {/* Badges */}
        {(thread.is_pinned || thread.is_locked) && (
          <div className="flex items-center gap-2 mb-3">
            {thread.is_pinned && (
              <span className="flex items-center gap-1 px-2 py-1 bg-blue-500/10 
                               text-blue-400 rounded text-xs">
                <Pin className="w-3 h-3" /> Pinned
              </span>
            )}
            {thread.is_locked && (
              <span className="flex items-center gap-1 px-2 py-1 bg-slate-500/10 
                               text-slate-500 rounded text-xs">
                <Lock className="w-3 h-3" /> Locked
              </span>
            )}
          </div>
        )}

        {/* Title & Meta */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-slate-100 mb-2">{thread.title}</h1>
            
            <div className="flex items-center gap-4 text-sm text-slate-400">
              <span>by {thread.created_by.display_name}</span>
              <span>{timeAgo(thread.created_at)}</span>
              
              <Link 
                href={`/problems/${thread.problem_slug}`}
                className="text-blue-400 hover:underline"
              >
                Problem: {thread.problem_slug}
              </Link>
            </div>
          </div>
          
          <div className="flex items-center gap-4 text-sm text-slate-500">
            <div className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              {thread.views}
            </div>
            <div className="flex items-center gap-1">
              <MessageSquare className="w-4 h-4" />
              {thread.comment_count}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="prose prose-invert max-w-none mb-4">
          <p className="text-slate-300 whitespace-pre-wrap">{thread.content}</p>
        </div>

        {/* Upvote button */}
        <button
          onClick={() => user && upvoteThreadMutation.mutate()}
          disabled={!user}
          className={`flex items-center gap-2 px-4 py-2 rounded transition-colors ${
            thread.has_upvoted
              ? 'bg-blue-600 text-white'
              : 'bg-[#1a1a1a] text-slate-300 hover:bg-[#252525]'
          } ${!user && 'opacity-50 cursor-not-allowed'}`}
          title={!user ? 'Login to upvote' : ''}
        >
          <ThumbsUp className={`w-4 h-4 ${thread.has_upvoted && 'fill-current'}`} />
          {thread.upvote_count} Upvotes
        </button>
      </div>

      {/* Comments */}
      <div>
        <h2 className="text-xl font-semibold text-slate-100 flex items-center gap-2 mb-4">
          <MessageSquare className="w-5 h-5" />
          Replies ({thread.comments?.length || 0})
        </h2>

        {/* Comment form */}
        {user && !thread.is_locked ? (
          <div className="bg-[#141414] rounded-lg border border-[#1e1e1e] p-4 mb-6">
            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder={replyingTo ? "Write a reply..." : "Write a comment..."}
              className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded px-3 py-2 
                         text-slate-200 placeholder-slate-500 focus:outline-none 
                         focus:border-blue-500 min-h-[100px] resize-y"
            />
            <div className="flex items-center justify-between mt-3">
              <label className="flex items-center gap-2 text-sm text-slate-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                  className="rounded"
                />
                Post anonymously
              </label>
              <div className="flex gap-2">
                {replyingTo && (
                  <button
                    onClick={() => setReplyingTo(null)}
                    className="px-3 py-1.5 bg-[#1a1a1a] text-slate-400 rounded text-sm
                               hover:text-slate-200 transition-colors"
                  >
                    Cancel Reply
                  </button>
                )}
                <button
                  onClick={handleSubmitComment}
                  disabled={!commentText.trim() || createCommentMutation.isPending}
                  className="flex items-center gap-1.5 px-4 py-1.5 bg-blue-600 
                             hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed
                             text-white rounded text-sm font-medium transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                  {createCommentMutation.isPending ? 'Posting...' : 'Post Comment'}
                </button>
              </div>
            </div>
          </div>
        ) : !user ? (
          <div className="mb-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <p className="text-sm text-blue-400">
              <Link href="/auth/login" className="underline font-medium">
                Login
              </Link>{' '}
              to comment on this discussion.
            </p>
          </div>
        ) : thread.is_locked ? (
          <div className="mb-6 p-4 bg-slate-500/10 border border-slate-500/20 rounded-lg">
            <p className="text-sm text-slate-400">
              This thread is locked. No new comments can be added.
            </p>
          </div>
        ) : null}

        {/* Comment list */}
        {thread.comments && thread.comments.length > 0 ? (
          <div>
            {thread.comments.map(comment => renderComment(comment))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-slate-400">
              No replies yet. {user && !thread.is_locked ? 'Be the first to comment!' : ''}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}