import { NextResponse } from "next/server";
import { apiClient } from "@/lib/api-client";
import { OpsAuthService } from "@/lib/ops-auth";

export const dynamic = "force-dynamic";

export async function GET(_request: Request) {
  try {
    const { user } = await OpsAuthService.requireSession();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const response = await apiClient.get('/api/v1/ai/stats');
    return NextResponse.json(response);
  } catch (error) {
    console.error("[AI_STATS_ERROR]", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
