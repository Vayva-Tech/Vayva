/**
 * Analytics Event Collector
 *
 * Server-side event ingestion with Prisma persistence.
 * The DB client is injected so this package typechecks without pulling @vayva/db into its program graph.
 */

import { z } from "zod";
import { EventName } from "./events";

/** Minimal delegate shape; pass `prisma` from @vayva/db at the app boundary. */
export type AnalyticsEventWriter = {
  analyticsEvent: {
    create: (args: {
      data: {
        category: string;
        action: string;
        userId: string | null;
        storeId: string | null;
        metadata: object;
        timestamp: Date;
      };
    }) => Promise<unknown>;
    createMany: (args: {
      data: Array<{
        category: string;
        action: string;
        userId: string | null;
        storeId: string | null;
        metadata: object;
        timestamp: Date;
      }>;
    }) => Promise<{ count: number }>;
  };
};

export const CollectedEventSchema = z.object({
  eventName: z.nativeEnum(EventName),
  userId: z.string().min(1),
  storeId: z.string().min(1).optional(),
  templateId: z.preprocess(
    (v) => (v === null || v === "" ? undefined : v),
    z.string().optional(),
  ),
  properties: z.record(z.unknown()).optional().default({}),
  timestamp: z.preprocess(
    (v) => (v === null || v === "" ? undefined : v),
    z.string().datetime().optional(),
  ),
});

export type CollectedEvent = z.infer<typeof CollectedEventSchema>;

export const BatchEventsSchema = z.object({
  events: z.array(CollectedEventSchema).min(1).max(100),
});

export class EventCollector {
  constructor(private readonly db: AnalyticsEventWriter) {}

  async collect(event: CollectedEvent): Promise<void> {
    const ts = event.timestamp ? new Date(event.timestamp) : new Date();

    await this.db.analyticsEvent.create({
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

    return this.db.analyticsEvent.createMany({ data: rows });
  }

  private resolveCategory(name: EventName): string {
    if (name.startsWith("user.") || name.startsWith("activation.")) return "auth";
    if (name.startsWith("order.") || name.startsWith("product.")) return "commerce";
    if (name.startsWith("payment.") || name.startsWith("refund.") || name.startsWith("payout."))
      return "finance";
    if (name.startsWith("delivery.") || name.startsWith("ticket.")) return "ops";
    if (name.startsWith("plan.") || name.startsWith("upgrade.")) return "billing";
    if (name.startsWith("template.") || name.startsWith("onboarding.")) return "onboarding";
    return "system";
  }
}

export async function collectEvent(
  event: CollectedEvent,
  db: AnalyticsEventWriter,
): Promise<void> {
  return new EventCollector(db).collect(event);
}

/** Persist events already validated and stamped (e.g. after IncomingBatchSchema + session storeId). Skips a second full-batch Zod pass that could spuriously reject the same shape. */
export async function persistStampedCollectedEvents(
  events: CollectedEvent[],
  db: AnalyticsEventWriter,
): Promise<{ count: number }> {
  return new EventCollector(db).collectBatch(events);
}

export async function collectBatchFromRequest(
  body: unknown,
  db: AnalyticsEventWriter,
): Promise<{ success: true; count: number } | { success: false; error: string }> {
  const parsed = BatchEventsSchema.safeParse(body);
  if (!parsed.success) {
    return { success: false, error: parsed.error.message };
  }
  const collector = new EventCollector(db);
  const result = await collector.collectBatch(parsed.data.events);
  return { success: true, count: result.count };
}
