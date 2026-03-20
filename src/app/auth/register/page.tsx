"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Code2 } from "lucide-react";
import { authApi, getErrorMessage } from "@/lib/api";
import { useAuthStore } from "@/lib/auth";

export default function RegisterPage() {
  const router = useRouter();
  const setUser = useAuthStore((s) => s.setUser);
  const [form, setForm] = useState({
    email: "", username: "", password: "", password_confirm: "", display_name: ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      // const { data } = await authApi.register(form);
      const { user } = await authApi.register(form);
      setUser(user);
      // setUser(data.user);
      router.push("/");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-2 justify-center mb-8">
          <div className="w-9 h-9 rounded-xl bg-brand-600 flex items-center justify-center">
            <Code2 className="w-5 h-5 text-white" />
          </div>
          <span className="font-display text-xl font-bold text-slate-100">CodeQuest</span>
        </div>

        <div className="card p-6">
          <h1 className="font-display text-xl font-bold text-slate-100 mb-1">Create account</h1>
          <p className="text-slate-500 text-sm mb-6">Free forever. No credit card required.</p>

          {error && (
            <div className="mb-4 px-3 py-2 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            {[
              { k: "display_name", label: "Display Name", type: "text", placeholder: "Alice" },
              { k: "username", label: "Username", type: "text", placeholder: "alice42" },
              { k: "email", label: "Email", type: "email", placeholder: "alice@example.com" },
              { k: "password", label: "Password", type: "password", placeholder: "Min 8 chars" },
              { k: "password_confirm", label: "Confirm Password", type: "password", placeholder: "Repeat password" },
            ].map(({ k, label, type, placeholder }) => (
              <div key={k}>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">{label}</label>
                <input
                  type={type}
                  value={(form as any)[k]}
                  onChange={set(k)}
                  placeholder={placeholder}
                  className="input"
                  required
                />
              </div>
            ))}

            <button type="submit" disabled={loading} className="btn-primary justify-center mt-2">
              {loading ? "Creating account…" : "Create account"}
            </button>
          </form>

          <div className="mt-4 pt-4 border-t border-surface-300 text-center text-sm text-slate-500">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-brand-400 hover:text-brand-300 font-medium">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}