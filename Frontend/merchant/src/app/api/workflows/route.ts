import { NextRequest, NextResponse } from "next/server";
import { buildBackendAuthHeaders } from "@/lib/backend-proxy";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

const backendBase = () => process.env.BACKEND_API_URL?.replace(/\/$/, "") ?? "";

export async function GET(request: NextRequest) {
  try {
    const auth = await buildBackendAuthHeaders(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const qs = new URL(request.url).searchParams.toString();
    const suffix = qs ? `?${qs}` : "";
    const data = await apiJson<unknown>(`${backendBase()}/api/workflows${suffix}`, {
      headers: auth.headers,
    });
    return NextResponse.json(data);
  } catch (error) {
    handleApiError(error, { endpoint: "/workflows", operation: "GET_WORKFLOWS" });
    return NextResponse.json({ error: "Failed to list workflows" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await buildBackendAuthHeaders(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const body = await request.text();
    const data = await apiJson<unknown>(`${backendBase()}/api/workflows`, {
      method: "POST",
      headers: auth.headers,
      body,
    });
    return NextResponse.json(data);
  } catch (error) {
    handleApiError(error, { endpoint: "/workflows", operation: "POST_WORKFLOW" });
    return NextResponse.json({ error: "Failed to create workflow" }, { status: 500 });
  }
}
