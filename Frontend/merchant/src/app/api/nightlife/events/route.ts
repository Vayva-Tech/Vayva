import { NextRequest, NextResponse } from "next/server";
import { buildBackendAuthHeaders } from "@/lib/backend-proxy";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma, OrderStatus, type ProductVariant, type Product } from "@vayva/db";
// Use Prisma's OrderStatus enum values
const VALID_ORDER_STATUSES: OrderStatus[] = ["DELIVERED", "PROCESSING"];

interface TicketTypeInput {
  name?: string;
  price?: number;
  quantity?: number;
}

export async function GET(request: NextRequest) {
  try {
    const auth = await buildBackendAuthHeaders(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const storeId = auth.user.storeId;
    const events = await prisma.product?.findMany({
      where: { storeId, productType: "event" },
      include: {
        productImages: {
          orderBy: { position: "asc" },
          take: 1,
        },
        productVariants: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const eventIds = events?.map((e) => e.id) || [];
    const ticketSales = await prisma.orderItem?.groupBy({
      by: ["productId"],
      where: {
        productId: { in: eventIds },
        order: { status: { in: VALID_ORDER_STATUSES } },
      },
      _sum: { quantity: true },
    });

    const salesMap = new Map(ticketSales?.map((s) => [s.productId, s._sum?.quantity || 0]) || []);

    const formattedEvents = (events || []).map((event: Product & { productImages: { url: string }[]; productVariants: ProductVariant[]; status: string }) => {
      const metadata = (event.metadata as Record<string, string>) || {};
      const eventDate = new Date(metadata.eventDate || event.createdAt);
      const now = new Date();
      
      let status: string = event.status;
      if (eventDate < now) status = "PAST";

      return {
        id: event.id,
        title: event.title,
        description: event.description,
        eventDate: metadata.eventDate || event.createdAt,
        eventTime: metadata.eventTime || "22:00",
        venue: metadata.venue || "TBD",
        image: event.productImages?.[0]?.url || null,
        ticketsSold: salesMap.get(event.id) || 0,
        ticketTypes: event.productVariants?.map((v: ProductVariant) => ({
          name: v.title,
          price: Number(v.price),
          available: v.inventory || 0,
        })),
        status,
      };
    });

    return NextResponse.json(formattedEvents, {
      headers: {
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    handleApiError(error, {
      endpoint: "/api/nightlife/events",
      operation: "GET_EVENTS",
    });
    return NextResponse.json(
      { error: "Failed to fetch events" },
      { status: 500 }
    );
  }
}
