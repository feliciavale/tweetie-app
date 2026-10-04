import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/session";

export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const notifications = await prisma.notification.findMany({
    where: { recipientId: userId },
    orderBy: { createdAt: "desc" },
    include: {
      actor: { select: { id: true, username: true } },
      post: { select: { id: true, content: true } },
    },
  });

  await prisma.notification.updateMany({
    where: { recipientId: userId, read: false },
    data: { read: true },
  });

  const followActorIds = notifications
    .filter((n) => n.type === "follow")
    .map((n) => n.actor.id);

  const alreadyFollowingBack = followActorIds.length
    ? await prisma.follow.findMany({
        where: { followerId: userId, followingId: { in: followActorIds } },
        select: { followingId: true, status: true },
      })
    : [];

  const followBackMap = new Map(
    alreadyFollowingBack.map((f) => [
      f.followingId,
      f.status === "PENDING" ? "pending" : "accepted",
    ]),
  );

  const formatted = notifications.map((n) => ({
    id: n.id,
    type: n.type,
    actor: n.actor.username,
    timestamp: n.createdAt.toISOString(),
    postId: n.post?.id ?? null,
    postPreview: n.post?.content ?? null,
    followId: n.followId,
    followBackStatus:
      n.type === "follow" ? (followBackMap.get(n.actor.id) ?? "none") : null,
  }));

  return NextResponse.json({ notifications: formatted });
}
