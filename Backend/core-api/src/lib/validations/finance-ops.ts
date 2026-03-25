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
  // Amount in NGN (not kobo)
  amount: z.number().positive("Amount must be positive"),
  currency: z.string().default("NGN"),
  // Affiliate payouts are typically instant; allow manual as a fallback.
  instant: z.boolean().optional().default(true),
  bankDetails: z.object({
    accountNumber: z.string().min(10),
    bankCode: z.string(),
    accountName: z.string(),
    // Optional optimization: if already created and stored client-side.
    recipientCode: z.string().optional(),
  }),
});
