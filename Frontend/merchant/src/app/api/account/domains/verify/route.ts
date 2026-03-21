// @ts-nocheck
import { NextRequest, NextResponse } from "next/server";
import { PERMISSIONS } from "@/lib/team/permissions";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

interface DomainVerifyBody {
  domainMappingId?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({})) as DomainVerifyBody;
    const domainMappingId = String(body?.domainMappingId || "");
    if (!domainMappingId) {
      return NextResponse.json({ error: "Domain mapping ID required" }, { status: 400 });
    }

    const storeId = request.headers.get("x-store-id") || "";
    // Call backend API to verify domain
    const result = await apiJson<{
      message: string;
      status: string;
      provider: unknown | null;
    }>(`${process.env.BACKEND_API_URL}/api/account/domains/verify`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-store-id": storeId,
      },
      body: JSON.stringify({ domainMappingId }),
    });
    
    return NextResponse.json(result);
  } catch (error) {
    handleApiError(error, {
      endpoint: "/api/account/domains/verify",
      operation: "VERIFY_DOMAIN",
    });
    return NextResponse.json(
      { error: "Failed to verify domain" },
      { status: 500 }
    );
  }
}
