// "use client";
// import { useRef } from "react";
// import Editor, { OnMount } from "@monaco-editor/react";
// import type { Language } from "@/types";

// const LANGUAGE_MAP: Record<Language, string> = {
//   python: "python",
//   cpp: "cpp",
//   java: "java",
//   javascript: "javascript",
// };

// const STARTER_CODE: Record<Language, string> = {
//   python: `# Write your solution here
// class Solution:
//     def solve(self):
//         pass
// `,
//   cpp: `#include <bits/stdc++.h>
// using namespace std;

// class Solution {
// public:
//     void solve() {
//         // Your solution here
//     }
// };
// `,
//   java: `class Solution {
//     public void solve() {
//         // Your solution here
//     }
// }
// `,
//   javascript: `/**
//  * @param {*} input
//  * @return {*}
//  */
// var solve = function(input) {
//     // Your solution here
// };
// `,
// };

// interface Props {
//   value: string;
//   language: Language;
//   onChange: (value: string) => void;
//   readOnly?: boolean;
//   height?: string;
// }

// export default function CodeEditor({ value, language, onChange, readOnly = false, height = "400px" }: Props) {
//   const editorRef = useRef<any>(null);

//   const handleMount: OnMount = (editor, monaco) => {
//     editorRef.current = editor;

//     // Dark theme matching our palette
//     monaco.editor.defineTheme("codequest-dark", {
//       base: "vs-dark",
//       inherit: true,
//       rules: [
//         { token: "comment", foreground: "4a5568", fontStyle: "italic" },
//         { token: "keyword", foreground: "8199f8" },
//         { token: "string", foreground: "a8d8a8" },
//         { token: "number", foreground: "f6c90e" },
//         { token: "type", foreground: "c7d7fe" },
//       ],
//       colors: {
//         "editor.background": "#18181f",
//         "editor.foreground": "#e2e8f0",
//         "editorLineNumber.foreground": "#374151",
//         "editorCursor.foreground": "#6175f2",
//         "editor.selectionBackground": "#6175f230",
//         "editor.lineHighlightBackground": "#1e1e2740",
//         "editorGutter.background": "#18181f",
//         "editorIndentGuide.background": "#27272f",
//         "scrollbarSlider.background": "#32323c",
//         "scrollbarSlider.hoverBackground": "#4a4a58",
//       },
//     });
//     monaco.editor.setTheme("codequest-dark");

//     // Keyboard shortcut: Ctrl+Enter to submit
//     editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
//       editor.trigger("keyboard", "editor.action.formatDocument", null);
//     });
//   };

//   return (
//     <div className="rounded-lg overflow-hidden border border-surface-300">
//       <Editor
//         height={height}
//         language={LANGUAGE_MAP[language]}
//         value={value || STARTER_CODE[language]}
//         onChange={(v) => onChange(v ?? "")}
//         onMount={handleMount}
//         options={{
//           readOnly,
//           fontSize: 13,
//           fontFamily: "var(--font-jetbrains), 'JetBrains Mono', Menlo, monospace",
//           fontLigatures: true,
//           minimap: { enabled: false },
//           scrollBeyondLastLine: false,
//           lineNumbers: "on",
//           renderLineHighlight: "line",
//           automaticLayout: true,
//           tabSize: 4,
//           wordWrap: "off",
//           padding: { top: 12, bottom: 12 },
//           suggestOnTriggerCharacters: true,
//           quickSuggestions: true,
//         }}
//         loading={
//           <div className="flex items-center justify-center h-full bg-surface-50 text-slate-500 text-sm">
//             Loading editor…
//           </div>
//         }
//       />
//     </div>
//   );
// }


"use client";
import Editor, { type OnMount } from "@monaco-editor/react";
import type { Language } from "@/types";

const LANG_MAP: Record<Language, string> = {
  python: "python", cpp: "cpp", java: "java", javascript: "javascript",
};

const STARTER: Record<Language, string> = {
  python: `class Solution:\n    def solve(self, nums):\n        # Write your solution here\n        pass\n`,
  cpp: `#include <bits/stdc++.h>\nusing namespace std;\n\nclass Solution {\npublic:\n    void solve() {\n        // Write your solution here\n    }\n};\n`,
  java: `class Solution {\n    public void solve() {\n        // Write your solution here\n    }\n}\n`,
  javascript: `/**\n * @param {*} input\n * @return {*}\n */\nvar solve = function(input) {\n    // Write your solution here\n};\n`,
};

interface Props {
  value: string;
  language: Language;
  onChange: (val: string) => void;
  readOnly?: boolean;
  height?: string;
}

export default function CodeEditor({ value, language, onChange, readOnly = false, height = "400px" }: Props) {
  const handleMount: OnMount = (editor, monaco) => {
    monaco.editor.defineTheme("cq-dark", {
      base: "vs-dark", inherit: true,
      rules: [
        { token: "comment",  foreground: "4a5568", fontStyle: "italic" },
        { token: "keyword",  foreground: "8199f8" },
        { token: "string",   foreground: "86efac" },
        { token: "number",   foreground: "fde68a" },
      ],
      colors: {
        "editor.background":            "#18181f",
        "editor.foreground":            "#e2e8f0",
        "editorLineNumber.foreground":  "#374151",
        "editorCursor.foreground":      "#6175f2",
        "editor.selectionBackground":   "#6175f230",
        "editor.lineHighlightBackground":"#1e1e2750",
        "editorGutter.background":      "#18181f",
        "scrollbarSlider.background":   "#32323c",
      },
    });
    monaco.editor.setTheme("cq-dark");
  };

  return (
    <div className="rounded-lg overflow-hidden border border-surface-300 h-full">
      <Editor
        height={height}
        language={LANG_MAP[language]}
        value={value || STARTER[language]}
        onChange={(v) => onChange(v ?? "")}
        onMount={handleMount}
        options={{
          readOnly,
          fontSize: 13,
          fontFamily: "var(--font-jetbrains), 'JetBrains Mono', Menlo, monospace",
          fontLigatures: true,
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          lineNumbers: "on",
          automaticLayout: true,
          tabSize: 4,
          wordWrap: "off",
          padding: { top: 12, bottom: 12 },
          quickSuggestions: true,
          renderLineHighlight: "line",
        }}
        loading={
          <div className="flex items-center justify-center h-full bg-surface-50 text-slate-500 text-sm">
            Loading editor…
          </div>
        }
      />
    </div>
  );
}