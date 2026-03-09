"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const router = useRouter();
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${location.origin}/auth/callback` },
        });
        if (error) throw error;
        setMessage({
          type: "success",
          text: "Check your email to confirm your account.",
        });
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.push("/");
        router.refresh();
      }
    } catch (err) {
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "An error occurred",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-scheme-bg-muted/95">
      <div className="w-full max-w-sm rounded-xl border border-scheme-border/60 bg-white p-8 shadow-sm">
        <h1 className="mb-6 text-2xl font-bold text-stone-900">
          {isSignUp ? "Create account" : "Sign in"}
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium text-stone-700">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-lg border border-stone-300 px-3 py-2 text-stone-900 placeholder-stone-400 focus:border-scheme-primary focus:outline-none focus:ring-1 focus:ring-scheme-primary"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-medium text-stone-700">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full rounded-lg border border-stone-300 px-3 py-2 text-stone-900 placeholder-stone-400 focus:border-scheme-primary focus:outline-none focus:ring-1 focus:ring-scheme-primary"
              placeholder="••••••••"
            />
          </div>
          {message && (
            <p
              className={`text-sm ${message.type === "success" ? "text-emerald-600" : "text-red-600"}`}
            >
              {message.text}
            </p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-scheme-primary px-4 py-2 font-medium text-white hover:bg-scheme-primary-hover focus:outline-none focus:ring-2 focus:ring-scheme-primary focus:ring-offset-2 disabled:opacity-50"
          >
            {loading ? "Loading…" : isSignUp ? "Sign up" : "Sign in"}
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-stone-500">
          {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
          <button
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setMessage(null);
            }}
            className="font-medium text-scheme-primary hover:text-scheme-primary-hover"
          >
            {isSignUp ? "Sign in" : "Sign up"}
          </button>
        </p>
      </div>
    </main>
  );
}
