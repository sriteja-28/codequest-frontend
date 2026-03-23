"use client";

import { useRef, useState, useEffect } from "react";
import {
  ChevronDown, Settings, RotateCcw, Check, Type, Indent,
  Keyboard, Info, Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Language } from "@/types";

const LANG_LABELS: Record<Language, string> = {
  python: "Python3",
  cpp: "C++",
  java: "Java",
  javascript: "JavaScript",
};

const LANG_VERSIONS: Record<Language, string> = {
  python: "3.11",
  cpp: "17 (GCC 11.2)",
  java: "17 (OpenJDK)",
  javascript: "Node 18.x",
};

interface Props {
  language: Language;
  onLanguageChange: (lang: Language) => void;
  fontSize: number;
  onFontSizeChange: (size: number) => void;
  tabSize: number;
  onTabSizeChange: (size: number) => void;
  keyBinding: "standard" | "vim";
  onKeyBindingChange: (binding: "standard" | "vim") => void;
  enableIntelliSense: boolean;
  onIntelliSenseChange: (enabled: boolean) => void;
  enableAutoComplete: boolean;
  onAutoCompleteChange: (enabled: boolean) => void;
  enableAIFeatures: boolean;
  onAIFeaturesChange: (enabled: boolean) => void;
  showCelebration: boolean;
  onCelebrationChange: (enabled: boolean) => void;
  onResetCode: () => void;
  onResetLayout: () => void;
}

