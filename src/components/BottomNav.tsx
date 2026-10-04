"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { HomeIcon, SearchIcon, BellIcon, MessageIcon } from "./icons";
import { useRealtime } from "@/context/RealTimeContext";

const items = [
  { href: "/home", label: "Home", icon: HomeIcon },
  { href: "/search", label: "Search", icon: SearchIcon },
  { href: "/notifications", label: "Notifications", icon: BellIcon },
  { href: "/messages", label: "Messages", icon: MessageIcon },
];

export default function BottomNav() {
  const pathname = usePathname();
  const { subscribe } = useRealtime();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    function loadUnreadCount() {
      fetch("/api/notifications/unread-count")
        .then((res) => res.json())
        .then((data) => {
          if (typeof data.count === "number") setUnreadCount(data.count);
        })
        .catch(() => {}); // best-effort — a failed poll shouldn't crash the nav
    }

    loadUnreadCount();
    const interval = setInterval(loadUnreadCount, 20000); // fallback poll every 20s
    window.addEventListener("focus", loadUnreadCount);

    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", loadUnreadCount);
    };
  }, []);

  useEffect(() => {
    return subscribe("notification", (data) => {
      const payload = data as { count?: number } | null;
      if (typeof payload?.count === "number") setUnreadCount(payload.count);
    });
  }, [subscribe]);

  useEffect(() => {
    if (
      pathname === "/notifications" ||
      pathname.startsWith("/notifications/")
    ) {
      setUnreadCount(0);
    }
  }, [pathname]);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-[#2A1F16]/10">
      <div className="max-w-[600px] mx-auto flex items-center justify-around py-2">
        {items.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          const showBadge = href === "/notifications" && unreadCount > 0;
          return (
            <Link
              key={href}
              href={href}
              aria-label={label}
              className={`relative p-3 rounded-md transition-colors ${active ? "text-[#2A1F16]" : "text-[#6B5842]"}`}
            >
              <Icon active={active} />
              {showBadge && (
                <span
                  className="absolute top-1 right-1 min-w-[16px] h-4 px-1 rounded-[3px] bg-[#9C5B33]
                                               text-white text-[10px] font-medium leading-4 text-center"
                >
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
