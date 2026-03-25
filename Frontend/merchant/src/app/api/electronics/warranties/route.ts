import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { buildBackendAuthHeaders } from "@/lib/backend-proxy";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";
import { electronicsService } from "@/services/electronics.service";
import type { WarrantyStatus } from "@/types/phase2-industry";

const WARRANTY_TYPES = ["manufacturer", "extended"] as const;

function isWarrantyType(v: string): v is (typeof WARRANTY_TYPES)[number] {
  return (WARRANTY_TYPES as readonly string[]).includes(v);
}

function isWarrantyStatus(v: string): v is WarrantyStatus {
  return v === "active" || v === "expired" || v === "claimed" || v === "void";
}

const backendBase = () => process.env.BACKEND_API_URL?.replace(/\/$/, "") ?? "";

// GET /api/electronics/warranties?customerId=xxx or ?orderId=xxx
export async function GET(request: NextRequest) {
  try {
    const auth = await buildBackendAuthHeaders(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get("customerId");
    const orderId = searchParams.get("orderId");

    if (!customerId && !orderId) {
      return NextResponse.json(
        { error: "Missing customerId or orderId" },
        { status: 400 }
      );
    }

    const queryParams = new URLSearchParams();
    if (customerId) queryParams.append("customerId", customerId);
    if (orderId) queryParams.append("orderId", orderId);

    const result = await apiJson<{
      success: boolean;
      data?: unknown[];
      error?: string;
    }>(`${backendBase()}/api/electronics/warranties?${queryParams.toString()}`, {
      headers: auth.headers,
    });

    if (!result.success) {
      throw new Error(result.error || "Failed to fetch warranties");
    }

    const warranties = Array.isArray(result.data) ? result.data : [];
    return NextResponse.json({ warranties });
  } catch (error: unknown) {
    handleApiError(error, {
      endpoint: "/api/electronics/warranties",
      operation: "FETCH_WARRANTIES",
    });
    return NextResponse.json(
      {
        error: "Failed to fetch warranties",
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

// POST /api/electronics/warranties
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const sessionStoreId = session?.user?.storeId;
    if (!session?.user || !sessionStoreId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body: unknown = await req.json();
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid body" }, { status: 400 });
    }
    const b = body as Record<string, unknown>;
    const orderId = typeof b.orderId === "string" ? b.orderId : undefined;
    const productId = typeof b.productId === "string" ? b.productId : undefined;
    const customerId = typeof b.customerId === "string" ? b.customerId : undefined;
    const serialNumber =
      typeof b.serialNumber === "string" ? b.serialNumber : undefined;
    const warrantyTypeRaw =
      typeof b.warrantyType === "string" ? b.warrantyType : undefined;
    const startDate = typeof b.startDate === "string" ? b.startDate : undefined;
    const endDate = typeof b.endDate === "string" ? b.endDate : undefined;
    const durationRaw = b.durationMonths;
    const durationMonths =
      typeof durationRaw === "number"
        ? durationRaw
        : typeof durationRaw === "string"
          ? Number(durationRaw)
          : NaN;

    if (
      !orderId ||
      !productId ||
      !customerId ||
      !warrantyTypeRaw ||
      !isWarrantyType(warrantyTypeRaw) ||
      !startDate ||
      !endDate ||
      !Number.isFinite(durationMonths)
    ) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const warranty = await electronicsService.createWarranty({
      storeId: sessionStoreId,
      orderId,
      productId,
      customerId,
      serialNumber,
      warrantyType: warrantyTypeRaw,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      durationMonths,
    });

    return NextResponse.json({ warranty }, { status: 201 });
  } catch (error: unknown) {
    return NextResponse.json(
      {
        error: "Failed to create warranty",
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

// PATCH /api/electronics/warranties?id=xxx - update status
export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const sessionStoreId = session?.user?.storeId;
    if (!session?.user || !sessionStoreId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    const body: unknown = await req.json();
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid body" }, { status: 400 });
    }
    const status = (body as Record<string, unknown>).status;
    if (typeof status !== "string" || !status || !isWarrantyStatus(status)) {
      return NextResponse.json({ error: "Missing or invalid status" }, { status: 400 });
    }

    const warranty = await electronicsService.updateWarrantyStatus(
      sessionStoreId,
      id,
      status
    );
    return NextResponse.json({ warranty });
  } catch (error: unknown) {
    return NextResponse.json(
      {
        error: "Failed to update warranty",
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
