import { NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { DataGovernanceService } from "@vayva/ai-agent";
import { prisma } from "@vayva/db";
import { logger } from "@/lib/logger";

const EXPORT_STATUSES = [
  "PENDING",
  "RUNNING",
  "COMPLETED",
  "FAILED",
  "EXPIRED",
] as const;
const DELETION_STATUSES = [
  "PENDING_REVIEW",
  "APPROVED",
  "REJECTED",
  "SCHEDULED",
  "COMPLETED",
] as const;
const GOVERNANCE_REASON_CODES = [
  "USER_REQUEST",
  "COMPLIANCE_REVIEW",
  "RISK_REVIEW",
  "DATA_RETENTION",
  "PROCESSING_FAILURE",
  "SYSTEM_TIMEOUT",
  "MANUAL_OVERRIDE",
  "OPERATOR_CORRECTION",
] as const;

type ExportStatus = (typeof EXPORT_STATUSES)[number];
type DeletionStatus = (typeof DELETION_STATUSES)[number];
type GovernanceReasonCode = (typeof GOVERNANCE_REASON_CODES)[number];

type GovernancePatchBody = {
  requestType?: "export" | "deletion";
  requestId?: string;
  status?: string;
  reasonCode?: string;
  errorMessage?: string;
  notes?: string;
  scheduledFor?: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isExportStatus(value: string): value is ExportStatus {
  return (EXPORT_STATUSES as readonly string[]).includes(value);
}

function isDeletionStatus(value: string): value is DeletionStatus {
  return (DELETION_STATUSES as readonly string[]).includes(value);
}

function parseDate(value: string | undefined): Date | undefined {
  if (!value) return undefined;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return undefined;
  return date;
}

function isGovernanceReasonCode(value: string): value is GovernanceReasonCode {
  return (GOVERNANCE_REASON_CODES as readonly string[]).includes(value);
}

function requiresReasonCode(
  requestType: "export" | "deletion",
  status: string,
): boolean {
  if (requestType === "export") {
    return status === "FAILED" || status === "EXPIRED";
  }
  return status === "REJECTED" || status === "COMPLETED";
}

async function logGovernanceTransitionAudit(params: {
  storeId: string;
  userId: string;
  correlationId: string;
  requestType: "export" | "deletion";
  requestId: string;
  status: string;
  reasonCode?: GovernanceReasonCode;
}) {
  await prisma.auditLog.create({
    data: {
      app: "merchant",
      action: "GOVERNANCE_STATUS_UPDATED",
      targetType: "system",
      targetId: params.requestId,
      targetStoreId: params.storeId,
      severity: "INFO",
      requestId: params.correlationId,
      metadata: {
        requestType: params.requestType,
        status: params.status,
        reasonCode: params.reasonCode,
        actorUserId: params.userId,
      },
    },
  });
}

export const PATCH = withVayvaAPI(
  [PERMISSIONS.EXPORTS_MANAGE, PERMISSIONS.APPROVALS_DECIDE],
  async (req, { storeId, user, correlationId }) => {
    if (user.role !== "OWNER" && user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Forbidden - Only Owner/Admin can change governance request status" },
        { status: 403 },
      );
    }

    try {
      const parsedBody: unknown = await req.json().catch(() => ({}));
      const body = isRecord(parsedBody)
        ? (parsedBody as GovernancePatchBody)
        : ({} as GovernancePatchBody);

      const requestType = body.requestType;
      const requestId = typeof body.requestId === "string" ? body.requestId.trim() : "";
      const status = typeof body.status === "string" ? body.status.trim() : "";
      const reasonCode =
        typeof body.reasonCode === "string" ? body.reasonCode.trim() : "";

      const validatedReasonCode: GovernanceReasonCode | undefined =
        reasonCode && isGovernanceReasonCode(reasonCode)
          ? (reasonCode as GovernanceReasonCode)
          : undefined;

      if (!requestType || (requestType !== "export" && requestType !== "deletion")) {
        return NextResponse.json(
          { error: "requestType must be either 'export' or 'deletion'" },
          { status: 400 },
        );
      }

      if (!requestId) {
        return NextResponse.json(
          { error: "requestId is required" },
          { status: 400 },
        );
      }

      if (!status) {
        return NextResponse.json(
          { error: "status is required" },
          { status: 400 },
        );
      }

      if (requiresReasonCode(requestType, status)) {
        if (!reasonCode) {
          return NextResponse.json(
            {
              error:
                "reasonCode is required for this transition status",
            },
            { status: 400 },
          );
        }

        if (!isGovernanceReasonCode(reasonCode)) {
          return NextResponse.json(
            { error: "Invalid reasonCode" },
            { status: 400 },
          );
        }
      }

      if (requestType === "export") {
        if (!isExportStatus(status)) {
          return NextResponse.json(
            { error: "Invalid export status" },
            { status: 400 },
          );
        }

        const existing = await prisma.dataExportRequest.findUnique({
          where: { id: requestId },
          select: { id: true, storeId: true, status: true },
        });

        if (!existing || existing.storeId !== storeId) {
          return NextResponse.json(
            { error: "Export request not found." },
            { status: 404 },
          );
        }

        if (existing.status === status) {
          logger.info("[DATA_GOVERNANCE_STATUS_NOOP]", {
            storeId,
            userId: user.id,
            requestType,
            requestId,
            status,
            correlationId,
            reasonCode: validatedReasonCode,
          });

          return NextResponse.json({
            success: true,
            requestType,
            requestId,
            status,
            noOp: true,
          });
        }

        await prisma.dataExportRequest.update({
          where: { id: requestId },
          data: {
            status,
            errorMessage:
              typeof body.errorMessage === "string" ? body.errorMessage : undefined,
          },
        });

        await logGovernanceTransitionAudit({
          storeId,
          userId: user.id,
          correlationId,
          requestType,
          requestId,
          status,
          reasonCode: validatedReasonCode,
        }).catch((error: unknown) => {
          logger.warn("[DATA_GOVERNANCE_AUDIT_LOG_FAILED]", "api", {
            storeId,
            userId: user.id,
            requestId,
            requestType,
            correlationId,
            reasonCode: validatedReasonCode,
            error: error instanceof Error ? error.message : String(error),
          });
        });

        logger.info("[DATA_GOVERNANCE_STATUS_UPDATED]", {
          storeId,
          userId: user.id,
          requestType,
          requestId,
          status,
          correlationId,
          reasonCode,
        });

        return NextResponse.json({ success: true, requestType, requestId, status });
      }

      if (!isDeletionStatus(status)) {
        return NextResponse.json(
          { error: "Invalid deletion status" },
          { status: 400 },
        );
      }

      const existing = await prisma.dataDeletionRequest.findUnique({
        where: { id: requestId },
        select: { id: true, storeId: true, status: true },
      });

      if (!existing || existing.storeId !== storeId) {
        return NextResponse.json(
          { error: "Deletion request not found." },
          { status: 404 },
        );
      }

      if (existing.status === status) {
        logger.info("[DATA_GOVERNANCE_STATUS_NOOP]", {
          storeId,
          userId: user.id,
          requestType,
          requestId,
          status,
          correlationId,
        });

        return NextResponse.json({
          success: true,
          requestType,
          requestId,
          status,
          noOp: true,
        });
      }

      await prisma.dataDeletionRequest.update({
        where: { id: requestId },
        data: {
          status,
          notes: typeof body.notes === "string" ? body.notes : undefined,
          scheduledFor: parseDate(body.scheduledFor),
        },
      });

      await logGovernanceTransitionAudit({
        storeId,
        userId: user.id,
        correlationId,
        requestType,
        requestId,
        status,
        reasonCode: validatedReasonCode,
      }).catch((error: unknown) => {
        logger.warn("[DATA_GOVERNANCE_AUDIT_LOG_FAILED]", "api", {
          storeId,
          userId: user.id,
          requestId,
          requestType,
          correlationId,
          reasonCode: validatedReasonCode,
          error: error instanceof Error ? error.message : String(error),
        });
      });

      logger.info("[DATA_GOVERNANCE_STATUS_UPDATED]", {
        storeId,
        userId: user.id,
        requestType,
        requestId,
        status,
        correlationId,
        reasonCode: validatedReasonCode,
      });

      return NextResponse.json({ success: true, requestType, requestId, status });
    } catch (error: unknown) {
      logger.error("[DATA_GOVERNANCE_STATUS_PATCH]", error, {
        storeId,
        userId: user.id,
      });
      return NextResponse.json(
        { error: "Failed to update governance status" },
        { status: 500 },
      );
    }
  },
);

const VALID_EXPORT_SCOPES = [
  "orders",
  "customers",
  "products",
  "transactions",
  "audit_logs",
  "conversations",
  "staff_activity",
  "store_settings",
] as const;

type ExportScope = (typeof VALID_EXPORT_SCOPES)[number];

type ExportPostBody = {
  requestType?: "export" | "deletion";
  scopes?: string[];
  reason?: string;
  scheduledFor?: string;
};

function isExportScope(value: string): value is ExportScope {
  return (VALID_EXPORT_SCOPES as readonly string[]).includes(value);
}

function validateExportScopes(scopes: unknown): ExportScope[] | { error: string } {
  if (!Array.isArray(scopes) || scopes.length === 0) {
    return { error: "scopes must be a non-empty array" };
  }

  const validScopes: ExportScope[] = [];
  for (const scope of scopes) {
    if (typeof scope !== "string" || !isExportScope(scope)) {
      return { error: `Invalid export scope: ${scope}` };
    }
    validScopes.push(scope);
  }

  return validScopes;
}

function parseDeletionDate(value: string | undefined): Date | undefined {
  if (!value) return undefined;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return undefined;
  // Minimum 7 days grace period
  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 7);
  if (date < minDate) return minDate;
  return date;
}

