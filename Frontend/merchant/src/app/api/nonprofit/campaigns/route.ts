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
    const campaignId = searchParams.get("campaignId");

    if (campaignId) {
      // Get single campaign
      const response = await apiJson(
        `${process.env.BACKEND_API_URL}/api/v1/campaigns/${campaignId}`,
        {
          headers: auth.headers,
        }
      );
      return NextResponse.json(response);
    }

    // Get all campaigns
    const response = await apiJson(
      `${process.env.BACKEND_API_URL}/api/v1/campaigns?storeId=${storeId}`,
      {
        headers: auth.headers,
      }
    );

    return NextResponse.json(response);
  } catch (error: unknown) {
    const _errMsg = error instanceof Error ? error.message : String(error);
    logger.error("[CAMPAIGNS_GET_ERROR]", { error: _errMsg });
    return Response.json({ error: _errMsg }, { status: 500 });
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

    const response = await apiJson(
      `${process.env.BACKEND_API_URL}/api/v1/campaigns`,
      {
        method: "POST",
        headers: auth.headers,
        body: JSON.stringify({ ...body, storeId }),
      }
    );

    return NextResponse.json(response);
  } catch (error: unknown) {
    const _errMsg = error instanceof Error ? error.message : String(error);
    logger.error("[CAMPAIGN_CREATE_ERROR]", { error: _errMsg });
    return Response.json({ error: _errMsg }, { status: 500 });
  }
}
