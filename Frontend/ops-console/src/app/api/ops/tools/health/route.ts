import { NextRequest, NextResponse } from "next/server";
import { OpsAuthService } from "@/lib/ops-auth";
import { apiClient } from "@/lib/api-client";

export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest) {
  try {
    await OpsAuthService.requireSession();

    const response = await apiClient.get('/api/v1/admin/tools/health');
    
    return NextResponse.json(response);
  } catch {
    return NextResponse.json({ error: "Health check failed" }, { status: 500 });
  }
}
