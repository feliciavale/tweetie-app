import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/session";
import { createPostSchema } from "@/lib/validation";
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
    orderBy: { createdAt: "desc" },
    include: {
      ...postListingInclude,
      ...likeAndRepostInclude(userId),
    },
  });

  return NextResponse.json({ posts: posts.map(formatPost) });
}

export async function POST(req: Request) {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = createPostSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 400 },
    );
  }

  const { content, quotedPostId } = parsed.data;

  if (quotedPostId) {
    const quoted = await prisma.post.findUnique({
      where: { id: quotedPostId },
      select: { id: true },
    });
    if (!quoted) {
      return NextResponse.json(
        { error: "The post being quoted no longer exists." },
        { status: 404 },
      );
    }
  }

  const post = await prisma.post.create({
    data: {
      content,
      authorId: userId,
      quotedPostId: quotedPostId ?? null,
    },
    include: {
      ...postListingInclude,
      ...likeAndRepostInclude(userId),
    },
  });

  return NextResponse.json(formatPost(post), { status: 201 });
}
