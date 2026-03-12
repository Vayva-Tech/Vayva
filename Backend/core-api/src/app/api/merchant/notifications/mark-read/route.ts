import { NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

export const POST = withVayvaAPI(
  PERMISSIONS.NOTIFICATIONS_MANAGE,
  async (req) => {
    try {
      const parsedBody: unknown = await req.json().catch(() => ({}));
      const body = isRecord(parsedBody) ? parsedBody : {};
      const notificationId = getString(body.notificationId);

      if (!notificationId) {
        return NextResponse.json(
          { error: "notificationId required" },
          { status: 400 },
        );
      }

      return NextResponse.json(
        { error: "Gone", message: "Moved to /api/notifications/mark-read" },
        { status: 410 },
      );
    } catch {
      return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
  },
);
