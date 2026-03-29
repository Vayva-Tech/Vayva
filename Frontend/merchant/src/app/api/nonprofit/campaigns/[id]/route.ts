import { NextRequest, NextResponse } from "next/server";
import { buildBackendAuthHeaders } from "@/lib/backend-proxy";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = await buildBackendAuthHeaders(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const response = await apiJson(
      `${process.env.BACKEND_API_URL}/api/v1/campaigns/${params.id}`,
      {
        headers: auth.headers,
      }
    );

    return NextResponse.json(response);
  } catch (error: unknown) {
    const _errMsg = error instanceof Error ? error.message : String(error);
    logger.error("[CAMPAIGN_GET_ERROR]", { error: _errMsg });
    return Response.json({ error: _errMsg }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = await buildBackendAuthHeaders(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const body = await request.json();

    const response = await apiJson(
      `${process.env.BACKEND_API_URL}/api/v1/campaigns/${params.id}`,
      {
        method: "PUT",
        headers: auth.headers,
        body: JSON.stringify(body),
      }
    );

    return NextResponse.json(response);
  } catch (error: unknown) {
    const _errMsg = error instanceof Error ? error.message : String(error);
    logger.error("[CAMPAIGN_UPDATE_ERROR]", { error: _errMsg });
    return Response.json({ error: _errMsg }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = await buildBackendAuthHeaders(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const response = await apiJson(
      `${process.env.BACKEND_API_URL}/api/v1/campaigns/${params.id}`,
      {
        method: "DELETE",
        headers: auth.headers,
      }
    );

    return NextResponse.json(response);
  } catch (error: unknown) {
    const _errMsg = error instanceof Error ? error.message : String(error);
    logger.error("[CAMPAIGN_DELETE_ERROR]", { error: _errMsg });
    return Response.json({ error: _errMsg }, { status: 500 });
  }
}
