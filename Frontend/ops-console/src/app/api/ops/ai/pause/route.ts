import { NextRequest, NextResponse } from "next/server";
import { apiClient } from "@/lib/api-client";
import { OpsAuthService } from "@/lib/ops-auth";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const { user } = await OpsAuthService.requireSession();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { phoneNumber, handoffId } = body;

    if (!phoneNumber) {
      return NextResponse.json(
        { error: "Phone number is required" },
        { status: 400 }
      );
    }

    const response = await apiClient.post('/api/v1/ai/pause', {
      phoneNumber,
      handoffId,
    });

    return NextResponse.json(response);
  } catch (error) {
    console.error("[AI_PAUSE_ERROR]", error);
    return NextResponse.json(
      { error: "Failed to pause AI agent" },
      { status: 500 },
    );
  }
}
