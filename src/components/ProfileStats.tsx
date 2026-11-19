interface ProfileStatsProps {
  postCount?: number;
  followerCount?: number;
  followingCount?: number;
}

function Stat({ value, label }: { value?: number; label: string }) {
  return (
    <span className="text-sm text-[#6B5842]">
      <span className="font-semibold text-[#2A1F16]">
        {value === undefined ? "–" : value.toLocaleString()}
      </span>{" "}
      {label}
    </span>
  );
}

export default function ProfileStats({
  postCount,
  followerCount,
  followingCount,
}: ProfileStatsProps) {
  return (
    <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1">
      <Stat value={postCount} label={postCount === 1 ? "Post" : "Posts"} />
      <Stat
        value={followerCount}
        label={followerCount === 1 ? "Follower" : "Followers"}
      />
      <Stat value={followingCount} label="Following" />
    </div>
  );
}
