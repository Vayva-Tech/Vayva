import { NextRequest, NextResponse } from "next/server";
import { buildBackendAuthHeaders } from "@/lib/backend-proxy";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

export async function POST(request: NextRequest) {
  try {
    const auth = await buildBackendAuthHeaders(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const storeId = auth.user.storeId;
    const body = await request.json();
    const result = await apiJson(
      `${process.env.BACKEND_API_URL}/api/affiliate/register`,
      {
        method: "POST",
        headers: { ...auth.headers },
        body: JSON.stringify(body),
      }
    );
    return NextResponse.json(result);
  } catch (error) {
    handleApiError(error, { endpoint: "/api/affiliate/register", operation: "POST" });
    return NextResponse.json({ error: "Failed to register affiliate" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const auth = await buildBackendAuthHeaders(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const storeId = auth.user.storeId;
    const body = await request.json();
    const result = await apiJson(
      `${process.env.BACKEND_API_URL}/api/affiliate/register`,
      {
        method: "PUT",
        headers: { ...auth.headers },
        body: JSON.stringify(body),
      }
    );
    return NextResponse.json(result);
  } catch (error) {
    handleApiError(error, { endpoint: "/api/affiliate/register", operation: "PUT" });
    return NextResponse.json({ error: "Failed to update bank details" }, { status: 500 });
  }
}
