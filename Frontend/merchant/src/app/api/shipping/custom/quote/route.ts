// @ts-nocheck
import { logger } from "@vayva/shared";
import { NextRequest, NextResponse } from "next/server";
import { PERMISSIONS } from "@/lib/team/permissions";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

interface CustomQuoteRequest {
  pickupAddress: string;
  dropoffAddress: string;
  price: number;
  currency?: string;
  estimatedTime?: string;
  notes?: string;
}

/**
 * POST /api/shipping/custom/quote
 * Create custom delivery quote (manual pricing)
 */
export async function POST(request: NextRequest) {
  const storeId = request.headers.get("x-store-id") || "";
  try {
    const body = await request.json().catch(() => ({}));
    const {
      pickupAddress,
      dropoffAddress,
      price,
      currency = "NGN",
      estimatedTime = "24-48 hours",
      notes
    } = body as CustomQuoteRequest;

    // Validate required fields
    if (!pickupAddress || !dropoffAddress) {
      return NextResponse.json(
        { error: "Pickup and dropoff addresses required" },
        { status: 400 }
      );
    }

    if (!price || price <= 0) {
      return NextResponse.json(
        { error: "Valid price required" },
        { status: 400 }
      );
    }

    // Save quote to database for tracking
    const quote = await prisma.shippingQuote?.create({
      data: {
        storeId,
        provider: "CUSTOM",
        pickupAddress,
        dropoffAddress,
        price,
        currency,
        estimatedDeliveryTime: estimatedTime,
        notes: notes || null,
        status: "PENDING",
      },
    });

    logger.info("[CUSTOM_QUOTE_CREATED]", {
      quoteId: quote?.id,
      price,
      storeId
    });

    return NextResponse.json({
      success: true,
      quote: {
        id: quote?.id,
        price,
        currency,
        estimatedTime,
        provider: "custom",
        notes,
      },
    });
  } catch (error) {
    handleApiError(error, {
      endpoint: '/api/shipping/custom/quote',
      operation: 'CREATE_CUSTOM_QUOTE',
    });
    return NextResponse.json(
      { error: 'Failed to complete operation' },
      { status: 500 }
    );
  }
}
