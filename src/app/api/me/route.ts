import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/session";
import { updateProfileSchema } from "@/lib/validation";

export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      username: true,
      email: true,
      bio: true,
      isPrivate: true,
      avatarUrl: true,
      bannerUrl: true,
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
  const parsed = updateProfileSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 400 },
    );
  }

  const { username, email, bio, isPrivate, avatarUrl, bannerUrl } = parsed.data;

  if (username || email) {
    const existing = await prisma.user.findFirst({
      where: {
        AND: [
          { id: { not: userId } },
          {
            OR: [
              ...(username ? [{ username }] : []),
              ...(email ? [{ email }] : []),
            ],
          },
        ],
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "That username or email is already taken." },
        { status: 409 },
      );
    }
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      ...(username !== undefined && { username }),
      ...(email !== undefined && { email }),
      ...(bio !== undefined && { bio }),
      ...(isPrivate !== undefined && { isPrivate }),
      ...(avatarUrl !== undefined && { avatarUrl }),
      ...(bannerUrl !== undefined && { bannerUrl }),
    },
    select: {
      username: true,
      email: true,
      bio: true,
      isPrivate: true,
      avatarUrl: true,
      bannerUrl: true,
    },
  });

  return NextResponse.json(user);
}
