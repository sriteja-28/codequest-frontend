"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { discussApi } from "@/lib/api";
import { X, MessageSquare, Lightbulb } from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  problemSlug: string;
  defaultType?: "question" | "solution";
}

export default function CreateThreadModal({ 
  isOpen, 
  onClose, 
  problemSlug,
  defaultType = "question"
}: Props) {
  const [type, setType] = useState<"question" | "solution">(defaultType);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: () => discussApi.createThread(problemSlug, title, content, isAnonymous),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["threads", problemSlug] });
      queryClient.invalidateQueries({ queryKey: ["discussions-all"] });
      setTitle("");
      setContent("");
      setIsAnonymous(false);
      onClose();
    },
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    createMutation.mutate();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#141414] rounded-lg border border-[#2a2a2a] w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#2a2a2a]">
          <h2 className="text-xl font-semibold text-slate-100">
            {type === "question" ? "Ask a Question" : "Share a Solution"}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Type Toggle */}
          <div className="flex gap-2 p-1 bg-[#0a0a0a] rounded-lg">
            <button
              type="button"
              onClick={() => setType("question")}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded transition-colors ${
                type === "question"
                  ? "bg-blue-600 text-white"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              Question
            </button>
            <button
              type="button"
              onClick={() => setType("solution")}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded transition-colors ${
                type === "solution"
                  ? "bg-green-600 text-white"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Lightbulb className="w-4 h-4" />
              Solution
            </button>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={
                type === "question"
                  ? "e.g., How to optimize time complexity?"
                  : "e.g., O(n) Dynamic Programming Solution"
              }
              className="w-full bg-[#0a0a0a] border border-[#2a2a2a] rounded px-3 py-2 
                         text-slate-200 placeholder-slate-500 focus:outline-none 
                         focus:border-blue-500"
              required
            />
          </div>

          {/* Content - Markdown Support */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              {type === "question" ? "Description" : "Solution"}
              <span className="text-slate-500 font-normal ml-2">
                (Markdown supported)
              </span>
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={
                type === "question"
                  ? "Describe your question in detail. You can use markdown for code blocks:\n\n```python\ndef solution():\n    pass\n```"
                  : "Share your solution with explanation. Use markdown for code:\n\n```python\nclass Solution:\n    def solve(self):\n        # Your solution here\n        pass\n```"
              }
              className="w-full bg-[#0a0a0a] border border-[#2a2a2a] rounded px-3 py-2 
                         text-slate-200 placeholder-slate-500 focus:outline-none 
                         focus:border-blue-500 min-h-[300px] resize-y font-mono text-sm"
              required
            />
            <p className="text-xs text-slate-500 mt-1">
              Use ``` for code blocks, ** for bold, * for italic
            </p>
          </div>

          {/* Options */}
          <div className="flex items-center justify-between pt-4 border-t border-[#2a2a2a]">
            <label className="flex items-center gap-2 text-sm text-slate-400 cursor-pointer">
              <input
                type="checkbox"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
                className="rounded bg-[#0a0a0a] border-[#2a2a2a]"
              />
              Post anonymously
            </label>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-[#1a1a1a] text-slate-400 rounded 
                           hover:text-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!title.trim() || !content.trim() || createMutation.isPending}
                className={`px-6 py-2 rounded font-medium transition-colors ${
                  type === "question"
                    ? "bg-blue-600 hover:bg-blue-500 text-white"
                    : "bg-green-600 hover:bg-green-500 text-white"
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {createMutation.isPending ? "Posting..." : "Post"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}