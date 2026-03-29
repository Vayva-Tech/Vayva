import { NextRequest, NextResponse } from "next/server";
import { buildBackendAuthHeaders } from "@/lib/backend-proxy";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

interface StoreSettings {
  paystack?: { connected?: boolean };
  delivery?: { connected?: boolean };
  api?: { active?: boolean };
}

export async function GET(request: NextRequest) {
  try {
    // Call backend API to fetch account overview
    const auth = await buildBackendAuthHeaders(request);
    if (!auth?.user?.storeId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const result = await apiJson<{
      store: {
        name: string;
        slug: string;
        category: string;
        plan: string;
        isLive: boolean;
        onboardingCompleted: boolean;
        settings: StoreSettings;
      };
      bankAccount?: { id: string; isDefault: boolean };
      security?: { twoFactorEnabled: boolean };
      domain?: { id: string; domain: string };
      recentLogs?: Array<{ id: string; action: string; createdAt: Date }>;
      kyc?: { id: string; status: string };
    }>(`${process.env.BACKEND_API_URL}/api/account/overview`, {
      headers: auth.headers,
    });
    
    return NextResponse.json(result);
  } catch (error) {
    handleApiError(error, {
      endpoint: "/account/overview",
      operation: "GET_ACCOUNT_OVERVIEW",
    });
    return NextResponse.json(
      { error: "Failed to fetch account overview" },
      { status: 500 }
    );
  }
}
