import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/session";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ username: string }> },
) {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { username } = await params;

  const user = await prisma.user.findUnique({
    where: { username },
    select: {
      id: true,
      username: true,
      bio: true,
      isPrivate: true,
      avatarUrl: true,
      bannerUrl: true,
    },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const isMe = user.id === userId;

  let followStatus: "none" | "pending" | "accepted" = "none";
  if (!isMe) {
    const follow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: { followerId: userId, followingId: user.id },
      },
    });
    if (follow)
      followStatus = follow.status === "PENDING" ? "pending" : "accepted";
  }

  return NextResponse.json({
    username: user.username,
    bio: user.bio,
    isPrivate: user.isPrivate,
    avatarUrl: user.avatarUrl,
    bannerUrl: user.bannerUrl,
    isMe,
    followStatus,
  });
}
