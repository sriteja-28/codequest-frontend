"use client";
import { useState, useRef, useEffect } from "react";
import { Lightbulb, MessageSquare, ChevronRight, Send, AlertCircle } from "lucide-react";
import { useHint, useAiChat } from "@/lib/hooks";
import { cn } from "@/lib/utils";
import type { ChatMessage } from "@/types";

interface Props {
  problemSlug: string;
  code: string;
  language: string;
}

export default function AiPanel({ problemSlug, code, language }: Props) {
  const [tab, setTab] = useState<"hints" | "chat">("hints");
  const [hintLevel, setHintLevel] = useState(0);
  const [hints, setHints] = useState<Array<{ level: number; text: string }>>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [conversationId, setConversationId] = useState<string | undefined>();
  const [rateLimitMsg, setRateLimitMsg] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  const hintMutation = useHint();
  const chatMutation = useAiChat();

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const requestHint = async () => {
    setRateLimitMsg("");
    try {
      const result = await hintMutation.mutateAsync({
        slug: problemSlug,
        level: hintLevel,
        code,
      });
      setHints((prev) => [...prev, { level: hintLevel, text: result.hint }]);
      if (result.has_more) setHintLevel((l) => l + 1);
    } catch (err: any) {
      if (err?.response?.status === 429) {
        setRateLimitMsg(err.response.data?.detail ?? "Hint limit reached.");
      }
    }
  };

  const sendMessage = async () => {
    const msg = input.trim();
    if (!msg) return;
    setInput("");
    setMessages((m) => [...m, { role: "user", content: msg }]);

    try {
      const result = await chatMutation.mutateAsync({
        slug: problemSlug,
        message: msg,
        conversationId,
      });
      setConversationId(result.conversation_id);
      setMessages((m) => [...m, { role: "assistant", content: result.response }]);
    } catch (err: any) {
      if (err?.response?.status === 429) {
        setMessages((m) => [...m, { role: "assistant", content: err.response.data?.detail ?? "Chat limit reached." }]);
      }
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Tabs */}
      <div className="flex border-b border-surface-300 bg-surface-50 shrink-0">
        <button
          onClick={() => setTab("hints")}
          className={cn(
            "flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium border-b-2 transition-colors",
            tab === "hints" ? "border-brand-500 text-brand-400" : "border-transparent text-slate-500 hover:text-slate-300"
          )}
        >
          <Lightbulb className="w-3.5 h-3.5" /> Hints
        </button>
        <button
          onClick={() => setTab("chat")}
          className={cn(
            "flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium border-b-2 transition-colors",
            tab === "chat" ? "border-brand-500 text-brand-400" : "border-transparent text-slate-500 hover:text-slate-300"
          )}
        >
          <MessageSquare className="w-3.5 h-3.5" /> Chat
        </button>
      </div>

      {/* Hints panel */}
      {tab === "hints" && (
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
          <p className="text-xs text-slate-500">
            Hints are progressive — each one is slightly more specific.
          </p>

          {hints.map((h) => (
            <div key={h.level} className="card p-3 animate-slide-up">
              <div className="text-xs font-medium text-brand-400 mb-1">Hint {h.level + 1}</div>
              <p className="text-sm text-slate-300">{h.text}</p>
            </div>
          ))}

          {rateLimitMsg && (
            <div className="flex items-start gap-2 text-amber-400 text-xs card p-3">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                {rateLimitMsg}
                <a href="/upgrade" className="block mt-1 text-brand-400 hover:underline">Upgrade to Pro →</a>
              </div>
            </div>
          )}

          <button
            onClick={requestHint}
            disabled={hintMutation.isPending}
            className="btn-primary justify-center text-xs"
          >
            <Lightbulb className="w-3.5 h-3.5" />
            {hintMutation.isPending ? "Thinking…" : hints.length === 0 ? "Get a Hint" : "Next Hint"}
          </button>
        </div>
      )}

      {/* Chat panel */}
      {tab === "chat" && (
        <>
          <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-3">
            {messages.length === 0 && (
              <div className="text-center text-slate-500 text-xs mt-8">
                <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-30" />
                Ask anything about this problem.<br />
                <span className="text-slate-600">The AI won't give away the solution.</span>
              </div>
            )}
            {messages.map((m, i) => (
              <div
                key={i}
                className={cn(
                  "rounded-xl px-3 py-2 text-sm max-w-[85%]",
                  m.role === "user"
                    ? "bg-brand-600/20 text-brand-100 ml-auto"
                    : "bg-surface-200 text-slate-300"
                )}
              >
                {m.content}
              </div>
            ))}
            {chatMutation.isPending && (
              <div className="bg-surface-200 text-slate-400 rounded-xl px-3 py-2 text-sm max-w-[85%] animate-pulse">
                Thinking…
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          <div className="p-3 border-t border-surface-300 shrink-0">
            <div className="flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
                placeholder="Ask about this problem…"
                className="input text-xs flex-1"
              />
              <button onClick={sendMessage} disabled={chatMutation.isPending} className="btn-primary p-2">
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}