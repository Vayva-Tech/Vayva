import { z } from "zod";
import { Role } from "../enums";

export const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  fullName: z.string().min(2),
  phone: z.string().optional(), // E.164 format
  avatarUrl: z.string().url().optional(),
  isEmailVerified: z.boolean().default(false),
  isPhoneVerified: z.boolean().default(false),
  createdAt: z.date(),
  updatedAt: z.date(),
  lastLoginAt: z.date().optional(),
});

export const MembershipSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  storeId: z.string().uuid(),
  role: z.nativeEnum(Role),
  invitedBy: z.string().uuid().optional(), // UserId
  createdAt: z.date(),
});

export type User = z.infer<typeof UserSchema>;
export type Membership = z.infer<typeof MembershipSchema>;
