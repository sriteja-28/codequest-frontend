// ─── Auth / Users ──────────────────────────────────────────────────────────

export type Plan = "FREE" | "PRO";
export type Role = "USER" | "MODERATOR" | "ADMIN";

export interface User {
  id: number;
  email: string;
  username: string;
  display_name: string;
  avatar_url: string;
  bio: string;
  role: Role;
  plan: Plan;
  is_pro: boolean;
  plan_expires_at: string | null;
  problems_solved: number;
  current_streak: number;
  last_active_date: string | null;
  ai_hint_limit: number;
  ai_chat_limit: number;
  created_at: string;
  updated_at: string;
}

// ─── Problems ──────────────────────────────────────────────────────────────

export type Difficulty = "EASY" | "MEDIUM" | "HARD";

export interface Section {
  id: number;
  name: string;
  display_name: string;
  order_index: number;
  icon: string;
}

export interface Tag {
  id: number;
  name: string;
  slug: string;
  tag_type: "TOPIC" | "COMPANY";
}

export interface TestCase {
  id: number;
  input_data: string;
  expected_output: string;
  explanation: string;
  order_index: number;
  is_sample: boolean;
  is_hidden: boolean;
}

export interface Solution {
  id: number;
  title: string;
  approach_summary_md: string;
  code_python: string;
  code_cpp: string;
  code_java: string;
  code_javascript: string;
  time_complexity: string;
  space_complexity: string;
  complexity_explanation_md: string;
  is_official: boolean;
  visibility: "FREE" | "PRO";
  is_locked: boolean;
}

export interface Problem {
  id: number;
  slug: string;
  title: string;
  number: number | null;
  difficulty: Difficulty;
  visibility: "FREE" | "PRO";
  section: Section | null;
  tags: Tag[];
  acceptance_rate: number;
  total_submissions: number;
  accepted_submissions: number;
  is_solved: boolean;
  // Detail-only fields
  statement_md?: string;
  sample_test_cases?: TestCase[];
  hints?: Array<{ index: number; available: boolean; content?: string }>;
  time_complexity_best?: string;
  time_complexity_average?: string;
  time_complexity_worst?: string;
  space_complexity?: string;
  complexity_notes_md?: string;
  solutions?: Solution[];
}

// ─── Submissions ───────────────────────────────────────────────────────────

export type Language = "python" | "cpp" | "java" | "javascript";
export type SubmissionStatus =
  | "QUEUED" | "RUNNING" | "ACCEPTED" | "WRONG_ANSWER"
  | "RUNTIME_ERROR" | "TIME_LIMIT" | "MEMORY_LIMIT"
  | "COMPILE_ERROR" | "INTERNAL_ERROR";

export interface SubmissionResult {
  id: number;
  test_case: number;
  status: SubmissionStatus;
  actual_output: string;
  expected_output: string;
  error_output: string;
  time_ms: number | null;
  memory_kb: number | null;
  is_hidden: boolean;
}

export interface Submission {
  id: string;
  problem_slug: string;
  problem_title: string;
  username: string;
  language: Language;
  code: string;
  status: SubmissionStatus;
  runtime_ms: number | null;
  memory_kb: number | null;
  error_message: string;
  results: SubmissionResult[];
  duration_ms: number | null;
  created_at: string;
  judge_started_at: string | null;
  judge_finished_at: string | null;
}

// ─── Contests ──────────────────────────────────────────────────────────────

export type ContestStatus = "upcoming" | "live" | "ended";

export interface ContestProblem {
  id: number;
  problem: Problem;
  order_index: number;
  score: number;
}

export interface Contest {
  id: number;
  name: string;
  slug: string;
  description_md?: string;
  start_at: string;
  end_at: string;
  is_public: boolean;
  is_rated: boolean;
  max_participants: number | null;
  duration_minutes: number;
  status: ContestStatus;
  contest_problems?: ContestProblem[];
  participant_count: number;
  is_registered?: boolean;
}

export interface LeaderboardEntry {
  rank: number | null;
  username: string;
  display_name: string;
  avatar_url: string;
  final_score: number;
  is_disqualified: boolean;
}

// ─── Discussions ───────────────────────────────────────────────────────────


export interface DiscussionAuthor {
  id: number;
  username: string;
  display_name: string;
  avatar_url: string;
  plan: Plan;
}

export interface Comment {
  id: number;
  thread: number;
  parent: number | null;
  body_md: string;
  created_by: DiscussionAuthor;
  created_at: string;
  updated_at: string;
  upvotes: number;
  has_upvoted: boolean;  // Has current user upvoted this comment
  is_accepted_answer: boolean;
  is_flagged: boolean;
  is_hidden: boolean;
  replies: Comment[];
  can_moderate: boolean;
}

export interface Thread {
  id: number;
  problem_slug: string;
  title: string;
  content: string;
  created_by: DiscussionAuthor;
  created_at: string;
  updated_at: string;
  is_pinned: boolean;
  is_locked: boolean;
  views: number;
  comment_count: number;
  upvote_count: number;
  has_upvoted: boolean;  // Has current user upvoted this thread
  comments?: Comment[];  // Only present in detail view
}

// ─── Ads ───────────────────────────────────────────────────────────────────

export interface AdCreative {
  id: number;
  name: string;
  html_snippet: string;
  image_url: string;
  link_url: string;
  plan_target: string;
  priority: number;
}

export interface AdPlacement {
  key: string;
  position: string;
  creatives: AdCreative[];
}

// ─── AI ────────────────────────────────────────────────────────────────────

export interface HintResponse {
  hint: string;
  level: number;
  has_more: boolean;
  used_today: number;
  daily_limit: number;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

// ─── Pagination ────────────────────────────────────────────────────────────

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// ─── Admin ─────────────────────────────────────────────────────────────────

export interface AdminStats {
  users: {
    total: number;
    pro: number;
    free: number;
    new_this_week: number;
    pro_pct: number;
  };
  submissions: {
    total: number;
    today: number;
    accepted_today: number;
    acceptance_rate_today: number;
    per_day: Array<{ day: string; count: number; accepted: number }>;
  };
  platform: {
    total_problems: number;
    active_contests: number;
    flagged_comments: number;
  };
}