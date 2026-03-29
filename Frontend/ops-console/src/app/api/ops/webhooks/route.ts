import { NextRequest, NextResponse } from "next/server";
import { OpsAuthService } from "@/lib/ops-auth";
import { apiClient } from "@/lib/api-client";
import { logger } from "@vayva/shared";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    await OpsAuthService.requireSession();

    const searchParams = req.nextUrl?.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const search = searchParams.get("q") || "";
    const provider = searchParams.get("provider") || "";
    const status = searchParams.get("status") || "";

    const response = await apiClient.get('/api/v1/admin/webhooks', {
      page,
      limit,
      q: search,
      provider,
      status,
    });

    return NextResponse.json(response);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: unknown) {
    logger.error("[WEBHOOKS_LIST_ERROR]", { error });
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
