import { NextRequest, NextResponse } from "next/server";
import { buildBackendAuthHeaders } from "@/lib/backend-proxy";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";
import { automotiveService } from "@/services/automotive.service";

function backendBase(): string {
  return process.env.BACKEND_API_URL?.replace(/\/$/, "") ?? "";
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

// GET /api/automotive/tradeins?storeId=xxx or ?customerId=xxx
export async function GET(req: Request) {
  try {
    const request = req as NextRequest;
    const auth = await buildBackendAuthHeaders(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const sessionStoreId = auth.user.storeId;
    if (!sessionStoreId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const customerId = searchParams.get("customerId");
    const status = searchParams.get("status");

    const queryParams = new URLSearchParams();
    queryParams.append("storeId", sessionStoreId);
    if (customerId) queryParams.append("customerId", customerId);
    if (status) queryParams.append("status", status);

    const result = await apiJson<{
      success: boolean;
      data?: unknown[];
      error?: string;
    }>(`${backendBase()}/api/automotive/tradeins?${queryParams.toString()}`, {
      headers: auth.headers,
    });

    if (!result.success) {
      throw new Error(result.error || "Failed to fetch trade-ins");
    }

    const valuations = Array.isArray(result.data) ? result.data : [];
    return NextResponse.json({ valuations });
  } catch (error: unknown) {
    handleApiError(error, {
      endpoint: "/automotive/tradeins",
      operation: "FETCH_TRADE_INS",
    });
    return NextResponse.json(
      {
        error: "Failed to fetch trade-ins",
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

// POST /api/automotive/tradeins
export async function POST(req: Request) {
  try {
    const request = req as NextRequest;
    const auth = await buildBackendAuthHeaders(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const storeId = auth.user.storeId;
    if (!storeId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body: unknown = await req.json();
    if (!isRecord(body)) {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const customerId = body.customerId;
    const make = body.make;
    const model = body.model;
    const year = body.year;
    const mileage = body.mileage;
    const condition = body.condition;
    const vin = body.vin;
    const estimatedValue = body.estimatedValue;
    const vehicleId = body.vehicleId;
    const notes = body.notes;

    if (
      typeof customerId !== "string" ||
      typeof make !== "string" ||
      typeof model !== "string" ||
      (typeof year !== "number" && typeof year !== "string") ||
      (typeof estimatedValue !== "number" && typeof estimatedValue !== "string")
    ) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const valuation = await automotiveService.createTradeInValuation({
      storeId,
      customerId,
      make,
      model,
      year: Number(year),
      mileage: Number(mileage) || 0,
      condition: typeof condition === "string" ? condition : "good",
      vin: typeof vin === "string" ? vin : undefined,
      estimatedValue: Number(estimatedValue),
      vehicleId: typeof vehicleId === "string" ? vehicleId : undefined,
      notes: typeof notes === "string" ? notes : undefined,
    });

    return NextResponse.json({ valuation }, { status: 201 });
  } catch (error: unknown) {
    return NextResponse.json(
      {
        error: "Failed to create trade-in valuation",
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

// PATCH /api/automotive/tradeins?id=xxx - update offer or accept
export async function PATCH(req: Request) {
  try {
    const request = req as NextRequest;
    const auth = await buildBackendAuthHeaders(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const sessionStoreId = auth.user.storeId;
    if (!sessionStoreId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    const body: unknown = await req.json();
    if (!isRecord(body)) {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const action = body.action;
    const offerPrice = body.offerPrice;
    const notes = body.notes;

    let valuation;
    if (action === "offer") {
      if (offerPrice === undefined || offerPrice === null) {
        return NextResponse.json({ error: "Missing offerPrice" }, { status: 400 });
      }
      const priceNum = Number(offerPrice);
      if (Number.isNaN(priceNum)) {
        return NextResponse.json({ error: "Invalid offerPrice" }, { status: 400 });
      }
      valuation = await automotiveService.updateTradeInOffer(
        sessionStoreId,
        id,
        priceNum,
        typeof notes === "string" ? notes : undefined
      );
    } else if (action === "accept") {
      valuation = await automotiveService.acceptTradeInOffer(sessionStoreId, id);
    } else {
      return NextResponse.json(
        { error: "Invalid action. Use offer or accept" },
        { status: 400 }
      );
    }

    return NextResponse.json({ valuation });
  } catch (error: unknown) {
    return NextResponse.json(
      {
        error: "Failed to update trade-in",
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
