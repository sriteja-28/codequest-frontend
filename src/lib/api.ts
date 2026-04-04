/**
 * lib/api.ts
 *
 * Single source of truth for all HTTP calls to the Django backend.
 *
 * Design choices:
 *  - HTTP-only cookie auth (no tokens in JS / localStorage)
 *  - Auto-refresh: on 401 we silently hit /auth/refresh/, then retry once
 *  - Every function returns the unwrapped .data, so callers never write .data.data
 *  - All types imported from @/types — no inline type definitions here
 */

import axios, { AxiosError, type AxiosRequestConfig } from "axios";
import type {
  User, Problem, Solution, Section, Tag,
  Submission, Contest, LeaderboardEntry,
  Thread, Comment, AdPlacement, HintResponse,
  PaginatedResponse, AdminStats,
} from "@/types";

// ─── Axios instance ────────────────────────────────────────────────────────

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export const axiosClient = axios.create({
  baseURL: `${BASE_URL}/api`,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

// ─── Silent token refresh interceptor ─────────────────────────────────────

let isRefreshing = false;
let refreshQueue: Array<() => void> = [];

axiosClient.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const original = error.config as AxiosRequestConfig & { _retry?: boolean };
    if (error.response?.status !== 401 || original._retry) {
      return Promise.reject(error);
    }
    if (isRefreshing) {
      return new Promise((resolve) => {
        refreshQueue.push(() => resolve(axiosClient(original)));
      });
    }
    original._retry = true;
    isRefreshing = true;
    try {
      await axios.post(`${BASE_URL}/api/auth/refresh/`, {}, { withCredentials: true });
      refreshQueue.forEach((cb) => cb());
      refreshQueue = [];
      return axiosClient(original);
    } catch {
      refreshQueue = [];
      if (typeof window !== "undefined") window.location.href = "/auth/login";
      return Promise.reject(error);
    } finally {
      isRefreshing = false;
    }
  }
);

// ─── Error helper ──────────────────────────────────────────────────────────

export function getErrorMessage(err: unknown): string {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as Record<string, unknown> | undefined;
    if (!data) return err.message;
    if (typeof data.detail === "string") return data.detail;
    if (Array.isArray(data.non_field_errors)) return data.non_field_errors.join(", ");
    const firstKey = Object.keys(data)[0];
    if (firstKey) {
      const val = data[firstKey];
      return `${firstKey}: ${Array.isArray(val) ? val[0] : val}`;
    }
    return err.message;
  }
  return String(err);
}

// ─── Auth ──────────────────────────────────────────────────────────────────

export const authApi = {
  register: (payload: {
    email: string; username: string;
    password: string; password_confirm: string; display_name?: string;
  }) =>
    axiosClient.post<{ message: string; user: User }>("/auth/register/", payload).then((r) => r.data),

  login: (email: string, password: string) =>
    axiosClient.post<{ message: string; user: User }>("/auth/login/", { email, password }).then((r) => r.data),

  logout: () =>
    axiosClient.post<{ message: string }>("/auth/logout/").then((r) => r.data),

  me: () =>
    axiosClient.get<User>("/auth/me/").then((r) => r.data),

  updateMe: (data: Partial<Pick<User, "display_name" | "bio" | "avatar_url">>) =>
    axiosClient.patch<User>("/auth/me/", data).then((r) => r.data),
};

// ─── Problems ──────────────────────────────────────────────────────────────

export type ProblemListParams = {
  page?: number; difficulty?: string; section?: string;
  topic?: string; company?: string; search?: string; solved?: boolean;
};

