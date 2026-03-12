import { z } from "zod";

export const PayoutSchema = z.object({
  id: z.string().uuid(),
  storeId: z.string().uuid(),
  amount: z.number().int().positive(),
  currency: z.string().default("NGN"),
  status: z.enum(["PENDING", "PROCESSING", "PAID", "FAILED"]),
  bankAccountSnapshot: z.object({
    bankName: z.string(),
    accountNumber: z.string(),
    accountName: z.string(),
  }),
  reference: z.string().optional(), // Internal or provider ref
  metadata: z.record(z.unknown()).optional(),
  processedAt: z.date().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Payout = z.infer<typeof PayoutSchema>;
