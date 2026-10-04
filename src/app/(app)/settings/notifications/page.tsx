"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Toggle from "@/components/Toggle";

interface Preferences {
  notifyOnLike: boolean;
  notifyOnRepost: boolean;
  notifyOnReply: boolean;
  notifyOnFollow: boolean;
  notifyOnMessage: boolean;
}

const rows: { key: keyof Preferences; title: string; description: string }[] = [
  {
    key: "notifyOnLike",
    title: "Likes",
    description: "When someone likes one of your posts.",
  },
  {
    key: "notifyOnRepost",
    title: "Reposts",
    description: "When someone reposts one of your posts.",
  },
  {
    key: "notifyOnReply",
    title: "Replies",
    description: "When someone replies to your posts or comments.",
  },
  {
    key: "notifyOnFollow",
    title: "New followers",
    description: "When someone starts following you.",
  },
  {
    key: "notifyOnMessage",
    title: "Direct messages",
    description: "When someone sends you a message.",
  },
];

export default function NotificationSettingsPage() {
  const [preferences, setPreferences] = useState<Preferences | null>(null);

  useEffect(() => {
    fetch("/api/settings/notifications")
      .then((res) => res.json())
      .then((data) => setPreferences(data));
  }, []);

  function toggle(key: keyof Preferences, value: boolean) {
    setPreferences((prev) => (prev ? { ...prev, [key]: value } : prev));
    fetch("/api/settings/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [key]: value }),
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
        <h1 className="font-display text-xl text-[#2A1F16]">Notifications</h1>
      </div>

      {!preferences ? (
        <p className="px-5 py-8 text-sm text-[#6B5842]">Loading...</p>
      ) : (
        <div>
          {rows.map((row) => (
            <div
              key={row.key}
              className="flex items-center justify-between gap-4 px-5 py-4 border-b border-[#2A1F16]/10"
            >
              <div>
                <p className="text-sm font-medium text-[#2A1F16]">
                  {row.title}
                </p>
                <p className="text-sm text-[#6B5842] mt-0.5">
                  {row.description}
                </p>
              </div>
              <Toggle
                checked={preferences[row.key]}
                onChange={(v) => toggle(row.key, v)}
                label={row.title}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
