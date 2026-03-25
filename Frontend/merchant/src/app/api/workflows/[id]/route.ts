import { NextRequest, NextResponse } from "next/server";
import { buildBackendAuthHeaders } from "@/lib/backend-proxy";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

const backendBase = () => process.env.BACKEND_API_URL?.replace(/\/$/, "") ?? "";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const auth = await buildBackendAuthHeaders(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { id } = await params;
    const data = await apiJson<unknown>(
      `${backendBase()}/api/workflows/${encodeURIComponent(id)}`,
      { headers: auth.headers },
    );
    return NextResponse.json(data);
  } catch (error) {
    handleApiError(error, {
      endpoint: "/api/workflows/[id]",
      operation: "GET_WORKFLOW",
    });
    return NextResponse.json({ error: "Failed to load workflow" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const auth = await buildBackendAuthHeaders(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { id } = await params;
    const body = await request.text();
    const data = await apiJson<unknown>(
      `${backendBase()}/api/workflows/${encodeURIComponent(id)}`,
      {
        method: "PUT",
        headers: auth.headers,
        body,
      },
    );
    return NextResponse.json(data);
  } catch (error) {
    handleApiError(error, {
      endpoint: "/api/workflows/[id]",
      operation: "PUT_WORKFLOW",
    });
    return NextResponse.json({ error: "Failed to update workflow" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const auth = await buildBackendAuthHeaders(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { id } = await params;
    const res = await fetch(
      `${backendBase()}/api/workflows/${encodeURIComponent(id)}`,
      {
        method: "DELETE",
        headers: auth.headers,
      },
    );
    if (res.status === 204) {
      return new NextResponse(null, { status: 204 });
    }
    const body: unknown = await res.json().catch(() => ({}));
    return NextResponse.json(body, { status: res.status });
  } catch (error) {
    handleApiError(error, {
      endpoint: "/api/workflows/[id]",
      operation: "DELETE_WORKFLOW",
    });
    return NextResponse.json({ error: "Failed to delete workflow" }, { status: 500 });
  }
}
