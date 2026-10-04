"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Avatar from "@/components/Avatar";
import PostCard from "@/components/PostCard";
import EditProfileModal from "@/components/EditProfileModal";
import { useCurrentUser } from "@/context/CurrentUserContext";

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
  quotedPost?: {
    id: string;
    name: string;
    handle: string;
    timestamp: string;
    content: string;
  } | null;
}

interface Me {
  username: string;
  email: string;
  bio?: string | null;
  avatarUrl?: string | null;
  bannerUrl?: string | null;
}

export default function ProfilePage() {
  const [tab, setTab] = useState<"posts" | "likes">("posts");
  const [yourPosts, setYourPosts] = useState<Post[]>([]);
  const [likedPosts, setLikedPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [me, setMe] = useState<Me | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const { refresh: refreshCurrentUser } = useCurrentUser();

  useEffect(() => {
    fetch("/api/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.username) setMe(data);
      });
  }, []);

  useEffect(() => {
    setLoading(true);
    const endpoint = tab === "posts" ? "/api/posts/mine" : "/api/posts/liked";
    fetch(endpoint)
      .then((res) => res.json())
      .then((data) => {
        if (tab === "posts") setYourPosts(data.posts ?? []);
        else setLikedPosts(data.posts ?? []);
      })
      .finally(() => setLoading(false));
  }, [tab]);

  function makeHandlers(setter: React.Dispatch<React.SetStateAction<Post[]>>) {
    async function handleLike(id: string) {
      setter((prev) =>
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
        setter((prev) =>
          prev.map((p) => (p.id === id ? { ...p, likedByMe, likeCount } : p)),
        );
      }
    }

    async function handleRepost(id: string) {
      setter((prev) =>
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
        setter((prev) =>
          prev.map((p) =>
            p.id === id ? { ...p, repostedByMe, repostCount } : p,
          ),
        );
      }
    }

    async function handleDelete(id: string) {
      let previous: Post[] = [];
      setter((prev) => {
        previous = prev;
        return prev.filter((p) => p.id !== id);
      });
      const res = await fetch(`/api/posts/${id}`, { method: "DELETE" });
      if (!res.ok) setter(previous);
    }

    return { handleLike, handleRepost, handleDelete };
  }

  const { handleLike, handleRepost, handleDelete } = makeHandlers(
    tab === "posts" ? setYourPosts : setLikedPosts,
  );
  const activePosts = tab === "posts" ? yourPosts : likedPosts;

  return (
    <div>
      <div
        className="h-28 bg-[#2A1F16] bg-cover bg-center"
        style={
          me?.bannerUrl
            ? { backgroundImage: `url(${me.bannerUrl})` }
            : undefined
        }
      />

      <div className="px-5 -mt-10">
        <div className="inline-block rounded-full ring-4 ring-[#F1E9DC]">
          <Avatar name={me?.username ?? "?"} size={80} src={me?.avatarUrl} />
        </div>
      </div>

      <div className="px-5 pt-3 pb-4 border-b border-[#2A1F16]/10">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-xl text-[#2A1F16]">
              {me?.username ?? "Loading..."}
            </h1>
            <p className="text-sm text-[#6B5842]">
              {me ? `@${me.username}` : ""}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Link
              href="/profile/edit"
              className="px-4 py-2 rounded-md border border-[#2A1F16] text-[#2A1F16] text-sm font-medium hover:bg-[#2A1F16] hover:text-white transition-colors"
            >
              Edit profile
            </Link>
          </div>
        </div>
        <p className="mt-3 text-sm text-[#2A1F16] leading-relaxed max-w-[420px]">
          {me?.bio && me.bio.trim().length > 0
            ? me.bio
            : "Write a short line about yourself here."}
        </p>
      </div>

      <div className="flex border-b border-[#2A1F16]/10">
        {(["posts", "likes"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-3 text-sm font-medium capitalize transition-colors
                                    ${tab === t ? "text-[#2A1F16] border-b-2 border-[#9C5B33]" : "text-[#6B5842]"}`}
          >
            {t}
          </button>
        ))}
      </div>

      <div>
        {loading && (
          <p className="px-5 py-8 text-sm text-[#6B5842]">Loading...</p>
        )}
        {!loading && activePosts.length === 0 && (
          <p className="px-5 py-8 text-sm text-[#6B5842]">
            {tab === "posts"
              ? "You haven't posted anything yet."
              : "No likes yet."}
          </p>
        )}
        {!loading &&
          activePosts.map((post) => (
            <PostCard
              key={post.id}
              {...post}
              onLike={handleLike}
              onRepost={handleRepost}
              onDelete={handleDelete}
            />
          ))}
      </div>

      <EditProfileModal
        open={editOpen}
        me={me}
        onClose={() => setEditOpen(false)}
        onSaved={(updated) => {
          setMe((prev) => (prev ? { ...prev, ...updated } : updated));
          refreshCurrentUser();
        }}
      />
    </div>
  );
}
