"use client";

import { useEffect, useState } from "react";
import ConfirmDialog from "./ConfirmDialog";

type FollowStatus = "none" | "pending" | "accepted";

interface FollowButtonProps {
  username: string;
  initialStatus?: FollowStatus;
  compact?: boolean;
  onStatusChange?: (status: FollowStatus) => void;
}

export default function FollowButton({
  username,
  initialStatus,
  compact,
  onStatusChange,
}: FollowButtonProps) {
  const [status, setStatus] = useState<FollowStatus>(initialStatus ?? "none");
  const [loaded, setLoaded] = useState(initialStatus !== undefined);
  const [busy, setBusy] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    if (initialStatus !== undefined) return;
    fetch(`/api/users/${username}/follow`)
      .then((res) => res.json())
      .then((data) => {
        if (data.status) updateStatus(data.status);
      })
      .finally(() => setLoaded(true));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [username, initialStatus]);

  function updateStatus(next: FollowStatus) {
    setStatus(next);
    onStatusChange?.(next);
  }

  async function follow() {
    setBusy(true);
    const res = await fetch(`/api/users/${username}/follow`, {
      method: "POST",
    });
    const data = await res.json();
    setBusy(false);
    if (res.ok) updateStatus(data.status);
  }

  async function unfollow() {
    setBusy(true);
    const res = await fetch(`/api/users/${username}/follow`, {
      method: "DELETE",
    });
    setBusy(false);
    if (res.ok) updateStatus("none");
    setConfirmOpen(false);
  }

  function handleClick() {
    if (status === "none") {
      follow();
    } else {
      setConfirmOpen(true);
    }
  }

  if (!loaded) return null;

  const label =
    status === "accepted"
      ? "Following"
      : status === "pending"
        ? "Requested"
        : "Follow";
  const size = compact ? "px-3 py-1.5 text-xs" : "px-4 py-2 text-sm";

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        disabled={busy}
        className={`${size} rounded-md border font-medium transition-colors disabled:opacity-40 ${
          status === "none"
            ? "border-[#2A1F16] text-[#2A1F16] hover:bg-[#2A1F16] hover:text-white"
            : "border-[#2A1F16]/20 text-[#6B5842] hover:border-[#2A1F16]/40 hover:text-[#2A1F16]"
        }`}
      >
        {label}
      </button>

      <ConfirmDialog
        open={confirmOpen}
        message={
          status === "pending"
            ? "Cancel your follow request?"
            : "Do u want to Unfollow?"
        }
        confirmLabel="Yes"
        cancelLabel="No"
        onConfirm={unfollow}
        onCancel={() => setConfirmOpen(false)}
      />
    </>
  );
}
