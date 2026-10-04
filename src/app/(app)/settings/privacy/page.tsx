"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Toggle from "@/components/Toggle";

export default function PrivacySettingsPage() {
  const [isPrivate, setIsPrivate] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch("/api/me")
      .then((res) => res.json())
      .then((data) => {
        if (typeof data.isPrivate === "boolean") setIsPrivate(data.isPrivate);
      })
      .finally(() => setLoaded(true));
  }, []);

  async function togglePrivate(value: boolean) {
    setIsPrivate(value);
    await fetch("/api/me", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isPrivate: value }),
    });
  }

  return (
    <div>
      <div className="px-5 py-4 border-b border-[#2A1F16]/10 flex items-center gap-3">
        <Link
          href="/settings"
          aria-label="Back to settings"
          className="text-[#6B5842] hover:text-[#2A1F16] transition-colors"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
          >
            <path
              d="M15 18l-6-6 6-6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </Link>
        <h1 className="font-display text-xl text-[#2A1F16]">
          Privacy and safety
        </h1>
      </div>

      {!loaded ? (
        <p className="px-5 py-8 text-sm text-[#6B5842]">Loading...</p>
      ) : (
        <div className="flex items-center justify-between gap-4 px-5 py-4 border-b border-[#2A1F16]/10">
          <div>
            <p className="text-sm font-medium text-[#2A1F16]">
              Private account
            </p>
            <p className="text-sm text-[#6B5842] mt-0.5">
              New followers need your approval before they can follow you, and
              only your followers can see your posts.
            </p>
          </div>
          <Toggle
            checked={isPrivate}
            onChange={togglePrivate}
            label="Private account"
          />
        </div>
      )}
    </div>
  );
}
