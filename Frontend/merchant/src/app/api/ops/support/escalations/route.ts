import { logger } from "@/lib/logger";
import { NextRequest, NextResponse } from "next/server";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

const INTERNAL_SECRET = process.env?.INTERNAL_API_SECRET;

function verifyInternalAuth(req: NextRequest): boolean {
  if (!INTERNAL_SECRET) {
    logger.error("[INTERNAL_AUTH] INTERNAL_API_SECRET not configured");
    return false;
  }
  const secret = req.headers?.get("x-internal-secret");
  return secret === INTERNAL_SECRET;
}

export const dynamic = "force-dynamic";

// GET /api/ops/support/escalations - Get escalated tickets
export async function GET(req: NextRequest) {
  try {
    if (!verifyInternalAuth(req)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");

    // Fetch escalated tickets via backend API
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    const result = await apiJson<{
      success: boolean;
      data?: any[];
      pagination?: { total?: number; hasMore?: boolean };
      error?: string;
    }>(`${process.env.BACKEND_API_URL}/api/ops/support/escalations?${queryParams.toString()}`, {
      headers: {
        'x-internal-secret': INTERNAL_SECRET || '',
      },
    });

    if (!result.success) {
      throw new Error(result.error || 'Failed to fetch escalated tickets');
    }

    return NextResponse.json({
      escalations: result.data || [],
      pagination: result.pagination,
    });
  } catch (error) {
    handleApiError(
      error,
      {
        endpoint: '/api/ops/support/escalations',
        operation: 'GET_ESCALATIONS',
      }
    );
    logger.error("[ESCALATIONS_GET] Failed to fetch escalated tickets", { error });
    return NextResponse.json(
      { error: "Failed to fetch escalated tickets" },
      { status: 500 }
    );
  }
}
