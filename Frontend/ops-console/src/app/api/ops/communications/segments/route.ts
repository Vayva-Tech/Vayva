import { NextResponse } from "next/server";
import { OpsAuthService } from "@/lib/ops-auth";
import { apiClient } from "@/lib/api-client";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { user } = await OpsAuthService.requireSession();
  if (!["OPS_OWNER", "OPS_ADMIN", "OPS_SUPPORT"].includes(user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const storeId = searchParams.get("storeId")?.trim();
  if (!storeId) {
    return NextResponse.json(
      { error: "storeId query parameter is required" },
      { status: 400 },
    );
  }

  const minSpend = parseInt(searchParams.get("minSpend") || "0");
  const minOrders = parseInt(searchParams.get("minOrders") || "0");

  const response = await apiClient.get('/api/v1/admin/communications/segments', {
    storeId,
    minSpend,
    minOrders,
  });

  return NextResponse.json(response);
}
