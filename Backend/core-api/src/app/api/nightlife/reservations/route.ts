import { NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma, Prisma } from "@vayva/db";
import { startOfDay, endOfDay } from "date-fns";
import { logger } from "@/lib/logger";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getOptionalString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function getOptionalNumber(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value)
    ? value
    : undefined;
}

function getOptionalArray(value: unknown): unknown[] | undefined {
  return Array.isArray(value) ? value : undefined;
}

function getObject(value: unknown): Record<string, unknown> {
  return isRecord(value) ? value : {};
}

function toBottleJsonArray(
  value: unknown[] | undefined,
): Array<Record<string, unknown>> | undefined {
  if (!value) return undefined;

  const out: Array<Record<string, unknown>> = [];
  for (const item of value) {
    if (!isRecord(item)) continue;
    const price = Number(item.price);
    const quantity = Number(item.quantity);
    const name = getOptionalString(item.name);

    out.push({
      price: Number.isFinite(price) ? price : 0,
      quantity: Number.isFinite(quantity) ? quantity : 1,
      ...(name ? { name } : {}),
    });
  }

  return out;
}

export const GET = withVayvaAPI(
  PERMISSIONS.ORDERS_VIEW,
  async (req, { storeId }) => {
    try {
      const { searchParams } = new URL(req.url);
      const filter = searchParams.get("filter") || "tonight";

      // Get reservations from bookings table
      const now = new Date();
      let dateFilter: Prisma.BookingWhereInput = {};

      switch (filter) {
        case "tonight":
          dateFilter = {
            startsAt: {
              gte: startOfDay(now),
              lte: endOfDay(now),
            },
          };
          break;
        case "upcoming":
          dateFilter = {
            startsAt: {
              gt: endOfDay(now),
            },
          };
          break;
        case "past":
          dateFilter = {
            startsAt: {
              lt: startOfDay(now),
            },
          };
          break;
        default:
          dateFilter = {};
      }

      const bookings = await prisma.booking.findMany({
        where: {
          storeId,
          ...dateFilter,
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
          service: {
            select: { title: true, metadata: true },
          },
        },
        orderBy: { startsAt: "asc" },
      });

      const reservations = bookings.map((booking) => {
        const metadata = isRecord(booking.metadata) ? booking.metadata : {};
        const serviceMetadata = isRecord(booking.service?.metadata)
          ? booking.service.metadata
          : {};

        const guestNameFromMetadata = getOptionalString(metadata.guestName);
        const guestPhoneFromMetadata = getOptionalString(metadata.guestPhone);
        const guestEmailFromMetadata = getOptionalString(metadata.guestEmail);
        const tableNameFromMetadata = getOptionalString(metadata.tableName);
        const tableTypeFromMetadata =
          getOptionalString(serviceMetadata.tableType) ??
          getOptionalString(metadata.tableType);
        const partySizeFromMetadata = getOptionalNumber(metadata.partySize);
        const minimumSpendFromMetadata =
          getOptionalNumber(serviceMetadata.minimumSpend) ??
          getOptionalNumber(metadata.minimumSpend);
        const bottlesFromMetadata = getOptionalArray(metadata.bottles);
        const totalAmountFromMetadata = getOptionalNumber(metadata.totalAmount);
        const specialRequestsFromMetadata = getOptionalString(
          metadata.specialRequests,
        );

        return {
          id: booking.id,
          guestName: booking.customer
            ? `${booking.customer.firstName || ""} ${booking.customer.lastName || ""}`.trim()
            : guestNameFromMetadata || "Guest",
          guestPhone: booking.customer?.phone || guestPhoneFromMetadata || "",
          guestEmail: booking.customer?.email || guestEmailFromMetadata || "",
          tableName: booking.service?.title || tableNameFromMetadata || "Table",
          tableType: tableTypeFromMetadata || "Standard",
          date: booking.startsAt.toISOString().split("T")[0],
          time: booking.startsAt.toTimeString().substring(0, 5),
          partySize: partySizeFromMetadata || 2,
          minimumSpend: minimumSpendFromMetadata || 0,
          bottles: bottlesFromMetadata || [],
          totalAmount: totalAmountFromMetadata || 0,
          status: booking.status,
          specialRequests: specialRequestsFromMetadata || booking.notes || "",
          createdAt: booking.createdAt.toISOString(),
        };
      });

      return NextResponse.json(reservations, {
        headers: {
          "Cache-Control": "no-store",
        },
      });
    } catch (error: unknown) {
      logger.error("[NIGHTLIFE_RESERVATIONS_GET]", error, { storeId });
      return NextResponse.json(
        { error: "Internal Server Error" },
        { status: 500 },
      );
    }
  },
);

export const POST = withVayvaAPI(
  PERMISSIONS.ORDERS_MANAGE,
  async (req, { storeId }) => {
    try {
      const body: unknown = await req.json().catch(() => ({}));
      const b = isRecord(body) ? body : {};

      const guestName = getOptionalString(b.guestName);
      const guestPhone = getOptionalString(b.guestPhone);
      const guestEmail = getOptionalString(b.guestEmail);
      const tableId = getOptionalString(b.tableId);
      const date = getOptionalString(b.date);
      const time = getOptionalString(b.time);
      const partySize = getOptionalNumber(b.partySize);
      const bottles = getOptionalArray(b.bottles);
      const specialRequests = getOptionalString(b.specialRequests);

      if (!guestName || !guestPhone || !tableId || !date) {
        return NextResponse.json(
          { error: "Missing required fields" },
          { status: 400 },
        );
      }

      // Get table info
      const table = await prisma.product.findFirst({
        where: { id: tableId, storeId, productType: "SERVICE" },
      });

      if (!table) {
        return NextResponse.json({ error: "Table not found" }, { status: 404 });
      }

      const tableMetadata = getObject(table.metadata);
      const minimumSpend = Number(tableMetadata.minimumSpend) || 0;

      // Calculate total from bottles
      let bottlesTotal = 0;
      const bottlesJson = toBottleJsonArray(bottles);
      if (bottles && bottles.length > 0) {
        for (const bottle of bottles) {
          if (!isRecord(bottle)) continue;
          const price = Number(bottle.price) || 0;
          const quantity = Number(bottle.quantity) || 1;
          bottlesTotal += price * quantity;
        }
      }

      const totalAmount = Math.max(bottlesTotal, minimumSpend);

      // Create booking
      const startsAt = new Date(`${date}T${time || "22:00"}:00`);
      const endsAt = new Date(startsAt.getTime() + 4 * 60 * 60 * 1000); // 4 hours

      const booking = await prisma.booking.create({
        data: {
          storeId,
          serviceId: tableId,
          startsAt,
          endsAt,
          status: "PENDING",
          notes: specialRequests,
          metadata: {
            guestName,
            guestPhone,
            guestEmail,
            partySize,
            bottles: bottlesJson,
            totalAmount,
            minimumSpend,
            specialRequests,
          } as Prisma.InputJsonValue,
        },
      });

      return NextResponse.json({ success: true, id: booking.id });
    } catch (error: unknown) {
      logger.error("[NIGHTLIFE_RESERVATIONS_POST]", error, { storeId });
      return NextResponse.json(
        { error: "Internal Server Error" },
        { status: 500 },
      );
    }
  },
);
