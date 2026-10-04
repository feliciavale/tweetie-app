import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/session";
import { createNotification } from "@/lib/notify";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: postId } = await params;

  const comments = await prisma.comment.findMany({
    where: { postId },
    orderBy: { createdAt: "asc" },
    include: { author: { select: { username: true } } },
  });

  const formatted = comments.map((c) => ({
    id: c.id,
    parentId: c.parentId,
    name: c.author.username,
    handle: `@${c.author.username}`,
    timestamp: c.createdAt.toISOString(),
    content: c.content,
  }));

  return NextResponse.json({ comments: formatted });
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { id: postId } = await params;
  const { content, parentId } = await req.json();

  if (!content || !content.trim()) {
    return NextResponse.json({ error: "Content is required" }, { status: 400 });
  }

  const comment = await prisma.comment.create({
    data: {
      content: content.trim(),
      authorId: userId,
      postId,
      parentId: parentId ?? null,
    },
    include: { author: { select: { username: true } } },
  });

  if (parentId) {
    const parentComment = await prisma.comment.findUnique({
      where: { id: parentId },
      select: { authorId: true },
    });
    if (parentComment) {
      await createNotification({
        type: "reply",
        recipientId: parentComment.authorId,
        actorId: userId,
        postId,
      });
    }
  } else {
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { authorId: true },
    });
    if (post) {
      await createNotification({
        type: "reply",
        recipientId: post.authorId,
        actorId: userId,
        postId,
      });
    }
  }

  return NextResponse.json(
    {
      id: comment.id,
      parentId: comment.parentId,
      name: comment.author.username,
      handle: `@${comment.author.username}`,
      timestamp: comment.createdAt.toISOString(),
      content: comment.content,
    },
    { status: 201 },
  );
}
