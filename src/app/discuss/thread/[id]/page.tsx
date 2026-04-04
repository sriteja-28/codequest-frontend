"use client";

import { use, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { discussApi } from "@/lib/api";
import { useAuth } from "@/lib/hooks";
import { timeAgo } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { 
  ThumbsUp, Eye, ArrowLeft, CheckCircle, 
  MessageSquare, AlertCircle 
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
  const [replyingToName, setReplyingToName] = useState<string>("");

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
      setReplyingToName("");
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
        <div className="w-8 h-8 border-2 border-slate-700 border-t-slate-400 rounded-full animate-spin" />
      </div>
    );
  }

  if (!thread) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h1 className="text-xl font-semibold text-slate-100 mb-2">Thread Not Found</h1>
          <p className="text-slate-400 mb-4">This discussion doesn't exist.</p>
          <Link
            href="/discussions"
            className="text-blue-400 hover:underline"
          >
            Back to Discussions
          </Link>
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
      className={`${depth > 0 ? 'ml-8 mt-3 border-l-2 border-[#1e1e1e] pl-4' : 'mt-4'}`}
    >
      <div className="bg-[#0a0a0a] rounded-lg border border-[#1e1e1e] p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 
                            flex items-center justify-center text-xs font-semibold text-white">
              {comment.created_by.display_name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-slate-200">
                  {comment.created_by.display_name}
                </span>
                {comment.created_by.plan === 'PRO' && (
                  <span className="px-1.5 py-0.5 bg-blue-600 text-white text-[10px] rounded font-semibold">
                    PRO
                  </span>
                )}
                {comment.is_accepted_answer && (
                  <span className="flex items-center gap-1 px-2 py-0.5 bg-green-500/10 
                                 text-green-400 rounded text-xs font-medium">
                    <CheckCircle className="w-3 h-3" /> Accepted
                  </span>
                )}
              </div>
              <span className="text-xs text-slate-500">
                {timeAgo(comment.created_at)}
              </span>
            </div>
          </div>

          {/* Upvote */}
          <button
            onClick={() => user && upvoteCommentMutation.mutate(comment.id)}
            disabled={!user}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded transition-colors ${
              comment.has_upvoted
                ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                : 'bg-[#141414] text-slate-400 hover:text-slate-200 border border-[#2a2a2a]'
            } ${!user && 'opacity-50 cursor-not-allowed'}`}
            title={!user ? 'Login to upvote' : ''}
          >
            <ThumbsUp className={`w-3.5 h-3.5 ${comment.has_upvoted && 'fill-current'}`} />
            <span className="text-sm font-medium">{comment.upvotes}</span>
          </button>
        </div>
        
        {/* Content with Markdown */}
        <div className="prose prose-sm prose-invert max-w-none mb-3">
          {/* <ReactMarkdown
            components={{
              code({ node, inline, className, children, ...props }) {
                const match = /language-(\w+)/.exec(className || '');
                return !inline && match ? (
                  <SyntaxHighlighter
                    style={vscDarkPlus}
                    language={match[1]}
                    PreTag="div"
                    {...props}
                  >
                    {String(children).replace(/\n$/, '')}
                  </SyntaxHighlighter>
                ) : (
                  <code className="bg-[#1a1a1a] px-1.5 py-0.5 rounded text-blue-400" {...props}>
                    {children}
                  </code>
                );
              },
            }}
          >
            {comment.body_md}
          </ReactMarkdown> */}
        </div>
        
        {/* Actions */}
        <div className="flex items-center gap-3">
          {user && !thread.is_locked && (
            <button
              onClick={() => {
                setReplyingTo(comment.id);
                setReplyingToName(comment.created_by.display_name);
                document.getElementById('comment-input')?.focus();
              }}
              className="text-xs text-slate-400 hover:text-blue-400 transition-colors font-medium"
            >
              Reply
            </button>
          )}

          {user && thread.created_by.id === user.id && !comment.is_accepted_answer && depth === 0 && (
            <button
              onClick={() => acceptAnswerMutation.mutate(comment.id)}
              className="text-xs text-green-400 hover:text-green-300 transition-colors font-medium"
            >
              ✓ Accept Answer
            </button>
          )}
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
    <div className="min-h-screen bg-[#0a0a0a]">
      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Back Button */}
        <Link
          href={`/problems/${thread.problem_slug}`}
          className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-slate-200 
                     transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Problem
        </Link>

        {/* Thread Container */}
        <div className="bg-[#0a0a0a] rounded-lg border border-[#1e1e1e]">
          {/* Thread Header */}
          <div className="p-6 border-b border-[#1e1e1e]">
            <div className="flex items-start gap-4">
              {/* Upvote Section */}
              <div className="flex flex-col items-center gap-2 pt-1">
                <button
                  onClick={() => user && upvoteThreadMutation.mutate()}
                  disabled={!user}
                  className={`p-2 rounded transition-colors ${
                    thread.has_upvoted
                      ? 'bg-blue-600 text-white'
                      : 'bg-[#141414] text-slate-400 hover:text-slate-200 border border-[#2a2a2a]'
                  } ${!user && 'opacity-50 cursor-not-allowed'}`}
                  title={!user ? 'Login to upvote' : ''}
                >
                  <ThumbsUp className={`w-5 h-5 ${thread.has_upvoted && 'fill-current'}`} />
                </button>
                <span className={`text-sm font-bold ${
                  thread.has_upvoted ? 'text-blue-400' : 'text-slate-400'
                }`}>
                  {thread.upvote_count}
                </span>
              </div>

              {/* Content */}
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-slate-100 mb-3">{thread.title}</h1>
                
                <div className="flex items-center gap-3 text-sm text-slate-400 mb-4">
                  <div className="flex items-center gap-1.5">
                    <div className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 
                                    flex items-center justify-center text-[10px] font-semibold text-white">
                      {thread.created_by.display_name.charAt(0).toUpperCase()}
                    </div>
                    <span>{thread.created_by.display_name}</span>
                    {thread.created_by.plan === 'PRO' && (
                      <span className="px-1.5 py-0.5 bg-blue-600 text-white text-[10px] rounded">
                        PRO
                      </span>
                    )}
                  </div>
                  <span>•</span>
                  <span>{timeAgo(thread.created_at)}</span>
                  <span>•</span>
                  <Link 
                    href={`/problems/${thread.problem_slug}`}
                    className="text-blue-400 hover:underline"
                  >
                    {thread.problem_slug}
                  </Link>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5" />
                    {thread.views}
                  </span>
                </div>

                {/* Thread Content with Markdown */}
                <div className="prose prose-invert max-w-none">
                  {/* <ReactMarkdown
                    components={{
                      code({ node, inline, className, children, ...props }) {
                        const match = /language-(\w+)/.exec(className || '');
                        return !inline && match ? (
                          <SyntaxHighlighter
                            style={vscDarkPlus}
                            language={match[1]}
                            PreTag="div"
                            {...props}
                          >
                            {String(children).replace(/\n$/, '')}
                          </SyntaxHighlighter>
                        ) : (
                          <code className="bg-[#1a1a1a] px-1.5 py-0.5 rounded text-blue-400" {...props}>
                            {children}
                          </code>
                        );
                      },
                    }}
                  >
                    {thread.content}
                  </ReactMarkdown> */}
                </div>
              </div>
            </div>
          </div>

          {/* Comments Section */}
          <div className="p-6">
            <h2 className="text-lg font-semibold text-slate-100 flex items-center gap-2 mb-4">
              <MessageSquare className="w-5 h-5" />
              {thread.comments?.length || 0} Replies
            </h2>

            {/* Comment Form */}
            {user && !thread.is_locked ? (
              <div className="bg-[#141414] rounded-lg border border-[#2a2a2a] p-4 mb-6">
                {replyingTo && (
                  <div className="mb-2 flex items-center gap-2">
                    <span className="text-xs text-slate-500">
                      Replying to <span className="text-blue-400">{replyingToName}</span>
                    </span>
                    <button
                      onClick={() => {
                        setReplyingTo(null);
                        setReplyingToName("");
                      }}
                      className="text-xs text-slate-500 hover:text-slate-300"
                    >
                      Cancel
                    </button>
                  </div>
                )}
                <textarea
                  id="comment-input"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Write a comment... (Markdown supported)"
                  className="w-full bg-[#0a0a0a] border border-[#2a2a2a] rounded px-3 py-2 
                             text-slate-200 placeholder-slate-500 focus:outline-none 
                             focus:border-blue-500 min-h-[100px] resize-y font-mono text-sm"
                />
                <div className="flex items-center justify-between mt-3">
                  <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isAnonymous}
                      onChange={(e) => setIsAnonymous(e.target.checked)}
                      className="rounded bg-[#0a0a0a] border-[#2a2a2a]"
                    />
                    Post anonymously
                  </label>
                  <button
                    onClick={handleSubmitComment}
                    disabled={!commentText.trim() || createCommentMutation.isPending}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 
                               disabled:opacity-50 disabled:cursor-not-allowed
                               text-white rounded text-sm font-medium transition-colors"
                  >
                    {createCommentMutation.isPending ? 'Posting...' : 'Post Comment'}
                  </button>
                </div>
              </div>
            ) : !user ? (
              <div className="mb-6 p-4 bg-blue-500/5 border border-blue-500/10 rounded">
                <p className="text-sm text-blue-400">
                  <Link href="/auth/login" className="underline font-medium">
                    Login
                  </Link>{' '}
                  to comment on this discussion.
                </p>
              </div>
            ) : thread.is_locked ? (
              <div className="mb-6 p-4 bg-slate-500/5 border border-slate-500/10 rounded">
                <p className="text-sm text-slate-400">
                  This thread is locked. No new comments can be added.
                </p>
              </div>
            ) : null}

            {/* Comment List */}
            {thread.comments && thread.comments.length > 0 ? (
              <div>
                {thread.comments.map(comment => renderComment(comment))}
              </div>
            ) : (
              <div className="text-center py-12">
                <MessageSquare className="w-10 h-10 mx-auto text-slate-700 mb-2 opacity-25" />
                <p className="text-slate-400 text-sm">
                  No replies yet. {user && !thread.is_locked ? 'Be the first to comment!' : ''}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}