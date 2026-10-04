"use client";

import { useEffect, useState } from "react";
import { CloseIcon } from "./icons";
import { formatTimestamp } from "@/lib/formatTimestamp";

interface QuotedPostPreview {
  name: string;
  handle: string;
  timestamp: string;
  content: string;
}

interface ComposeModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (content: string) => Promise<void>;
  quotedPost?: QuotedPostPreview;
}

export default function ComposeModal({
  open,
  onClose,
  onSubmit,
  quotedPost,
}: ComposeModalProps) {
  const [content, setContent] = useState("");
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    if (open) setContent("");
  }, [open]);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (open) document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;
    setPosting(true);
    await onSubmit(content.trim());
    setPosting(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4">
      <div
        onClick={onClose}
        aria-hidden="true"
        className="absolute inset-0 bg-black/40"
      />

      <form
        onSubmit={handleSubmit}
        className="relative w-full max-w-[480px] bg-white rounded-md border border-[#2A1F16]/10 shadow-lg"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#2A1F16]/10">
          <h2 className="font-display text-lg text-[#2A1F16]">
            {quotedPost ? "Quote Tweetie" : "New Tweetie"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="text-[#6B5842] hover:text-[#2A1F16] transition-colors"
          >
            <CloseIcon />
          </button>
        </div>

        <div className="px-5 py-5 flex flex-col gap-3">
          {quotedPost && (
            <div className="px-3.5 py-3 rounded-md border border-[#2A1F16]/10 bg-[#F1E9DC]/50">
              <div className="flex items-baseline gap-2 text-sm">
                <span className="font-medium text-[#2A1F16]">
                  {quotedPost.name}
                </span>
                <span className="text-[#6B5842] text-xs">
                  {quotedPost.handle}
                </span>
                <span className="text-[#6B5842] text-xs">
                  {formatTimestamp(quotedPost.timestamp)}
                </span>
              </div>
              <p className="text-sm text-[#2A1F16] mt-0.5">
                {quotedPost.content}
              </p>
            </div>
          )}

          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Post your Tweetie"
            rows={5}
            autoFocus
            className="w-full resize-none px-3.5 py-2.5 rounded-md bg-[#F1E9DC] border border-[#2A1F16]/10
                                   text-[#2A1F16] text-sm placeholder-[#6B5842]/60 outline-none
                                   focus:bg-white focus:border-[#9C5B33] transition-colors"
          />
        </div>

        <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-[#2A1F16]/10">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-md text-sm font-medium text-[#2A1F16] hover:bg-[#2A1F16]/8 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!content.trim() || posting}
            className="px-5 py-2 rounded-md bg-[#2A1F16] text-white text-sm font-medium
                                   disabled:opacity-40 hover:bg-[#3A2C1E] transition-colors"
          >
            {posting ? "Posting..." : "Post"}
          </button>
        </div>
      </form>
    </div>
  );
}
