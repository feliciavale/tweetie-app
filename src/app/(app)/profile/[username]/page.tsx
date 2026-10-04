"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Avatar from "@/components/Avatar";
import PostCard from "@/components/PostCard";
import FollowButton from "@/components/FollowButton";
import { MessageIcon } from "@/components/icons";
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

interface Profile {
  username: string;
  bio?: string | null;
  isPrivate: boolean;
  followStatus: "none" | "pending" | "accepted";
  avatarUrl?: string | null;
  bannerUrl?: string | null;
}

export default function PublicProfilePage() {
  const params = useParams<{ username: string }>();
  const router = useRouter();
  const { me, loading: meLoading } = useCurrentUser();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);
  const [postsGated, setPostsGated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (meLoading) return;
    if (me && me.username === params.username) {
      router.replace("/profile");
    }
  }, [me, meLoading, params.username, router]);

  function loadPosts() {
    setLoading(true);
    fetch(`/api/users/${params.username}/posts`)
      .then((res) => res.json())
      .then((data) => {
        setPosts(data.posts ?? []);
        setPostsGated(Boolean(data.private));
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    fetch(`/api/users/${params.username}`)
      .then((res) => {
        if (res.status === 404) {
          setNotFound(true);
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data) setProfile(data);
      });

    loadPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.username]);

  function handleFollowStatusChange(status: "none" | "pending" | "accepted") {
    setProfile((prev) => (prev ? { ...prev, followStatus: status } : prev));
    loadPosts();
  }

  function handleLike(id: string) {
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
    fetch(`/api/posts/${id}/like`, { method: "POST" })
      .then((res) => res.json())
      .then(({ likedByMe, likeCount }) =>
        setPosts((prev) =>
          prev.map((p) => (p.id === id ? { ...p, likedByMe, likeCount } : p)),
        ),
      );
  }

  function handleRepost(id: string) {
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
    fetch(`/api/posts/${id}/repost`, { method: "POST" })
      .then((res) => res.json())
      .then(({ repostedByMe, repostCount }) =>
        setPosts((prev) =>
          prev.map((p) =>
            p.id === id ? { ...p, repostedByMe, repostCount } : p,
          ),
        ),
      );
  }

  function handleDelete(id: string) {
    const previous = posts;
    setPosts((prev) => prev.filter((p) => p.id !== id));
    fetch(`/api/posts/${id}`, { method: "DELETE" }).then((res) => {
      if (!res.ok) setPosts(previous);
    });
  }

  if (notFound) {
    return (
      <p className="px-5 py-8 text-sm text-[#6B5842]">
        This account doesn't exist.
      </p>
    );
  }

  return (
    <div>
      <div
        className="h-28 bg-[#2A1F16] bg-cover bg-center"
        style={
          profile?.bannerUrl
            ? { backgroundImage: `url(${profile.bannerUrl})` }
            : undefined
        }
      />

      <div className="px-5 -mt-10">
        <div className="inline-block rounded-full ring-4 ring-[#F1E9DC]">
          <Avatar
            name={profile?.username ?? "?"}
            size={80}
            src={profile?.avatarUrl}
          />
        </div>
      </div>

      <div className="px-5 pt-3 pb-4 border-b border-[#2A1F16]/10">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-xl text-[#2A1F16]">
              {profile?.username ?? "Loading..."}
            </h1>
            <p className="text-sm text-[#6B5842]">
              {profile ? `@${profile.username}` : ""}
            </p>
          </div>

          {profile && (
            <div className="flex items-center gap-2 shrink-0">
              <FollowButton
                username={profile.username}
                initialStatus={profile.followStatus}
                onStatusChange={handleFollowStatusChange}
              />
              <Link
                href={`/messages/${profile.username}`}
                className="flex items-center gap-2 px-4 py-2 rounded-md border border-[#2A1F16] text-[#2A1F16] text-sm font-medium hover:bg-[#2A1F16] hover:text-white transition-colors"
              >
                <MessageIcon />
                Message
              </Link>
            </div>
          )}
        </div>
        <p className="mt-3 text-sm text-[#2A1F16] leading-relaxed max-w-[420px]">
          {profile?.bio && profile.bio.trim().length > 0 ? profile.bio : ""}
        </p>
      </div>

      <div className="px-5 py-3 border-b border-[#2A1F16]/10">
        <p className="text-sm font-medium text-[#2A1F16]">Posts</p>
      </div>

      <div>
        {loading && (
          <p className="px-5 py-8 text-sm text-[#6B5842]">Loading...</p>
        )}

        {!loading && postsGated && (
          <p className="px-5 py-16 text-sm text-[#6B5842] text-center">
            This account is private. Follow {profile?.username} to see their
            posts.
          </p>
        )}

        {!loading && !postsGated && posts.length === 0 && (
          <p className="px-5 py-8 text-sm text-[#6B5842]">No posts yet.</p>
        )}

        {!loading &&
          !postsGated &&
          posts.map((post) => (
            <PostCard
              key={post.id}
              {...post}
              onLike={handleLike}
              onRepost={handleRepost}
              onDelete={handleDelete}
            />
          ))}
      </div>
    </div>
  );
}
