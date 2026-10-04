"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Avatar from "./Avatar";
import CommentThread, { CommentData } from "./CommentThread";
import ConfirmDialog from "./ConfirmDialog";
import ComposeModal from "./ComposeModal";
import { TrashIcon, QuoteIcon } from "./icons";
import { formatTimestamp } from "@/lib/formatTimestamp";
import { useCommentContext } from "@/context/CommentContext";
import { useCurrentUser } from "@/context/CurrentUserContext";

interface QuotedPost {
  id: string;
  name: string;
  handle: string;
  timestamp: string;
  content: string;
}

interface PostCardProps {
  id: string;
  name: string;
  handle: string;
  timestamp: string;
  content: string;
  likeCount: number;
  repostCount: number;
  likedByMe: boolean;
  repostedByMe: boolean;
  quotedPost?: QuotedPost | null;
  onLike: (id: string) => void;
  onRepost: (id: string) => void;
  onDelete?: (id: string) => void;
}

export default function PostCard({
  id,
  name,
  handle,
  timestamp,
  content,
  likeCount,
  repostCount,
  likedByMe,
  repostedByMe,
  quotedPost,
  onLike,
  onRepost,
  onDelete,
}: PostCardProps) {
  const [comments, setComments] = useState<CommentData[]>([]);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [quoteOpen, setQuoteOpen] = useState(false);
  const router = useRouter();
  const { openPostId, toggleComments } = useCommentContext();
  const { me } = useCurrentUser();
  const showComments = openPostId === id;
  const authorUsername = handle.replace(/^@/, "");
  const isMe = me?.username === authorUsername;
  const profileHref = isMe ? "/profile" : `/profile/${authorUsername}`;

  const quotedAuthorUsername = quotedPost?.handle.replace(/^@/, "");
  const quotedProfileHref = quotedAuthorUsername
    ? me?.username === quotedAuthorUsername
      ? "/profile"
      : `/profile/${quotedAuthorUsername}`
    : "#";

  useEffect(() => {
    fetch(`/api/posts/${id}/comments`)
      .then((res) => res.json())
      .then((data) => setComments(data.comments ?? []));
  }, [id]);

  async function handleAddComment(content: string, parentId: string | null) {
    const res = await fetch(`/api/posts/${id}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content, parentId }),
    });
    if (res.ok) {
      const newComment = await res.json();
      setComments((prev) => [...prev, newComment]);
    }
  }

  function handleDeleteConfirmed() {
    setConfirmOpen(false);
    onDelete?.(id);
  }
  async function handleQuoteSubmit(quoteContent: string) {
    const res = await fetch("/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: quoteContent, quotedPostId: id }),
    });
    if (res.ok) {
      setQuoteOpen(false);
      window.dispatchEvent(new Event("tweetie:post-created"));
      router.push("/home");
    }
  }

  return (
    <article className="border-b border-[#2A1F16]/10">
      <div className="flex gap-3 px-5 py-4">
        <Link href={profileHref} className="shrink-0">
          <Avatar name={name} />
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2 text-sm">
            <Link
              href={profileHref}
              className="font-medium text-[#2A1F16] hover:underline"
            >
              {name}
            </Link>
            <Link href={profileHref} className="text-[#6B5842] hover:underline">
              {handle}
            </Link>
            <span className="text-[#6B5842]">{formatTimestamp(timestamp)}</span>

            {isMe && onDelete && (
              <button
                type="button"
                aria-label="Delete post"
                onClick={() => setConfirmOpen(true)}
                className="ml-auto text-[#6B5842] hover:text-red-700 transition-colors"
              >
                <TrashIcon />
              </button>
            )}
          </div>
          {quotedPost && (
            <Link
              href={quotedProfileHref}
              className="block mt-1 px-3.5 py-3 rounded-md border border-[#2A1F16]/10 hover:bg-[#2A1F16]/5 transition-colors"
            >
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
            </Link>
          )}

          <p className="mt-2 text-sm text-[#2A1F16] leading-relaxed">
            {content}
          </p>

          <div className="flex items-center gap-5 mt-3 text-[#6B5842]">
            <button
              aria-label="Comments"
              onClick={() => toggleComments(id)}
              className={`flex items-center gap-1.5 transition-colors ${
                showComments ? "text-[#9C5B33]" : "hover:text-[#9C5B33]"
              }`}
            >
              <svg
                width="17"
                height="17"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
              >
                <path
                  d="M21 12c0 4.4-4 8-9 8-1.1 0-2.2-.2-3.1-.5L4 21l1.4-4C4.5 15.7 3 14 3 12c0-4.4 4-8 9-8s9 3.6 9 8Z"
                  strokeLinejoin="round"
                />
              </svg>
              {comments.length > 0 && (
                <span className="text-xs">{comments.length}</span>
              )}
            </button>

            <button
              aria-label="Repost"
              onClick={() => onRepost(id)}
              className={`flex items-center gap-1.5 transition-colors ${
                repostedByMe ? "text-green-700" : "hover:text-green-700"
              }`}
            >
              <svg
                width="17"
                height="17"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
              >
                <path
                  d="M17 2l4 4-4 4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path d="M3 11V9a4 4 0 0 1 4-4h14" strokeLinecap="round" />
                <path
                  d="M7 22l-4-4 4-4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path d="M21 13v2a4 4 0 0 1-4 4H3" strokeLinecap="round" />
              </svg>
              {repostCount > 0 && (
                <span className="text-xs">{repostCount}</span>
              )}
            </button>

            <button
              aria-label="Quote"
              onClick={() => setQuoteOpen(true)}
              className="flex items-center gap-1.5 transition-colors hover:text-[#9C5B33]"
            >
              <QuoteIcon />
            </button>

            <button
              aria-label="Like"
              onClick={() => onLike(id)}
              className={`flex items-center gap-1.5 transition-colors ${
                likedByMe ? "text-[#9C5B33]" : "hover:text-[#9C5B33]"
              }`}
            >
              <svg
                width="17"
                height="17"
                viewBox="0 0 24 24"
                fill={likedByMe ? "currentColor" : "none"}
                stroke="currentColor"
                strokeWidth="1.6"
              >
                <path
                  d="M12 20s-7-4.4-9.5-8.8C1 8.2 2.5 5 6 5c2 0 3.3 1 4.5 2.6C11.7 6 13 5 15 5c3.5 0 5 3.2 3.5 6.2C19.5 15.6 12 20 12 20Z"
                  strokeLinejoin="round"
                />
              </svg>
              {likeCount > 0 && <span className="text-xs">{likeCount}</span>}
            </button>
          </div>
        </div>
      </div>

      {showComments && (
        <CommentThread
          postId={id}
          comments={comments}
          onAddComment={handleAddComment}
        />
      )}

      <ConfirmDialog
        open={confirmOpen}
        message="Delete this post? This can't be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={handleDeleteConfirmed}
        onCancel={() => setConfirmOpen(false)}
      />

      <ComposeModal
        open={quoteOpen}
        onClose={() => setQuoteOpen(false)}
        onSubmit={handleQuoteSubmit}
        quotedPost={{ name, handle, timestamp, content }}
      />
    </article>
  );
}
