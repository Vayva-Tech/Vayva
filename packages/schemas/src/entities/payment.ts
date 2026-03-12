import { z } from "zod";
import { ApprovalStatus } from "../enums";

export const PaymentTransactionSchema = z.object({
  id: z.string().uuid(),
  storeId: z.string().uuid(),
  orderId: z.string().uuid(),
  reference: z.string(), // Gateway reference (Paystack/Flutterwave)
  provider: z.enum(["PAYSTACK", "FLUTTERWAVE", "CASH", "TRANSFER"]),
  amount: z.number().int().nonnegative(),
  currency: z.string().default("NGN"),
  status: z.enum(["SUCCESS", "FAILED", "PENDING"]),
  metadata: z.record(z.unknown()).optional(),
  createdAt: z.date(),
});

export const RefundRequestSchema = z.object({
  id: z.string().uuid(),
  storeId: z.string().uuid(),
  orderId: z.string().uuid(),
  amount: z.number().int().positive(),
  reason: z.string(),
  status: z.nativeEnum(ApprovalStatus).default(ApprovalStatus.PENDING),
  requestedBy: z.string().uuid(),
  approvedBy: z.string().uuid().optional(),
  rejectionReason: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type PaymentTransaction = z.infer<typeof PaymentTransactionSchema>;
export type RefundRequest = z.infer<typeof RefundRequestSchema>;
