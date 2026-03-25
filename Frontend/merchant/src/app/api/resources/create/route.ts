import { NextRequest, NextResponse } from "next/server";
import { buildBackendAuthHeaders, buildBackendUrl } from "@/lib/backend-proxy";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

const ALLOWED_TYPES = ["digital", "service", "course", "event", "subscription", "physical"] as const;

export async function POST(request: NextRequest): Promise<Response> {
  try {
    const auth = await buildBackendAuthHeaders(request);
    if (!auth?.user?.storeId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as Record<string, unknown>;
    const primaryObject = typeof body.primaryObject === "string" ? body.primaryObject : "";
    const data = body.data;

    if (!primaryObject || !(ALLOWED_TYPES as readonly string[]).includes(primaryObject)) {
      return NextResponse.json({ error: "Invalid resource type" }, { status: 400 });
    }

    const result = await apiJson<{
      success: boolean;
      data?: { id?: string };
      error?: string;
    }>(buildBackendUrl("/api/resources/create"), {
      method: "POST",
      headers: auth.headers,
      body: JSON.stringify({ primaryObject, data }),
    });

    if (!result.success) {
      throw new Error(result.error || "Failed to create resource");
    }

    return NextResponse.json({ success: true, id: result.data?.id || "" });
  } catch (error: unknown) {
    handleApiError(error, { endpoint: "/api/resources/create", operation: "POST" });
    return NextResponse.json({ error: "Failed to complete operation" }, { status: 500 });
  }
}
