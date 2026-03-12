import { NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

export const POST = withVayvaAPI(
  PERMISSIONS.NOTIFICATIONS_MANAGE,
  async (req, { storeId }) => {
    try {
      const parsedBody: unknown = await req.json().catch(() => ({}));
      const body = isRecord(parsedBody) ? parsedBody : {};
      const notificationId = getString(body.notificationId);

      if (!notificationId || typeof notificationId !== "string") {
        return NextResponse.json(
          { error: "notificationId required" },
          { status: 400 },
        );
      }

      const updated = await prisma.notification.updateMany({
        where: { id: notificationId, storeId, readAt: null },
        data: { readAt: new Date() },
      });

      if (updated.count === 0) {
        return NextResponse.json(
          { error: "Notification not found" },
          { status: 404 },
        );
      }

      return NextResponse.json({ success: true, id: notificationId });
    } catch {
      return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
  },
);
