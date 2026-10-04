-- AlterTable
ALTER TABLE "User" ADD COLUMN     "notifyOnFollow" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "notifyOnLike" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "notifyOnMessage" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "notifyOnReply" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "notifyOnRepost" BOOLEAN NOT NULL DEFAULT true;
