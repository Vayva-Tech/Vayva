// @ts-nocheck
import { urls } from "@vayva/shared";
import { NextRequest, NextResponse } from "next/server";
import { PERMISSIONS } from "@/lib/team/permissions";
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
    const storeId = request.headers.get("x-store-id") || "";
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
      headers: {
        "x-store-id": storeId,
      },
    });
    
    return NextResponse.json(result);
  } catch (error) {
    handleApiError(error, {
      endpoint: "/api/account/overview",
      operation: "GET_ACCOUNT_OVERVIEW",
    });
    return NextResponse.json(
      { error: "Failed to fetch account overview" },
      { status: 500 }
    );
  }
}
