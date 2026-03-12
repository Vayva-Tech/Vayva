import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/with-vayva-api";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@/lib/prisma";

/**
 * POST /api/legal/discovery/[id]/respond
 * Submit discovery response
 */
export const POST = withVayvaAPI(
  PERMISSIONS.LEGAL_CASES_EDIT,
  async (request: NextRequest, { params }: { params: { id: string } }) => {
    try {
      const { id } = params;
      const body = await request.json();
      const { responses, attachments, completedBy } = body;

      // Update discovery request
      const updated = await prisma.discoveryRequest.update({
        where: { id },
        data: {
          responses: JSON.stringify(responses),
          status: "completed",
          completedAt: new Date(),
          metadata: {
            ...(await prisma.discoveryRequest.findUnique({ where: { id } }))?.metadata,
            attachments,
            completedBy,
          },
        },
      });

      return NextResponse.json({
        success: true,
        data: updated,
      });
    } catch (error) {
      console.error("Error submitting discovery response:", error);
      return NextResponse.json(
        { success: false, error: "Failed to submit discovery response" },
        { status: 500 }
      );
    }
  }
);
