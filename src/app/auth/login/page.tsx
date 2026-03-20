"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Code2, Eye, EyeOff } from "lucide-react";
import { useLogin } from "@/lib/hooks";
import { getErrorMessage } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const login = useLogin();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await login.mutateAsync({ email, password });
      router.push("/");
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex items-center gap-2 justify-center mb-8">
          <div className="w-9 h-9 rounded-xl bg-brand-600 flex items-center justify-center shadow-lg shadow-brand-900/40">
            <Code2 className="w-5 h-5 text-white" />
          </div>
          <span className="font-display text-xl font-bold text-slate-100">CodeQuest</span>
        </div>

        <div className="card p-6">
          <h1 className="font-display text-xl font-bold text-slate-100 mb-1">Sign in</h1>
          <p className="text-slate-500 text-sm mb-6">Welcome back — continue your journey.</p>

          {error && (
            <div className="mb-4 px-3 py-2 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="input"
                required
                autoFocus
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={login.isPending} className="btn-primary justify-center mt-2">
              {login.isPending ? "Signing in…" : "Sign in"}
            </button>
          </form>

          <div className="mt-4 pt-4 border-t border-surface-300 text-center text-sm text-slate-500">
            Don&apos;t have an account?{" "}
            <Link href="/auth/register" className="text-brand-400 hover:text-brand-300 font-medium">
              Register free
            </Link>
          </div>

          {/* Demo credentials hint */}
          <div className="mt-3 p-2.5 bg-surface-100 rounded-lg text-xs text-slate-500">
            <strong className="text-slate-400">Demo:</strong> free@codequest.dev / user123
          </div>
        </div>
      </div>
    </div>
  );
}