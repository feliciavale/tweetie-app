"use client";

import { useEffect, useRef, useState } from "react";
import Avatar from "./Avatar";
import { CloseIcon, CameraIcon } from "./icons";
import { resizeImage } from "@/lib/resizeImage";

interface Me {
  username: string;
  email: string;
  bio?: string | null;
  avatarUrl?: string | null;
  bannerUrl?: string | null;
}

interface EditProfileModalProps {
  open: boolean;
  me: Me | null;
  onClose: () => void;
  onSaved: (me: Me) => void;
}

const BIO_MAX = 160;
const AVATAR_MAX_DIMENSION = 400;
const BANNER_MAX_DIMENSION = 1200;

export default function EditProfileModal({
  open,
  me,
  onClose,
  onSaved,
}: EditProfileModalProps) {
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null | undefined>(null);
  const [bannerUrl, setBannerUrl] = useState<string | null | undefined>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [processingImage, setProcessingImage] = useState(false);

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open && me) {
      setUsername(me.username);
      setBio(me.bio ?? "");
      setAvatarUrl(me.avatarUrl ?? null);
      setBannerUrl(me.bannerUrl ?? null);
      setError(null);
    }
  }, [open, me]);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (open) document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setError(null);
    setProcessingImage(true);
    try {
      const dataUrl = await resizeImage(file, AVATAR_MAX_DIMENSION);
      setAvatarUrl(dataUrl);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not process that image.",
      );
    }
    setProcessingImage(false);
  }

  async function handleBannerChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setError(null);
    setProcessingImage(true);
    try {
      const dataUrl = await resizeImage(file, BANNER_MAX_DIMENSION);
      setBannerUrl(dataUrl);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not process that image.",
      );
    }
    setProcessingImage(false);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (username.trim().length < 3) {
      setError("Username must be at least 3 characters.");
      return;
    }

    setSaving(true);
    const res = await fetch("/api/me", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: username.trim(),
        bio: bio.trim(),
        avatarUrl,
        bannerUrl,
      }),
    });
    const data = await res.json();
    setSaving(false);

    if (!res.ok) {
      setError(data.error ?? "Something went wrong. Try again.");
      return;
    }

    onSaved(data);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4">
      <div
        onClick={onClose}
        aria-hidden="true"
        className="absolute inset-0 bg-black/40"
      />

      <form
        onSubmit={handleSave}
        className="relative w-full max-w-[420px] bg-white rounded-md border border-[#2A1F16]/10 shadow-lg overflow-hidden"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#2A1F16]/10">
          <h2 className="font-display text-lg text-[#2A1F16]">Edit profile</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="text-[#6B5842] hover:text-[#2A1F16] transition-colors"
          >
            <CloseIcon />
          </button>
        </div>

        <div className="relative h-28 bg-[#2A1F16]">
          {bannerUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={bannerUrl}
              alt=""
              className="absolute inset-0 w-full h-full object-cover"
            />
          )}
          <button
            type="button"
            onClick={() => bannerInputRef.current?.click()}
            aria-label="Change background image"
            className="absolute inset-0 flex items-center justify-center bg-black/0 hover:bg-black/30 transition-colors group"
          >
            <span className="w-9 h-9 rounded-full bg-black/50 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
              <CameraIcon />
            </span>
          </button>
          <input
            ref={bannerInputRef}
            type="file"
            accept="image/*"
            onChange={handleBannerChange}
            className="hidden"
          />

          <div className="absolute -bottom-8 left-5">
            <div className="relative">
              <div className="ring-4 ring-white rounded-full">
                <Avatar name={username || "?"} size={64} src={avatarUrl} />
              </div>
              <button
                type="button"
                onClick={() => avatarInputRef.current?.click()}
                aria-label="Change profile picture"
                className="absolute inset-0 rounded-full flex items-center justify-center bg-black/0 hover:bg-black/40 transition-colors group"
              >
                <span className="text-white opacity-0 group-hover:opacity-100 transition-opacity">
                  <CameraIcon />
                </span>
              </button>
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </div>
          </div>
        </div>

        <div className="px-5 pt-11 pb-5 flex flex-col gap-4">
          {processingImage && (
            <p className="text-xs text-[#6B5842]">Processing image...</p>
          )}

          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-[#6B5842]">Username</span>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              maxLength={30}
              className="px-3.5 py-2.5 rounded-md bg-[#F1E9DC] border border-[#2A1F16]/10
                                       text-[#2A1F16] text-sm outline-none
                                       focus:bg-white focus:border-[#9C5B33] transition-colors"
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-[#6B5842]">Bio</span>
              <span className="text-xs text-[#6B5842]">
                {bio.length}/{BIO_MAX}
              </span>
            </div>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value.slice(0, BIO_MAX))}
              rows={3}
              placeholder="Write a short line about yourself."
              className="px-3.5 py-2.5 rounded-md bg-[#F1E9DC] border border-[#2A1F16]/10
                                       text-[#2A1F16] text-sm placeholder-[#6B5842]/60 outline-none resize-none
                                       focus:bg-white focus:border-[#9C5B33] transition-colors"
            />
          </label>

          {error && <p className="text-sm text-red-700">{error}</p>}
        </div>

        <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-[#2A1F16]/10">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-md text-sm font-medium text-[#2A1F16]
                                   hover:bg-[#2A1F16]/8 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving || processingImage}
            className="px-4 py-2 rounded-md bg-[#2A1F16] text-white text-sm font-medium
                                   disabled:opacity-40 hover:bg-[#3A2C1E] transition-colors"
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </form>
    </div>
  );
}
