import { NextRequest, NextResponse } from "next/server";
import { OpsAuthService } from "@/lib/ops-auth";
import { apiClient } from "@/lib/api-client";
import { logger } from "@vayva/shared";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { user } = await OpsAuthService.requireSession();
    if (!user || !["OPS_OWNER", "OPS_ADMIN", "OPS_SUPPORT"].includes(user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const searchParams = req.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 100);
    const q = (searchParams.get("q") || "").trim();
    const storeId = (searchParams.get("storeId") || "").trim();

    // Proxy to backend Fastify API
    const response = await apiClient.get('/api/v1/financial/wallet-funding/ops', {
      page: page.toString(),
      limit: limit.toString(),
      q,
      storeId
    });

    return NextResponse.json(response);
  } catch (error: unknown) {
    logger.error("[OPS_WALLET_FUNDING_LIST_ERROR]", { error });
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
