// @ts-nocheck
import { NextRequest, NextResponse } from "next/server";
import { PERMISSIONS } from "@/lib/team/permissions";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

interface AgentConfig {
  name: string;
  avatarUrl: string;
  tone: string;
  signature: string;
}

// GET /api/ai-agent/profile - Load agent profile
export async function GET(request: NextRequest) {
  try {
    const result = await apiJson<AgentConfig>(`${process.env.BACKEND_API_URL}/api/ai-agent/profile`, {
      headers: {
        "x-store-id": storeId,
        "x-user-id": user.id,
      },
    });
    
    return NextResponse.json(result);
  } catch (error) {
    handleApiError(error, {
      endpoint: "/api/ai-agent/profile",
      operation: "GET_AI_AGENT_PROFILE",
    });
    return NextResponse.json(
      { error: "Failed to load agent profile" },
      { status: 500 }
    );
  }
}