export const POST = withVayvaAPI(
  PERMISSIONS.EXPORTS_MANAGE,
  async (req, { storeId, user, correlationId }) => {
    try {
      const parsedBody: unknown = await req.json().catch(() => ({}));
      const body = isRecord(parsedBody) ? (parsedBody as ExportPostBody) : {};

      const requestType = body.requestType || "export";

      if (requestType === "deletion") {
        // Deletion request handling
        if (user.role !== "OWNER") {
          return NextResponse.json(
            { error: "Only store owner can request account deletion" },
            { status: 403 },
          );
        }

        const reason = typeof body.reason === "string" ? body.reason.trim() : "";
        if (!reason) {
          return NextResponse.json(
            { error: "reason is required for deletion requests" },
            { status: 400 },
          );
        }

        const scheduledFor = parseDeletionDate(body.scheduledFor);

        const request = await DataGovernanceService.requestDeletion(
          storeId,
          user.id,
          reason,
        );

        logger.info("[DATA_DELETION_REQUESTED]", {
          storeId,
          userId: user.id,
          requestId: request.id,
          scheduledFor: scheduledFor?.toISOString(),
          correlationId,
        });

        return NextResponse.json({
          success: true,
          requestType: "deletion",
          requestId: request.id,
          status: request.status,
          scheduledFor: scheduledFor?.toISOString(),
        });
      }

      // Export request handling (default)
      const scopeValidation = validateExportScopes(body.scopes);
      if ("error" in scopeValidation) {
        return NextResponse.json({ error: scopeValidation.error }, { status: 400 });
      }

      const request = await DataGovernanceService.requestExport(
        storeId,
        user.id,
        scopeValidation,
      );

      logger.info("[DATA_EXPORT_REQUESTED]", {
        storeId,
        userId: user.id,
        requestId: request.id,
        scopes: scopeValidation,
        correlationId,
      });

      return NextResponse.json({
        success: true,
        requestType: "export",
        requestId: request.id,
        status: request.status,
        scopes: scopeValidation,
        expiresAt: request.expiresAt,
      });
    } catch (error: unknown) {
      logger.error("[DATA_GOVERNANCE_REQUEST_FAILED]", error, {
        storeId,
        userId: user.id,
      });
      return NextResponse.json(
        { error: "Failed to create governance request" },
        { status: 500 },
      );
    }
  },
);

