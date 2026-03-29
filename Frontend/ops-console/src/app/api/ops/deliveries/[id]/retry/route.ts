import { NextResponse } from "next/server";
import { OpsAuthService } from "@/lib/ops-auth";
import { apiClient } from "@/lib/api-client";
import { logger } from "@vayva/shared";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { user } = await OpsAuthService.requireSession();
    if (!["OPS_OWNER", "OPS_ADMIN", "OPS_SUPPORT"].includes(user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const resolvedParams = await params;
    const { id } = resolvedParams;

    const response = await apiClient.post(`/api/v1/admin/deliveries/${id}/retry`);
    
    return NextResponse.json(response);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: unknown) {
    if (
      error instanceof Error ? error.message : String(error) === "Unauthorized"
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    logger.error("[RETRY_DISPATCH_ERROR]", { error });
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
