import { NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger } from "@/lib/logger";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

export const GET = withVayvaAPI(
  PERMISSIONS.ORDERS_VIEW,
  async (req, { storeId }) => {
    try {
      const viewings = await prisma.booking.findMany({
        where: {
          storeId,
          service: {
            productType: "SERVICE",
            metadata: {
              path: ["type"],
              equals: "TOUR",
            },
          },
        },
        include: {
          customer: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
            },
          },
          service: true,
        },
        orderBy: { startsAt: "desc" },
      });

      return NextResponse.json(
        { data: viewings },
        {
          headers: {
            "Cache-Control": "no-store",
          },
        },
      );
    } catch (error: unknown) {
      logger.error("[PROPERTIES_VIEWINGS_GET]", error, { storeId });
      return NextResponse.json(
        { error: "Internal Server Error" },
        { status: 500 },
      );
    }
  },
);

export const POST = withVayvaAPI(
  PERMISSIONS.ORDERS_MANAGE,
  async (req, { storeId, user }) => {
    try {
      const parsedBody: unknown = await req.json().catch(() => ({}));
      const body = isRecord(parsedBody) ? parsedBody : {};

      const propertyId = getString(body.propertyId);
      const customerId = getString(body.customerId);
      const date = getString(body.date);
      const time = getString(body.time);
      const notes = getString(body.notes);

      if (!propertyId || !date) {
        return NextResponse.json(
          { error: "Property and date required" },
          { status: 400 },
        );
      }

      const startsAt = new Date(`${date}T${time || "10:00"}:00`);
      const endsAt = new Date(startsAt.getTime() + 60 * 60 * 1000); // 1 hour

      const viewing = await prisma.booking.create({
        data: {
          storeId,
          serviceId: propertyId,
          customerId: customerId || null,
          startsAt,
          endsAt,
          status: "PENDING",
          notes: notes || "",
          metadata: {
            type: "TOUR",
          },
        },
      });

      return NextResponse.json(
        { success: true, data: viewing },
        { status: 201 },
      );
    } catch (error: unknown) {
      logger.error("[PROPERTIES_VIEWINGS_POST]", error, {
        storeId,
        userId: user.id,
      });
      return NextResponse.json(
        { error: "Internal Server Error" },
        { status: 500 },
      );
    }
  },
);
