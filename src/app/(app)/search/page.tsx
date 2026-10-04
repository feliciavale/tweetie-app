"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Avatar from "@/components/Avatar";

interface UserResult {
  username: string;
  bio: string | null;
}

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<UserResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    const trimmed = query.trim();

    if (trimmed.length === 0) {
      setResults([]);
      setSearched(false);
      setLoading(false);
      return;
    }

    setLoading(true);
    const timeout = setTimeout(() => {
      fetch(`/api/search/users?q=${encodeURIComponent(trimmed)}`)
        .then((res) => res.json())
        .then((data) => {
          setResults(data.users ?? []);
          setSearched(true);
        })
        .finally(() => setLoading(false));
    }, 300);

    return () => clearTimeout(timeout);
  }, [query]);

  return (
    <div>
      <div className="px-5 py-4 border-b border-[#2A1F16]/10">
        <h1 className="font-display text-xl text-[#2A1F16]">Search</h1>
      </div>

      <div className="px-5 py-4 border-b border-[#2A1F16]/10">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for people"
          className="w-full px-3.5 py-2.5 rounded-md bg-[#F1E9DC] border border-[#2A1F16]/10 text-[#2A1F16] text-sm placeholder-[#6B5842]/60 outline-none focus:bg-white focus:border-[#9C5B33] transition-colors"
        />
      </div>

      {!searched && !loading && (
        <p className="px-5 py-8 text-sm text-[#6B5842]">
          Results will appear here.
        </p>
      )}

      {loading && (
        <p className="px-5 py-8 text-sm text-[#6B5842]">Searching...</p>
      )}

      {!loading && searched && results.length === 0 && (
        <p className="px-5 py-8 text-sm text-[#6B5842]">
          No accounts found for "{query.trim()}".
        </p>
      )}

      {!loading &&
        results.map((user) => (
          <Link
            key={user.username}
            href={`/profile/${user.username}`}
            className="flex items-center gap-3 px-5 py-4 border-b border-[#2A1F16]/10 hover:bg-[#2A1F16]/5 transition-colors"
          >
            <Avatar name={user.username} size={40} />
            <div className="min-w-0">
              <p className="text-sm font-medium text-[#2A1F16]">
                {user.username}
              </p>
              <p className="text-sm text-[#6B5842]">@{user.username}</p>
              {user.bio && (
                <p className="text-sm text-[#6B5842] mt-0.5 truncate">
                  {user.bio}
                </p>
              )}
            </div>
          </Link>
        ))}
    </div>
  );
}
