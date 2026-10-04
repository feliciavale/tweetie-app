import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/session";
import { createNotification } from "@/lib/notify";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { id: postId } = await params;

  const existing = await prisma.repost.findUnique({
    where: { userId_postId: { userId, postId } },
  });

  if (existing) {
    await prisma.repost.delete({ where: { id: existing.id } });
  } else {
    await prisma.like.create({ data: { userId, postId } });

    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { authorId: true },
    });

    if (post) {
      await createNotification({
        type: "repost",
        recipientId: post.authorId,
        actorId: userId,
        postId,
      });
    }
  }

  const repostCount = await prisma.repost.count({ where: { postId } });

  return NextResponse.json({ repostedByMe: !existing, repostCount });
}
