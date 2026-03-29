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
    const storeId = auth.user.storeId;
    const { searchParams } = new URL(request.url);
    const query = searchParams.toString();
    const result = await apiJson(
      `${process.env.BACKEND_API_URL}/api/education/assignments${query ? `?${query}` : ""}`,
      { headers: auth.headers }
    );
    return NextResponse.json(result);
  } catch (error) {
    handleApiError(error, { endpoint: "/education/assignments", operation: "GET" });
    return NextResponse.json({ error: "Failed to fetch assignments" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await buildBackendAuthHeaders(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const storeId = auth.user.storeId;
    const body = await request.json();
    const result = await apiJson(
      `${process.env.BACKEND_API_URL}/api/education/assignments`,
      {
        method: "POST",
        headers: { ...auth.headers },
        body: JSON.stringify(body),
      }
    );
    return NextResponse.json(result);
  } catch (error) {
    handleApiError(error, { endpoint: "/education/assignments", operation: "POST" });
    return NextResponse.json({ error: "Failed to create assignment" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const auth = await buildBackendAuthHeaders(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const storeId = auth.user.storeId;
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const body = await request.json();
    const result = await apiJson(
      `${process.env.BACKEND_API_URL}/api/education/assignments${id ? `?id=${id}` : ""}`,
      {
        method: "PUT",
        headers: { ...auth.headers },
        body: JSON.stringify(body),
      }
    );
    return NextResponse.json(result);
  } catch (error) {
    handleApiError(error, { endpoint: "/education/assignments", operation: "PUT" });
    return NextResponse.json({ error: "Failed to update assignment" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const auth = await buildBackendAuthHeaders(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const storeId = auth.user.storeId;
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const result = await apiJson(
      `${process.env.BACKEND_API_URL}/api/education/assignments${id ? `?id=${id}` : ""}`,
      {
        method: "DELETE",
        headers: auth.headers,
      }
    );
    return NextResponse.json(result);
  } catch (error) {
    handleApiError(error, { endpoint: "/education/assignments", operation: "DELETE" });
    return NextResponse.json({ error: "Failed to delete assignment" }, { status: 500 });
  }
}
