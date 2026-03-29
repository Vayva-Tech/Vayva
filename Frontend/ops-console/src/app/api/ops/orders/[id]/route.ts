import { NextRequest, NextResponse } from "next/server";
import { OpsAuthService } from "@/lib/ops-auth";
import { apiClient } from "@/lib/api-client";
import { logger } from "@vayva/shared";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }, // Next 15 Pattern
) {
  try {
    await OpsAuthService.requireSession();

    const { id } = await params;

    const response = await apiClient.get(`/api/v1/admin/orders/${id}`);
    
    return NextResponse.json(response);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: unknown) {
    if (
      error instanceof Error ? error.message : String(error) === "Unauthorized"
    )
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    logger.error("[ORDER_DETAIL_ERROR]", { error });
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
