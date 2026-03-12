import { NextResponse } from "next/server";
import { prisma } from "@vayva/db";
import { OpsAuthService } from "@/lib/ops-auth";
import { logger } from "@vayva/shared";

export const dynamic = "force-dynamic";

// GET: Fetch Merchant AI Profile
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { user } = await OpsAuthService.requireSession();
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const resolvedParams = await params;
    const { id } = resolvedParams;

    // Upsert profile to ensure it exists
    const profile = await prisma.merchantAiProfile.upsert({
      where: { storeId: id },
      create: { storeId: id },
      update: {},
    });

    return NextResponse.json({ success: true, data: profile });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: unknown) {
    logger.error("[MERCHANT_AI_FETCH_ERROR]", { error });
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

// PATCH: Update Merchant AI Profile
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { user } = await OpsAuthService.requireSession();
    // Only Admins or Support can modify AI settings
    if (!["OPS_OWNER", "OPS_ADMIN", "OPS_SUPPORT"].includes(user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const resolvedParams = await params;
    const { id } = resolvedParams;
    const body = await request.json();

    // Validate body fields (allow partial updates)
    const {
      agentName,
      tonePreset,
      greetingTemplate,
      _botEnabled, // Hypothetical, schema might not have this yet but useful to track
    } = body;

    const updated = await prisma.merchantAiProfile.update({
      where: { storeId: id },
      data: {
        agentName,
        tonePreset,
        greetingTemplate,
      },
    });

    await OpsAuthService.logEvent(user.id, "UPDATE_MERCHANT_AI", {
      storeId: id,
      changes: body,
    });

    return NextResponse.json({ success: true, data: updated });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: unknown) {
    logger.error("[MERCHANT_AI_UPDATE_ERROR]", { error });
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}
