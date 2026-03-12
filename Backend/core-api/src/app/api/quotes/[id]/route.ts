import { NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma, BookingStatus } from "@vayva/db";

import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function parseBookingStatus(value: unknown): BookingStatus | undefined {
  if (typeof value !== "string") return undefined;
  const normalized = value.toUpperCase();
  return (Object.values(BookingStatus) as string[]).includes(normalized)
    ? (normalized as BookingStatus)
    : undefined;
}

export const GET = withVayvaAPI(
  PERMISSIONS.ORDERS_VIEW,
  async (req, { storeId, params }) => {
    const { id } = await params;
    try {
      if (!id)
        return NextResponse.json({ error: "ID required" }, { status: 400 });

      const quote = await prisma.booking.findFirst({
        where: {
          id,
          storeId,
          metadata: {
            path: ["type"],
            equals: "quote_request",
          },
        },
      });

      if (!quote) {
        return NextResponse.json({ error: "Quote not found" }, { status: 404 });
      }

      const meta = isRecord(quote.metadata) ? quote.metadata : {};
      return NextResponse.json(
        {
          quote: {
            id: quote.id,
            quoteNumber: meta?.quoteNumber,
            companyName: meta?.companyName,
            contactName: meta?.contactName,
            contactEmail: meta?.contactEmail,
            contactPhone: meta?.contactPhone,
            items: meta?.items || [],
            total: meta?.total || 0,
            status: quote.status,
            notes: quote.notes,
            validUntil: quote.endsAt,
            createdAt: quote.createdAt,
          },
        },
        {
          headers: {
            "Cache-Control": "no-store",
          },
        },
      );
    } catch (error: unknown) {
      logger.error("[QUOTE_GET_BY_ID]", error, { storeId, quoteId: id });
      return NextResponse.json(
        { error: "Internal Server Error" },
        { status: 500 },
      );
    }
  },
);

export const PATCH = withVayvaAPI(
  PERMISSIONS.ORDERS_MANAGE,
  async (req, { storeId, params, user }) => {
    const { id } = await params;
    try {
      if (!id)
        return NextResponse.json({ error: "ID required" }, { status: 400 });
      const parsedBody: unknown = await req.json().catch(() => ({}));
      const body = isRecord(parsedBody) ? parsedBody : {};
      const status = parseBookingStatus(body.status);
      const notes = getString(body.notes);

      const existing = await prisma.booking.findFirst({
        where: {
          id,
          storeId,
          metadata: {
            path: ["type"],
            equals: "quote_request",
          },
        },
      });

      if (!existing) {
        return NextResponse.json({ error: "Quote not found" }, { status: 404 });
      }

      const quote = await prisma.booking.update({
        where: { id },
        data: {
          ...(status && { status }),
          ...(notes !== undefined && { notes }),
        },
      });

      return NextResponse.json({ quote });
    } catch (error: unknown) {
      logger.error("[QUOTE_PATCH]", error, {
        storeId,
        quoteId: id,
        userId: user.id,
      });
      return NextResponse.json(
        { error: "Internal Server Error" },
        { status: 500 },
      );
    }
  },
);

export const DELETE = withVayvaAPI(
  PERMISSIONS.ORDERS_MANAGE,
  async (req, { storeId, params, user }) => {
    const { id } = await params;
    try {
      if (!id)
        return NextResponse.json({ error: "ID required" }, { status: 400 });

      const existing = await prisma.booking.findFirst({
        where: {
          id,
          storeId,
          metadata: {
            path: ["type"],
            equals: "quote_request",
          },
        },
      });

      if (!existing) {
        return NextResponse.json({ error: "Quote not found" }, { status: 404 });
      }

      await prisma.booking.delete({
        where: { id },
      });

      return NextResponse.json({ success: true });
    } catch (error: unknown) {
      logger.error("[QUOTE_DELETE]", error, {
        storeId,
        quoteId: id,
        userId: user.id,
      });
      return NextResponse.json(
        { error: "Internal Server Error" },
        { status: 500 },
      );
    }
  },
);
