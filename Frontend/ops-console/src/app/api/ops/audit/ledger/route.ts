import { NextResponse } from "next/server";
import { OpsAuthService } from "@/lib/ops-auth";
import { apiClient } from "@/lib/api-client";
import { logger } from "@vayva/shared";

export async function GET(req: Request) {
  try {
    await OpsAuthService.requireSession();

    const { searchParams } = new URL(req.url);
    const storeId = searchParams.get("storeId");
    const count = parseInt(searchParams.get("limit") || "100");

    const response = await apiClient.get('/api/v1/admin/audit/ledger', {
      storeId,
      limit: count,
    });

    return NextResponse.json(response);

    return NextResponse.json({ entries, integrityCheck: "VALID" });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    logger.error("[LEDGER_AUDIT_ERROR]", { error });
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
