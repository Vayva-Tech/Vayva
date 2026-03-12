import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@vayva/db";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { logger } from "@/lib/logger";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function handler(req: NextRequest, context: any) {
  const { storeId } = context;

  if (!storeId) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    // Fetch store and related data
    const store = await prisma.store.findUnique({
      where: { id: storeId },
      select: {
        id: true,
        industrySlug: true,
        isActive: true,
        kycStatus: true,
      },
    });

    if (!store) {
      return NextResponse.json(
        { error: "Store not found" },
        { status: 404 }
      );
    }

    // Check for products
    const productsCount = await prisma.product.count({
      where: { storeId },
    });
    const hasProducts = productsCount > 0;

    // Check for payout method
    const paymentAccount = await prisma.paymentAccount.findFirst({
      where: { storeId },
    });
    const hasPayoutMethod = !!paymentAccount;

    // Check KYC status
    const kycStatus = store.kycStatus || "NOT_STARTED";

    // Check if store is live
    const storefrontPublished = await prisma.storefrontPublished.findUnique({
      where: { storeId },
    });
    const isStoreLive = store.isActive && !!storefrontPublished;

    // Check for custom roles (optional)
    const customRoles = await prisma.role.count({
      where: { storeId },
    });
    const hasCustomRoles = customRoles > 0;

    return NextResponse.json({
      data: {
        hasProducts,
        hasPayoutMethod,
        kycStatus,
        isStoreLive,
        hasCustomRoles,
        industrySlug: store.industrySlug,
      },
    }, {
      headers: {
        "Cache-Control": "no-store",
      },
    });
    } catch (error) {
    logger.error("[ACTIVATION_PROGRESS_GET] Failed to fetch activation progress", { storeId, error });
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export const GET = withVayvaAPI(PERMISSIONS.ONBOARDING_VIEW, handler);
