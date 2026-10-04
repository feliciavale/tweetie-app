"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Avatar from "@/components/Avatar";
import FollowButton from "@/components/FollowButton";
import { formatDateTime } from "@/lib/formatTimestamp";
import { useRealtime } from "@/context/RealTimeContext";

interface NotificationItem {
  id: string;
  type: "like" | "repost" | "reply" | "follow" | "follow_request" | "message";
  actor: string;
  timestamp: string;
  postId: string | null;
  postPreview: string | null;
  followId: string | null;
  followBackStatus: "none" | "pending" | "accepted" | null;
}

function truncate(text: string, max: number) {
  return text.length > max ? text.slice(0, max).trimEnd() + "..." : text;
}

export default function NotificationsPage() {
  const { subscribe } = useRealtime();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  function loadNotifications() {
    fetch("/api/notifications")
      .then((res) => res.json())
      .then((data) => setNotifications(data.notifications ?? []))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 20000);
    window.addEventListener("focus", loadNotifications);

    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", loadNotifications);
    };
  }, []);

  useEffect(() => {
    return subscribe("notification", () => {
      loadNotifications();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subscribe]);

  async function handleConfirm(notification: NotificationItem) {
    if (!notification.followId) return;
    setBusyId(notification.id);
    const res = await fetch(`/api/follow-requests/${notification.followId}`, {
      method: "PATCH",
    });
    setBusyId(null);
    if (res.ok) {
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notification.id
            ? { ...n, type: "follow", followBackStatus: null }
            : n,
        ),
      );
    }
  }

  async function handleDelete(notification: NotificationItem) {
    if (!notification.followId) return;
    setBusyId(notification.id);
    const res = await fetch(`/api/follow-requests/${notification.followId}`, {
      method: "DELETE",
    });
    setBusyId(null);
    if (res.ok) {
      setNotifications((prev) => prev.filter((n) => n.id !== notification.id));
    }
  }

  return (
    <div>
      <div className="px-5 py-4 border-b border-[#2A1F16]/10">
        <h1 className="font-display text-xl text-[#2A1F16]">Notifications</h1>
      </div>

      <div>
        {loading && (
          <p className="px-5 py-8 text-sm text-[#6B5842]">Loading...</p>
        )}
        {!loading && notifications.length === 0 && (
          <p className="px-5 py-8 text-sm text-[#6B5842]">
            No notifications yet.
          </p>
        )}

        {!loading &&
          notifications.map((n) => (
            <div
              key={n.id}
              className="flex items-start gap-3 px-5 py-4 border-b border-[#2A1F16]/10"
            >
              <Link href={`/profile/${n.actor}`} className="shrink-0">
                <Avatar name={n.actor} size={36} />
              </Link>

              <div className="flex-1 min-w-0">
                <p className="text-sm text-[#2A1F16]">
                  <Link
                    href={`/profile/${n.actor}`}
                    className="font-medium hover:underline"
                  >
                    {n.actor}
                  </Link>{" "}
                  {n.type === "like" && "liked your post"}
                  {n.type === "repost" && "reposted your post"}
                  {n.type === "reply" && "replied to your post"}
                  {n.type === "follow" && "followed you"}
                  {n.type === "follow_request" && "wants to follow you"}
                  {n.type === "message" && "sent you a message"}
                </p>

                {(n.type === "like" ||
                  n.type === "repost" ||
                  n.type === "reply") &&
                  n.postPreview && (
                    <p className="text-sm text-[#6B5842] mt-0.5">
                      {truncate(n.postPreview, 80)}
                    </p>
                  )}

                <p className="text-xs text-[#6B5842] mt-1">
                  {formatDateTime(n.timestamp)}
                </p>

                {n.type === "message" && (
                  <Link
                    href={`/messages/${n.actor}`}
                    className="inline-block mt-2 px-3 py-1.5 rounded-md border border-[#2A1F16]/20 text-[#6B5842] text-xs font-medium
                                                   hover:border-[#2A1F16]/40 hover:text-[#2A1F16] transition-colors"
                  >
                    View message
                  </Link>
                )}

                {n.type === "follow" && (
                  <div className="mt-2">
                    <FollowButton
                      username={n.actor}
                      {...(n.followBackStatus
                        ? { initialStatus: n.followBackStatus }
                        : {})}
                      compact
                    />
                  </div>
                )}

                {n.type === "follow_request" && (
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      type="button"
                      onClick={() => handleConfirm(n)}
                      disabled={busyId === n.id}
                      className="px-3 py-1.5 rounded-md bg-[#2A1F16] text-white text-xs font-medium
                                                       disabled:opacity-40 hover:bg-[#3A2C1E] transition-colors"
                    >
                      Confirm
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(n)}
                      disabled={busyId === n.id}
                      className="px-3 py-1.5 rounded-md border border-[#2A1F16]/20 text-[#6B5842] text-xs font-medium
                                                       disabled:opacity-40 hover:border-[#2A1F16]/40 hover:text-[#2A1F16] transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
