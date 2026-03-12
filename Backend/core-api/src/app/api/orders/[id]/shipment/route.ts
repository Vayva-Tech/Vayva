import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@vayva/db";
import { requireAuthFromRequest } from "@/lib/session.server";

/**
 * GET /api/orders/[id]/shipment
 * Returns shipment data for a specific order
 * Requires authentication
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Authenticate user
    const user = await requireAuthFromRequest(req);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id: orderId } = await params;

    // Fetch shipment data for the order
    const shipment = await prisma.shipment.findUnique({
      where: { orderId },
      select: {
        id: true,
        trackingCode: true,
        trackingUrl: true,
        status: true,
        provider: true,
        recipientPhone: true,
        recipientName: true,
        addressLine1: true,
        addressCity: true,
        addressState: true,
        externalId: true,
        createdAt: true,
        updatedAt: true,
        // Include related order data for verification
        order: {
          select: {
            storeId: true,
          },
        },
      },
    });

    if (!shipment) {
      return NextResponse.json(
        { success: false, error: "Shipment not found" },
        { status: 404 }
      );
    }

    // Verify user has access to this order's shipment
    // Check if user belongs to the store or is the merchant
    const hasAccess =
      user.storeId === shipment.order.storeId;

    if (!hasAccess) {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 }
      );
    }

    // Return shipment data (excluding sensitive order info)
    return NextResponse.json({
      success: true,
      shipment: {
        id: shipment.id,
        trackingCode: shipment.trackingCode,
        trackingUrl: shipment.trackingUrl,
        status: shipment.status,
        provider: shipment.provider,
        recipientPhone: shipment.recipientPhone,
        recipientName: shipment.recipientName,
        addressLine1: shipment.addressLine1,
        addressCity: shipment.addressCity,
        addressState: shipment.addressState,
        externalId: shipment.externalId,
        createdAt: shipment.createdAt.toISOString(),
        updatedAt: shipment.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("[SHIPMENT_API_ERROR]", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch shipment data" },
      { status: 500 }
    );
  }
}
