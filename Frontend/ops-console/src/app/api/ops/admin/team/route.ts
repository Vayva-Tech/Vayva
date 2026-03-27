import { NextResponse } from "next/server";
import { apiClient } from "@/lib/api-client";
import { OpsAuthService } from "@/lib/ops-auth";
import { logger } from "@vayva/shared";

export const dynamic = "force-dynamic";

export async function GET(_request: Request) {
  const { user } = await OpsAuthService.requireSession();
  if (!["OPS_OWNER", "OPS_ADMIN"].includes(user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const response = await apiClient.get('/api/v1/admin/team');
  return NextResponse.json(response);
}

export async function POST(request: Request) {
  const { user } = await OpsAuthService.requireSession();
  if (user.role !== "OPS_OWNER") {
    return NextResponse.json(
      { error: "Unauthorized: Only Owner can invite users" },
      { status: 403 },
    );
  }

  const body = await request.json();
  const { email, name, role } = body;

  if (!email || !name || !role) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  try {
    const response: any = await apiClient.post('/api/v1/admin/team', {
      email,
      name,
      role,
    });

    await OpsAuthService.logEvent(user.id, "OPS_USER_CREATE", {
      createdUserId: response?.data?.id,
      role,
    });

    return NextResponse.json(response);
  } catch (e) {
    logger.error("[OPS_TEAM_CREATE_ERROR]", { error: e });
    return NextResponse.json(
      {
        error: e instanceof Error ? e.message : String(e),
      },
      { status: 500 },
    );
  }
}
