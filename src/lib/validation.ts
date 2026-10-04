import { z } from "zod";

export const signUpSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters.")
    .max(30),
  email: z.string().email("Enter a valid email address."),
  password: z.string().min(8, "Password must be at least 8 characters."),
});

export const signInSchema = z.object({
  email: z.string().email("Enter a valid email address."),
  password: z.string().min(1, "Password is required."),
});

export const updateProfileSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters.")
    .max(30)
    .optional(),
  email: z.string().email("Enter a valid email address.").optional(),
  bio: z.string().max(160, "Bio must be 160 characters or less.").optional(),
  isPrivate: z.boolean().optional(),
  avatarUrl: z
    .string()
    .max(2_000_000, "That image is too large.")
    .nullable()
    .optional(),
  bannerUrl: z
    .string()
    .max(2_000_000, "That image is too large.")
    .nullable()
    .optional(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required."),
  newPassword: z.string().min(8, "New password must be at least 8 characters."),
});

export const sendMessageSchema = z.object({
  content: z
    .string()
    .trim()
    .min(1, "Message can't be empty.")
    .max(1000, "Message is too long."),
});

export const notificationPreferencesSchema = z.object({
  notifyOnLike: z.boolean().optional(),
  notifyOnRepost: z.boolean().optional(),
  notifyOnReply: z.boolean().optional(),
  notifyOnFollow: z.boolean().optional(),
  notifyOnMessage: z.boolean().optional(),
});

export const createPostSchema = z.object({
  content: z
    .string()
    .trim()
    .min(1, "Content is required.")
    .max(500, "Posts must be 500 characters or less."),
  quotedPostId: z.string().optional(),
});
