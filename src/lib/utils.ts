/**
 * lib/utils.ts
 *
 * Pure utility functions — no React, no network calls.
 * Safe to import in both client and server components.
 */

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// ─── Class name helper ─────────────────────────────────────────────────────

/** Merge Tailwind classes safely (handles conflicts, conditionals, arrays). */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ─── Difficulty colours ────────────────────────────────────────────────────

/** Returns a Tailwind text-colour class for a problem difficulty string. */
export function difficultyColor(difficulty: string): string {
  switch (difficulty.toUpperCase()) {
    case "EASY":   return "text-emerald-400";
    case "MEDIUM": return "text-amber-400";
    case "HARD":   return "text-red-400";
    default:       return "text-slate-400";
  }
}

/** Returns a readable lowercase label, e.g. "EASY" → "Easy". */
export function difficultyLabel(difficulty: string): string {
  if (!difficulty) return "—";
  return difficulty[0].toUpperCase() + difficulty.slice(1).toLowerCase();
}

// ─── Submission status colours ─────────────────────────────────────────────

/** Returns a Tailwind text-colour class for a SubmissionStatus string. */
export function statusColor(status: string): string {
  switch (status) {
    case "ACCEPTED":       return "text-emerald-400";
    case "WRONG_ANSWER":   return "text-red-400";
    case "RUNTIME_ERROR":  return "text-orange-400";
    case "COMPILE_ERROR":  return "text-orange-400";
    case "TIME_LIMIT":     return "text-yellow-400";
    case "MEMORY_LIMIT":   return "text-yellow-400";
    case "QUEUED":         return "text-slate-400";
    case "RUNNING":        return "text-brand-400";
    case "INTERNAL_ERROR": return "text-slate-500";
    default:               return "text-slate-400";
  }
}

/** Returns a human-readable label, e.g. "WRONG_ANSWER" → "Wrong Answer". */
export function statusLabel(status: string): string {
  return status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

// ─── Formatters ────────────────────────────────────────────────────────────

/**
 * Format a runtime value in milliseconds.
 * < 1 s  → "48 ms"
 * ≥ 1 s  → "1.23 s"
 * null   → "—"
 */
export function formatRuntime(ms: number | null | undefined): string {
  if (ms == null) return "—";
  return ms < 1000 ? `${ms} ms` : `${(ms / 1000).toFixed(2)} s`;
}

/**
 * Format a memory value in kilobytes.
 * < 1 MB → "512 KB"
 * ≥ 1 MB → "15.3 MB"
 * null   → "—"
 */
export function formatMemory(kb: number | null | undefined): string {
  if (kb == null) return "—";
  return kb < 1024 ? `${kb} KB` : `${(kb / 1024).toFixed(1)} MB`;
}

/**
 * Return a relative time string.
 * < 1 min  → "just now"
 * < 1 hr   → "42m ago"
 * < 1 day  → "5h ago"
 * ≥ 1 day  → "3d ago"
 */
export function timeAgo(dateStr: string | null | undefined): string {
  if (!dateStr) return "—";
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diffMs / 60_000);
  if (mins < 1)   return "just now";
  if (mins < 60)  return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)   return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30)  return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(months / 12)}y ago`;
}

// ─── Contest helpers ───────────────────────────────────────────────────────

/** Countdown string: "2h 14m remaining" / "Ended" */
export function contestCountdown(endAt: string): string {
  const diffMs = new Date(endAt).getTime() - Date.now();
  if (diffMs <= 0) return "Ended";
  const totalMins = Math.floor(diffMs / 60_000);
  const hrs = Math.floor(totalMins / 60);
  const mins = totalMins % 60;
  if (hrs > 0) return `${hrs}h ${mins}m remaining`;
  return `${mins}m remaining`;
}

// ─── Misc ──────────────────────────────────────────────────────────────────

/** Clamp a number between min and max. */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/** Get the user's initials (up to 2 chars) for avatar placeholders. */
export function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0][0]?.toUpperCase() ?? "?";
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}