/**
 * lib/ws.ts
 *
 * WebSocket client for Django Channels real-time features:
 *  - Submission status updates  →  ws/submissions/{id}/
 *  - Contest leaderboard        →  ws/contests/{slug}/leaderboard/
 *
 * ReconnectingWS automatically reconnects on unexpected close with
 * exponential back-off (1 s → 1.5 s → 2.25 s … capped at 15 s).
 *
 * Usage:
 *   const ws = submissionWS("550e8400-...");
 *   ws.connect();
 *   const unsubscribe = ws.on((msg) => { ... });
 *   // later:
 *   unsubscribe();   // stop this handler
 *   ws.close();      // close the socket entirely
 */

const WS_BASE =
  process.env.NEXT_PUBLIC_WS_URL ?? "ws://localhost:8000";

export type WsMessage = Record<string, unknown>;
export type MessageHandler = (data: WsMessage) => void;

export class ReconnectingWS {
  private socket: WebSocket | null = null;
  private handlers: Set<MessageHandler> = new Set();
  private shouldClose = false;
  private reconnectDelay = 1_000;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(private readonly url: string) {}

  /** Open the WebSocket connection. Safe to call multiple times. */
  connect(): void {
    if (typeof window === "undefined") return; // SSR guard
    if (this.socket?.readyState === WebSocket.OPEN) return;

    this.shouldClose = false;
    this._open();
  }

  private _open(): void {
    this.socket = new WebSocket(this.url);

    this.socket.onopen = () => {
      this.reconnectDelay = 1_000; // reset on successful connect
    };

    this.socket.onmessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data as string) as WsMessage;
        this.handlers.forEach((h) => h(data));
      } catch {
        // Non-JSON frame — ignore
      }
    };

    this.socket.onclose = (event: CloseEvent) => {
      if (this.shouldClose) return;
      // Reconnect unless it was a normal closure (1000)
      if (event.code !== 1000) {
        this.reconnectTimer = setTimeout(() => {
          this.reconnectDelay = Math.min(this.reconnectDelay * 1.5, 15_000);
          this._open();
        }, this.reconnectDelay);
      }
    };

    this.socket.onerror = () => {
      // onerror is always followed by onclose — let onclose handle reconnect
      this.socket?.close();
    };
  }

  /**
   * Register a message handler. Returns an unsubscribe function.
   *
   *   const off = ws.on((msg) => console.log(msg));
   *   // later:
   *   off();
   */
  on(handler: MessageHandler): () => void {
    this.handlers.add(handler);
    return () => this.handlers.delete(handler);
  }

  /**
   * Permanently close the socket and cancel any pending reconnect.
   * Call this in useEffect cleanup:
   *   return () => { ws.close(); };
   */
  close(): void {
    this.shouldClose = true;
    if (this.reconnectTimer != null) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.socket) {
      this.socket.close(1000, "Component unmounted");
      this.socket = null;
    }
    this.handlers.clear();
  }

  /** True when the underlying socket is open and ready. */
  get isConnected(): boolean {
    return this.socket?.readyState === WebSocket.OPEN;
  }
}

// ─── Convenience factories ─────────────────────────────────────────────────

/**
 * WebSocket for a single submission's live status updates.
 *
 * Messages you'll receive:
 *   { type: "connected", submission_id: "..." }
 *   { type: "status_update", submission_id: "...", status: "ACCEPTED", runtime_ms: 48, memory_kb: 15200 }
 */
export function submissionWS(submissionId: string): ReconnectingWS {
  return new ReconnectingWS(
    `${WS_BASE}/ws/submissions/${submissionId}/`
  );
}

/**
 * WebSocket for a contest's live leaderboard updates.
 *
 * Messages you'll receive:
 *   { type: "connected", contest: "weekly-contest-1" }
 *   { type: "leaderboard_update", entries: [{ rank, username, final_score, ... }] }
 */
export function leaderboardWS(contestSlug: string): ReconnectingWS {
  return new ReconnectingWS(
    `${WS_BASE}/ws/contests/${contestSlug}/leaderboard/`
  );
}