"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Avatar from "./Avatar";
import { UserIcon, SettingsIcon, SignOutIcon } from "./icons";
import { useCurrentUser } from "@/context/CurrentUserContext";

interface DrawerProps {
  open: boolean;
  onClose: () => void;
}

export default function Drawer({ open, onClose }: DrawerProps) {
  const { me } = useCurrentUser();
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);

  async function handleSignOut() {
    setSigningOut(true);
    await fetch("/api/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  return (
    <>
      <div
        onClick={onClose}
        aria-hidden="true"
        className={`fixed inset-0 bg-black/40 z-40 transition-opacity duration-300 ${
          open
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      />

      <aside
        className="fixed top-0 left-0 h-full w-[280px] bg-white z-50 flex flex-col justify-between px-5 py-6"
        style={{
          transform: open ? "translateX(0)" : "translateX(-100%)",
          transition: "transform 300ms ease",
        }}
      >
        <div>
          <div className="flex items-center gap-3 pb-5 mb-4 border-b border-[#2A1F16]/10">
            <Avatar name={me?.username ?? "?"} size={48} src={me?.avatarUrl} />
            <div>
              <p className="font-medium text-[#2A1F16] text-sm">
                {me?.username ?? "..."}
              </p>
              <p className="text-sm text-[#6B5842]">
                {me ? `@${me.username}` : ""}
              </p>
            </div>
          </div>

          <nav className="flex flex-col gap-1">
            <Link
              href="/profile"
              onClick={onClose}
              className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm text-[#2A1F16] hover:bg-[#2A1F16]/8 transition-colors"
            >
              <UserIcon />
              Profile
            </Link>
            <Link
              href="/settings"
              onClick={onClose}
              className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm text-[#2A1F16] hover:bg-[#2A1F16]/8 transition-colors"
            >
              <SettingsIcon />
              Settings and privacy
            </Link>
          </nav>
        </div>

        <button
          onClick={handleSignOut}
          disabled={signingOut}
          className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm text-[#6B5842] hover:bg-[#2A1F16]/8 transition-colors disabled:opacity-50"
        >
          <SignOutIcon />
          {signingOut ? "Signing out..." : "Sign out"}
        </button>
      </aside>
    </>
  );
}
