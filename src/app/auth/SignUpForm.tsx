"use client";

import { useState } from "react";

interface SignUpFormProps {
  onSuccess: (email: string) => void;
}

export default function SignUpForm({ onSuccess }: SignUpFormProps) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Try again.");
        return;
      }

      onSuccess(email);
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
      <h2 className="font-display text-2xl text-[#2A1F16]">Create account</h2>
      <p className="text-sm text-[#6B5842]">Register with your email.</p>

      <label className="flex flex-col gap-1.5">
        <span className="text-xs font-medium text-[#6B5842]">Username</span>
        <input
          type="text"
          required
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Your username"
          className="w-full px-3.5 py-2.5 rounded-md bg-white/60 border border-[#2A1F16]/10 text-[#2A1F16] text-sm placeholder-[#6B5842]/60 outline-none focus:bg-white focus:border-[#9C5B33] transition-colors"
        />
      </label>

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
          placeholder="Create a password"
          className="w-full px-3.5 py-2.5 rounded-md bg-white/60 border border-[#2A1F16]/10 text-[#2A1F16] text-sm placeholder-[#6B5842]/60 outline-none focus:bg-white focus:border-[#9C5B33] transition-colors"
        />
      </label>

      {error && <p className="text-sm text-[#9C5B33]">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="self-start mt-1 px-6 py-2.5 rounded-md bg-[#2A1F16] text-white text-sm font-medium hover:bg-[#3A2C1E] disabled:opacity-60 transition-colors"
      >
        {loading ? "Creating account..." : "Create account"}
      </button>
    </form>
  );
}
