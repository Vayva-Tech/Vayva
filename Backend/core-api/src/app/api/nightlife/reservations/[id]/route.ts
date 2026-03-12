import { NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma, BookingStatus } from "@vayva/db";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function _getString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function parseBookingStatus(value: unknown): BookingStatus | undefined {
  if (typeof value !== "string") return undefined;
  const normalized = value.toUpperCase();
  return (Object.values(BookingStatus) as string[]).includes(normalized)
    ? (normalized as BookingStatus)
    : undefined;
}

export const PATCH = withVayvaAPI(
  PERMISSIONS.ORDERS_MANAGE,
  async (req, { storeId, params }) => {
    const { id } = await params;
    try {
      const parsedBody: unknown = await req.json().catch(() => ({}));
      const body = isRecord(parsedBody) ? parsedBody : {};
      const status = parseBookingStatus(body.status);

      if (!status) {
        return NextResponse.json(
          { error: "Status required or invalid" },
          { status: 400 },
        );
      }

      // Verify booking belongs to store
      const booking = await prisma.booking.findFirst({
        where: { id, storeId },
      });

      if (!booking) {
        return NextResponse.json(
          { error: "Reservation not found" },
          { status: 404 },
        );
      }

      // Update status
      const updated = await prisma.booking.update({
        where: { id },
        data: { status },
      });

      return NextResponse.json({ success: true, booking: updated });
    } catch (error: unknown) {
      logger.error("[NIGHTLIFE_RESERVATIONS_ID_PATCH]", error, { storeId });
      return NextResponse.json(
        { error: "Internal Server Error" },
        { status: 500 },
      );
    }
  },
);
