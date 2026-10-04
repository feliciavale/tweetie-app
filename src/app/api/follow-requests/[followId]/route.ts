import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/session";
import { createNotification } from "@/lib/notify";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ followId: string }> },
) {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { followId } = await params;

  const follow = await prisma.follow.findUnique({ where: { id: followId } });
  if (!follow || follow.followingId !== userId) {
    return NextResponse.json(
      { error: "Follow request not found" },
      { status: 404 },
    );
  }

  await prisma.follow.update({
    where: { id: followId },
    data: { status: "ACCEPTED" },
  });
  await prisma.notification.deleteMany({
    where: { followId, type: "follow_request" },
  });
  await createNotification({
    type: "follow",
    recipientId: follow.followerId,
    actorId: userId,
    followId: follow.id,
  });

  return NextResponse.json({ status: "accepted" });
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ followId: string }> },
) {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { followId } = await params;

  const follow = await prisma.follow.findUnique({ where: { id: followId } });
  if (!follow || follow.followingId !== userId) {
    return NextResponse.json(
      { error: "Follow request not found" },
      { status: 404 },
    );
  }

  await prisma.notification.deleteMany({ where: { followId } });
  await prisma.follow.delete({ where: { id: followId } });

  return NextResponse.json({ status: "declined" });
}