export const problemsApi = {
  list: (params?: ProblemListParams) =>
    axiosClient.get<PaginatedResponse<Problem>>("/problems/", { params }).then((r) => r.data),

  get: (slug: string) =>
    axiosClient.get<Problem>(`/problems/${slug}/`).then((r) => r.data),

  solutions: (slug: string) =>
    axiosClient.get<Solution[]>(`/problems/${slug}/solutions/`).then((r) => r.data),

  // DRF PageNumberPagination is applied globally — all list endpoints return
  // { count, next, previous, results: [...] } not a plain array.
  // Unwrap .results here so callers always receive Section[] / Tag[] directly.
  sections: () =>
    axiosClient
      .get<PaginatedResponse<Section>>("/problems/sections/")
      .then((r) => r.data.results),

  tags: (tag_type?: "TOPIC" | "COMPANY") =>
    axiosClient
      .get<PaginatedResponse<Tag>>("/problems/tags/", {
        // page_size=200 ensures all tags arrive in one request
        params: { ...(tag_type ? { tag_type } : {}), page_size: 200 },
      })
      .then((r) => r.data.results),
};

// ─── Submissions ───────────────────────────────────────────────────────────

export type SubmitPayload = {
  problem_slug: string; language: string; code: string; contest?: number;
};

export const submissionsApi = {
  create: (payload: SubmitPayload) =>
    axiosClient.post<{ submission_id: string; status: string }>("/submissions/", payload).then((r) => r.data),

  get: (id: string) =>
    axiosClient.get<Submission>(`/submissions/${id}/`).then((r) => r.data),

  history: (problemSlug?: string) =>
    axiosClient
      .get<PaginatedResponse<Submission>>("/submissions/history/", { params: problemSlug ? { problem_slug: problemSlug } : {} })
      .then((r) => r.data.results),

  // new endpoint for "Run Code" / sample test run
  run: (payload: SubmitPayload) =>
    axiosClient
      .post<{ submission_id: string; status: string }>("/submissions/run-code/", payload)
      .then((r) => r.data),
};

// ─── Contests ──────────────────────────────────────────────────────────────

export const contestsApi = {
  list: () =>
    axiosClient.get<PaginatedResponse<Contest>>("/contests/").then((r) => r.data.results),

  get: (slug: string) =>
    axiosClient.get<Contest>(`/contests/${slug}/`).then((r) => r.data),

  register: (slug: string) =>
    axiosClient.post<{ detail: string }>(`/contests/${slug}/register/`).then((r) => r.data),

  leaderboard: (slug: string) =>
    axiosClient.get<PaginatedResponse<LeaderboardEntry>>(`/contests/${slug}/leaderboard/`)
      .then((r) => r.data.results),
};


// ─── Discussions API ───────────────────────────────────────────────────────

export const discussApi = {
  // List all threads globally (public)
  listAll: (page?: number) =>
    axiosClient
      .get<PaginatedResponse<Thread>>("/discuss/threads/", { 
        params: { page } 
      })
      .then((r) => r.data.results),

  // Get single thread with comments (public)
  getThread: (threadId: number) =>
    axiosClient
      .get<Thread>(`/discuss/threads/${threadId}/`)
      .then((r) => r.data),

  // Get threads for specific problem (public)
  threads: (problemSlug: string) =>
    axiosClient
      .get<PaginatedResponse<Thread>>(`/discuss/problems/${problemSlug}/threads/`)
      .then((r) => r.data.results),

  // Create new thread (requires auth)
  createThread: (problemSlug: string, title: string, content: string, isAnonymous = false) =>
    axiosClient
      .post<Thread>(`/discuss/problems/${problemSlug}/threads/create/`, { 
        title, 
        content,
        is_anonymous: isAnonymous
      })
      .then((r) => r.data),

  // Get comments for thread (public)
  comments: (threadId: number) =>
    axiosClient
      .get<PaginatedResponse<Comment>>(`/discuss/threads/${threadId}/comments/`)
      .then((r) => r.data.results),

  // Create comment (requires auth)
  createComment: (threadId: number, body_md: string, parent?: number, isAnonymous = false) =>
    axiosClient
      .post<Comment>(`/discuss/threads/${threadId}/comments/create/`, {
        body_md,
        ...(parent != null ? { parent } : {}),
        is_anonymous: isAnonymous
      })
      .then((r) => r.data),

  // Upvote thread (requires auth, toggles upvote)
  upvoteThread: (threadId: number) =>
    axiosClient
      .post<{ action: 'added' | 'removed'; upvote_count: number; has_upvoted: boolean }>(
        `/discuss/threads/${threadId}/upvote/`
      )
      .then((r) => r.data),

  // Upvote comment (requires auth, toggles upvote)
  upvoteComment: (commentId: number) =>
    axiosClient
      .post<{ action: 'added' | 'removed'; upvotes: number; has_upvoted: boolean }>(
        `/discuss/comments/${commentId}/upvote/`
      )
      .then((r) => r.data),

  // Mark comment as accepted answer (thread author or admin only)
  acceptAnswer: (commentId: number) =>
    axiosClient
      .post<{ is_accepted_answer: boolean }>(
        `/discuss/comments/${commentId}/accept/`
      )
      .then((r) => r.data),
};

