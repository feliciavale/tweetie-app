"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface CommentContextValue {
  openPostId: string | null;
  toggleComments: (postId: string) => void;
}

const CommentContext = createContext<CommentContextValue | null>(null);

export function CommentProvider({ children }: { children: ReactNode }) {
  const [openPostId, setOpenPostId] = useState<string | null>(null);

  function toggleComments(postId: string) {
    setOpenPostId((prev) => (prev === postId ? null : postId));
  }
  return (
    <CommentContext.Provider value={{ openPostId, toggleComments }}>
      {children}
    </CommentContext.Provider>
  );
}

export function useCommentContext() {
  const ctx = useContext(CommentContext);
  if (!ctx) {
    throw new Error("useCommentContext must be used within a CommentProvider");
  }
  return ctx;
}
