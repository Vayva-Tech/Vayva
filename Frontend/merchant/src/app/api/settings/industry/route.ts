import { NextRequest, NextResponse } from "next/server";
import { buildBackendAuthHeaders } from "@/lib/backend-proxy";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

export async function GET(request: NextRequest) {
  try {
    const auth = await buildBackendAuthHeaders(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = await apiJson<{
      industrySlug: string | null;
      config: {
        displayName: string;
        primaryObject: string;
        modules: string[];
        moduleLabels: Record<string, string>;
      } | null;
    }>(`${process.env.BACKEND_API_URL}/api/settings/industry`, {
      headers: auth.headers,
    });

    return NextResponse.json(result, {
      headers: {
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    handleApiError(error, {
      endpoint: "/settings/industry",
      operation: "GET_INDUSTRY_SETTINGS",
    });
    return NextResponse.json(
      { error: "Failed to fetch industry settings" },
      { status: 500 },
    );
  }
}
