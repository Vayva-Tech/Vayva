import { NextRequest, NextResponse } from "next/server";
import { apiClient } from "@/lib/api-client";
import { OpsAuthService } from "../../../../lib/ops-auth";
import {
  handleAuthError,
  handleInternalError,
} from "../../../../lib/api/errors";

// Type for store with included relations
type StoreWithRelations = Prisma.StoreGetPayload<{
  include: {
    aiSubscription: true;
    wallet: { select: { kycStatus: true; isLocked: true } };
    orders: { select: { total: true } };
    tenant: {
      include: {
        tenantMemberships: {
          include: {
            user: { select: { id: true; firstName: true; lastName: true; email: true } };
          };
        };
      };
    };
    _count: { select: { orders: true } };
  };
}>;

type TenantMembership = Prisma.TenantMembershipGetPayload<{
  include: {
    user: { select: { id: true; firstName: true; lastName: true; email: true } };
  };
}>;

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { user } = await OpsAuthService.requireSession();
    (OpsAuthService as any).requireRole(user, "OPS_SUPPORT");

    const { searchParams } = new URL(request.url);
    const page = searchParams.get("page") || "1";
    const limit = searchParams.get("limit") || "20";
    const search = searchParams.get("q") || searchParams.get("search") || "";

    // Proxy to backend
    const response = await apiClient.get('/api/v1/admin/merchants', { page, limit, q: search });
    return NextResponse.json(response);
  } catch (error: unknown) {
    if (error instanceof Error && error.message.includes("Unauthorized")) {
      return handleAuthError(error);
    }
    if (error instanceof Error && error.message.includes("permission")) {
      return handleAuthError(error);
    }
    return handleInternalError(error, { endpoint: "/api/ops/merchants" });
  }
}
