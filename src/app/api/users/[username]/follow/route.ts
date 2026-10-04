import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/session";
import { createNotification } from "@/lib/notify";

async function resolveTarget(username: string) {
  return prisma.user.findUnique({
    where: { username },
    select: { id: true, isPrivate: true },
  });
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ username: string }> },
) {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { username } = await params;
  const target = await resolveTarget(username);
  if (!target) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const follow = await prisma.follow.findUnique({
    where: {
      followerId_followingId: { followerId: userId, followingId: target.id },
    },
  });

  return NextResponse.json({
    status: follow
      ? follow.status === "PENDING"
        ? "pending"
        : "accepted"
      : "none",
  });
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ username: string }> },
) {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { username } = await params;
  const target = await resolveTarget(username);
  if (!target) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  if (target.id === userId) {
    return NextResponse.json(
      { error: "You can't follow yourself." },
      { status: 400 },
    );
  }

  const existing = await prisma.follow.findUnique({
    where: {
      followerId_followingId: { followerId: userId, followingId: target.id },
    },
  });

  if (existing) {
    return NextResponse.json({
      status: existing.status === "PENDING" ? "pending" : "accepted",
    });
  }

  const status = target.isPrivate ? "PENDING" : "ACCEPTED";

  const follow = await prisma.follow.create({
    data: { followerId: userId, followingId: target.id, status },
  });

  await createNotification({
    type: status === "PENDING" ? "follow_request" : "follow",
    recipientId: target.id,
    actorId: userId,
    followId: follow.id,
  });

  return NextResponse.json(
    { status: status === "PENDING" ? "pending" : "accepted" },
    { status: 201 },
  );
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ username: string }> },
) {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { username } = await params;
  const target = await resolveTarget(username);
  if (!target) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const existing = await prisma.follow.findUnique({
    where: {
      followerId_followingId: { followerId: userId, followingId: target.id },
    },
  });

  if (existing) {
    await prisma.notification.deleteMany({ where: { followId: existing.id } });
    await prisma.follow.delete({ where: { id: existing.id } });
  }

  return NextResponse.json({ status: "none" });
}
