import { NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { OrderStatus, prisma } from "@vayva/db";

import { logger } from "@/lib/logger";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getOptionalString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

export const GET = withVayvaAPI(
  PERMISSIONS.PRODUCTS_VIEW,
  async (req, { storeId }) => {
    try {
      // Get events (stored as products with productType = 'event')
      const events = await prisma.product.findMany({
        where: { storeId, productType: "event" },
        include: {
          productImages: {
            orderBy: { position: "asc" },
            take: 1,
          },
          productVariants: true, // Ticket types stored as variants
        },
        orderBy: { createdAt: "desc" },
      });

      // Get ticket sales for each event
      const eventIds = events.map((e) => e.id);
      const ticketSales = await prisma.orderItem.groupBy({
        by: ["productId"],
        where: {
          productId: { in: eventIds },
          order: {
            status: { in: [OrderStatus.DELIVERED, OrderStatus.PROCESSING] },
          },
        },
        _sum: { quantity: true },
      });

      const salesMap = new Map(
        ticketSales.map((s) => [s.productId, s._sum?.quantity || 0]),
      );

      const formattedEvents = events.map((event) => {
        const metadata = isRecord(event.metadata) ? event.metadata : {};
        const eventDate = new Date(
          String(metadata.eventDate || event.createdAt),
        );
        const now = new Date();

        let displayStatus: string = event.status;
        if (eventDate < now) displayStatus = "PAST";

        const eventDateValue =
          getOptionalString(metadata.eventDate) ??
          event.createdAt.toISOString();
        const eventTimeValue = getOptionalString(metadata.eventTime) ?? "22:00";
        const venueValue = getOptionalString(metadata.venue) ?? "TBD";

        return {
          id: event.id,
          title: event.title,
          description: event.description,
          eventDate: eventDateValue,
          eventTime: eventTimeValue,
          venue: venueValue,
          image: event.productImages?.[0]?.url || null,
          ticketsSold: salesMap.get(event.id) || 0,
          ticketTypes: event.productVariants.map((v) => ({
            name: v.title,
            price: Number(v.price),
            available: 0,
          })),
          status: displayStatus,
        };
      });

      return NextResponse.json(formattedEvents, {
        headers: {
          "Cache-Control": "no-store",
        },
      });
    } catch (error: unknown) {
      logger.error("[NIGHTLIFE_EVENTS_GET]", error, { storeId });
      return NextResponse.json(
        { error: "Internal Server Error" },
        { status: 500 },
      );
    }
  },
);

export const POST = withVayvaAPI(
  PERMISSIONS.PRODUCTS_MANAGE,
  async (req, { storeId }) => {
    try {
      const body: unknown = await req.json().catch(() => ({}));
      const bodyRecord = isRecord(body) ? body : {};

      const title = getOptionalString(bodyRecord.title);
      const description = getOptionalString(bodyRecord.description);
      const eventDate = getOptionalString(bodyRecord.eventDate);
      const eventTime = getOptionalString(bodyRecord.eventTime);
      const venue = getOptionalString(bodyRecord.venue);

      const address = getOptionalString(bodyRecord.address);
      const dressCode = getOptionalString(bodyRecord.dressCode);
      const ageLimit = getOptionalString(bodyRecord.ageLimit);
      const musicGenre = getOptionalString(bodyRecord.musicGenre);

      const imagesRaw = Array.isArray(bodyRecord.images)
        ? bodyRecord.images
        : [];
      const images = imagesRaw.map((u) => String(u || "")).filter(Boolean);

      const ticketTypesRaw = Array.isArray(bodyRecord.ticketTypes)
        ? bodyRecord.ticketTypes
        : [];
      const ticketTypes = ticketTypesRaw.filter(isRecord);

      if (!title || !eventDate || !eventTime || !venue) {
        return NextResponse.json(
          { error: "Missing required fields" },
          { status: 400 },
        );
      }

      // Create event as a product
      const event = await prisma.product.create({
        data: {
          storeId,
          title,
          description: description || "",
          handle: `${title.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}`,
          productType: "event",
          status: "ACTIVE",
          price: Number(ticketTypes[0]?.price || 0),
          metadata: {
            eventDate,
            eventTime,
            venue,
            address,
            dressCode,
            ageLimit,
            musicGenre,
          },
          productImages:
            images.length > 0
              ? {
                  create: images.map((url, i) => ({
                    url,
                    position: i,
                  })),
                }
              : undefined,
          productVariants:
            ticketTypes.length > 0
              ? {
                  create: ticketTypes.map((t, i) => {
                    const name = getOptionalString(t.name) ?? `Ticket ${i + 1}`;
                    const price = Number(t.price || 0);
                    const skuName =
                      getOptionalString(t.name)?.toUpperCase() ?? String(i);
                    return {
                      storeId,
                      title: name,
                      price,
                      sku: `${title.substring(0, 3).toUpperCase()}-${skuName}`,
                      options: {},
                      position: i,
                    };
                  }),
                }
              : undefined,
        },
      });

      return NextResponse.json({ success: true, id: event.id });
    } catch (error: unknown) {
      logger.error("[NIGHTLIFE_EVENTS_POST]", error, { storeId });
      return NextResponse.json(
        { error: "Internal Server Error" },
        { status: 500 },
      );
    }
  },
);
