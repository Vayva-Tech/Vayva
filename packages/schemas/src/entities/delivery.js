import { z } from "zod";
import { DeliveryTaskStatus } from "../enums";
export const DeliveryTaskSchema = z.object({
    id: z.string().uuid(),
    storeId: z.string().uuid(),
    orderId: z.string().uuid(),
    // Provider Info
    provider: z.enum(["Kwik", "Gokada", "Manual"]),
    trackingId: z.string().optional(),
    trackingUrl: z.string().url().optional(),
    // Status
    status: z
        .nativeEnum(DeliveryTaskStatus)
        .default(DeliveryTaskStatus.SCHEDULED),
    // Locations
    pickupAddress: z.record(z.any()), // Snapshot
    dropoffAddress: z.record(z.any()), // Snapshot
    // Cost
    estimatedCost: z.number().int().nonnegative(),
    actualCost: z.number().int().nonnegative().optional(),
    scheduledAt: z.date().optional(),
    completedAt: z.date().optional(),
    createdAt: z.date(),
    updatedAt: z.date(),
});
