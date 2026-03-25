import { NextRequest, NextResponse } from "next/server";
import { buildBackendAuthHeaders } from "@/lib/backend-proxy";
import { z } from "zod";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

const payoutCalculationSchema = z.object({
  vendorId: z.string(),
  periodStart: z.string().datetime(),
  periodEnd: z.string().datetime(),
});

const payoutStatusSchema = z.object({
  status: z.enum(["pending", "processing", "paid", "failed"]),
  paymentRef: z.string().optional(),
});

/**
 * GET /api/marketplace/payouts?vendorId=xxx&status=xxx — store from session only
 */
export async function GET(request: NextRequest): Promise<Response> {
  try {
    const auth = await buildBackendAuthHeaders(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const storeId = auth.user.storeId;
    const { searchParams } = new URL(request.url);
    const vendorId = searchParams.get("vendorId");
    const status = searchParams.get("status");

    // Fetch payouts via backend API
    const queryParams = new URLSearchParams({ storeId });
    if (vendorId) queryParams.append('vendorId', vendorId);
    if (status) queryParams.append('status', status);

    const result = await apiJson<{
      success: boolean;
      data?: { payouts?: any[]; stats?: any };
      error?: string;
    }>(`${process.env.BACKEND_API_URL}/api/marketplace/payouts?${queryParams.toString()}`, {
      headers: auth.headers,
    });

    if (!result.success) {
      throw new Error(result.error || 'Failed to fetch payouts');
    }

    return NextResponse.json({ 
      payouts: result.data?.payouts || [], 
      stats: result.data?.stats 
    });
  } catch (error: unknown) {
    handleApiError(
      error,
      {
        endpoint: "/api/marketplace/payouts",
        operation: "FETCH_PAYOUTS",
      }
    );
    return NextResponse.json(
      { error: "Failed to fetch payouts" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/marketplace/payouts/calculate
 * Calculate payout for a vendor period
 */
export async function POST(request: NextRequest): Promise<Response> {
  try {
    const auth = await buildBackendAuthHeaders(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validated = payoutCalculationSchema.parse(body);

    // Calculate payout via backend API
    const result = await apiJson<{
      success: boolean;
      data?: any;
      error?: string;
    }>(`${process.env.BACKEND_API_URL}/api/marketplace/payouts/calculate`, {
      method: "POST",
      headers: { ...auth.headers },
      body: JSON.stringify(validated),
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to calculate payout' },
        { status: 400 }
      );
    }

    return NextResponse.json(result.data, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      );
    }
    handleApiError(
      error,
      {
        endpoint: "/api/marketplace/payouts/calculate",
        operation: "CALCULATE_PAYOUT",
      }
    );
    return NextResponse.json(
      { error: "Failed to calculate payout" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/marketplace/payouts?id=xxx
 * Update payout status
 */
export async function PATCH(request: NextRequest): Promise<Response> {
  try {
    const auth = await buildBackendAuthHeaders(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Payout ID required" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const validated = payoutStatusSchema.parse(body);

    // Update payout via backend API
    const result = await apiJson<{
      success: boolean;
      data?: any;
      error?: string;
    }>(`${process.env.BACKEND_API_URL}/api/marketplace/payouts?id=${id}`, {
      method: "PATCH",
      headers: { ...auth.headers },
      body: JSON.stringify(validated),
    });

    if (!result.success) {
      throw new Error(result.error || 'Failed to update payout');
    }

    return NextResponse.json({ payout: result.data });
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      );
    }
    handleApiError(
      error,
      {
        endpoint: "/api/marketplace/payouts",
        operation: "UPDATE_PAYOUT",
      }
    );
    return NextResponse.json(
      { error: "Failed to update payout" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/marketplace/payouts/summary?storeId=xxx
 * Get payout summary/dashboard data
 */
export async function PUT(request: NextRequest): Promise<Response> {
  try {
    const auth = await buildBackendAuthHeaders(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const storeId = auth.user.storeId;

    // Fetch payout summary via backend API
    const result = await apiJson<{
      success: boolean;
      data?: { summary?: any };
      error?: string;
    }>(`${process.env.BACKEND_API_URL}/api/marketplace/payouts/summary?storeId=${encodeURIComponent(storeId)}`, {
      headers: auth.headers,
    });

    if (!result.success) {
      throw new Error(result.error || 'Failed to get payout summary');
    }

    return NextResponse.json({ summary: result.data?.summary });
  } catch (error: unknown) {
    handleApiError(
      error,
      {
        endpoint: "/api/marketplace/payouts/summary",
        operation: "FETCH_PAYOUT_SUMMARY",
      }
    );
    return NextResponse.json(
      { error: "Failed to get payout summary" },
      { status: 500 }
    );
  }
}
