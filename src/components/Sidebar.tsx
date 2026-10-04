"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

function HomeIcon({ active }: { active: boolean }) {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={active ? 2.2 : 1.6}
    >
      <path
        d="M4 11.5 12 4l8 7.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M6 10v9h12v-9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function UserIcon({ active }: { active: boolean }) {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={active ? 2.2 : 1.6}
    >
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 20c1.2-3.6 4-5.5 7-5.5s5.8 1.9 7 5.5" strokeLinecap="round" />
    </svg>
  );
}

function SignOutIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
    >
      <path d="M9 4H5v16h4" strokeLinecap="round" strokeLinejoin="round" />
      <path
        d="M14 8l4 4-4 4M18 12H9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const links = [
  { href: "/home", label: "Home", icon: HomeIcon },
  { href: "/profile", label: "Profile", icon: UserIcon },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-[220px] shrink-0 flex flex-col justify-between py-6 px-4 h-screen sticky top-0">
      <div className="flex flex-col gap-6">
        <Link href="/home" className="flex items-center gap-2 px-2">
          <span className="w-9 h-9 rounded-md bg-[#2A1F16] flex items-center justify-center">
            <span className="font-display text-sm text-white">T</span>
          </span>
          <span className="font-display text-lg text-[#2A1F16]">Tweetie</span>
        </Link>

        <nav className="flex flex-col gap-1">
          {links.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-md
text-sm transition-colors
                                    ${
                                      active
                                        ? "bg-[#2A1F16] text-white"
                                        : "text-[#2A1F16] hover:bg-[#2A1F16]/8"
                                    }`}
              >
                <Icon active={active} />
                {label}
              </Link>
            );
          })}
        </nav>
      </div>

      <Link
        href="/"
        className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm text-[#6B5842] hover:bg-[#2A1F16]/8 transition-colors"
      >
        <SignOutIcon />
        Sign out
      </Link>
    </aside>
  );
}
