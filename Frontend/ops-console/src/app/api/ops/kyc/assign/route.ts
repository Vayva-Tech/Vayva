import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@vayva/db";
import { withOpsAPI } from "@/lib/api-handler";
import { logger } from "@vayva/shared";

export const dynamic = "force-dynamic";

/**
 * POST /api/ops/kyc/assign
 * Assign KYC records to reviewers using metadata field
 */
const postHandler = withOpsAPI(
  async (req: NextRequest, context: any) => {
    try {
      const body = await req.json();
      const { kycIds, reviewerId } = body;
      const { user, requestId } = context;

      if (!kycIds || !Array.isArray(kycIds) || kycIds.length === 0) {
        return NextResponse.json(
          { error: "kycIds array is required" },
          { status: 400 }
        );
      }

      if (!reviewerId) {
        return NextResponse.json(
          { error: "reviewerId is required" },
          { status: 400 }
        );
      }

      // Validate reviewer exists and has KYC review permissions
      const reviewer = await prisma.opsUser?.findUnique({
        where: { id: reviewerId },
      });

      if (!reviewer) {
        return NextResponse.json(
          { error: "Reviewer not found" },
          { status: 404 }
        );
      }

      const allowedRoles = ["OPS_OWNER", "SUPERVISOR", "OPERATOR", "OPS_ADMIN"];
      if (!allowedRoles.includes(reviewer.role)) {
        return NextResponse.json(
          { error: "Reviewer does not have KYC review privileges" },
          { status: 403 }
        );
      }

      // Update KYC records using notes field for assignment tracking
      const assignmentNote = JSON.stringify({
        assignedTo: reviewerId,
        assignedToName: reviewer.name,
        assignedAt: new Date().toISOString(),
        assignedBy: user.id,
        assignedByEmail: user.email,
      });

      const updatePromises = kycIds.map((kycId) =>
        prisma.kycRecord?.update({
          where: { id: kycId, status: "PENDING" },
          data: {
            notes: assignmentNote,
          },
        })
      );

      const updatedRecords = await Promise.allSettled(updatePromises);
      const successful = updatedRecords.filter((r) => r.status === "fulfilled").length;
      const failed = updatedRecords.filter((r) => r.status === "rejected").length;

      // Log assignment to ops audit
      await prisma.opsAuditEvent?.create({
        data: {
          opsUserId: user.id,
          eventType: "KYC_ASSIGNED",
          metadata: {
            kycIds,
            assignedTo: reviewerId,
            assignedToEmail: reviewer.email,
            assignedToName: reviewer.name,
            count: successful,
            failed,
          },
        },
      });

      // Also log to main audit log
      await prisma.auditLog?.create({
        data: {
          app: "ops",
          action: "KYC_ASSIGNED",
          actorUserId: user.id,
          actorEmail: user.email,
          targetType: "user",
          targetId: kycIds.join(","),
          severity: "INFO",
          requestId,
          metadata: {
            kycIds,
            assignedTo: reviewerId,
            assignedToEmail: reviewer.email,
            assignedToName: reviewer.name,
            count: successful,
            failed,
          },
        },
      });

      return NextResponse.json({
        success: true,
        assigned: successful,
        failed,
        reviewer: {
          id: reviewer.id,
          name: reviewer.name,
          email: reviewer.email,
        },
      });
    } catch (error) {
      logger.error("[KYC_ASSIGN_ERROR]", { error });
      return NextResponse.json(
        { error: "Internal Server Error" },
        { status: 500 }
      );
    }
  },
  { requiredPermission: "OPERATOR" }
);

export async function POST(
  req: NextRequest,
  context: { params: Promise<Record<string, string>> }
) {
  const params = await context.params;
  return postHandler(req, { params } as any);
}

/**
 * GET /api/ops/kyc/reviewers
 * Get list of eligible KYC reviewers
 */
const getHandler = withOpsAPI(
  async (_req: NextRequest, _context: any) => {
    try {
      const reviewers = await prisma.opsUser?.findMany({
        where: {
          isActive: true,
          role: { in: ["OPS_OWNER", "SUPERVISOR", "OPERATOR", "OPS_ADMIN"] },
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
        orderBy: { name: "asc" },
      });

      // Count KYC records with assignment in notes field
      const allPendingKyc = await prisma.kycRecord?.findMany({
        where: { status: "PENDING" },
        select: { notes: true },
      });

      const reviewersWithCounts = reviewers.map((reviewer) => {
        const count = allPendingKyc.filter((kyc) => {
          if (!kyc.notes) return false;
          try {
            const notesData = JSON.parse(kyc.notes);
            return notesData.assignedTo === reviewer.id;
          } catch {
            return false;
          }
        }).length;
        return {
          ...reviewer,
          currentAssignments: count,
        };
      });

      return NextResponse.json({ reviewers: reviewersWithCounts });
    } catch (error) {
      logger.error("[KYC_REVIEWERS_ERROR]", { error });
      return NextResponse.json(
        { error: "Internal Server Error" },
        { status: 500 }
      );
    }
  },
  { requiredPermission: "OPERATOR" }
);

export async function GET(
  req: NextRequest,
  context: { params: Promise<Record<string, string>> }
) {
  const params = await context.params;
  return getHandler(req, { params } as any);
}
