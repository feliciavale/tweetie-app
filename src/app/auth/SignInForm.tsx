"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface SignInFormProps {
  successMessage?: string;
  initialEmail?: string;
}
export default function SignInForm({
  successMessage,
  initialEmail,
}: SignInFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState(initialEmail ?? "");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Try again.");
        return;
      }

      router.push("/home");
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col justify-center gap-4 h-full px-10"
    >
      <h2 className="font-display text-2xl text-[#2A1F16]">Sign in</h2>
      <p className="text-sm text-[#6B5842]">
        Sign in with your email and password.
      </p>

      {successMessage && (
        <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-md px-3 py-2">
          {successMessage}
        </p>
      )}

      <label className="flex flex-col gap-1.5">
        <span className="text-xs font-medium text-[#6B5842]">Email</span>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="w-full px-3.5 py-2.5 rounded-md bg-white/60 border border-[#2A1F16]/10 text-[#2A1F16] text-sm placeholder-[#6B5842]/60 outline-none focus:bg-white focus:border-[#9C5B33] transition-colors"
        />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-xs font-medium text-[#6B5842]">Password</span>
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter your password"
          className="w-full px-3.5 py-2.5 rounded-md bg-white/60 border border-[#2A1F16]/10 text-[#2A1F16] text-sm placeholder-[#6B5842]/60 outline-none focus:bg-white focus:border-[#9C5B33] transition-colors"
        />
      </label>

      {error && <p className="text-sm text-[#9C5B33]">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="self-start mt-1 px-6 py-2.5 rounded-md bg-[#2A1F16] text-white text-sm font-medium hover:bg-[#3A2C1E] disabled:opacity-60 transition-colors"
      >
        {loading ? "Signing in..." : "Sign in"}
      </button>
    </form>
  );
}
