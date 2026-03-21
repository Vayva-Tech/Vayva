// @ts-nocheck
import { urls } from "@vayva/shared";
import { NextRequest, NextResponse } from "next/server";
import { PERMISSIONS } from "@/lib/team/permissions";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

export async function GET(request: NextRequest) {
  try {
    // Call backend API to fetch domain details
    const storeId = request.headers.get("x-store-id") || "";
    const result = await apiJson<{
      id: string | null;
      subdomain: string | null;
      customDomain: string | null;
      status: string;
      verificationToken: string | null;
      lastCheckedAt: string | null;
      lastError: string | null;
      sslEnabled: boolean;
    }>(`${process.env.BACKEND_API_URL}/api/account/domains`, {
      headers: {
        "x-store-id": storeId,
      },
    });
    
    return NextResponse.json(result, {
      headers: {
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    handleApiError(error, {
      endpoint: "/api/account/domains",
      operation: "GET_DOMAINS",
    });
    throw error;
  }
}
