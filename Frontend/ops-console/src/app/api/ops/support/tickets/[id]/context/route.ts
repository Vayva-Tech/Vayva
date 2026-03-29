import { NextRequest, NextResponse } from "next/server";
import { OpsAuthService } from "@/lib/ops-auth";
import { apiClient } from "@/lib/api-client";
import { logger } from "@vayva/shared";

export const dynamic = "force-dynamic";

interface MerchantContext {
  store: {
    id: string;
    name: string;
    slug: string;
    status: string;
    tier: string;
    createdAt: string;
    lastLoginAt: string | null;
  };
  subscription: {
    plan: string;
    status: string;
    currentPeriodEnd: string | null;
    trialEndsAt: string | null;
    mrr: number;
  } | null;
  billing: {
    paymentMethodOnFile: boolean;
    lastPaymentAt: string | null;
    lastPaymentAmount: number | null;
    failedPaymentCount: number;
    balance: number;
  };
  kyc: {
    status: string;
    verifiedAt: string | null;
    documentsSubmitted: number;
    documentsVerified: number;
  };
  recentOrders: {
    id: string;
    total: number;
    status: string;
    createdAt: string;
    customerName: string;
  }[];
  recentActivity: {
    id: string;
    type: string;
    description: string;
    createdAt: string;
  }[];
  openAlerts: {
    id: string;
    severity: string;
    message: string;
    createdAt: string;
  }[];
  stats: {
    totalOrders30d: number;
    totalRevenue30d: number;
    avgOrderValue: number;
    supportTickets30d: number;
  };
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { user } = await OpsAuthService.requireSession();
    (OpsAuthService as any).requireRole(user, "OPS_SUPPORT");

    const { id } = await params;

    const response = await apiClient.get(`/api/v1/admin/support/tickets/${id}/context`);
    
    return NextResponse.json({ data: response });
  } catch (error: unknown) {
    if (
      error instanceof Error ? error.message : String(error) === "Unauthorized"
    )
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (
      error instanceof Error
        ? error.message
        : String(error)?.includes("Insufficient permissions")
    )
      return NextResponse.json(
        { error: error instanceof Error ? error.message : String(error) },
        { status: 403 },
      );

    logger.error("[SUPPORT_CONTEXT_ERROR]", { error });
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
