/**
 * Campaign Actions API Routes
 * Pause, Resume, Delete campaigns
 */

import { NextRequest, NextResponse } from "next/server";
import { campaignHub } from "@/services/ad-platforms/hub";
import type { AdPlatform } from "@/types/ad-platforms";
import { logger } from "@vayva/shared";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(
  req: NextRequest,
  { params }: RouteParams,
) {
  try {
    const { id } = await params;
    const { action } = await req.json() as { action: "pause" | "resume" };
    const body = await req.json();
    const { platform } = body as { platform: AdPlatform };
    const accountId = req.headers.get("x-ad-account-id");

    if (!accountId) {
      return NextResponse.json(
        { error: "No ad account connected" },
        { status: 401 },
      );
    }

    if (action === "pause") {
      await campaignHub.pauseCampaign(platform, accountId, id);
    } else {
      await campaignHub.resumeCampaign(platform, accountId, id);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error("[Campaign Action API] Failed", { error });
    return NextResponse.json(
      { error: "Failed to update campaign" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: RouteParams,
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { platform } = body as { platform: AdPlatform };
    const accountId = req.headers.get("x-ad-account-id");

    if (!accountId) {
      return NextResponse.json(
        { error: "No ad account connected" },
        { status: 401 },
      );
    }

    await campaignHub.deleteCampaign(platform, accountId, id);

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error("[Campaign Action API] Delete failed", { error });
    return NextResponse.json(
      { error: "Failed to delete campaign" },
      { status: 500 },
    );
  }
}
