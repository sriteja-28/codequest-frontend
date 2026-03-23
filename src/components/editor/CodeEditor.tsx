"use client";

import Editor, { type OnMount } from "@monaco-editor/react";
import type { Language } from "@/types";

const LANG_MAP: Record<Language, string> = {
  python: "python",
  cpp: "cpp",
  java: "java",
  javascript: "javascript",
};

interface Props {
  value: string;
  language: Language;
  onChange: (val: string) => void;
  onCursorChange?: (line: number, col: number) => void;
  readOnly?: boolean;
  height?: string;
  fontSize?: number;
  tabSize?: number;
  enableIntelliSense?: boolean;
  enableAutoComplete?: boolean;
}

export default function CodeEditor({
  value,
  language,
  onChange,
  onCursorChange,
  readOnly = false,
  height = "100%",
  fontSize = 14,
  tabSize = 4,
  enableIntelliSense = true,
  enableAutoComplete = true,
}: Props) {
  const handleMount: OnMount = (editor, monaco) => {
    // Custom dark theme
    monaco.editor.defineTheme("cq-dark", {
      base: "vs-dark",
      inherit: true,
      rules: [
        { token: "comment", foreground: "4a5568", fontStyle: "italic" },
        { token: "keyword", foreground: "8199f8" },
        { token: "string", foreground: "86efac" },
        { token: "number", foreground: "fde68a" },
        { token: "type", foreground: "f0abfc" },
        { token: "function", foreground: "7dd3fc" },
      ],
      colors: {
        "editor.background": "#1e1e1e",
        "editor.foreground": "#e2e8f0",
        "editorLineNumber.foreground": "#4b5563",
        "editorLineNumber.activeForeground": "#9ca3af",
        "editorCursor.foreground": "#6366f1",
        "editor.selectionBackground": "#6366f130",
        "editor.lineHighlightBackground": "#252525",
        "editorGutter.background": "#1e1e1e",
        "scrollbarSlider.background": "#3f3f46",
        "scrollbarSlider.hoverBackground": "#52525b",
        "editorWidget.background": "#1a1a1a",
        "editorWidget.border": "#2a2a2a",
        "editorError.foreground": "#ef4444",
        "editorWarning.foreground": "#f59e0b",
      },
    });
    monaco.editor.setTheme("cq-dark");

    // Track cursor position changes
    editor.onDidChangeCursorPosition((e) => {
      if (onCursorChange) {
        onCursorChange(e.position.lineNumber, e.position.column);
      }
    });

    // Configure enhanced error detection when auto-complete is enabled
    if (enableAutoComplete) {
      // Enable error squiggles for syntax errors
      monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
        noSemanticValidation: false,
        noSyntaxValidation: false,
      });

      monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
        noSemanticValidation: false,
        noSyntaxValidation: false,
      });

      // For Python, C++, Java - Monaco has basic syntax highlighting
      // but we can add custom markers for common errors
      const checkSyntaxErrors = () => {
        const model = editor.getModel();
        if (!model) return;

        const code = model.getValue();
        const markers: any[] = [];

        // Simple syntax checks based on language
        if (language === "python") {
          // Check for common Python errors
          const lines = code.split("\n");
          lines.forEach((line, idx) => {
            // Check for tabs and spaces mixed
            if (line.match(/^\t/) && lines.some((l) => l.match(/^    /))) {
              markers.push({
                severity: monaco.MarkerSeverity.Error,
                startLineNumber: idx + 1,
                startColumn: 1,
                endLineNumber: idx + 1,
                endColumn: line.length + 1,
                message: "Inconsistent use of tabs and spaces",
              });
            }
            // Check for invalid syntax patterns
            if (line.match(/\bcouter\b/)) {
              const match = line.match(/\bcouter\b/);
              if (match && match.index !== undefined) {
                markers.push({
                  severity: monaco.MarkerSeverity.Error,
                  startLineNumber: idx + 1,
                  startColumn: match.index + 1,
                  endLineNumber: idx + 1,
                  endColumn: match.index + match[0].length + 1,
                  message: "Did you mean 'counter'?",
                });
              }
            }
          });
        } else if (language === "cpp") {
          // Check for Python-like syntax in C++
          if (code.match(/\bdef\s+\w+/)) {
            const match = code.match(/\bdef\s+\w+/);
            if (match && match.index !== undefined) {
              const lines = code.substring(0, match.index).split("\n");
              const line = lines.length;
              markers.push({
                severity: monaco.MarkerSeverity.Error,
                startLineNumber: line,
                startColumn: 1,
                endLineNumber: line,
                endColumn: 100,
                message: "Invalid syntax: 'def' is not valid in C++. Use function declarations.",
              });
            }
          }
        } else if (language === "java") {
          // Check for Python-like syntax in Java
          if (code.match(/\bdef\s+\w+/)) {
            const match = code.match(/\bdef\s+\w+/);
            if (match && match.index !== undefined) {
              const lines = code.substring(0, match.index).split("\n");
              const line = lines.length;
              markers.push({
                severity: monaco.MarkerSeverity.Error,
                startLineNumber: line,
                startColumn: 1,
                endLineNumber: line,
                endColumn: 100,
                message: "Invalid syntax: 'def' is not valid in Java. Use method declarations.",
              });
            }
          }
        }

        monaco.editor.setModelMarkers(model, "custom", markers);
      };

      // Check on mount and when content changes
      checkSyntaxErrors();
      editor.onDidChangeModelContent(() => {
        checkSyntaxErrors();
      });
    }
  };

  return (
    <Editor
      height={height}
      language={LANG_MAP[language]}
      value={value}
      onChange={(v) => onChange(v ?? "")}
      onMount={handleMount}
      options={{
        readOnly,
        fontSize,
        fontFamily: '"JetBrains Mono", "Fira Code", Menlo, monospace',
        fontLigatures: true,
        minimap: { enabled: false },
        scrollBeyondLastLine: false,
        lineNumbers: "on",
        automaticLayout: true,
        tabSize,
        wordWrap: "off",
        padding: { top: 12, bottom: 12 },
        quickSuggestions: enableIntelliSense && enableAutoComplete,
        suggestOnTriggerCharacters: enableIntelliSense && enableAutoComplete,
        parameterHints: { enabled: enableAutoComplete },
        autoClosingBrackets: enableAutoComplete ? "always" : "never",
        autoClosingQuotes: enableAutoComplete ? "always" : "never",
        formatOnPaste: enableAutoComplete,
        formatOnType: enableAutoComplete,
        renderLineHighlight: "line",
        cursorBlinking: "smooth",
        smoothScrolling: true,
        contextmenu: true,
        mouseWheelZoom: false,
      }}
      loading={
        <div className="flex items-center justify-center h-full bg-[#1e1e1e] text-slate-500 text-sm">
          <div className="flex flex-col items-center gap-2">
            <div className="w-6 h-6 border-2 border-slate-700 border-t-slate-400 rounded-full animate-spin" />
            <span>Loading editor…</span>
          </div>
        </div>
      }
    />
  );
}