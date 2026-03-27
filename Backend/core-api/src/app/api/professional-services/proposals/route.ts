/**
 * Professional Services Proposals API
 * GET /api/professional-services/proposals - List proposals
 * POST /api/professional-services/proposals - Create proposal
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get("limit") || "200");
    const status = searchParams.get("status");

    const where: any = {};
    if (status) where.status = status;

    const proposals = await prisma.proposal.findMany({
      where,
      include: {
        client: true
      },
      orderBy: { submittedDate: "desc" },
      take: limit
    });

    return NextResponse.json({ data: proposals, success: true });
  } catch (error) {
    logger.error("Failed to fetch professional services proposals", error);
    return NextResponse.json(
      { error: "Failed to fetch proposals", success: false },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { clientId, title, description, value, deadline } = body;

    const proposal = await prisma.proposal.create({
      data: {
        clientId,
        title,
        description,
        value,
        deadline,
        status: "draft"
      },
      include: {
        client: true
      }
    });

    logger.info("Professional services proposal created", { proposalId: proposal.id });
    return NextResponse.json({ data: proposal, success: true }, { status: 201 });
  } catch (error) {
    logger.error("Failed to create professional services proposal", error);
    return NextResponse.json(
      { error: "Failed to create proposal", success: false },
      { status: 500 }
    );
  }
}
