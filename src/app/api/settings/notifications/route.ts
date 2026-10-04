import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/session";
import { notificationPreferencesSchema } from "@/lib/validation";

export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      notifyOnLike: true,
      notifyOnRepost: true,
      notifyOnReply: true,
      notifyOnFollow: true,
      notifyOnMessage: true,
    },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json(user);
}

export async function PATCH(request: Request) {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = notificationPreferencesSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 400 },
    );
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data: parsed.data,
    select: {
      notifyOnLike: true,
      notifyOnRepost: true,
      notifyOnReply: true,
      notifyOnFollow: true,
      notifyOnMessage: true,
    },
  });

  return NextResponse.json(user);
}
