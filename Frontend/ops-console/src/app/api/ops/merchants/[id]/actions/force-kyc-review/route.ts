import { NextRequest, NextResponse } from "next/server";
import { OpsAuthService } from "@/lib/ops-auth";
import { prisma } from "@vayva/db";
import { logger } from "@vayva/shared";

export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    // Require authentication and SUPERVISOR role
    const { user } = await OpsAuthService.requireSession();
    (OpsAuthService as any).requireRole(user, "SUPERVISOR");

    const { id: storeId } = await params;
    const { reason } = await req.json();

    // Validate reason
    if (!reason || reason.trim().length < 10) {
      return NextResponse.json(
        { error: "Reason must be at least 10 characters" },
        { status: 400 },
      );
    }

    // Check if store exists and get KYC record
    const store = await prisma.store.findUnique({
      where: { id: storeId },
      select: {
        id: true,
        name: true,
        kycRecord: {
          select: { id: true, status: true },
        },
      },
    });

    if (!store) {
      return NextResponse.json({ error: "Store not found" }, { status: 404 });
    }

    const kycRecord = store.kycRecord;

    if (!kycRecord) {
      return NextResponse.json(
        { error: "No KYC record found for this store" },
        { status: 400 },
      );
    }

    // Reset KYC status to PENDING for re-review
    await prisma.kycRecord.update({
      where: { id: kycRecord.id },
      data: {
        status: "PENDING",
        reviewedAt: null,
        reviewedBy: null,
      },
    });

    // Create audit log
    // Create audit log
    await OpsAuthService.logEvent(user.id, "FORCE_KYC_REVIEW", {
      targetType: "Store",
      targetId: storeId,
      reason: reason.trim(),
      storeName: store.name,
      kycRecordId: kycRecord.id,
      previousStatus: kycRecord.status,
      newStatus: "PENDING",
    });

    return NextResponse.json({
      success: true,
      message: "KYC review triggered successfully",
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: unknown) {
    if (
      error instanceof Error ? error.message : String(error) === "Unauthorized"
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (
      error instanceof Error
        ? error.message
        : String(error)?.includes("Insufficient permissions")
    ) {
      return NextResponse.json(
        { error: "Insufficient permissions. SUPERVISOR role required." },
        { status: 403 },
      );
    }
    logger.error("[FORCE_KYC_REVIEW_ERROR]", { error });
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
