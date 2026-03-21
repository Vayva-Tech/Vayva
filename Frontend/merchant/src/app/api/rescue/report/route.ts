import { NextRequest, NextResponse } from "next/server";
import { PERMISSIONS } from "@/lib/team/permissions";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

export async function POST(request: NextRequest) {
  try {
    const storeId = request.headers.get("x-store-id") || "";
    const body = await request.json().catch(() => ({}));
        const { route, errorMessage, stackHash, fingerprint } = body;
        if (!errorMessage) {
            return NextResponse.json({ error: "No error message" }, { status: 400 });
        }
        
        // Report incident via backend API
        const result = await apiJson<{
          success: boolean;
          data?: { id: string; status?: string };
          error?: string;
        }>(`${process.env.BACKEND_API_URL}/api/rescue/report`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-store-id": storeId,
          },
          body: JSON.stringify({
            route: route || "unknown",
            errorMessage,
            stackHash,
            fingerprint,
            storeId,
          }),
        });

        if (!result.success) {
          throw new Error(result.error || 'Failed to report incident');
        }

        return NextResponse.json({
            incidentId: result.data?.id,
            status: result.data?.status,
            message: "Rescue initiated",
        });
  } catch (error) {
    handleApiError(error, { endpoint: "/api/rescue/report", operation: "POST" });
    return NextResponse.json(
      { error: "Failed to complete operation" },
      { status: 500 }
    );
  }
}
