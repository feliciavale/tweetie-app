import Link from "next/link";

const sections = [
  {
    title: "Account information",
    description: "Update your username, email and password.",
    href: "/settings/account",
  },
  {
    title: "Privacy and safety",
    description: "Control who can see your posts and contact you.",
    href: "/settings/privacy",
  },
  {
    title: "Notifications",
    description: "Choose what you get notified about.",
    href: "/settings/notifications",
  },
  {
    title: "Liked Tweeties",
    description: "See Tweeties that you've liked.",
    href: "/settings/liked",
  },
  {
    title: "Reposted Tweeties",
    description: "See Tweeties that you've reposted.",
    href: "/settings/reposted",
  },
];

export default function SettingsPage() {
  return (
    <div>
      <div className="px-5 py-4 border-b border-[#2A1F16]/10">
        <h1 className="font-display text-xl text-[#2A1F16]">
          Settings and privacy
        </h1>
      </div>

      <div>
        {sections.map((s) => (
          <Link
            key={s.title}
            href={s.href}
            className="block w-full text-left px-5 py-4 border-b border-[#2A1F16]/10 hover:bg-[#2A1F16]/5 transition-colors"
          >
            <p className="text-sm font-medium text-[#2A1F16]">{s.title}</p>
            <p className="text-sm text-[#6B5842] mt-0.5">{s.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
