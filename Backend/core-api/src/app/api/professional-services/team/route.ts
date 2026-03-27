/**
 * Professional Services Team API
 * GET /api/professional-services/team - List team members
 * POST /api/professional-services/team - Add team member
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get("limit") || "200");

    const team = await prisma.teamMember.findMany({
      include: {
        assignments: {
          where: {
            status: "active"
          }
        }
      },
      orderBy: { name: "asc" },
      take: limit
    });

    return NextResponse.json({ data: team, success: true });
  } catch (error) {
    logger.error("Failed to fetch professional services team", error);
    return NextResponse.json(
      { error: "Failed to fetch team", success: false },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, role, email, hourlyRate, specialization } = body;

    const member = await prisma.teamMember.create({
      data: {
        name,
        role,
        email,
        hourlyRate,
        specialization,
        utilizationRate: 0
      }
    });

    logger.info("Professional services team member added", { memberId: member.id });
    return NextResponse.json({ data: member, success: true }, { status: 201 });
  } catch (error) {
    logger.error("Failed to add team member", error);
    return NextResponse.json(
      { error: "Failed to add team member", success: false },
      { status: 500 }
    );
  }
}
