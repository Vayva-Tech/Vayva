import { NextRequest, NextResponse } from "next/server";
import { apiClient } from "@/lib/api-client";
import { OpsAuthService } from "@/lib/ops-auth";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user } = await OpsAuthService.requireSession();
    
    try {
      OpsAuthService.requireRole(user, "OPS_SUPPORT");
    } catch (roleErr) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const page = searchParams.get("page") || "1";
    const limit = searchParams.get("limit") || "20";
    const search = searchParams.get("q") || "";

    const response = await apiClient.get(`/api/v1/admin/merchants/${id}/customers`, {
      page,
      limit,
      q: search,
    });

    return NextResponse.json(response);
  } catch (error) {
    console.error("[MERCHANT_CUSTOMERS_ERROR]", error);
    return NextResponse.json(
      { error: "Failed to fetch customers" },
      { status: 500 },
    );
  }
}
