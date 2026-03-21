import { NextResponse } from "next/server";
import { logger } from "@/lib/logger";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

export const runtime = "nodejs";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const reference = searchParams.get("reference");
    
    if (!reference) {
      return NextResponse.json({ error: "Reference required" }, { status: 400 });
    }
    
    // Call backend API to verify template switch payment
    const result = await apiJson<{
      success: boolean;
      message?: string;
      switch?: { id: string; status: string };
    }>(
      `${process.env.BACKEND_API_URL}/api/billing/template-switch/verify?reference=${reference}`,
      {
        headers: {},
      }
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