// ─── Layout / Ads ──────────────────────────────────────────────────────────

export const layoutApi = {
  placements: (route: string) =>
    axiosClient.get<{ placements: AdPlacement[] }>("/layout/placements/", { params: { route } }).then((r) => r.data),
};

// ─── AI Assist ─────────────────────────────────────────────────────────────

export const aiApi = {
  hint: (problem_slug: string, hint_level: number, user_code?: string) =>
    axiosClient.post<HintResponse>("/ai/hint/", { problem_slug, hint_level, user_code }).then((r) => r.data),

  explainSolution: (problem_slug: string, code: string, language: string) =>
    axiosClient
      .post<{
        explanation: string; time_complexity: string; space_complexity: string;
        time_justification: string; space_justification: string; improvement: string;
      }>("/ai/explain-solution/", { problem_slug, code, language })
      .then((r) => r.data),

  chat: (problem_slug: string, message: string, conversation_id?: string) =>
    axiosClient
      .post<{ response: string; conversation_id: string; used_today: number; daily_limit: number }>(
        "/ai/chat/", { problem_slug, message, conversation_id }
      )
      .then((r) => r.data),

  analyzeComplexity: (code: string, language: string) =>
    axiosClient
      .post<{
        time_complexity: string; space_complexity: string;
        time_explanation: string; space_explanation: string;
        confidence: "high" | "medium" | "low";
      }>("/ai/analyze-complexity/", { code, language })
      .then((r) => r.data),
};

// ─── Admin ─────────────────────────────────────────────────────────────────

export const adminApi = {
  statsOverview: () =>
    axiosClient.get<AdminStats>("/admin/stats/overview/").then((r) => r.data),

  statsProblems: () =>
    axiosClient
      .get<{ problems: Array<{ slug: string; title: string; difficulty: string; total_submissions: number; accepted_submissions: number; acceptance_rate: number }> }>
      ("/admin/stats/problems/")
      .then((r) => r.data),

  statsContest: (slug: string) =>
    axiosClient.get(`/admin/stats/contests/${slug}/`).then((r) => r.data),

  users: (params?: Record<string, string>) =>
    axiosClient.get<PaginatedResponse<User>>("/admin/users/", { params }).then((r) => r.data),

  updateUser: (id: number, data: Record<string, unknown>) =>
    axiosClient.patch<User>(`/admin/users/${id}/`, data).then((r) => r.data),

  flaggedComments: () =>
    axiosClient
      .get<{ flagged_comments: Array<{ id: number; body_preview: string; created_by: string; thread_id: number; problem_slug: string; created_at: string }>; count: number }>
      ("/admin/discussions/flags/")
      .then((r) => r.data),

  moderateComment: (id: number, data: { is_hidden?: boolean; is_flagged?: boolean }) =>
    axiosClient.patch<{ ok: boolean }>(`/discuss/admin/comments/${id}/moderate/`, data).then((r) => r.data),

  changePlan: (userId: number, plan: string, days = 30) =>
    axiosClient
      .patch<{ user_id: number; new_plan: string; plan_expires_at: string }>(
        `/billing/admin/users/${userId}/plan/`, { plan, days }
      )
      .then((r) => r.data),
};

export const api = {
  auth: authApi,
  contests: contestsApi,
  problems: problemsApi,
  submissions: submissionsApi,
  discuss: discussApi,
};
