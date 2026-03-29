import { NextResponse } from "next/server";
import { OpsAuthService } from "@/lib/ops-auth";
import { opsApiAuthErrorResponse } from "@/lib/ops-api-auth";
import { apiClient } from "@/lib/api-client";
import { logger } from "@vayva/shared";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const { user } = await OpsAuthService.requireSession();
    OpsAuthService.requireRole(user, "SUPERVISOR");

    const body = await req.json().catch(() => ({}));
    const batchSize = Math.min(Math.max(Number(body?.batchSize || 25), 1), 100);

    const response = await apiClient.post('/api/v1/admin/jobs/drain-emails', {
      batchSize,
    });

    return NextResponse.json(response);
  } catch (err: unknown) {
    const authRes = opsApiAuthErrorResponse(err);
    if (authRes) return authRes;
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
