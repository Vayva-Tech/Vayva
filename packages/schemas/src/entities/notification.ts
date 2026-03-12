import { z } from "zod";
import { NotificationType } from "../enums";

export const NotificationSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  storeId: z.string().uuid().optional(), // If store-specific

  type: z.nativeEnum(NotificationType),
  title: z.string(),
  message: z.string(),

  resourceId: z.string().uuid().optional(), // e.g. Order ID
  resourceType: z.string().optional(), // 'Order', 'Approval', etc.

  isRead: z.boolean().default(false),
  readAt: z.date().optional(),

  createdAt: z.date(),
});

export type Notification = z.infer<typeof NotificationSchema>;
