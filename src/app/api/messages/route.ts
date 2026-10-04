import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/session";

export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const messages = await prisma.message.findMany({
    where: { OR: [{ senderId: userId }, { receiverId: userId }] },
    orderBy: { createdAt: "desc" },
    include: {
      sender: { select: { username: true } },
      receiver: { select: { username: true } },
    },
  });

  const conversations = new Map<
    string,
    { username: string; preview: string; timestamp: string; unread: boolean }
  >();

  for (const m of messages) {
    const otherUsername =
      m.senderId === userId ? m.receiver.username : m.sender.username;

    if (!conversations.has(otherUsername)) {
      conversations.set(otherUsername, {
        username: otherUsername,
        preview: m.content,
        timestamp: m.createdAt.toISOString(),
        unread: m.receiverId === userId && m.readAt === null,
      });
    }
  }

  return NextResponse.json({
    conversations: Array.from(conversations.values()),
  });
}
