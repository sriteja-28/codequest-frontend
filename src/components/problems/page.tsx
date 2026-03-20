"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Play, Send, Lightbulb, MessageSquare, ChevronDown, ChevronUp, CheckCircle2, XCircle, Clock, Cpu } from "lucide-react";
import Navbar from "@/components/ui/Navbar";
import CodeEditor from "@/components/editor/CodeEditor";
import AdSlot from "@/components/ads/AdSlot";
import AiPanel from "@/components/ai/AiPanel";
import { useProblem, useSubmitCode, useSubmission, usePlacements } from "@/lib/hooks";
import { submissionWS } from "@/lib/ws";
import { difficultyColor, statusColor, formatRuntime, formatMemory, cn } from "@/lib/utils";
import type { Language, SubmissionStatus } from "@/types";

const LANGUAGES: { value: Language; label: string }[] = [
  { value: "python", label: "Python 3" },
  { value: "cpp", label: "C++ 17" },
  { value: "java", label: "Java 17" },
  { value: "javascript", label: "JavaScript" },
];

export default function ProblemDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: problem, isLoading } = useProblem(slug);
  const { data: adsData } = usePlacements(`/problems/${slug}`);
  const submitCode = useSubmitCode();

  const [language, setLanguage] = useState<Language>("python");
  const [code, setCode] = useState("");
  const [submissionId, setSubmissionId] = useState<string | null>(null);
  const [liveStatus, setLiveStatus] = useState<SubmissionStatus | null>(null);
  const [activeTab, setActiveTab] = useState<"description" | "solutions" | "discuss">("description");
  const [showAi, setShowAi] = useState(false);
  const [showComplexity, setShowComplexity] = useState(false);

  // Poll / WebSocket for submission status
  const { data: submissionData } = useSubmission(submissionId ?? "", !!submissionId);

  useEffect(() => {
    if (!submissionId) return;
    const ws = submissionWS(submissionId);
    ws.connect();
    const off = ws.on((msg) => {
      if (msg.type === "status_update") {
        setLiveStatus(msg.status as SubmissionStatus);
      }
    });
    return () => { off(); ws.close(); };
  }, [submissionId]);

  const handleSubmit = async () => {
    if (!problem) return;
    setSubmissionId(null);
    setLiveStatus(null);
    try {
      const { data } = await submitCode.mutateAsync({
        problem_slug: slug,
        language,
        code,
      });
      setSubmissionId(data.submission_id);
      setLiveStatus("QUEUED");
    } catch (err) {
      console.error(err);
    }
  };

  const currentStatus = liveStatus ?? submissionData?.status ?? null;

  if (isLoading) {
    return (
      <>
        <Navbar />
        <div className="flex items-center justify-center h-96 text-slate-500">Loading…</div>
      </>
    );
  }

  if (!problem) return null;

  const topicTags = problem.tags?.filter((t) => t.tag_type === "TOPIC") ?? [];
  const companyTags = problem.tags?.filter((t) => t.tag_type === "COMPANY") ?? [];

  return (
    <>
      <Navbar />
      <div className="flex h-[calc(100vh-56px)] overflow-hidden">
        {/* Left pane — problem + tabs */}
        <div className="w-full lg:w-[45%] xl:w-[40%] flex flex-col border-r border-surface-300 overflow-hidden">
          {/* Tabs */}
          <div className="flex items-center gap-4 px-4 border-b border-surface-300 bg-surface-50 shrink-0">
            {(["description", "solutions", "discuss"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "py-3 text-sm font-medium border-b-2 transition-colors capitalize",
                  activeTab === tab
                    ? "border-brand-500 text-brand-400"
                    : "border-transparent text-slate-500 hover:text-slate-300"
                )}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="flex-1 overflow-y-auto p-4">
            {activeTab === "description" && (
              <div>
                {/* Title + metadata */}
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    {problem.number && <span className="text-slate-600 text-sm">#{problem.number}</span>}
                    <span className={`text-sm font-semibold ${difficultyColor(problem.difficulty)}`}>
                      {problem.difficulty[0] + problem.difficulty.slice(1).toLowerCase()}
                    </span>
                    {problem.visibility === "PRO" && <span className="badge-pro">Pro</span>}
                  </div>
                  <h1 className="font-display text-xl font-bold text-slate-100">{problem.title}</h1>
                  <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                    <span>✓ {problem.accepted_submissions} accepted</span>
                    <span>↑ {problem.total_submissions} total</span>
                    <span>{problem.acceptance_rate}% acceptance</span>
                  </div>
                </div>

                {/* Tags */}
                {topicTags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {topicTags.map((t) => (
                      <span key={t.id} className="text-xs px-2 py-1 rounded-md bg-surface-200 text-slate-400">
                        {t.name}
                      </span>
                    ))}
                    {companyTags.map((t) => (
                      <span key={t.id} className="text-xs px-2 py-1 rounded-md bg-brand-950 text-brand-300 border border-brand-800/30">
                        🏢 {t.name}
                      </span>
                    ))}
                  </div>
                )}

                {/* Statement */}
                <div className="prose-dark">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {problem.statement_md ?? ""}
                  </ReactMarkdown>
                </div>

                {/* Complexity section */}
                {(problem.time_complexity_average || problem.space_complexity) && (
                  <div className="mt-6">
                    <button
                      onClick={() => setShowComplexity((v) => !v)}
                      className="flex items-center gap-2 text-sm text-slate-400 hover:text-slate-200 transition-colors"
                    >
                      {showComplexity ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      Complexity Analysis
                    </button>
                    {showComplexity && (
                      <div className="mt-3 card p-4 text-sm space-y-2 animate-fade-in">
                        {problem.time_complexity_average && (
                          <div className="flex gap-3">
                            <Clock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                            <div>
                              <span className="text-slate-400">Time: </span>
                              <span className="font-mono text-amber-300">{problem.time_complexity_average}</span>
                              {problem.time_complexity_best && problem.time_complexity_best !== problem.time_complexity_average && (
                                <span className="text-slate-500 ml-2">best: <span className="font-mono">{problem.time_complexity_best}</span></span>
                              )}
                            </div>
                          </div>
                        )}
                        {problem.space_complexity && (
                          <div className="flex gap-3">
                            <Cpu className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                            <div>
                              <span className="text-slate-400">Space: </span>
                              <span className="font-mono text-purple-300">{problem.space_complexity}</span>
                            </div>
                          </div>
                        )}
                        {problem.complexity_notes_md && (
                          <p className="text-slate-500 text-xs pt-1">{problem.complexity_notes_md}</p>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {activeTab === "solutions" && (
              <SolutionsTab slug={slug} />
            )}

            {activeTab === "discuss" && (
              <div className="text-slate-500 text-sm py-4">
                <a href={`/discuss/${slug}`} className="text-brand-400 hover:underline">Open discussion →</a>
              </div>
            )}
          </div>

          {/* Ad slot for left pane */}
          {(adsData?.placements?.length ?? 0) > 0 && (
            <div className="p-3 border-t border-surface-300 shrink-0">
              <AdSlot placements={adsData?.placements ?? []} position="sidebar_left" />
            </div>
          )}
        </div>

        {/* Right pane — editor + results */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Editor toolbar */}
          <div className="flex items-center gap-3 px-4 py-2 border-b border-surface-300 bg-surface-50 shrink-0">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as Language)}
              className="input w-auto text-xs"
            >
              {LANGUAGES.map((l) => (
                <option key={l.value} value={l.value}>{l.label}</option>
              ))}
            </select>
            <div className="ml-auto flex items-center gap-2">
              <button
                onClick={() => setShowAi((v) => !v)}
                className={cn("btn-ghost text-xs gap-1.5", showAi && "bg-surface-200 text-brand-400")}
              >
                <Lightbulb className="w-3.5 h-3.5" /> AI Help
              </button>
              <button onClick={handleSubmit} disabled={submitCode.isPending} className="btn-primary text-xs gap-1.5">
                <Send className="w-3.5 h-3.5" />
                {submitCode.isPending ? "Submitting…" : "Submit"}
              </button>
            </div>
          </div>

          {/* Editor + AI side-by-side */}
          <div className="flex-1 flex overflow-hidden">
            <div className={cn("flex flex-col transition-all", showAi ? "w-[60%]" : "w-full")}>
              <div className="flex-1 p-3">
                <CodeEditor
                  value={code}
                  language={language}
                  onChange={setCode}
                  height="100%"
                />
              </div>
            </div>

            {showAi && (
              <div className="w-[40%] border-l border-surface-300 overflow-hidden">
                <AiPanel problemSlug={slug} code={code} language={language} />
              </div>
            )}
          </div>

          {/* Results panel */}
          {currentStatus && (
            <div className="border-t border-surface-300 p-4 bg-surface-50 max-h-52 overflow-y-auto shrink-0 animate-slide-up">
              <div className="flex items-center gap-3 mb-3">
                {currentStatus === "ACCEPTED" && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
                {["WRONG_ANSWER", "RUNTIME_ERROR", "TIME_LIMIT", "COMPILE_ERROR"].includes(currentStatus) && (
                  <XCircle className="w-5 h-5 text-red-400" />
                )}
                <span className={`font-semibold text-sm ${statusColor(currentStatus)}`}>
                  {currentStatus.replace(/_/g, " ")}
                </span>
                {submissionData?.runtime_ms && (
                  <span className="text-slate-500 text-xs ml-auto">
                    {formatRuntime(submissionData.runtime_ms)} · {formatMemory(submissionData.memory_kb)}
                  </span>
                )}
              </div>

              {/* Test case results */}
              {submissionData?.results && submissionData.results.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {submissionData.results.map((r, i) => (
                    <div
                      key={r.id}
                      className={cn(
                        "w-8 h-8 rounded-md flex items-center justify-center text-xs font-bold",
                        r.status === "ACCEPTED" ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"
                      )}
                      title={r.is_hidden ? "Hidden test case" : `Test ${i + 1}: ${r.status}`}
                    >
                      {r.is_hidden ? "?" : i + 1}
                    </div>
                  ))}
                </div>
              )}

              {submissionData?.error_message && (
                <pre className="mt-2 text-xs text-red-300 bg-red-950/20 p-2 rounded font-mono overflow-x-auto">
                  {submissionData.error_message}
                </pre>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// Solutions sub-tab
function SolutionsTab({ slug }: { slug: string }) {
  const { data: solutions, isLoading } = useSolutions(slug);
  const [open, setOpen] = useState<number | null>(null);

  if (isLoading) return <div className="text-slate-500 text-sm">Loading…</div>;
  if (!solutions?.length) return <div className="text-slate-500 text-sm">No solutions yet.</div>;

  return (
    <div className="space-y-3">
      {solutions.map((s) => (
        <div key={s.id} className="card overflow-hidden">
          <button
            onClick={() => setOpen(open === s.id ? null : s.id)}
            className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-surface-100 transition-colors"
          >
            <div>
              <span className="text-sm font-medium text-slate-200">{s.title}</span>
              <div className="flex gap-3 mt-0.5 text-xs text-slate-500">
                <span>Time: <span className="font-mono text-amber-300">{s.time_complexity}</span></span>
                <span>Space: <span className="font-mono text-purple-300">{s.space_complexity}</span></span>
                {s.is_locked && <span className="badge-pro">🔒 Pro</span>}
              </div>
            </div>
            {open === s.id ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
          </button>
          {open === s.id && !s.is_locked && (
            <div className="border-t border-surface-300 p-4 prose-dark">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{s.approach_summary_md}</ReactMarkdown>
            </div>
          )}
          {open === s.id && s.is_locked && (
            <div className="border-t border-surface-300 p-4 text-center text-slate-500 text-sm">
              🔒 Upgrade to Pro to view this solution.
              <a href="/upgrade" className="block mt-2 text-brand-400 hover:underline">Upgrade →</a>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function useSolutions(slug: string) {
  const { useQuery } = require("@tanstack/react-query");
  const { problemsApi } = require("@/lib/api");
  return useQuery({
    queryKey: ["solutions", slug],
    queryFn: () => problemsApi.solutions(slug).then((r: any) => r.data),
  });
}