"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Me {
  username: string;
  email: string;
}

export default function AccountSettingsPage() {
  const [me, setMe] = useState<Me | null>(null);

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    fetch("/api/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.username) {
          setMe(data);
          setUsername(data.username);
          setEmail(data.email);
        }
      });
  }, []);

  async function handleProfileSave(e: React.FormEvent) {
    e.preventDefault();
    setProfileError(null);
    setProfileSuccess(false);
    setSavingProfile(true);

    const res = await fetch("/api/me", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: username.trim(), email: email.trim() }),
    });
    const data = await res.json();
    setSavingProfile(false);

    if (!res.ok) {
      setProfileError(data.error ?? "Something went wrong. Try again.");
      return;
    }

    setMe(data);
    setProfileSuccess(true);
  }

  async function handlePasswordSave(e: React.FormEvent) {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(false);

    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }

    setSavingPassword(true);
    const res = await fetch("/api/account/password", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    const data = await res.json();
    setSavingPassword(false);

    if (!res.ok) {
      setPasswordError(data.error ?? "Something went wrong. Try again.");
      return;
    }

    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setPasswordSuccess(true);
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
          Account information
        </h1>
      </div>

      {!me ? (
        <p className="px-5 py-6 text-sm text-[#6B5842]">Loading...</p>
      ) : (
        <div className="px-5 py-6 flex flex-col gap-8">
          <form onSubmit={handleProfileSave} className="flex flex-col gap-4">
            <div>
              <h2 className="text-sm font-medium text-[#2A1F16]">Profile</h2>
              <p className="text-xs text-[#6B5842] mt-0.5">
                Your username and email.
              </p>
            </div>

            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-[#6B5842]">
                Username
              </span>
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                maxLength={30}
                className="px-3.5 py-2.5 rounded-md bg-[#F1E9DC] border border-[#2A1F16]/10 text-[#2A1F16] text-sm outline-none max-w-[360px] focus:bg-white focus:border-[#9C5B33] transition-colors"
              />
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-[#6B5842]">Email</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="px-3.5 py-2.5 rounded-md bg-[#F1E9DC] border border-[#2A1F16]/10 text-[#2A1F16] text-sm outline-none max-w-[360px] focus:bg-white focus:border-[#9C5B33] transition-colors"
              />
            </label>

            {profileError && (
              <p className="text-sm text-red-700">{profileError}</p>
            )}
            {profileSuccess && (
              <p className="text-sm text-[#9C5B33]">Profile updated.</p>
            )}

            <div>
              <button
                type="submit"
                disabled={savingProfile}
                className="px-4 py-2 rounded-md bg-[#2A1F16] text-white text-sm font-medium disabled:opacity-40 hover:bg-[#3A2C1E] transition-colors"
              >
                {savingProfile ? "Saving..." : "Save profile"}
              </button>
            </div>
          </form>

          <form
            onSubmit={handlePasswordSave}
            className="flex flex-col gap-4 pt-6 border-t border-[#2A1F16]/10"
          >
            <div>
              <h2 className="text-sm font-medium text-[#2A1F16]">Password</h2>
              <p className="text-xs text-[#6B5842] mt-0.5">
                Change the password you use to sign in.
              </p>
            </div>

            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-[#6B5842]">
                Current password
              </span>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="px-3.5 py-2.5 rounded-md bg-[#F1E9DC] border border-[#2A1F16]/10 text-[#2A1F16] text-sm outline-none max-w-[360px] focus:bg-white focus:border-[#9C5B33] transition-colors"
              />
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-[#6B5842]">
                New password
              </span>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="px-3.5 py-2.5 rounded-md bg-[#F1E9DC] border border-[#2A1F16]/10 text-[#2A1F16] text-sm outline-none max-w-[360px] focus:bg-white focus:border-[#9C5B33] transition-colors"
              />
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-[#6B5842]">
                Confirm new password
              </span>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="px-3.5 py-2.5 rounded-md bg-[#F1E9DC] border border-[#2A1F16]/10 text-[#2A1F16] text-sm outline-none max-w-[360px] focus:bg-white focus:border-[#9C5B33] transition-colors"
              />
            </label>

            {passwordError && (
              <p className="text-sm text-red-700">{passwordError}</p>
            )}
            {passwordSuccess && (
              <p className="text-sm text-[#9C5B33]">Password changed.</p>
            )}

            <div>
              <button
                type="submit"
                disabled={savingPassword}
                className="px-4 py-2 rounded-md bg-[#2A1F16] text-white text-sm font-medium disabled:opacity-40 hover:bg-[#3A2C1E] transition-colors"
              >
                {savingPassword ? "Saving..." : "Change password"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
