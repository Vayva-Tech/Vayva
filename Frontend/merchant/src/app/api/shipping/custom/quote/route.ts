import crypto from "node:crypto";
import { logger } from "@vayva/shared";
import { NextRequest, NextResponse } from "next/server";
import { buildBackendAuthHeaders } from "@/lib/backend-proxy";
import { handleApiError } from "@/lib/api-error-handler";

/**
 * POST /api/shipping/custom/quote
 * Create custom delivery quote (manual pricing).
 * No persisted ShippingQuote model in schema — returns a client reference id for tracking/logs.
 */
export async function POST(request: NextRequest) {
  try {
    const auth = await buildBackendAuthHeaders(request);
    if (!auth?.user?.storeId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const storeId = auth.user.storeId;

    const body: unknown = await request.json().catch(() => ({}));
    if (body === null || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid body" }, { status: 400 });
    }
    const b = body as Record<string, unknown>;
    const pickupAddress =
      typeof b.pickupAddress === "string" ? b.pickupAddress : "";
    const dropoffAddress =
      typeof b.dropoffAddress === "string" ? b.dropoffAddress : "";
    const price =
      typeof b.price === "number" && Number.isFinite(b.price)
        ? b.price
        : typeof b.price === "string"
          ? Number(b.price)
          : NaN;
    const currency =
      typeof b.currency === "string" && b.currency ? b.currency : "NGN";
    const estimatedTime =
      typeof b.estimatedTime === "string" && b.estimatedTime
        ? b.estimatedTime
        : "24-48 hours";
    const notes = typeof b.notes === "string" ? b.notes : undefined;

    if (!pickupAddress || !dropoffAddress) {
      return NextResponse.json(
        { error: "Pickup and dropoff addresses required" },
        { status: 400 },
      );
    }

    if (!Number.isFinite(price) || price <= 0) {
      return NextResponse.json(
        { error: "Valid price required" },
        { status: 400 },
      );
    }

    const quoteId = crypto.randomUUID();

    logger.info("[CUSTOM_QUOTE_CREATED]", {
      quoteId,
      price,
      storeId,
    });

    return NextResponse.json({
      success: true,
      quote: {
        id: quoteId,
        price,
        currency,
        estimatedTime,
        provider: "custom",
        notes,
      },
    });
  } catch (error) {
    handleApiError(error, {
      endpoint: "/shipping/custom/quote",
      operation: "CREATE_CUSTOM_QUOTE",
    });
    return NextResponse.json(
      { error: "Failed to complete operation" },
      { status: 500 },
    );
  }
}
