"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  authApi, problemsApi, submissionsApi, contestsApi,
  discussApi, layoutApi, aiApi, adminApi,
} from "@/lib/api";
import { useAuthStore } from "@/lib/auth";
import type { User } from "@/types";

// ─── AUTH ──────────────────────────────────────────────────────────────────

export function useMe() {
  const setUser = useAuthStore((s) => s.setUser);
  return useQuery({
    queryKey: ["me"],
    queryFn: async () => {
      // authApi.me() already returns User (api.ts does .then(r => r.data))
      const user = await authApi.me();
      setUser(user);
      return user;
    },
    retry: false,
    staleTime: 60_000,
  });
}

export function useLogin() {
  const qc = useQueryClient();
  const setUser = useAuthStore((s) => s.setUser);
  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      authApi.login(email, password),
    // result = { message: string; user: User } — already unwrapped by api.ts
    onSuccess: (result) => {
      setUser(result.user);
      qc.setQueryData(["me"], result.user);
    },
  });
}

export function useRegister() {
  const qc = useQueryClient();
  const setUser = useAuthStore((s) => s.setUser);
  return useMutation({
    mutationFn: (payload: {
      email: string; username: string;
      password: string; password_confirm: string; display_name?: string;
    }) => authApi.register(payload),
    // result = { message: string; user: User }
    onSuccess: (result) => {
      setUser(result.user);
      qc.setQueryData(["me"], result.user);
    },
  });
}

export function useLogout() {
  const qc = useQueryClient();
  const setUser = useAuthStore((s) => s.setUser);
  return useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      setUser(null);
      qc.clear();
    },
  });
}

export function useUpdateMe() {
  const qc = useQueryClient();
  const setUser = useAuthStore((s) => s.setUser);
  return useMutation({
    mutationFn: (data: Partial<Pick<User, "display_name" | "bio" | "avatar_url">>) =>
      authApi.updateMe(data),
    // result = User directly
    onSuccess: (updatedUser) => {
      setUser(updatedUser);
      qc.setQueryData(["me"], updatedUser);
    },
  });
}

// ─── PROBLEMS ──────────────────────────────────────────────────────────────

export function useProblems(params?: Parameters<typeof problemsApi.list>[0]) {
  return useQuery({
    queryKey: ["problems", params],
    // problemsApi.list() returns PaginatedResponse<Problem> directly
    queryFn: () => problemsApi.list(params),
    staleTime: 30_000,
    placeholderData: (prev) => prev,
  });
}

export function useProblem(slug: string) {
  return useQuery({
    queryKey: ["problem", slug],
    // problemsApi.get() returns Problem directly
    queryFn: () => problemsApi.get(slug),
    enabled: !!slug,
    staleTime: 60_000,
  });
}

export function useSolutions(slug: string) {
  return useQuery({
    queryKey: ["solutions", slug],
    // problemsApi.solutions() returns Solution[] directly
    queryFn: () => problemsApi.solutions(slug),
    enabled: !!slug,
  });
}

export function useSections() {
  return useQuery({
    queryKey: ["sections"],
    queryFn: () => problemsApi.sections(),
    staleTime: Infinity,
  });
}

export function useTags(type?: "TOPIC" | "COMPANY") {
  return useQuery({
    queryKey: ["tags", type],
    queryFn: () => problemsApi.tags(type),
    staleTime: Infinity,
  });
}

// ─── SUBMISSIONS ───────────────────────────────────────────────────────────

export function useSubmission(id: string, enabled = true) {
  return useQuery({
    queryKey: ["submission", id],
    queryFn: () => submissionsApi.get(id),
    enabled: enabled && !!id,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      if (status === "QUEUED" || status === "RUNNING") return 1_500;
      return false;
    },
  });
}

export function useSubmitCode() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: submissionsApi.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["submissions"] });
    },
  });
}

export function useSubmissionHistory(problemSlug?: string) {
  return useQuery({
    queryKey: ["submissions", "history", problemSlug],
    queryFn: () => submissionsApi.history(problemSlug),
  });
}

// ─── CONTESTS ──────────────────────────────────────────────────────────────

export function useContests() {
  return useQuery({
    queryKey: ["contests"],
    queryFn: () => contestsApi.list(),
    staleTime: 30_000,
  });
}

