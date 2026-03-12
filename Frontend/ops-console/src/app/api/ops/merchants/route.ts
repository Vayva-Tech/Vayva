import { NextRequest, NextResponse } from "next/server";
import { prisma, Prisma } from "@vayva/db";
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
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const search = searchParams.get("q") || searchParams.get("search") || "";

    const skip = (page - 1) * limit;

    const where: Prisma.StoreWhereInput = {
      AND: [
        search
          ? {
              OR: [
                { name: { contains: search, mode: "insensitive" } },
                { slug: { contains: search, mode: "insensitive" } },
                {
                  tenant: {
                    tenantMemberships: {
                      some: {
                        user: {
                          OR: [
                            {
                              email: { contains: search, mode: "insensitive" },
                            },
                            {
                              firstName: {
                                contains: search,
                                mode: "insensitive",
                              },
                            },
                            {
                              lastName: {
                                contains: search,
                                mode: "insensitive",
                              },
                            },
                            {
                              phone: { contains: search, mode: "insensitive" },
                            },
                          ],
                        },
                      },
                    },
                  },
                },
              ],
            }
          : {},
      ],
    };

    const [stores, total] = await Promise.all([
      prisma.store.findMany({
        where,
        take: limit,
        skip,
        orderBy: { createdAt: "desc" },
        include: {
          aiSubscription: true,
          wallet: {
            select: {
              kycStatus: true,
              isLocked: true,
            },
          },
          orders: {
            where: {
              createdAt: {
                gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
              },
              paymentStatus: "SUCCESS", // Assuming SUCCESS means paid volume
            },
            select: {
              total: true,
            },
          },
          tenant: {
            include: {
              tenantMemberships: {
                include: {
                  user: {
                    select: {
                      id: true,
                      firstName: true,
                      lastName: true,
                      email: true,
                    },
                  },
                },
              },
            },
          },
          _count: {
            select: {
              orders: true,
            },
          },
        },
      }),
      prisma.store.count({ where }),
    ]);

    const data = stores.map((store: StoreWithRelations) => {
      // Find owner
      const members = store.tenant?.tenantMemberships || [];
      const ownerMember =
        members.find((m: TenantMembership) => m.role === "OWNER") || members[0];
      const owner = ownerMember?.user;
      const ownerName = owner
        ? `${owner.firstName || ""} ${owner.lastName || ""}`.trim()
        : "Unknown";

      // Calculate GMV
      const gmv30d = store.orders.reduce(
        (sum, o) => sum + Number(o.total || 0),
        0,
      );

      // Determine Risk
      const riskFlags: string[] = [];
      if (store.wallet?.isLocked) riskFlags.push("WALLET_LOCKED");

      return {
        id: store.id,
        name: store.name,
        slug: store.slug,
        ownerName: ownerName || "Unknown",
        ownerEmail: owner?.email || "Unknown",
        status: "ACTIVE" as const,
        plan: store.plan || "FREE",
        trialEndsAt: null,
        kycStatus: store.wallet?.kycStatus || "NOT_SUBMITTED",
        riskFlags,
        gmv30d: gmv30d,
        lastActive: store.createdAt.toISOString(),
        createdAt: store.createdAt.toISOString(),
        location: "N/A" as const,
      };
    });

    return NextResponse.json({
      success: true,
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        requestId: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date().toISOString(),
      },
    });
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
