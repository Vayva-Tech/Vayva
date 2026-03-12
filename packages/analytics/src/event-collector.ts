/**
 * Analytics Event Collector
 *
 * Server-side event ingestion with Prisma persistence.
 * Validates events against Zod schemas before writing to DB.
 * Used by the POST /api/analytics/events route.
 */

import { z } from "zod";
import { EventName } from "./events";

// ─── Prisma stub (replaced at runtime via @vayva/db) ───────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const prisma: any =
  typeof globalThis !== "undefined" &&
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (globalThis as any).__vayva_prisma
    ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (globalThis as any).__vayva_prisma
    : {
        analyticsEvent: {
          create: async () => ({}),
          createMany: async () => ({ count: 0 }),
        },
      };

// ─── Schemas ───────────────────────────────────────────────────────────────

export const CollectedEventSchema = z.object({
  eventName: z.nativeEnum(EventName),
  userId: z.string().min(1),
  storeId: z.string().min(1).optional(),
  templateId: z.string().optional(),
  properties: z.record(z.unknown()).optional().default({}),
  timestamp: z.string().datetime().optional(),
});

export type CollectedEvent = z.infer<typeof CollectedEventSchema>;

export const BatchEventsSchema = z.object({
  events: z.array(CollectedEventSchema).min(1).max(100),
});

// ─── Collector ─────────────────────────────────────────────────────────────

export class EventCollector {
  /**
   * Persist a single validated analytics event to the database.
   */
  async collect(event: CollectedEvent): Promise<void> {
    const ts = event.timestamp ? new Date(event.timestamp) : new Date();

    await prisma.analyticsEvent.create({
      data: {
        category: this.resolveCategory(event.eventName),
        action: event.eventName,
        userId: event.userId,
        storeId: event.storeId ?? null,
        metadata: {
          ...(event.properties ?? {}),
          ...(event.templateId ? { templateId: event.templateId } : {}),
        },
        timestamp: ts,
      },
    });
  }

  /**
   * Persist a batch of analytics events in a single DB round-trip.
   */
  async collectBatch(events: CollectedEvent[]): Promise<{ count: number }> {
    const rows = events.map((event) => ({
      category: this.resolveCategory(event.eventName),
      action: event.eventName,
      userId: event.userId,
      storeId: event.storeId ?? null,
      metadata: {
        ...(event.properties ?? {}),
        ...(event.templateId ? { templateId: event.templateId } : {}),
      },
      timestamp: event.timestamp ? new Date(event.timestamp) : new Date(),
    }));

    return prisma.analyticsEvent.createMany({ data: rows });
  }

  /**
   * Map an EventName to its broad category for indexing.
   */
  private resolveCategory(name: EventName): string {
    if (name.startsWith("user.") || name.startsWith("activation.")) return "auth";
    if (name.startsWith("order.") || name.startsWith("product.")) return "commerce";
    if (name.startsWith("payment.") || name.startsWith("refund.") || name.startsWith("payout.")) return "finance";
    if (name.startsWith("delivery.") || name.startsWith("ticket.")) return "ops";
    if (name.startsWith("plan.") || name.startsWith("upgrade.")) return "billing";
    if (name.startsWith("template.") || name.startsWith("onboarding.")) return "onboarding";
    return "system";
  }
}

// Singleton
export const eventCollector = new EventCollector();

/**
 * Convenience: track a single server-side event.
 */
export async function collectEvent(event: CollectedEvent): Promise<void> {
  return eventCollector.collect(event);
}

/**
 * Convenience: validate raw request body and persist as a batch.
 */
export async function collectBatchFromRequest(
  body: unknown,
): Promise<{ success: true; count: number } | { success: false; error: string }> {
  const parsed = BatchEventsSchema.safeParse(body);
  if (!parsed.success) {
    return { success: false, error: parsed.error.message };
  }
  const result = await eventCollector.collectBatch(parsed.data.events);
  return { success: true, count: result.count };
}
