import { NextRequest, NextResponse } from "next/server";
import { buildBackendAuthHeaders } from "@/lib/backend-proxy";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

function backendBase(): string {
  return process.env.BACKEND_API_URL?.replace(/\/$/, "") ?? "";
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

// GET /api/digital-products/licenses?storeId=xxx&filters...
export async function GET(req: Request) {
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

    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("productId");
    const customerId = searchParams.get("customerId");
    const status = searchParams.get("status");
    const licenseKey = searchParams.get("key");

    if (licenseKey) {
      const result = await apiJson<{
        success: boolean;
        data?: unknown;
        error?: string;
      }>(`${backendBase()}/api/digital-products/licenses?key=${encodeURIComponent(licenseKey)}`, {
        headers: auth.headers,
      });

      if (!result.success) {
        throw new Error(result.error || "Failed to fetch license");
      }

      return NextResponse.json({ license: result.data });
    }

    const queryParams = new URLSearchParams({ storeId });
    if (productId) queryParams.append("productId", productId);
    if (customerId) queryParams.append("customerId", customerId);
    if (status) queryParams.append("status", status);

    const result = await apiJson<{
      success: boolean;
      data?: unknown[];
      error?: string;
    }>(`${backendBase()}/api/digital-products/licenses?${queryParams.toString()}`, {
      headers: auth.headers,
    });

    if (!result.success) {
      throw new Error(result.error || "Failed to fetch licenses");
    }

    const licenses = Array.isArray(result.data) ? result.data : [];
    return NextResponse.json({ licenses });
  } catch (error: unknown) {
    handleApiError(error, {
      endpoint: "/digital-products/licenses",
      operation: "FETCH_LICENSES",
    });
    return NextResponse.json(
      {
        error: "Failed to fetch licenses",
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

// POST /api/digital-products/licenses
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
      return NextResponse.json({ error: "Invalid body" }, { status: 400 });
    }

    const productId = body.productId;
    const customerId = body.customerId;
    const orderId = body.orderId;

    if (
      typeof productId !== "string" ||
      typeof customerId !== "string" ||
      typeof orderId !== "string"
    ) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const result = await apiJson<{ success: boolean; data?: unknown; error?: string }>(
      `${backendBase()}/api/digital-products/licenses`,
      {
        method: "POST",
        headers: auth.headers,
        body: JSON.stringify({ ...body, storeId }),
      }
    );

    return NextResponse.json({ license: result.data }, { status: 201 });
  } catch (error: unknown) {
    return NextResponse.json(
      {
        error: "Failed to create license",
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

// PATCH /api/digital-products/licenses - activate or revoke
export async function PATCH(req: Request) {
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
      return NextResponse.json({ error: "Invalid body" }, { status: 400 });
    }

    const licenseKey = body.licenseKey;
    const action = body.action;
    const reason = body.reason;

    if (typeof licenseKey !== "string" || typeof action !== "string") {
      return NextResponse.json({ error: "Missing licenseKey or action" }, { status: 400 });
    }

    if (action !== "activate" && action !== "revoke") {
      return NextResponse.json(
        { error: "Invalid action. Use activate or revoke" },
        { status: 400 }
      );
    }

    if (action === "revoke" && typeof reason !== "string") {
      return NextResponse.json({ error: "Revoke reason required" }, { status: 400 });
    }

    const result = await apiJson<{ success: boolean; data?: unknown; error?: string }>(
      `${backendBase()}/api/digital-products/licenses`,
      {
        method: "PATCH",
        headers: auth.headers,
        body: JSON.stringify({ licenseKey, action, reason }),
      }
    );

    return NextResponse.json({ license: result.data });
  } catch (error: unknown) {
    return NextResponse.json(
      {
        error: "Failed to update license",
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
