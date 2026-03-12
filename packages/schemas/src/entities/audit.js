import { z } from "zod";
export const AuditEventSchema = z.object({
    id: z.string().uuid(),
    storeId: z.string().uuid().optional(),
    userId: z.string().uuid().optional(), // Null if system action
    action: z.string(), // e.g. 'order.create', 'setting.update'
    resourceId: z.string().uuid().optional(),
    resourceType: z.string().optional(),
    before: z.record(z.any()).optional(), // JSON snapshot
    after: z.record(z.any()).optional(), // JSON snapshot
    ipAddress: z.string().ip().optional(),
    userAgent: z.string().optional(),
    timestamp: z.date(),
});
