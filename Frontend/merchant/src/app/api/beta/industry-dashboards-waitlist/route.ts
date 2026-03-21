// @ts-nocheck
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@vayva/db";
import { logger } from "@vayva/shared";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, industry } = body;

    if (!email || !industry) {
      return NextResponse.json(
        { error: "Email and industry are required" },
        { status: 400 }
      );
    }

    // Check if already on waitlist
    const existing = await prisma.betaWaitlist.findFirst({
      where: { email },
    });

    if (existing) {
      return NextResponse.json({
        success: true,
        message: "Already on waitlist",
        existing: true,
      });
    }

    // Add to waitlist
    await prisma.betaWaitlist.create({
      data: {
        email,
        feature: "industry_dashboards",
        metadata: {
          industry,
          source: "merchant_admin",
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: "Joined waitlist successfully",
    });
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : String(error);
    logger.error("[BETA_WAITLIST_API_ERROR]", { error: errMsg });
    
    return NextResponse.json(
      { error: "Failed to join waitlist" },
      { status: 500 }
    );
  }
}
