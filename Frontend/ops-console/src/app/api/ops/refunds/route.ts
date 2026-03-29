import { NextRequest, NextResponse } from "next/server";
import { OpsAuthService } from "@/lib/ops-auth";
import { apiClient } from "@/lib/api-client";
import { logger } from "@vayva/shared";

interface ReturnRequestWithOrder {
  id: string;
  orderId: string;
  status: string;
  reasonText: string | null;
  reasonCode: string;
  merchantId: string;
  createdAt: Date;
}

export async function GET(req: NextRequest) {
  await OpsAuthService.requireSession();

  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || "PENDING";

    const response = await apiClient.get('/api/v1/admin/refunds', { status });
    
    return NextResponse.json(response);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: unknown) {
    logger.error("[REFUNDS_ERROR]", { error });
    return NextResponse.json(
      { error: "Failed to fetch refunds" },
      { status: 500 },
    );
  }
}
