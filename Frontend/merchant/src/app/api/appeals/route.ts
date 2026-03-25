import { NextRequest, NextResponse } from "next/server";
import { buildBackendAuthHeaders } from "@/lib/backend-proxy";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

interface Appeal {
  id: string;
  status: string;
  createdAt: string;
  createdBy: string;
  severity: string;
  channel?: string;
  reason: string;
  message: string;
  customerEmail?: string;
  customerPhone?: string;
  evidenceUrls: string[];
  history: Array<{
    at: string;
    by: string;
    type: string;
    status: string;
    notes: string;
  }>;
}

export async function GET(request: NextRequest) {
  try {
    const auth = await buildBackendAuthHeaders(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = await apiJson<{
      appeals: Appeal[];
      warnings: unknown[];
      restrictions: {
        ordersDisabled?: boolean;
        productsDisabled?: boolean;
        marketingDisabled?: boolean;
        settingsEditsDisabled?: boolean;
        salesDisabled?: boolean;
        paymentsDisabled?: boolean;
        uploadsDisabled?: boolean;
        aiDisabled?: boolean;
      };
    }>(`${process.env.BACKEND_API_URL}/api/appeals`, {
      headers: auth.headers,
    });

    return NextResponse.json(result);
  } catch (error) {
    handleApiError(error, {
      endpoint: "/api/appeals",
      operation: "GET_APPEALS",
    });
    return NextResponse.json(
      { error: "Failed to fetch appeals" },
      { status: 500 },
    );
  }
}
