import { NextRequest, NextResponse } from "next/server";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

export const runtime = "nodejs";

/**
 * Public-by-reference: Paystack return may land before cookies are readable.
 * Trust model matches public checkout verify — backend validates `reference` / Paystack.
 */
export async function GET(req: NextRequest) {
  try {
    const reference = req.nextUrl.searchParams.get("reference");
    
    if (!reference) {
      return NextResponse.json({ error: "Reference required" }, { status: 400 });
    }
    
    // Call backend API to verify template switch payment
    const result = await apiJson<{
      success: boolean;
      message?: string;
      switch?: { id: string; status: string };
    }>(
      `${process.env.BACKEND_API_URL}/api/billing/template-switch/verify?reference=${encodeURIComponent(reference)}`,
      {
        headers: { "Content-Type": "application/json" },
      },
    );
    
    return NextResponse.json(result, { headers: { "Cache-Control": "no-store" } });
  } catch (error: unknown) {
    handleApiError(
      error,
      {
        endpoint: "/api/billing/template-switch/verify",
        operation: "VERIFY_TEMPLATE_SWITCH",
        storeId: undefined,
      }
    );
    throw error;
  }
}
