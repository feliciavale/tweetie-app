import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/session";
import {
  formatPost,
  postListingInclude,
  likeAndRepostInclude,
} from "@/lib/formatPost";

export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const posts = await prisma.post.findMany({
    where: { likes: { some: { userId } } },
    orderBy: { createdAt: "desc" },
    include: {
      ...postListingInclude,
      ...likeAndRepostInclude(userId),
    },
  });

  return NextResponse.json({ posts: posts.map(formatPost) });
}
