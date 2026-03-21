// @ts-nocheck
import { NextRequest, NextResponse } from "next/server";
import { PERMISSIONS } from "@/lib/team/permissions";
import { logger, standardHeaders } from "@vayva/shared";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

export async function GET(request: NextRequest) {
  try {
    const storeId = request.headers.get("x-store-id") || "";
    // Call backend API to fetch template projects
    const result = await apiJson<{
      success: boolean;
      data: Array<{
        id: string;
        name: string;
        source: string;
        status: string;
        createdAt: string;
        updatedAt: string;
      }>;
      meta: { count: number };
      requestId: string;
    }>(
      `${process.env.BACKEND_API_URL}/api/templates/mine`,
      {
        headers: {
          "x-store-id": storeId,
        },
      }
    );
    
    return NextResponse.json(result, { headers: standardHeaders(correlationId) });
  } catch (error) {
    handleApiError(error, { endpoint: "/api/templates/mine", operation: "GET" });
    return NextResponse.json(
      { error: "Failed to complete operation" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const storeId = request.headers.get("x-store-id") || "";
    const body = await request.json();
    const { name, source, basedOnSystemTemplateKey, webstudioProjectId, thumbnailUrl } = body;

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json(
        { error: "Name is required", requestId: correlationId },
        { status: 400, headers: standardHeaders(correlationId) },
      );
    }

    // Call backend API to create template project
    const result = await apiJson<{
      success: boolean;
      data: {
        id: string;
        name: string;
        source: string;
        status: string;
      };
      requestId: string;
    }>(
      `${process.env.BACKEND_API_URL}/api/templates/mine`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-store-id": storeId,
        },
        body: JSON.stringify({
          name: name.trim(),
          source,
          basedOnSystemTemplateKey,
          webstudioProjectId,
          thumbnailUrl,
        }),
      }
    );
    
    return NextResponse.json(result, { status: 201, headers: standardHeaders(correlationId) });
  } catch (error) {
    handleApiError(error, { endpoint: "/api/templates/mine", operation: "POST" });
    return NextResponse.json(
      { error: "Failed to complete operation" },
      { status: 500 }
    );
  }
}
