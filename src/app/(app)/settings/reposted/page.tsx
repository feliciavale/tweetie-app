"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import PostCard from "@/components/PostCard";

interface Post {
  id: string;
  name: string;
  handle: string;
  timestamp: string;
  content: string;
  likeCount: number;
  repostCount: number;
  likedByMe: boolean;
  repostedByMe: boolean;
}
export default function RepostedTweetiesPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/posts/reposted")
      .then((res) => res.json())
      .then((data) => setPosts(data.posts ?? []))
      .finally(() => setLoading(false));
  }, []);

  async function handleLike(id: string) {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === id
          ? {
              ...p,
              likedByMe: !p.likedByMe,
              likeCount: p.likeCount + (p.likedByMe ? -1 : 1),
            }
          : p,
      ),
    );

    const res = await fetch(`/api/posts/${id}/like`, { method: "POST" });
    if (res.ok) {
      const { likedByMe, likeCount } = await res.json();
      setPosts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, likedByMe, likeCount } : p)),
      );
    }
  }

  async function handleRepost(id: string) {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === id
          ? {
              ...p,
              repostedByMe: !p.repostedByMe,
              repostCount: p.repostCount + (p.repostedByMe ? -1 : 1),
            }
          : p,
      ),
    );
    const res = await fetch(`/api/posts/${id}/repost`, { method: "POST" });
    if (res.ok) {
      const { repostedByMe, repostCount } = await res.json();
      setPosts((prev) =>
        prev
          .map((p) => (p.id === id ? { ...p, repostedByMe, repostCount } : p))
          .filter((p) => (p.id === id ? repostedByMe : true)),
      );
    }
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
          Reposted Tweeties
        </h1>
      </div>

      <div>
        {loading && (
          <p className="px-5 py-4 text-sm text-[#6B5842]">Loading...</p>
        )}
        {!loading && posts.length === 0 && (
          <p className="px-5 py-4 text-sm text-[#6B5842]">
            You haven&apos;t reposted any Tweeties yet.
          </p>
        )}
        {posts.map((post) => (
          <PostCard
            key={post.id}
            {...post}
            onLike={handleLike}
            onRepost={handleRepost}
          />
        ))}
      </div>
    </div>
  );
}
