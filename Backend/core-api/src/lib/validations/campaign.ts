import { z } from "zod";

export const CampaignCreateSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  goalAmount: z.number().positive("Goal amount must be positive"),
  endDate: z.string().datetime().optional(),
  tiers: z
    .array(
      z.object({
        name: z.string(),
        amount: z.number().positive(),
        description: z.string().optional(),
      }),
    )
    .optional(),
});
