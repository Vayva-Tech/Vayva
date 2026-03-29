import { NextRequest, NextResponse } from "next/server";
import { buildBackendAuthHeaders } from "@/lib/backend-proxy";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

const VALID_ORDER_STATUSES = ["PAID", "PROCESSING", "COMPLETED", "DELIVERED"];

interface TicketSales {
  sold: number;
  revenue: number;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const auth = await buildBackendAuthHeaders(request);
    if (!auth?.user?.storeId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const storeId = auth.user.storeId;
    const event = await prisma.product?.findFirst({
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
    const ticketSales = await prisma.orderItem?.groupBy({
      by: ["variantId"],
      where: {
        productId: id,
        order: { status: { in: VALID_ORDER_STATUSES as any } },
      },
      _sum: { quantity: true, price: true },
    });

    const salesByVariant = new Map<string, TicketSales>(
      ticketSales.map((s) => [s.variantId ?? "", { sold: s._sum?.quantity || 0, revenue: Number(s._sum?.price || 0) * (s._sum?.quantity || 0) }])
    );

    const metadata = (event.metadata as Record<string, unknown>) || {};
    const totalSold = ticketSales.reduce((sum: any, s: any) => sum + (s._sum?.quantity || 0), 0);
    const totalRevenue = ticketSales.reduce((sum: any, s: any) => sum + (Number(s._sum?.price || 0) * (s._sum?.quantity || 0)), 0);

    return NextResponse.json({
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
      images: event.productImages?.map((img) => img.url),
      ticketTypes: (event.productVariants as ProductVariant[]).map((v) => {
        const sales = salesByVariant.get(v.id) || { sold: 0, revenue: 0 };
        return {
          id: v.id,
          name: v.title,
          price: Number(v.price),
          quantity: v.inventory || 0,
          sold: sales.sold,
          description: v.sku || "",
        };
      }),
      status: (event as any).status,
      ticketsSold: totalSold,
      revenue: totalRevenue,
    }, {
      headers: {
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    handleApiError(error, { endpoint: "/nightlife/events/:id", operation: "GET" });
    return NextResponse.json(
      { error: "Failed to complete operation" },
      { status: 500 }
    );
  }
}
