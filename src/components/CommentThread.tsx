"use client";

import { useState } from "react";
import Avatar from "./Avatar";
import { formatTimestamp } from "@/lib/formatTimestamp";

export interface CommentData {
  id: string;
  parentId: string | null;
  name: string;
  handle: string;
  timestamp: string;
  content: string;
}

interface CommentThreadProps {
  postId: string;
  comments: CommentData[];
  onAddComment: (content: string, parentId: string | null) => Promise<void>;
}

function buildTree(
  comments: CommentData[],
  parentId: string | null,
): CommentData[] {
  return comments.filter((c) => c.parentId === parentId);
}

function CommentNode({
  comment,
  allComments,
  postId,
  onAddComment,
  depth,
  openReplyId,
  setOpenReplyId,
}: {
  comment: CommentData;
  allComments: CommentData[];
  postId: string;
  onAddComment: (content: string, parentId: string | null) => Promise<void>;
  depth: number;
  openReplyId: string | null;
  setOpenReplyId: (id: string | null) => void;
}) {
  const [draft, setDraft] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const children = buildTree(allComments, comment.id);
  const isIndented = depth > 0;
  const replying = openReplyId === comment.id;
  const replyingTo = comment.parentId
    ? allComments.find((c) => c.id === comment.parentId)
    : null;

  function toggleReply() {
    setOpenReplyId(replying ? null : comment.id);
  }

  async function handleReply(e: React.FormEvent) {
    e.preventDefault();
    if (!draft.trim()) return;
    setSubmitting(true);
    await onAddComment(draft, comment.id);
    setDraft("");
    setOpenReplyId(null);
    setSubmitting(false);
  }

  return (
    <div
      style={{ marginLeft: isIndented ? 20 : 0 }}
      className={isIndented ? "border-l border-[#2A1F16]/10 pl-3 mt-2" : "mt-3"}
    >
      <div className="flex gap-2.5">
        <Avatar name={comment.name} size={28} />
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2 text-sm">
            <span className="font-medium text-[#2A1F16]">{comment.name}</span>
            <span className="text-[#6B5842] text-xs">{comment.handle}</span>
            <span className="text-[#6B5842] text-xs">
              {formatTimestamp(comment.timestamp)}
            </span>
          </div>

          {replyingTo && (
            <p className="text-xs text-[#6B5842] mt-0.5">
              Replying to{" "}
              <span className="text-[#9C5B33] font-medium">
                {replyingTo.handle}
              </span>
            </p>
          )}

          <p className="text-sm text-[#2A1F16] mt-0.5">{comment.content}</p>

          <button
            onClick={toggleReply}
            className="text-xs text-[#6B5842] hover:text-[#9C5B33] transition-colors mt-1"
          >
            Reply
          </button>

          {replying && (
            <form onSubmit={handleReply} className="flex gap-2 mt-2">
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder={`Reply to ${comment.handle}`}
                autoFocus
                className="flex-1 px-3 py-1.5 rounded-md bg-[#F1E9DC] border border-[#2A1F16]/10 text-[#2A1F16] text-sm placeholder-[#6B5842]/60 outline-none focus:bg-white focus:border-[#9C5B33] transition-colors"
              />
              <button
                type="submit"
                disabled={!draft.trim() || submitting}
                className="px-3 py-1.5 rounded-md bg-[#2A1F16] text-white text-xs font-medium disabled:opacity-40 hover:bg-[#3A2C1E] transition-colors"
              >
                Reply
              </button>
            </form>
          )}

          {children.map((child) => (
            <CommentNode
              key={child.id}
              comment={child}
              allComments={allComments}
              postId={postId}
              onAddComment={onAddComment}
              depth={Math.min(depth + 1, 1)}
              openReplyId={openReplyId}
              setOpenReplyId={setOpenReplyId}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function CommentThread({
  postId,
  comments,
  onAddComment,
}: CommentThreadProps) {
  const [draft, setDraft] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [openReplyId, setOpenReplyId] = useState<string | null>(null);
  const topLevel = buildTree(comments, null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!draft.trim()) return;
    setSubmitting(true);
    await onAddComment(draft, null);
    setDraft("");
    setSubmitting(false);
  }

  return (
    <div className="px-5 pb-4 border-b border-[#2A1F16]/10 bg-[#F1E9DC]/50">
      {topLevel.length === 0 && (
        <p className="text-sm text-[#6B5842] pt-3">
          No comments yet. Start the conversation.
        </p>
      )}

      {topLevel.map((c) => (
        <CommentNode
          key={c.id}
          comment={c}
          allComments={comments}
          postId={postId}
          onAddComment={onAddComment}
          depth={0}
          openReplyId={openReplyId}
          setOpenReplyId={setOpenReplyId}
        />
      ))}

      <form
        onSubmit={handleSubmit}
        className="flex gap-2 pt-3 mt-3 border-t border-[#2A1F16]/10"
      >
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Write a comment"
          className="flex-1 px-3 py-1.5 rounded-md bg-white border border-[#2A1F16]/10 text-[#2A1F16] text-sm placeholder-[#6B5842]/60 outline-none focus:border-[#9C5B33] transition-colors"
        />
        <button
          type="submit"
          disabled={!draft.trim() || submitting}
          className="px-3 py-1.5 rounded-md bg-[#2A1F16] text-white text-xs font-medium disabled:opacity-40 hover:bg-[#3A2C1E] transition-colors"
        >
          Comment
        </button>
      </form>
    </div>
  );
}
