import { NextRequest, NextResponse } from "next/server";
import { buildBackendAuthHeaders } from "@/lib/backend-proxy";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

interface RetentionOffer {
  type: 'discount' | 'success_call' | 'support' | 'pause';
  value?: number;
  durationMonths?: number;
  message: string;
}

// GET /api/billing/cancel/options - Get cancellation options and retention offers
export async function GET(request: NextRequest) {
  try {
    const auth = await buildBackendAuthHeaders(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = await apiJson<{
      success: boolean;
      data?: {
        currentPlan: string;
        retentionOffers: RetentionOffer[];
        cancellationReasons: Array<{ value: string; label: string }>;
      };
      error?: string;
    }>(`${process.env.BACKEND_API_URL}/api/billing/cancel/options`, {
      headers: auth.headers,
    });

    return NextResponse.json(result);
  } catch (error) {
    handleApiError(error, {
      endpoint: "/api/billing/cancel/options",
      operation: "GET_CANCELLATION_OPTIONS",
    });
    return NextResponse.json(
      { error: "Failed to fetch cancellation options" },
      { status: 500 },
    );
  }
}

// POST /api/billing/cancel - Initiate cancellation with exit survey
export async function POST(request: NextRequest) {
  try {
    const auth = await buildBackendAuthHeaders(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    
    const result = await apiJson<{
      success: boolean;
      data?: {
        cancellationId: string;
        currentPlan: string;
        endDate: string;
        gracePeriodDays: number;
        retentionOffer: RetentionOffer | null;
        exportPackage: {
          status: string;
          itemCount: {
            products: number;
            customers: number;
            orders: number;
          };
        } | null;
        nextSteps: string[];
      };
      error?: string;
      requiresAction?: boolean;
    }>(`${process.env.BACKEND_API_URL}/api/billing/cancel`, {
      method: "POST",
      headers: auth.headers,
      body: JSON.stringify(body),
    });

    return NextResponse.json(result);
  } catch (error) {
    handleApiError(error, {
      endpoint: "/api/billing/cancel",
      operation: "POST_CANCELLATION",
    });
    return NextResponse.json(
      { error: "Failed to process cancellation" },
      { status: 500 },
    );
  }
}
