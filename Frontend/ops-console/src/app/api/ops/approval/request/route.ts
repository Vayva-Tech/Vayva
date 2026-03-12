import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@vayva/db";
import { withOpsAPI } from "@/lib/api-handler";
import bcrypt from "bcryptjs";
import { logger } from "@vayva/shared";

export const dynamic = "force-dynamic";

/**
 * POST /api/ops/approval/request
 * Request 2-person approval for ultra-high-risk actions
 */
const postHandler = withOpsAPI(
  async (req: NextRequest, context: any) => {
    try {
      const body = await req.json();
      const {
        action,
        targetType,
        targetId,
        targetStoreId,
        metadata,
        requestedFrom,
        confirmationCode,
      } = body;

      const { user, requestId } = context;

      // Validate the approver exists and has required role
      const approver = await prisma.opsUser?.findUnique({
        where: { id: requestedFrom },
      });

      if (!approver) {
        return NextResponse.json(
          { error: "Approver not found" },
          { status: 404 }
        );
      }

      // Check approver has required role
      const allowedRoles = ["OPS_OWNER", "SUPERVISOR", "OPS_ADMIN"];
      if (!allowedRoles.includes(approver.role)) {
        return NextResponse.json(
          { error: "Approver does not have sufficient privileges" },
          { status: 403 }
        );
      }

      // Verify confirmation code
      const isValidCode = await bcrypt.compare(
        confirmationCode,
        approver.password
      );

      if (!isValidCode) {
        await prisma.auditLog?.create({
          data: {
            app: "ops",
            action: "APPROVAL_INVALID_CODE",
            actorUserId: user.id,
            actorEmail: user.email,
            targetType,
            targetId,
            targetStoreId,
            severity: "WARN",
            requestId,
            metadata: {
              action,
              attemptedApprover: requestedFrom,
            },
          },
        });

        return NextResponse.json(
          { error: "Invalid confirmation code" },
          { status: 401 }
        );
      }

      // Log successful approval to audit (using OpsAuditEvent)
      await prisma.opsAuditEvent?.create({
        data: {
          opsUserId: user.id,
          eventType: "TWO_PERSON_APPROVAL_GRANTED",
          metadata: {
            action,
            targetType,
            targetId,
            targetStoreId,
            approvedBy: approver.id,
            approvedByEmail: approver.email,
            approvedByName: approver.name,
            ...metadata,
          },
        },
      });

      // Also log to main audit log
      await prisma.auditLog?.create({
        data: {
          app: "ops",
          action: "TWO_PERSON_APPROVAL_GRANTED",
          actorUserId: user.id,
          actorEmail: user.email,
          targetType,
          targetId,
          targetStoreId,
          severity: "INFO",
          requestId,
          metadata: {
            action,
            approvedBy: approver.id,
            approvedByEmail: approver.email,
            approvedByName: approver.name,
          },
        },
      });

      return NextResponse.json({
        success: true,
        approval: {
          approvedBy: approver.name,
          approvedByEmail: approver.email,
          approvedAt: new Date().toISOString(),
        },
      });
    } catch (error: any) {
      logger.error("[APPROVAL_REQUEST_ERROR]", { error });
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
