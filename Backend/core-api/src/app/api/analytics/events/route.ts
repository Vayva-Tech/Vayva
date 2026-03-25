/**
 * POST /api/analytics/events
 *
 * Receives batched client-side analytics events and persists them via
 * the EventCollector service.  Authentication is handled by withVayvaAPI
 * so every event is stamped with the authenticated storeId.
 */

import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI, APIContext } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import {
  CollectedEventSchema,
  persistStampedCollectedEvents,
  type CollectedEvent
} from "@vayva/analytics";
import { logger } from "@/lib/logger";
import { z } from "zod";

// Re-use the batch schema but override storeId injection from session
const IncomingBatchSchema = z.object({
  events: z
    .array(
      CollectedEventSchema.omit({ storeId: true }).extend({
        storeId: z.string().optional(), // will be overridden by session storeId
      }),
    )
    .min(1)
    .max(100),
});

export const POST = withVayvaAPI(
  PERMISSIONS.DASHBOARD_VIEW,
  async (req: NextRequest, { storeId, db }: APIContext) => {
    try {
      const body = await req.json().catch(() => null);

      if (!body) {
        return NextResponse.json(
          { success: false, error: "Invalid JSON body" },
          { status: 400 },
        );
      }

      const parsed = IncomingBatchSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json(
          { success: false, error: parsed.error.message },
          { status: 422 },
        );
      }

      // Stamp every event with the authenticated storeId
      const stampedEvents: CollectedEvent[] = parsed.data.events.map((e) => ({
        ...e,
        storeId,
      }));

      const { count } = await persistStampedCollectedEvents(stampedEvents, db);

      return NextResponse.json({ success: true, count }, { status: 200 });
    } catch (error) {
      logger.error("[ANALYTICS_EVENTS] Unexpected error", {
        error: error instanceof Error ? error.message : String(error),
        storeId,
      });
      return NextResponse.json(
        { success: false, error: "Internal server error" },
        { status: 500 },
      );
    }
  },
);