export const GET = withVayvaAPI(
  PERMISSIONS.EXPORTS_MANAGE,
  async (req, { storeId, user, correlationId }) => {
    try {
      const { searchParams } = new URL(req.url);
      const requestType = searchParams.get("requestType");
      const _status = searchParams.get("status");
      const limit = Math.min(parseInt(searchParams.get("limit") || "20", 10), 100);
      const offset = parseInt(searchParams.get("offset") || "0");

      const where: Record<string, unknown> = { storeId };

      if (requestType === "export") {
        const exports = await prisma.dataExportRequest.findMany({
          where,
          orderBy: { createdAt: "desc" },
          take: limit,
          skip: offset,
          select: {
            id: true,
            status: true,
            scopes: true,
            createdAt: true,
            expiresAt: true,
            completedAt: true,
            errorMessage: true,
            requestedBy: true,
          },
        });

        const total = await prisma.dataExportRequest.count({ where });

        logger.info("[GOVERNANCE_EXPORT_LIST]", {
          storeId,
          userId: user.id,
          count: exports.length,
          total,
          correlationId,
        });

        return NextResponse.json({
          success: true,
          requestType: "export",
          data: exports,
          pagination: { limit, offset, total },
        });
      }

      if (requestType === "deletion") {
        const deletions = await prisma.accountDeletionRequest.findMany({
          where,
          orderBy: { createdAt: "desc" },
          take: limit,
          skip: offset,
          select: {
            id: true,
            status: true,
            reason: true,
            scheduledFor: true,
            confirmationMeta: true,
            createdAt: true,
            updatedAt: true,
            requestedByUserId: true,
          },
        });

        const total = await prisma.accountDeletionRequest.count({ where });

        logger.info("[GOVERNANCE_DELETION_LIST]", {
          storeId,
          userId: user.id,
          count: deletions.length,
          total,
          correlationId,
        });

        return NextResponse.json({
          success: true,
          requestType: "deletion",
          data: deletions,
          pagination: { limit, offset, total },
        });
      }

      const [exports, deletions] = await Promise.all([
        prisma.dataExportRequest.findMany({
          where,
          orderBy: { createdAt: "desc" },
          take: limit,
          skip: offset,
          select: {
            id: true,
            status: true,
            scopes: true,
            createdAt: true,
            expiresAt: true,
            completedAt: true,
            errorMessage: true,
            requestedBy: true,
          },
        }),
        prisma.accountDeletionRequest.findMany({
          where,
          orderBy: { createdAt: "desc" },
          take: limit,
          skip: offset,
          select: {
            id: true,
            status: true,
            reason: true,
            scheduledFor: true,
            confirmationMeta: true,
            createdAt: true,
            updatedAt: true,
            requestedByUserId: true,
          },
        }),
      ]);

      logger.info("[GOVERNANCE_LIST_ALL]", {
        storeId,
        userId: user.id,
        exportsCount: exports.length,
        deletionsCount: deletions.length,
        correlationId,
      });

      return NextResponse.json({
        success: true,
        requestType: "all",
        data: {
          exports,
          deletions,
        },
        pagination: { limit, offset },
      });
    } catch (error: unknown) {
      logger.error("[GOVERNANCE_LIST_FAILED]", error, {
        storeId,
        userId: user.id,
      });
      return NextResponse.json(
        { error: "Failed to list governance requests" },
        { status: 500 },
      );
    }
  },
);