export function useContest(slug: string) {
  return useQuery({
    queryKey: ["contest", slug],
    queryFn: () => contestsApi.get(slug),
    enabled: !!slug,
  });
}


export function useLeaderboard(slug: string) {
  return useQuery({
    queryKey: ["leaderboard", slug],
    queryFn: () => contestsApi.leaderboard(slug),
    enabled: !!slug,
  });
}

export function useRegisterContest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (slug: string) => contestsApi.register(slug),
    onSuccess: (_, slug) => {
      qc.invalidateQueries({ queryKey: ["contest", slug] });
    },
  });
}

// ─── DISCUSSIONS ───────────────────────────────────────────────────────────

export function useThreads(problemSlug: string) {
  return useQuery({
    queryKey: ["threads", problemSlug],
    queryFn: () => discussApi.threads(problemSlug),
    enabled: !!problemSlug,
  });
}

export function useComments(threadId: number) {
  return useQuery({
    queryKey: ["comments", threadId],
    queryFn: () => discussApi.comments(threadId),
    enabled: !!threadId,
  });
}

export function usePostComment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ threadId, body_md, parent }: { threadId: number; body_md: string; parent?: number }) =>
      discussApi.createComment(threadId, body_md, parent),
    onSuccess: (_, { threadId }) => {
      qc.invalidateQueries({ queryKey: ["comments", threadId] });
    },
  });
}

export function useCreateThread() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ problemSlug, title }: { problemSlug: string; title: string }) =>
      discussApi.createThread(problemSlug, title),
    onSuccess: (_, { problemSlug }) => {
      qc.invalidateQueries({ queryKey: ["threads", problemSlug] });
    },
  });
}

// ─── ADS / LAYOUT ──────────────────────────────────────────────────────────

export function usePlacements(route: string) {
  return useQuery({
    queryKey: ["placements", route],
    queryFn: () => layoutApi.placements(route),
    staleTime: 300_000,
  });
}

// ─── AI ASSIST ─────────────────────────────────────────────────────────────

export function useHint() {
  return useMutation({
    mutationFn: ({ slug, level, code }: { slug: string; level: number; code?: string }) =>
      aiApi.hint(slug, level, code),
  });
}

export function useAiChat() {
  return useMutation({
    mutationFn: ({ slug, message, conversationId }: { slug: string; message: string; conversationId?: string }) =>
      aiApi.chat(slug, message, conversationId),
  });
}

export function useExplainSolution() {
  return useMutation({
    mutationFn: ({ slug, code, language }: { slug: string; code: string; language: string }) =>
      aiApi.explainSolution(slug, code, language),
  });
}

export function useAnalyzeComplexity() {
  return useMutation({
    mutationFn: ({ code, language }: { code: string; language: string }) =>
      aiApi.analyzeComplexity(code, language),
  });
}

// ─── ADMIN ─────────────────────────────────────────────────────────────────

export function useAdminStats() {
  return useQuery({
    queryKey: ["admin", "stats", "overview"],
    queryFn: () => adminApi.statsOverview(),
    staleTime: 30_000,
  });
}

export function useAdminUsers(params?: Record<string, string>) {
  return useQuery({
    queryKey: ["admin", "users", params],
    queryFn: () => adminApi.users(params),
  });
}

export function useAdminProblemStats() {
  return useQuery({
    queryKey: ["admin", "stats", "problems"],
    queryFn: () => adminApi.statsProblems(),
    staleTime: 60_000,
  });
}

export function useFlaggedComments() {
  return useQuery({
    queryKey: ["admin", "discussions", "flagged"],
    queryFn: () => adminApi.flaggedComments(),
  });
}

export function useUpdateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Record<string, unknown> }) =>
      adminApi.updateUser(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "users"] }),
  });
}

export function useChangePlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, plan, days = 30 }: { userId: number; plan: string; days?: number }) =>
      adminApi.changePlan(userId, plan, days),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "users"] }),
  });
}

export function useModerateComment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: { is_hidden?: boolean; is_flagged?: boolean } }) =>
      adminApi.moderateComment(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "discussions", "flagged"] }),
  });
}

