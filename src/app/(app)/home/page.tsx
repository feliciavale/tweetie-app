"use client";

import { useEffect, useState } from "react";
import PostCard from "@/components/PostCard";
import ComposeModal from "@/components/ComposeModal";
import { PlusIcon } from "@/components/icons";

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

export default function HomePage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [composeOpen, setComposeOpen] = useState(false);

  async function handlePost(content: string) {
    const res = await fetch("/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });

    if (res.ok) {
      const newPost = await res.json();
      setPosts((prev) => [newPost, ...prev]);
      setComposeOpen(false);
    }
  }

  function loadPosts() {
    fetch("/api/posts")
      .then((res) => res.json())
      .then((data) => setPosts(data.posts ?? []))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadPosts();
  }, []);

  useEffect(() => {
    window.addEventListener("tweetie:post-created", loadPosts);
    return () => window.removeEventListener("tweetie:post-created", loadPosts);
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
        prev.map((p) =>
          p.id === id ? { ...p, repostedByMe, repostCount } : p,
        ),
      );
    }
  }

  async function handleDelete(id: string) {
    const previous = posts;
    setPosts((prev) => prev.filter((p) => p.id !== id));

    const res = await fetch(`/api/posts/${id}`, { method: "DELETE" });
    if (!res.ok) setPosts(previous);
  }

  return (
    <div>
      <div className="px-5 py-4 border-b border-[#2A1F16]/10">
        <h1 className="font-display text-xl text-[#2A1F16]">Home</h1>
      </div>

      <div>
        {loading && (
          <p className="px-5 py-4 text-sm text-[#6B5842]">Loading...</p>
        )}
        {!loading && posts.length === 0 && (
          <p className="px-5 py-4 text-sm text-[#6B5842]">
            No tweets yet. Be the first to post.
          </p>
        )}
        {posts.map((post) => (
          <PostCard
            key={post.id}
            {...post}
            onLike={handleLike}
            onRepost={handleRepost}
            onDelete={handleDelete}
          />
        ))}
      </div>

      <div className="fixed inset-x-0 bottom-20 z-20 pointer-events-none">
        <div className="max-w-[600px] mx-auto relative">
          <button
            type="button"
            onClick={() => setComposeOpen(true)}
            aria-label="New Tweetie"
            className="pointer-events-auto absolute bottom-0 right-5 w-14 h-14 rounded-full
                             bg-[#2A1F16] text-white shadow-lg flex items-center justify-center
                             hover:bg-[#3A2C1E] transition-colors"
          >
            <PlusIcon />
          </button>
        </div>
      </div>

      <ComposeModal
        open={composeOpen}
        onClose={() => setComposeOpen(false)}
        onSubmit={handlePost}
      />
    </div>
  );
}
