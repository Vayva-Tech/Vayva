import { NextRequest, NextResponse } from "next/server";
import { buildBackendAuthHeaders } from "@/lib/backend-proxy";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

const backendBase = () => process.env.BACKEND_API_URL?.replace(/\/$/, "") ?? "";

export async function POST(request: NextRequest) {
  try {
    const auth = await buildBackendAuthHeaders(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = auth.user.id;

    const result = await apiJson<{
      success: boolean;
      data?: { message?: string };
      error?: string;
    }>(`${backendBase()}/api/auth/security/signout-all`, {
      method: "POST",
      headers: {
        ...auth.headers,
        "x-user-id": userId,
      },
    });

    return NextResponse.json(result);
  } catch (error) {
    handleApiError(error, {
      endpoint: "/auth/security/signout-all",
      operation: "SIGNOUT_ALL_SESSIONS",
    });
    return NextResponse.json(
      { error: "Failed to sign out all sessions" },
      { status: 500 },
    );
  }
}
