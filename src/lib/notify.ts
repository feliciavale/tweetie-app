import { prisma } from "./prisma";
import { sendToUser } from "./eventbus";

type NotifyType =
  "like" | "repost" | "reply" | "follow" | "follow_request" | "message";

interface NotifyParams {
  type: NotifyType;
  recipientId: string;
  actorId: string;
  postId?: string;
  followId?: string;
}

async function isAllowed(
  type: NotifyType,
  recipientId: string,
): Promise<boolean> {
  // A follow request is the only way to see and act on a pending request to a
  // private account, so it always notifies — muting "New followers" shouldn't
  // block approving requests.
  if (type === "follow_request") return true;

  const recipient = await prisma.user.findUnique({
    where: { id: recipientId },
    select: {
      notifyOnLike: true,
      notifyOnRepost: true,
      notifyOnReply: true,
      notifyOnFollow: true,
      notifyOnMessage: true,
    },
  });

  if (!recipient) return false;

  switch (type) {
    case "like":
      return recipient.notifyOnLike;
    case "repost":
      return recipient.notifyOnRepost;
    case "reply":
      return recipient.notifyOnReply;
    case "follow":
      return recipient.notifyOnFollow;
    case "message":
      return recipient.notifyOnMessage;
  }
}

export async function createNotification({
  type,
  recipientId,
  actorId,
  postId,
  followId,
}: NotifyParams) {
  if (recipientId === actorId) return;
  if (!(await isAllowed(type, recipientId))) return;

  await prisma.notification.create({
    data: { type, recipientId, actorId, postId, followId },
  });

  const count = await prisma.notification.count({
    where: { recipientId, read: false },
  });

  sendToUser(recipientId, "notification", { count });
}
