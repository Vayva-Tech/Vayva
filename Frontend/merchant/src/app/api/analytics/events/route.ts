import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI, type APIContext } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import {
  CollectedEventSchema,
  persistStampedCollectedEvents,
  type CollectedEvent,
} from "@vayva/analytics";
import { prisma } from "@vayva/db";
import { logger } from "@/lib/logger";
import { z } from "zod";

const IncomingBatchSchema = z.object({
  events: z
    .array(
      CollectedEventSchema.omit({ storeId: true }).extend({
        storeId: z.string().optional(),
      }),
    )
    .min(1)
    .max(100),
});

/**
 * Browser analytics batch: persist on the merchant app with the same DB as core
 * (`@vayva/db` on merchant). Avoids brittle BFF→core session forwarding.
 */
export const POST = withVayvaAPI(
  PERMISSIONS.DASHBOARD_VIEW,
  async (req: NextRequest, { storeId }: APIContext) => {
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

      const stampedEvents: CollectedEvent[] = parsed.data.events.map((e) => ({
        ...e,
        storeId,
      }));

      const { count } = await persistStampedCollectedEvents(stampedEvents, prisma);

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
