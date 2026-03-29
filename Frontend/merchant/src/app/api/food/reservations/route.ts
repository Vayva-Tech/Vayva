import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { buildBackendAuthHeaders } from "@/lib/backend-proxy";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";
import { foodService } from "@/services/food.service";

const backendBase = () => process.env.BACKEND_API_URL?.replace(/\/$/, "") ?? "";

// GET /api/food/reservations?storeId=xxx&date=xxx
export async function GET(request: NextRequest) {
  try {
    const auth = await buildBackendAuthHeaders(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const storeId = auth.user.storeId;
    if (!storeId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");
    const status = searchParams.get("status");

    if (!date) {
      return NextResponse.json({ error: "Missing date" }, { status: 400 });
    }

    const queryParams = new URLSearchParams({ storeId, date });
    if (status) queryParams.append("status", status);

    const result = await apiJson<{
      success: boolean;
      data?: unknown[];
      error?: string;
    }>(`${backendBase()}/api/food/reservations?${queryParams.toString()}`, {
      headers: auth.headers,
    });

    if (!result.success) {
      throw new Error(result.error || "Failed to fetch reservations");
    }

    const reservations = Array.isArray(result.data) ? result.data : [];
    return NextResponse.json({ reservations });
  } catch (error: unknown) {
    handleApiError(error, {
      endpoint: "/food/reservations",
      operation: "FETCH_RESERVATIONS",
    });
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: "Failed to fetch reservations", message: errorMessage },
      { status: 500 }
    );
  }
}

// POST /api/food/reservations
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const storeId = session.user.storeId;
    if (!storeId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body: unknown = await req.json();
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid body" }, { status: 400 });
    }
    const b = body as Record<string, unknown>;
    const customerId = typeof b.customerId === "string" ? b.customerId : undefined;
    const customerName =
      typeof b.customerName === "string" ? b.customerName : undefined;
    const customerPhone =
      typeof b.customerPhone === "string" ? b.customerPhone : undefined;
    const partySize = b.partySize;
    const date = typeof b.date === "string" ? b.date : undefined;
    const time = typeof b.time === "string" ? b.time : undefined;
    const tableId = typeof b.tableId === "string" ? b.tableId : undefined;
    const specialRequests =
      typeof b.specialRequests === "string" ? b.specialRequests : undefined;
    const dietaryRestrictions = Array.isArray(b.dietaryRestrictions)
      ? (b.dietaryRestrictions as string[])
      : [];
    const depositAmountRaw = b.depositAmount;
    const depositAmount =
      typeof depositAmountRaw === "number"
        ? depositAmountRaw
        : typeof depositAmountRaw === "string"
          ? Number(depositAmountRaw)
          : 0;

    if (!customerId || !customerName || !customerPhone || !date || !time) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const partySizeNum =
      typeof partySize === "number"
        ? partySize
        : typeof partySize === "string"
          ? Number(partySize)
          : NaN;
    if (!Number.isFinite(partySizeNum)) {
      return NextResponse.json({ error: "Invalid partySize" }, { status: 400 });
    }

    const reservation = await foodService.createReservation({
      storeId,
      customerId,
      customerName,
      customerPhone,
      partySize: partySizeNum,
      date: new Date(date),
      time,
      tableId,
      specialRequests,
      dietaryRestrictions,
      depositAmount: Number.isFinite(depositAmount) ? depositAmount : 0,
    });

    return NextResponse.json({ reservation }, { status: 201 });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: "Failed to create reservation", message: errorMessage },
      { status: 500 }
    );
  }
}

// PATCH /api/food/reservations?id=xxx - check-in or cancel
export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const storeId = session.user.storeId;
    if (!storeId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    const body: unknown = await req.json();
    const action =
      body && typeof body === "object" && "action" in body
        ? (body as Record<string, unknown>).action
        : undefined;

    let reservation;
    if (action === "checkin") {
      reservation = await foodService.checkInReservation(storeId, id);
    } else if (action === "cancel") {
      reservation = await foodService.cancelReservation(storeId, id);
    } else {
      return NextResponse.json(
        { error: "Invalid action. Use checkin or cancel" },
        { status: 400 }
      );
    }

    return NextResponse.json({ reservation });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "Reservation not found") {
      return NextResponse.json({ error: "Reservation not found" }, { status: 404 });
    }
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: "Failed to update reservation", message: errorMessage },
      { status: 500 }
    );
  }
}
