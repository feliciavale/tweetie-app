"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Avatar from "@/components/Avatar";
import { formatTimestamp } from "@/lib/formatTimestamp";
import { useRealtime } from "@/context/RealTimeContext";

interface Conversation {
  username: string;
  preview: string;
  timestamp: string;
  unread: boolean;
}

export default function MessagesPage() {
  const { subscribe } = useRealtime();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  function loadConversations() {
    fetch("/api/messages")
      .then((res) => res.json())
      .then((data) => setConversations(data.conversations ?? []))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadConversations();
    const interval = setInterval(loadConversations, 20000);
    window.addEventListener("focus", loadConversations);

    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", loadConversations);
    };
  }, []);

  useEffect(() => {
    return subscribe("message", () => {
      loadConversations();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subscribe]);

  return (
    <div>
      <div className="px-5 py-4 border-b border-[#2A1F16]/10">
        <h1 className="font-display text-xl text-[#2A1F16]">Messages</h1>
      </div>

      <div>
        {loading && (
          <p className="px-5 py-8 text-sm text-[#6B5842]">Loading...</p>
        )}
        {!loading && conversations.length === 0 && (
          <p className="px-5 py-8 text-sm text-[#6B5842]">
            No messages yet. Start a conversation from someone's profile.
          </p>
        )}
        {!loading &&
          conversations.map((c) => (
            <Link
              key={c.username}
              href={`/messages/${c.username}`}
              className="flex items-center gap-3 px-5 py-4 border-b border-[#2A1F16]/10 hover:bg-[#2A1F16]/5 transition-colors"
            >
              <Avatar name={c.username} size={40} />
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-sm font-medium text-[#2A1F16]">
                    @{c.username}
                  </span>
                  <span className="text-xs text-[#6B5842] shrink-0">
                    {formatTimestamp(c.timestamp)}
                  </span>
                </div>
                <p
                  className={`text-sm truncate ${
                    c.unread ? "text-[#2A1F16] font-medium" : "text-[#6B5842]"
                  }`}
                >
                  {c.preview}
                </p>
              </div>
              {c.unread && (
                <span className="w-2 h-2 rounded-full bg-[#9C5B33] shrink-0" />
              )}
            </Link>
          ))}
      </div>
    </div>
  );
}
