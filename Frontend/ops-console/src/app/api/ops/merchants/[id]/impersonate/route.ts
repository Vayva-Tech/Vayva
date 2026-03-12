import { NextResponse } from "next/server";
import { prisma } from "@vayva/db";
import { OpsAuthService } from "@/lib/ops-auth";
import crypto from "crypto";
import { logger } from "@vayva/shared";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { user } = await OpsAuthService.requireSession();
    // Strict Role Check - Only Owner/Admin can impersonate
    if (!["OPS_OWNER", "OPS_ADMIN"].includes(user.role)) {
      return NextResponse.json(
        { error: "Insufficient permissions for impersonation" },
        { status: 403 },
      );
    }

    const resolvedParams = await params;
    const { id } = resolvedParams; // Store ID

    // Find the Store Owner
    const store = await prisma.store.findUnique({
      where: { id },
      include: {
        tenant: {
          include: {
            tenantMemberships: {
              where: { role: "OWNER" },
              take: 1,
            },
          },
        },
      },
    });

    if (!store || !store.tenant?.tenantMemberships[0]) {
      return NextResponse.json(
        { error: "Store owner not found" },
        { status: 404 },
      );
    }

    const ownerUserId = store.tenant.tenantMemberships[0].userId;

    // Generate Merchant Session Token
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1); // 1 hour impersonation session

    // Create Merchant Session
    await prisma.merchantSession.create({
      data: {
        userId: ownerUserId,
        token,
        expiresAt,
        device: "Ops Console Impersonation",
        ipAddress: "127.0.0.1", // In real world, extract from request
      },
    });

    // Audit Log
    await OpsAuthService.logEvent(user.id, "OPS_MERCHANT_IMPERSONATION", {
      targetStoreId: id,
      targetUserId: ownerUserId,
      adminUser: user.email,
    });

    // Return the token (Frontend will set cookie and redirect)
    return NextResponse.json({
      success: true,
      token,
      redirectUrl: process.env.NEXT_PUBLIC_APP_URL || "https://app.vayva.ng",
    });
  } catch (error: unknown) {
    const msg =
      error instanceof Error
        ? error instanceof Error
          ? error.message
          : String(error)
        : String(error);
    logger.error("[OPS_IMPERSONATION_ERROR]", { error, message: msg });
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
