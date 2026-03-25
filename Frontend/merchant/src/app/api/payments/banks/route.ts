import { NextResponse } from "next/server";
import { buildBackendAuthHeaders } from "@/lib/backend-proxy";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";
export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: { "Cache-Control": "no-store" } });
  }
  try {
    // Fetch banks list via backend API
    const result = await apiJson<{
      success: boolean;
      data?: Array<{ name: string; code: string }>;
      error?: string;
    }>(`${process.env.BACKEND_API_URL}/api/payments/banks`);

    if (!result.success) {
      throw new Error(result.error || 'Failed to fetch banks');
    }

    return NextResponse.json(result.data, { headers: { "Cache-Control": "no-store" } });
  }
  catch (error) {
    handleApiError(
      error,
      {
        endpoint: "/api/payments/banks",
        operation: "FETCH_BANKS_LIST",
      }
    );
    return NextResponse.json({ error: "Failed to fetch banks" }, { status: 500, headers: { "Cache-Control": "no-store" } });
  }
}
