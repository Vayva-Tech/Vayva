import { NextRequest, NextResponse } from "next/server";
import { buildBackendAuthHeaders } from "@/lib/backend-proxy";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

const backendBase = () => process.env.BACKEND_API_URL?.replace(/\/$/, "") ?? "";

/** DELETE /api/social-connections/[platformId] */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ platformId: string }> },
) {
  try {
    const auth = await buildBackendAuthHeaders(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { platformId } = await params;
    const encoded = encodeURIComponent(platformId);

    const data = await apiJson<unknown>(
      `${backendBase()}/api/social-connections/${encoded}`,
      {
        method: "DELETE",
        headers: auth.headers,
      },
    );

    return NextResponse.json(data);
  } catch (error) {
    handleApiError(error, {
      endpoint: "/social-connections/[platformId]",
      operation: "DELETE_SOCIAL_CONNECTION",
    });
    return NextResponse.json(
      { error: "Failed to disconnect social platform" },
      { status: 500 },
    );
  }
}
