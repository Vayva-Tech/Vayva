import { logger } from "@vayva/shared";
import { NextRequest, NextResponse } from "next/server";
import { buildBackendAuthHeaders } from "@/lib/backend-proxy";
import { handleApiError } from "@/lib/api-error-handler";

interface KwikQuoteResponse {
  success: boolean;
  quote?: {
    price: number;
    currency: string;
    estimatedTime: string;
    distance: number;
    provider: "kwik";
  };
  error?: string;
}

/**
 * GET /api/shipping/kwik/quote
 * Get shipping quote from Kwik API
 */
export async function GET(request: NextRequest) {
  try {
    const auth = await buildBackendAuthHeaders(request);
    if (!auth?.user?.storeId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const storeId = auth.user.storeId;
    const { searchParams } = new URL(request.url);
    const pickup = searchParams.get("pickup");
    const dropoff = searchParams.get("dropoff");
    const weight = searchParams.get("weight");

    if (!pickup || !dropoff) {
      return NextResponse.json(
        { error: "Pickup and dropoff addresses required" },
        { status: 400 },
      );
    }

    const kwikApiKey = process.env.KWIK_API_KEY;
    const kwikBaseUrl =
      process.env.KWIK_API_BASE_URL || "https://api.kwik.delivery/v1";

    if (!kwikApiKey) {
      return NextResponse.json(
        { error: "Kwik API not configured. Use custom delivery instead." },
        { status: 503 },
      );
    }

    const response = await fetch(`${kwikBaseUrl}/quotes`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${kwikApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        pickup_address: pickup,
        dropoff_address: dropoff,
        weight: weight ? Number.parseFloat(weight) : undefined,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      logger.error("[KWIK_QUOTE_ERROR]", {
        status: response.status,
        error: errorText,
        storeId,
      });
      return NextResponse.json(
        { error: "Failed to get quote from Kwik" },
        { status: response.status },
      );
    }

    const data = (await response.json()) as KwikQuoteResponse;

    return NextResponse.json({
      success: true,
      quote: data.quote,
      provider: "kwik",
    });
  } catch (error) {
    handleApiError(error, {
      endpoint: "/api/shipping/kwik/quote",
      operation: "GET_KWIK_QUOTE",
    });
    return NextResponse.json(
      { error: "Failed to complete operation" },
      { status: 500 },
    );
  }
}
