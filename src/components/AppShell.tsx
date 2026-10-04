"use client";
import { useState } from "react";
import Avatar from "./Avatar";
import Drawer from "./Drawer";
import BottomNav from "./BottomNav";
import { CommentProvider } from "@/context/CommentContext";
import {
  CurrentUserProvider,
  useCurrentUser,
} from "@/context/CurrentUserContext";
import { RealtimeProvider } from "@/context/RealTimeContext";

function ShellChrome({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const { me } = useCurrentUser();

  return (
    <div className="min-h-screen bg-[#F1E9DC]">
      <header className="sticky top-0 z-30 bg-[#F1E9DC]/95 backdrop-blur border-b border-[#2A1F16]/10">
        <div className="max-w-[600px] mx-auto flex items-center justify-between px-4 py-3">
          <button
            onClick={() => setOpen(true)}
            aria-label="Open menu"
            className="rounded-full"
          >
            <Avatar name={me?.username ?? "?"} size={36} src={me?.avatarUrl} />
          </button>
          <span className="font-display text-lg text-[#2A1F16]">Tweetie</span>
          <span className="w-9" aria-hidden="true" />
        </div>
      </header>

      <main className="max-w-[600px] mx-auto pb-20">{children}</main>

      <BottomNav />
      <Drawer open={open} onClose={() => setOpen(false)} />
    </div>
  );
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <CurrentUserProvider>
      <RealtimeProvider>
        <CommentProvider>
          <ShellChrome>{children}</ShellChrome>
        </CommentProvider>
      </RealtimeProvider>
    </CurrentUserProvider>
  );
}
