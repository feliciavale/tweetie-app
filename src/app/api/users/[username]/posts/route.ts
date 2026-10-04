import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/session";
import {
  formatPost,
  postListingInclude,
  likeAndRepostInclude,
} from "@/lib/formatPost";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ username: string }> },
) {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { username } = await params;

  const author = await prisma.user.findUnique({
    where: { username },
    select: { id: true, isPrivate: true },
  });

  if (!author) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const isSelf = author.id === userId;
  let canView = isSelf || !author.isPrivate;

  if (!canView) {
    const follow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: { followerId: userId, followingId: author.id },
      },
    });
    canView = follow?.status === "ACCEPTED";
  }

  if (!canView) {
    return NextResponse.json({ posts: [], private: true });
  }

  const posts = await prisma.post.findMany({
    where: { authorId: author.id },
    orderBy: { createdAt: "desc" },
    include: {
      ...postListingInclude,
      ...likeAndRepostInclude(userId),
    },
  });

  return NextResponse.json({ posts: posts.map(formatPost), private: false });
}
