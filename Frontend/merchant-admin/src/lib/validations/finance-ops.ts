import { z } from "zod";

export const ShipmentQuerySchema = z.object({
  limit: z.coerce.number().min(1).max(100).default(50),
  offset: z.coerce.number().min(0).default(0),
  status: z
    .enum(["PENDING", "processing", "shipped", "delivered", "cancelled", "ALL"])
    .optional(),
  issue: z.enum(["delayed", "lost", "damaged", "none", "ALL"]).optional(),
});

export const PayoutCreateSchema = z.object({
  amount: z.number().positive("Amount must be positive"),
  currency: z.string().default("NGN"),
  bankDetails: z.object({
    accountNumber: z.string().min(10),
    bankCode: z.string(),
    accountName: z.string(),
  }),
});
