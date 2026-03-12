import { NextResponse } from "next/server";
import { withStorefrontAPI } from "@/lib/api-handler";
import { standardHeaders, logger, BaseError } from "@vayva/shared";

export const POST = withStorefrontAPI(async (request: any, ctx: any) => {
  const { requestId, db, storeId } = ctx;

  try {
    const body = await request.json().catch(() => ({}));

    const propertyId = String(body?.propertyId || "");
    const clientName = String(body?.clientName || "");
    const clientEmail = String(body?.clientEmail || "");
    const clientPhone = String(body?.clientPhone || "");
    const scheduledAt = String(body?.scheduledAt || "");

    if (!propertyId || !clientName || !clientEmail || !clientPhone || !scheduledAt) {
      return NextResponse.json(
        { error: "Missing required fields", requestId },
        { status: 400, headers: standardHeaders(requestId) },
      );
    }

    const property = await db.property.findFirst({
      where: { id: propertyId, storeId, status: "available" },
      select: { id: true },
    });

    if (!property) {
      return NextResponse.json(
        { error: "Property not found", requestId },
        { status: 404, headers: standardHeaders(requestId) },
      );
    }

    const viewing = await db.viewing.create({
      data: {
        propertyId: property.id,
        clientName,
        clientEmail,
        clientPhone,
        scheduledAt: new Date(scheduledAt),
        duration: 30,
        status: "scheduled",
      },
      select: { id: true },
    });

    return NextResponse.json(
      { success: true, data: { viewingId: viewing.id }, requestId },
      { headers: standardHeaders(requestId) },
    );
  } catch (e: unknown) {
    if (e instanceof BaseError) throw e;

    logger.error("Failed to create viewing", {
      requestId,
      error: e instanceof Error ? e.message : String(e),
      app: "storefront",
    });

    return NextResponse.json(
      { error: "Internal server error", requestId },
      { status: 500, headers: standardHeaders(requestId) },
    );
  }
});
