/**
 * POST /api/templates/purchase
 * Purchase an additional template using credits
 */

import { NextRequest, NextResponse } from "next/server";
import { getAuthStoreId } from "@/lib/auth";
import { creditManager } from "@/lib/credits/credit-manager";
import { checkFeatureAccess } from "@/lib/billing/access";
import { logger } from "@vayva/shared";
import { prisma } from "@vayva/db";

const TEMPLATE_COST = 5000; // 5,000 credits per additional template

export async function POST(req: NextRequest) {
  try {
    const storeId = await getAuthStoreId(req);
    
    if (!storeId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { templateId } = body;

    if (!templateId || typeof templateId !== 'string') {
      return NextResponse.json(
        { error: "Template ID is required" },
        { status: 400 }
      );
    }

    // Check if user can purchase templates
    const accessCheck = await checkFeatureAccess(storeId, "template_change");
    
    if (!accessCheck.allowed && accessCheck.reason !== "requires_payment") {
      return NextResponse.json(
        { 
          error: accessCheck.message || "Cannot purchase template",
          allowed: false 
        },
        { status: 403 }
      );
    }

    // Get store to check current owned templates
    const store = await prisma.store.findUnique({
      where: { id: storeId },
      select: {
        plan: true,
        ownedTemplates: true,
        currentTemplateId: true,
      },
    });

    if (!store) {
      return NextResponse.json(
        { error: "Store not found" },
        { status: 404 }
      );
    }

    const ownedCount = store.ownedTemplates?.length || 0;
    const alreadyOwned = store.ownedTemplates?.includes(templateId);

    if (alreadyOwned) {
      return NextResponse.json(
        { 
          error: "You already own this template",
          allowed: true,
          alreadyOwned: true
        },
        { status: 400 }
      );
    }

    // Check credits
    const creditCheck = await creditManager.checkCredits(storeId, TEMPLATE_COST);
    
    if (!creditCheck.allowed) {
      return NextResponse.json(
        { 
          error: creditCheck.message || "Insufficient credits",
          remaining: creditCheck.remaining,
          cost: TEMPLATE_COST
        },
        { status: 402 }
      );
    }

    // Deduct credits
    const usageResult = await creditManager.useCredits(
      storeId,
      TEMPLATE_COST,
      "template_purchase",
      `Purchased template ${templateId}`
    );

    if (!usageResult.success) {
      return NextResponse.json(
        { error: usageResult.message || "Failed to deduct credits" },
        { status: 500 }
      );
    }

    // Add template to owned templates
    await prisma.store.update({
      where: { id: storeId },
      data: {
        ownedTemplates: {
          push: templateId,
        },
      },
    });

    logger.info("[TEMPLATE_PURCHASE]", {
      storeId,
      templateId,
      remainingCredits: usageResult.remaining,
      totalOwned: ownedCount + 1,
    });

    return NextResponse.json({
      success: true,
      templateId,
      remainingCredits: usageResult.remaining,
      totalOwned: ownedCount + 1,
      message: "Template purchased successfully!",
    });
  } catch (error) {
    logger.error("[TEMPLATE_PURCHASE_ERROR]", {
      error: error instanceof Error ? error.message : String(error),
      app: "core-api",
    });

    return NextResponse.json(
      { error: "Failed to purchase template" },
      { status: 500 }
    );
  }
}
