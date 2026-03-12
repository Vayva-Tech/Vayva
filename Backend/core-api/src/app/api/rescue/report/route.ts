import { NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { MerchantRescueService } from "@/lib/rescue/merchant-rescue-service";
import { logger } from "@/lib/logger";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

export const POST = withVayvaAPI(
  PERMISSIONS.SUPPORT_MANAGE,
  async (req, { storeId, user }) => {
    try {
      const parsedBody: unknown = await req.json().catch(() => ({}));
      const body = isRecord(parsedBody) ? parsedBody : {};
      const route = getString(body.route);
      const errorMessage = getString(body.errorMessage);
      const stackHash = getString(body.stackHash);
      const fingerprint = getString(body.fingerprint);
      if (!errorMessage) {
        return NextResponse.json(
          { error: "No error message" },
          { status: 400 },
        );
      }
      const incident = await MerchantRescueService.reportIncident({
        route: route || "unknown",
        errorMessage,
        stackHash,
        fingerprint,
        storeId,
        userId: user.id,
      });
      return NextResponse.json({
        incidentId: incident.id,
        status: incident.status,
        message: "Rescue initiated",
      });
    } catch (error) {
      logger.error("[RESCUE_REPORT_POST]", error, { storeId, userId: user.id });
      return NextResponse.json({ error: "Failed to report" }, { status: 500 });
    }
  },
);
