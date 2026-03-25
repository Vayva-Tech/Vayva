import { NextRequest, NextResponse } from "next/server";
import { buildBackendAuthHeaders } from "@/lib/backend-proxy";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

const backendBase = () => process.env.BACKEND_API_URL?.replace(/\/$/, "") ?? "";

interface AgentConfig {
  name: string;
  avatarUrl: string;
  tone: string;
  signature: string;
}

// GET /api/ai-agent/profile - Load agent profile
export async function GET(request: NextRequest) {
  try {
    const auth = await buildBackendAuthHeaders(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = await apiJson<AgentConfig>(
      `${backendBase()}/api/ai-agent/profile`,
      {
        headers: {
          ...auth.headers,
          "x-user-id": auth.user.id,
        },
      },
    );

    return NextResponse.json(result);
  } catch (error) {
    handleApiError(error, {
      endpoint: "/api/ai-agent/profile",
      operation: "GET_AI_AGENT_PROFILE",
    });
    return NextResponse.json(
      { error: "Failed to load agent profile" },
      { status: 500 },
    );
  }
}
