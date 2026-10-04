import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/session";
import { sendMessageSchema } from "@/lib/validation";
import { createNotification } from "@/lib/notify";
import { sendToUser } from "@/lib/eventbus";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ username: string }> },
) {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { username } = await params;

  const other = await prisma.user.findUnique({
    where: { username },
    select: { id: true, username: true },
  });

  if (!other) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const messages = await prisma.message.findMany({
    where: {
      OR: [
        { senderId: userId, receiverId: other.id },
        { senderId: other.id, receiverId: userId },
      ],
    },
    orderBy: { createdAt: "asc" },
  });

  await prisma.message.updateMany({
    where: { senderId: other.id, receiverId: userId, readAt: null },
    data: { readAt: new Date() },
  });

  const formatted = messages.map((m) => ({
    id: m.id,
    content: m.content,
    timestamp: m.createdAt.toISOString(),
    fromMe: m.senderId === userId,
  }));

  return NextResponse.json({ username: other.username, messages: formatted });
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

  const other = await prisma.user.findUnique({
    where: { username },
    select: { id: true },
  });

  if (!other) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  if (other.id === userId) {
    return NextResponse.json(
      { error: "You can't message yourself." },
      { status: 400 },
    );
  }

  const body = await req.json();
  const parsed = sendMessageSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 400 },
    );
  }

  const message = await prisma.message.create({
    data: {
      content: parsed.data.content,
      senderId: userId,
      receiverId: other.id,
    },
  });

  const sender = await prisma.user.findUnique({
    where: { id: userId },
    select: { username: true },
  });

  sendToUser(other.id, "message", {
    senderUsername: sender?.username,
    message: {
      id: message.id,
      content: message.content,
      timestamp: message.createdAt.toISOString(),
      fromMe: false,
    },
  });

  await createNotification({
    type: "message",
    recipientId: other.id,
    actorId: userId,
  });

  return NextResponse.json(
    {
      id: message.id,
      content: message.content,
      timestamp: message.createdAt.toISOString(),
      fromMe: true,
    },
    { status: 201 },
  );
}
