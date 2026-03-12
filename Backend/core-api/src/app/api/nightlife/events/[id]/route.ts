import { NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { OrderStatus, prisma } from "@vayva/db";

import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getOptionalString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function getOptionalNumber(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const n = Number(value);
    return Number.isFinite(n) ? n : undefined;
  }
  return undefined;
}

export const GET = withVayvaAPI(
  PERMISSIONS.PRODUCTS_VIEW,
  async (req, { storeId, params }) => {
    const { id } = await params;
    try {
      if (!id)
        return NextResponse.json({ error: "ID required" }, { status: 400 });

      const event = await prisma.product.findFirst({
        where: { id, storeId, productType: "event" },
        include: {
          productImages: { orderBy: { position: "asc" } },
          productVariants: true,
        },
      });

      if (!event) {
        return NextResponse.json({ error: "Event not found" }, { status: 404 });
      }

      // Get ticket sales
      const ticketSales = await prisma.orderItem.groupBy({
        by: ["variantId"],
        where: {
          productId: id,
          order: {
            status: { in: [OrderStatus.DELIVERED, OrderStatus.PROCESSING] },
          },
        },
        _sum: { quantity: true, price: true },
      });

      const salesByVariant = new Map(
        ticketSales.map((s) => [
          s.variantId,
          {
            sold: s._sum?.quantity || 0,
            revenue: Number(s._sum?.price || 0) * (s._sum?.quantity || 0),
          },
        ]),
      );

      const metadata = isRecord(event.metadata) ? event.metadata : {};
      const totalSold = ticketSales.reduce(
        (sum, s) => sum + (s._sum?.quantity || 0),
        0,
      );
      const totalRevenue = ticketSales.reduce(
        (sum, s) => sum + Number(s._sum?.price || 0) * (s._sum?.quantity || 0),
        0,
      );

      return NextResponse.json(
        {
          id: event.id,
          title: event.title,
          description: event.description,
          eventDate: metadata.eventDate,
          eventTime: metadata.eventTime,
          venue: metadata.venue,
          address: metadata.address,
          dressCode: metadata.dressCode,
          ageLimit: metadata.ageLimit,
          musicGenre: metadata.musicGenre,
          images: event.productImages.map((img) => img.url),
          ticketTypes: event.productVariants.map((v) => {
            const sales = salesByVariant.get(v.id) || { sold: 0, revenue: 0 };
            return {
              id: v.id,
              name: v.title,
              price: Number(v.price),
              quantity: 0,
              sold: sales.sold,
              description: v.sku || "",
            };
          }),
          status: event.status,
          ticketsSold: totalSold,
          revenue: totalRevenue,
        },
        {
          headers: {
            "Cache-Control": "no-store",
          },
        },
      );
    } catch (error: unknown) {
      logger.error("[NIGHTLIFE_EVENT_GET]", error, { storeId, eventId: id });
      return NextResponse.json(
        { error: "Internal Server Error" },
        { status: 500 },
      );
    }
  },
);

export const PATCH = withVayvaAPI(
  PERMISSIONS.PRODUCTS_MANAGE,
  async (req, { storeId, params, user }) => {
    const { id } = await params;
    try {
      if (!id)
        return NextResponse.json({ error: "ID required" }, { status: 400 });
      const body: unknown = await req.json().catch(() => ({}));
      const bodyRecord = isRecord(body) ? body : {};

      // Verify event belongs to store
      const existingEvent = await prisma.product.findFirst({
        where: { id, storeId, productType: "event" },
      });

      if (!existingEvent) {
        return NextResponse.json({ error: "Event not found" }, { status: 404 });
      }

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

      // Update event
      await prisma.product.update({
        where: { id },
        data: {
          title: title || existingEvent.title,
          description: description || existingEvent.description,
          metadata: {
            ...(isRecord(existingEvent.metadata) ? existingEvent.metadata : {}),
            ...(eventDate ? { eventDate } : {}),
            ...(eventTime ? { eventTime } : {}),
            ...(venue ? { venue } : {}),
            ...(address ? { address } : {}),
            ...(dressCode ? { dressCode } : {}),
            ...(ageLimit ? { ageLimit } : {}),
            ...(musicGenre ? { musicGenre } : {}),
          },
        },
      });

      // Update images if provided
      if (images.length > 0) {
        await prisma.productImage.deleteMany({ where: { productId: id } });
        await prisma.productImage.createMany({
          data: images.map((url: string, i: number) => ({
            productId: id,
            url,
            position: i,
          })),
        });
      }

      // Update ticket types (variants)
      if (ticketTypes.length > 0) {
        for (const ticket of ticketTypes) {
          const ticketId = getOptionalString(ticket.id);
          const ticketName = getOptionalString(ticket.name);
          const ticketPrice = getOptionalNumber(ticket.price);

          if (ticketId) {
            await prisma.productVariant.updateMany({
              where: { id: ticketId, productId: id },
              data: {
                ...(ticketName ? { title: ticketName } : {}),
                ...(ticketPrice !== undefined ? { price: ticketPrice } : {}),
              },
            });
          } else {
            const createName = ticketName || "Ticket";
            const createPrice = ticketPrice ?? 0;
            const skuPrefix =
              (title || existingEvent.title)?.substring(0, 3).toUpperCase() ||
              "EVT";
            const skuSuffix = ticketName?.toUpperCase() || "NEW";
            await prisma.productVariant.create({
              data: {
                productId: id,
                storeId,
                title: createName,
                price: createPrice,
                sku: `${skuPrefix}-${skuSuffix}`,
                options: [],
              },
            });
          }
        }
      }

      return NextResponse.json({ success: true });
    } catch (error: unknown) {
      logger.error("[NIGHTLIFE_EVENT_PATCH]", error, {
        storeId,
        eventId: id,
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
  PERMISSIONS.PRODUCTS_MANAGE,
  async (req, { storeId, params, user }) => {
    const { id } = await params;
    try {
      if (!id)
        return NextResponse.json({ error: "ID required" }, { status: 400 });

      // Verify event belongs to store
      const event = await prisma.product.findFirst({
        where: { id, storeId, productType: "event" },
      });

      if (!event) {
        return NextResponse.json({ error: "Event not found" }, { status: 404 });
      }

      // Check if any tickets sold
      const ticketsSold = await prisma.orderItem.count({
        where: { productId: id },
      });

      if (ticketsSold > 0) {
        return NextResponse.json(
          {
            error: "Cannot delete event with ticket sales. Archive it instead.",
          },
          { status: 400 },
        );
      }

      // Delete dependencies first
      await prisma.productVariant.deleteMany({ where: { productId: id } });
      await prisma.productImage.deleteMany({ where: { productId: id } });

      // Delete event
      await prisma.product.deleteMany({
        where: { id, storeId },
      });

      return NextResponse.json({ success: true });
    } catch (error: unknown) {
      logger.error("[NIGHTLIFE_EVENT_DELETE]", error, {
        storeId,
        eventId: id,
        userId: user.id,
      });
      return NextResponse.json(
        { error: "Internal Server Error" },
        { status: 500 },
      );
    }
  },
);
