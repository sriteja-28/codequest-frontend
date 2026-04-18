"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { Copy, Check } from "lucide-react";
import type { Solution } from "@/types";

type Lang = "python" | "cpp" | "java" | "javascript";

const LANGS: { key: Lang; label: string }[] = [
    { key: "python", label: "Python" },
    { key: "cpp", label: "C++" },
    { key: "java", label: "Java" },
    { key: "javascript", label: "JS" },
];

export default function SolutionCard({ solution: sol }: { solution: Solution }) {
    const [lang, setLang] = useState<Lang>("python");
    const [copied, setCopied] = useState(false);

    const codeMap: Record<Lang, string> = {
        python: sol.code_python ?? "",
        cpp: sol.code_cpp ?? "",
        java: sol.code_java ?? "",
        javascript: sol.code_javascript ?? "",
    };

    const handleCopy = () => {
        const code = codeMap[lang];
        if (!code) return;
        navigator.clipboard.writeText(code).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    return (
        <div className="border border-[#2a2a2a] bg-[#1a1a1a] rounded-xl p-4">
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                    <h3 className="text-sm font-bold text-white mb-1">{sol.title}</h3>
                    {sol.is_official && (
                        <span className="inline-block text-[10px] px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                            Official Solution
                        </span>
                    )}
                </div>

                {/* Complexity badges — now labelled */}
                <div className="flex flex-col gap-1 text-[10px] shrink-0 ml-3 items-end">
                    <div className="flex items-center gap-1.5">
                        <span className="text-slate-600">Time</span>
                        <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 font-mono">
                            {sol.time_complexity}
                        </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span className="text-slate-600">Space</span>
                        <span className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20 font-mono">
                            {sol.space_complexity}
                        </span>
                    </div>
                </div>
            </div>

            {/* Approach summary */}
            <div className="prose prose-invert prose-sm max-w-none
                      prose-p:text-slate-300 prose-p:text-xs prose-p:leading-relaxed
                      prose-code:text-blue-300 prose-code:bg-[#1e2030] prose-code:px-1.5 prose-code:py-0.5
                      prose-code:rounded prose-code:text-[11px] prose-code:before:content-none prose-code:after:content-none
                      prose-ul:text-slate-300 prose-ol:text-slate-300 prose-li:text-xs
                      prose-strong:text-white mb-3">
                <ReactMarkdown>{sol.approach_summary_md}</ReactMarkdown>
            </div>

            {/* Locked */}
            {sol.is_locked ? (
                <div className="p-3 bg-slate-900/50 border border-slate-800 rounded-lg flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-brand-500/10 flex items-center justify-center shrink-0">
                        <span className="text-sm">🔒</span>
                    </div>
                    <div className="flex-1">
                        <p className="text-xs font-semibold text-slate-200">Pro Feature</p>
                        <p className="text-xs text-slate-500">Upgrade to view full code implementation</p>
                    </div>
                    <a
                        href="/upgrade"
                        className="px-3 py-1.5 bg-brand-600 hover:bg-brand-500 text-white rounded text-xs font-semibold transition-colors shrink-0"
                    >
                        Upgrade
                    </a>
                </div>
            ) : (
                <>
                    {/* Language tabs + copy button on same row */}
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex gap-1">
                            {LANGS.map(({ key, label }) => (
                                <button
                                    key={key}
                                    onClick={() => setLang(key)}
                                    className={`text-[10px] px-2 py-1 rounded border transition-colors ${lang === key
                                            ? "bg-[#2d2d2d] text-slate-200 border-[#444]"
                                            : "bg-transparent text-slate-600 border-[#333] hover:text-slate-400"
                                        }`}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>

                        <button
                            onClick={handleCopy}
                            className="flex items-center gap-1 text-[10px] px-2 py-1 rounded border border-[#333] 
                         text-slate-500 hover:text-slate-300 hover:border-[#444] transition-colors"
                        >
                            {copied ? (
                                <><Check className="w-3 h-3 text-green-400" /><span className="text-green-400">Copied</span></>
                            ) : (
                                <><Copy className="w-3 h-3" />Copy</>
                            )}
                        </button>
                    </div>

                    {/* Code block */}
                    <pre className="bg-[#111] border border-[#222] rounded-lg p-3 text-[11px] font-mono text-slate-200 overflow-x-auto leading-relaxed whitespace-pre">
                        {codeMap[lang] || "// Not available for this language"}
                    </pre>
                </>
            )}
        </div>
    );
}