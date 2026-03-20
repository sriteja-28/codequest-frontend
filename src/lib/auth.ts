/**
 * lib/auth.ts
 *
 * Zustand store for the current authenticated user.
 *
 * Why Zustand instead of just React Query?
 * - useMe() (React Query) is the server-truth source; it sets this store on success.
 * - Components that only need to READ the user (Navbar, route guards, plan checks)
 *   use this store directly — zero network calls, zero waterfalls.
 * - useMutation onSuccess handlers (login, register, logout) also update this store
 *   so the UI is instant, before the next useMe re-fetch.
 *
 * Persistence: we use sessionStorage (not localStorage) so the store clears on
 * tab close. The server JWT cookie is the real auth source anyway.
 */

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { User } from "@/types";

interface AuthState {
  /** The currently authenticated user, or null when logged out. */
  user: User | null;

  /** Called by useMe, useLogin, useRegister, useLogout to sync the store. */
  setUser: (user: User | null) => void;

  /** Convenience: true when user is logged in AND has an active Pro plan. */
  isPro: () => boolean;

  /** Convenience: true when user has role === "ADMIN". */
  isAdmin: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,

      setUser: (user) => set({ user }),

      isPro: () => {
        const u = get().user;
        return u?.is_pro ?? false;
      },

      isAdmin: () => {
        const u = get().user;
        return u?.role === "ADMIN";
      },
    }),
    {
      name: "cq-auth",
      // sessionStorage clears on tab close; cookies remain until expiry
      storage: createJSONStorage(() =>
        typeof window !== "undefined" ? sessionStorage : {
          getItem: () => null,
          setItem: () => {},
          removeItem: () => {},
        }
      ),
      // Only persist the user object, not the function references
      partialize: (state) => ({ user: state.user }),
    }
  )
);