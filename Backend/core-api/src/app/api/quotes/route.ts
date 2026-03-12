import { NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { BookingStatus, Prisma, prisma } from "@vayva/db";

import { logger } from "@/lib/logger";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function parseBookingStatus(value: string): BookingStatus | null {
  const normalized = value.toUpperCase();
  const allowed = Object.values(BookingStatus) as string[];
  return allowed.includes(normalized) ? (normalized as BookingStatus) : null;
}

function getErrorMessage(error: unknown): string | undefined {
  if (error instanceof Error) return error.message;
  if (!isRecord(error)) return undefined;
  return getString(error.message);
}

/**
 * GET /api/quotes
 * List all B2B quotes for the store
 */
export const GET = withVayvaAPI(
  PERMISSIONS.ORDERS_VIEW,
  async (req, { storeId }) => {
    try {
      const { searchParams } = new URL(req.url);
      const statusParam = searchParams.get("status");
      const status = statusParam ? parseBookingStatus(statusParam) : null;

      // Quotes are stored as bookings with type: "quote_request" in metadata
      const quotes = await prisma.booking.findMany({
        where: {
          storeId,
          metadata: {
            path: ["type"],
            equals: "quote_request",
          },
          ...(status ? { status } : {}),
        },
        orderBy: { createdAt: "desc" },
      });

      // eslint-disable-next-line @typescript-eslint/no-empty-object-type
      type QuoteBooking = Prisma.BookingGetPayload<object>;

      return NextResponse.json(
        {
          quotes: (quotes as QuoteBooking[]).map((q) => {
            const meta = isRecord(q.metadata) ? q.metadata : {};
            return {
              id: q.id,
              quoteNumber:
                getString(meta.quoteNumber) || q.id.slice(0, 8).toUpperCase(),
              companyName: getString(meta.companyName) || "Unknown",
              contactName: getString(meta.contactName) || "",
              contactEmail: getString(meta.contactEmail) || "",
              contactPhone: getString(meta.contactPhone) || "",
              items: meta.items ?? [],
              total:
                typeof meta.total === "number"
                  ? meta.total
                  : Number(meta.total ?? 0),
              status: q.status,
              notes: q.notes,
              validUntil: q.endsAt,
              createdAt: q.createdAt,
            };
          }),
          total: quotes.length,
        },
        {
          headers: {
            "Cache-Control": "no-store",
          },
        },
      );
    } catch (error: unknown) {
      logger.error("[QUOTES_GET]", error, { storeId });
      return NextResponse.json(
        { error: getErrorMessage(error) || "Internal Server Error" },
        { status: 500 },
      );
    }
  },
);

/**
 * POST /api/quotes
 * Create a new B2B quote
 */
export const POST = withVayvaAPI(
  PERMISSIONS.ORDERS_MANAGE,
  async (req, { storeId, user }) => {
    try {
      const parsedBody: unknown = await req.json().catch(() => ({}));
      const body = isRecord(parsedBody) ? parsedBody : {};
      const companyName = getString(body.companyName);
      const contactName = getString(body.contactName);
      const contactEmail = getString(body.contactEmail);
      const contactPhone = getString(body.contactPhone);
      const items = Array.isArray(body.items) ? body.items : [];
      const notes = getString(body.notes);
      const validDays =
        typeof body.validDays === "number" ? body.validDays : undefined;

      if (!companyName || !items.length) {
        return NextResponse.json(
          { error: "Company name and items are required" },
          { status: 400 },
        );
      }

      // Calculate total from items
      let total = 0;
      const quoteItems = [];

      for (const itemRaw of items) {
        const item = isRecord(itemRaw) ? itemRaw : {};
        const productId = getString(item.productId);
        const quantity = typeof item.quantity === "number" ? item.quantity : 0;

        if (!productId || quantity <= 0) continue;

        const product = await prisma.product.findFirst({
          where: { id: productId, storeId },
        });

        if (product) {
          // Check for tiered pricing
          const pricingTiers = await prisma.pricingTier.findMany({
            where: { productId: product.id },
            orderBy: { minQuantity: "asc" },
          });

          let unitPrice = Number(product.price);
          for (const tier of pricingTiers) {
            if (quantity >= tier.minQuantity) {
              unitPrice = Number(tier.price);
            }
          }

          const lineTotal = unitPrice * quantity;
          total += lineTotal;

          quoteItems.push({
            productId: product.id,
            name: product.title,
            quantity,
            unitPrice,
            lineTotal,
          });
        }
      }

      const quoteNumber = `QT-${Date.now().toString(36).toUpperCase()}`;
      const validUntil = new Date();
      validUntil.setDate(validUntil.getDate() + (validDays || 30));

      const quote = await prisma.booking.create({
        data: {
          storeId,
          serviceId: quoteItems[0]?.productId || "",
          startsAt: new Date(),
          endsAt: validUntil,
          status: "CONFIRMED",
          notes: notes || "",
          metadata: {
            type: "quote_request",
            quoteNumber,
            companyName,
            contactName,
            contactEmail,
            contactPhone,
            items: quoteItems,
            total,
            source: "dashboard",
          },
        },
      });

      return NextResponse.json(
        {
          quote: {
            id: quote.id,
            quoteNumber,
            companyName,
            items: quoteItems,
            total,
            validUntil,
            status: quote.status,
          },
        },
        { status: 201 },
      );
    } catch (error: unknown) {
      logger.error("[QUOTE_CREATE_POST]", error, { storeId, userId: user.id });
      return NextResponse.json(
        { error: getErrorMessage(error) || "Internal Server Error" },
        { status: 500 },
      );
    }
  },
);
