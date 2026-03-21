// @ts-nocheck
import { NextRequest, NextResponse } from "next/server";
import { PERMISSIONS } from "@/lib/team/permissions";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

// POST /api/ai-agent/publish - Publish agent profile changes live
export async function POST(request: NextRequest) {
  try {
    const result = await apiJson<{ success: boolean }>(`${process.env.BACKEND_API_URL}/api/ai-agent/publish`, {
      method: "POST",
      headers: {
        "x-store-id": storeId,
        "x-user-id": user.id,
      },
    });
    
    return NextResponse.json(result);
  } catch (error) {
    handleApiError(error, {
      endpoint: "/api/ai-agent/publish",
      operation: "PUBLISH_AI_AGENT",
    });
    return NextResponse.json(
      { error: "Failed to publish agent" },
      { status: 500 }
    );
  }
}
