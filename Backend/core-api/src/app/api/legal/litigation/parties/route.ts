import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/with-vayva-api";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@/lib/prisma";

/**
 * POST /api/legal/litigation/parties
 * Add litigation party to case
 */
export const POST = withVayvaAPI(
  PERMISSIONS.LEGAL_CASES_EDIT,
  async (request: NextRequest) => {
    try {
      const body = await request.json();
      const { caseId, name, role, type, contactInfo } = body;

      // Validate case exists
      const caseExists = await prisma.case.findUnique({
        where: { id: caseId },
      });

      if (!caseExists) {
        return NextResponse.json(
          { success: false, error: "Case not found" },
          { status: 404 }
        );
      }

      // Create litigation party
      const party = await prisma.litigationParty.create({
        data: {
          caseId,
          name,
          role, // plaintiff, defendant, petitioner, respondent, etc.
          type, // individual, organization, government
          contactInfo,
        },
      });

      return NextResponse.json({
        success: true,
        data: party,
      });
    } catch (error) {
      console.error("Error adding litigation party:", error);
      return NextResponse.json(
        { success: false, error: "Failed to add litigation party" },
        { status: 500 }
      );
    }
  }
);