export default function EditorToolbar({
  language,
  onLanguageChange,
  fontSize,
  onFontSizeChange,
  tabSize,
  onTabSizeChange,
  keyBinding,
  onKeyBindingChange,
  enableIntelliSense,
  onIntelliSenseChange,
  enableAutoComplete,
  onAutoCompleteChange,
  enableAIFeatures,
  onAIFeaturesChange,
  showCelebration,
  onCelebrationChange,
  onResetCode,
  onResetLayout,
}: Props) {
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const langRef = useRef<HTMLDivElement>(null);
  const settingsRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setShowLanguageMenu(false);
      }
      if (settingsRef.current && !settingsRef.current.contains(e.target as Node)) {
        setShowSettings(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="h-11 shrink-0 flex items-center justify-between px-3 bg-[#252525] border-b border-[#1e1e1e]">
      {/* Left side: Language selector + version info */}
      <div className="flex items-center gap-3">
        {/* Language dropdown */}
        <div className="relative" ref={langRef}>
          <button
            onClick={() => setShowLanguageMenu((v) => !v)}
            className="flex items-center gap-2 px-3 py-1.5 bg-[#1a1a1a] hover:bg-[#2e2e2e] 
                       border border-[#333] rounded text-xs font-semibold text-slate-200 transition-colors"
          >
            {LANG_LABELS[language]}
            <ChevronDown className="w-3 h-3" />
          </button>

          {showLanguageMenu && (
            <div className="absolute top-full left-0 mt-1 z-50 bg-[#1a1a1a] border border-[#2a2a2a] 
                            rounded-lg shadow-2xl shadow-black/60 py-1 min-w-[160px]">
              {(Object.keys(LANG_LABELS) as Language[]).map((lang) => (
                <button
                  key={lang}
                  onClick={() => {
                    onLanguageChange(lang);
                    setShowLanguageMenu(false);
                  }}
                  className={cn(
                    "w-full px-4 py-2 text-left text-xs font-semibold transition-colors flex items-center justify-between",
                    language === lang
                      ? "bg-[#2e2e2e] text-white"
                      : "text-slate-400 hover:bg-[#252525] hover:text-slate-200"
                  )}
                >
                  <span>{LANG_LABELS[lang]}</span>
                  {language === lang && <Check className="w-3 h-3" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Version info */}
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <Info className="w-3 h-3" />
          <span>{LANG_VERSIONS[language]}</span>
        </div>

        {/* Auto toggle */}
        <label className="flex items-center gap-2 cursor-pointer">
          <span className="text-xs text-slate-500">Auto</span>
          <button
            onClick={() => onAutoCompleteChange(!enableAutoComplete)}
            className={cn(
              "w-8 h-4 rounded-full transition-colors relative",
              enableAutoComplete ? "bg-blue-600" : "bg-[#333]"
            )}
          >
            <span
              className={cn(
                "absolute top-0.5 left-0.5 w-3 h-3 rounded-full bg-white transition-transform",
                enableAutoComplete && "translate-x-4"
              )}
            />
          </button>
        </label>
      </div>

      {/* Right side: Settings + Reset Code + Reset Layout */}
      <div className="flex items-center gap-2">
        {/* Settings dropdown */}
        <div className="relative" ref={settingsRef}>
          <button
            onClick={() => setShowSettings((v) => !v)}
            className="p-1.5 rounded text-slate-500 hover:text-slate-200 hover:bg-[#2e2e2e] transition-colors"
            title="Editor Settings"
          >
            <Settings className="w-4 h-4" />
          </button>

          {showSettings && (
            <div className="absolute top-full right-0 mt-1 z-50 bg-[#1a1a1a] border border-[#2a2a2a] 
                            rounded-lg shadow-2xl shadow-black/60 p-3 w-72">
              <p className="text-xs font-bold text-slate-400 mb-3">Editor Settings</p>

              <div className="space-y-3">
                {/* Font Size */}
                <div>
                  <label className="flex items-center gap-2 text-[11px] text-slate-500 mb-1.5">
                    <Type className="w-3 h-3" /> Font Size
                  </label>
                  <select
                    value={fontSize}
                    onChange={(e) => onFontSizeChange(Number(e.target.value))}
                    className="w-full bg-[#252525] border border-[#333] rounded px-2 py-1.5 
                               text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                  >
                    {[12, 13, 14, 16, 18, 20].map((s) => (
                      <option key={s} value={s}>
                        {s}px
                      </option>
                    ))}
                  </select>
                </div>

                {/* Tab Size */}
                <div>
                  <label className="flex items-center gap-2 text-[11px] text-slate-500 mb-1.5">
                    <Indent className="w-3 h-3" /> Tab Size
                  </label>
                  <select
                    value={tabSize}
                    onChange={(e) => onTabSizeChange(Number(e.target.value))}
                    className="w-full bg-[#252525] border border-[#333] rounded px-2 py-1.5 
                               text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                  >
                    {[2, 4, 8].map((s) => (
                      <option key={s} value={s}>
                        {s} spaces
                      </option>
                    ))}
                  </select>
                </div>

                {/* Key Bindings */}
                <div>
                  <label className="flex items-center gap-2 text-[11px] text-slate-500 mb-1.5">
                    <Keyboard className="w-3 h-3" /> Key Bindings
                  </label>
                  <select
                    value={keyBinding}
                    onChange={(e) => onKeyBindingChange(e.target.value as "standard" | "vim")}
                    className="w-full bg-[#252525] border border-[#333] rounded px-2 py-1.5 
                               text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                  >
                    <option value="standard">Standard</option>
                    <option value="vim">Vim</option>
                  </select>
                </div>

                {/* Toggles */}
                <div className="space-y-2 pt-2 border-t border-[#2a2a2a]">
                  {[
                    {
                      label: "IntelliSense",
                      state: enableIntelliSense,
                      setState: onIntelliSenseChange,
                    },
                    {
                      label: "AI Features",
                      state: enableAIFeatures,
                      setState: onAIFeaturesChange,
                    },
                    {
                      label: "Celebration Animation",
                      state: showCelebration,
                      setState: onCelebrationChange,
                    },
                  ].map(({ label, state, setState }) => (
                    <label key={label} className="flex items-center justify-between cursor-pointer">
                      <span className="text-xs text-slate-400">{label}</span>
                      <button
                        onClick={() => setState(!state)}
                        className={cn(
                          "w-9 h-5 rounded-full transition-colors relative",
                          state ? "bg-blue-600" : "bg-[#333]"
                        )}
                      >
                        <span
                          className={cn(
                            "absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform",
                            state && "translate-x-4"
                          )}
                        />
                      </button>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Reset Code Button */}
        <button
          onClick={onResetCode}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs 
                     text-slate-500 hover:text-slate-200 hover:bg-[#2e2e2e] transition-colors"
          title="Reset to starter code"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="hidden lg:inline">Reset Code</span>
        </button>

        {/* Reset Layout Button */}
        <button
          onClick={onResetLayout}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs 
                     text-slate-500 hover:text-slate-200 hover:bg-[#2e2e2e] transition-colors"
          title="Reset panel layout to defaults"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="hidden lg:inline">Reset Layout</span>
        </button>
      </div>
    </div>
  );
}