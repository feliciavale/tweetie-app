"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Avatar from "@/components/Avatar";
import { formatTimestamp } from "@/lib/formatTimestamp";
import { useRealtime } from "@/context/RealTimeContext";

interface Message {
  id: string;
  content: string;
  timestamp: string;
  fromMe: boolean;
}

export default function ConversationPage() {
  const params = useParams<{ username: string }>();
  const router = useRouter();
  const { subscribe } = useRealtime();

  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function loadMessages() {
      fetch(`/api/messages/${params.username}`)
        .then((res) => {
          if (res.status === 404) {
            setNotFound(true);
            return null;
          }
          return res.json();
        })
        .then((data) => {
          if (data) setMessages(data.messages ?? []);
        })
        .finally(() => setLoading(false));
    }

    loadMessages();
    const interval = setInterval(loadMessages, 5000);
    return () => clearInterval(interval);
  }, [params.username]);

  useEffect(() => {
    return subscribe("message", (data) => {
      const payload = data as {
        senderUsername?: string;
        message?: Message;
      } | null;
      if (payload?.senderUsername === params.username && payload.message) {
        setMessages((prev) => [...prev, payload.message as Message]);
      }
    });
  }, [subscribe, params.username]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [messages.length]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!draft.trim()) return;

    setSending(true);
    const res = await fetch(`/api/messages/${params.username}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: draft.trim() }),
    });
    setSending(false);

    if (res.ok) {
      const message = await res.json();
      setMessages((prev) => [...prev, message]);
      setDraft("");
    }
  }

  if (notFound) {
    return (
      <div>
        <div className="px-5 py-4 border-b border-[#2A1F16]/10 flex items-center gap-3">
          <button
            onClick={() => router.push("/messages")}
            aria-label="Back to messages"
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
          </button>
        </div>
        <p className="px-5 py-8 text-sm text-[#6B5842]">
          This account doesn't exist.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="px-5 py-4 border-b border-[#2A1F16]/10 flex items-center gap-3 bg-[#F1E9DC]">
        <Link
          href="/messages"
          aria-label="Back to messages"
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
        <Link
          href={`/profile/${params.username}`}
          className="flex items-center gap-2.5"
        >
          <Avatar name={params.username} size={32} />
          <h1 className="font-display text-lg text-[#2A1F16]">
            @{params.username}
          </h1>
        </Link>
      </div>

      <div className="min-h-[50vh] max-h-[calc(100vh-14rem)] overflow-y-auto px-5 py-4 pb-32 flex flex-col gap-2">
        {loading && <p className="text-sm text-[#6B5842]">Loading...</p>}
        {!loading && messages.length === 0 && (
          <p className="text-sm text-[#6B5842]">
            No messages yet. Say hello to @{params.username}.
          </p>
        )}
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex ${m.fromMe ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[75%] px-3.5 py-2 rounded-md text-sm ${
                m.fromMe
                  ? "bg-[#2A1F16] text-white"
                  : "bg-white border border-[#2A1F16]/10 text-[#2A1F16]"
              }`}
            >
              <p>{m.content}</p>
              <p
                className={`text-[10px] mt-1 ${m.fromMe ? "text-white/60" : "text-[#6B5842]"}`}
              >
                {formatTimestamp(m.timestamp)}
              </p>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <form
        onSubmit={handleSend}
        className="fixed bottom-16 left-0 right-0 z-20 bg-[#F1E9DC] border-t border-[#2A1F16]/10"
      >
        <div className="max-w-[600px] mx-auto flex gap-2 px-5 py-3">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Write a message"
            className="flex-1 px-3.5 py-2.5 rounded-md bg-white border border-[#2A1F16]/10 text-[#2A1F16] text-sm placeholder-[#6B5842]/60 outline-none focus:border-[#9C5B33] transition-colors"
          />
          <button
            type="submit"
            disabled={!draft.trim() || sending}
            className="px-4 py-2 rounded-md bg-[#2A1F16] text-white text-sm font-medium disabled:opacity-40 hover:bg-[#3A2C1E] transition-colors"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}
