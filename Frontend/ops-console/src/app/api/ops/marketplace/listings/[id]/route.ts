import { NextRequest, NextResponse } from "next/server";
import { prisma, ListingStatus } from "@vayva/db";
import { OpsAuthService } from "@/lib/ops-auth";
import { logger } from "@vayva/shared";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { user } = await OpsAuthService.requireSession();

  try {
    const { id } = await params;
    const body = await req.json();
    const { action, note } = body;

    const statusMap: Record<string, string> = {
      approve: "APPROVED",
      reject: "REJECTED",
      suspend: "SUSPENDED",
    };

    const newStatus = statusMap[action];
    if (!newStatus) {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    const listing = await prisma.marketplaceListing.update({
      where: { id },
      data: {
        status: newStatus as ListingStatus,
        moderationNote: note || null,
        moderatedBy: user.id || "ops_admin",
      },
    });

    return NextResponse.json({ success: true, listing });
  } catch (error: unknown) {
    logger.error("[LISTING_ACTION_ERROR]", { error });
    return NextResponse.json(
      { error: "Failed to update listing" },
      { status: 500 },
    );
  }
}
