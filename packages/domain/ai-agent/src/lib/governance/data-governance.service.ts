import { prisma, Prisma } from "@vayva/db";
import { logger } from "../logger";
import { randomUUID } from "crypto";

type ExportScope = string;
type ExportLifecycleStatus =
  | "PENDING"
  | "RUNNING"
  | "COMPLETED"
  | "FAILED"
  | "EXPIRED";
type DeletionLifecycleStatus =
  | "PENDING_REVIEW"
  | "APPROVED"
  | "REJECTED"
  | "SCHEDULED"
  | "COMPLETED";

const EXPORT_TRANSITIONS: Record<ExportLifecycleStatus, ExportLifecycleStatus[]> = {
  PENDING: ["RUNNING", "EXPIRED"],
  RUNNING: ["COMPLETED", "FAILED"],
  COMPLETED: [],
  FAILED: [],
  EXPIRED: [],
};

const DELETION_TRANSITIONS: Record<
  DeletionLifecycleStatus,
  DeletionLifecycleStatus[]
> = {
  PENDING_REVIEW: ["APPROVED", "REJECTED", "SCHEDULED"],
  APPROVED: ["SCHEDULED", "REJECTED"],
  REJECTED: [],
  SCHEDULED: ["COMPLETED"],
  COMPLETED: [],
};

type AiTraceParams = {
  storeId: string;
  conversationId?: string;
  requestId?: string;
  model?: string;
  toolsUsed?: Prisma.JsonValue | null;
  retrievedDocs?: Prisma.JsonValue | null;
  inputSummary?: string;
  outputSummary?: string;
  guardrailFlags?: Prisma.JsonValue | null;
  latencyMs?: number;
};

/**
 * Vayva Data Governance Service
 * Handles Export Requests, Deletion, and Privacy Redaction
 */
export class DataGovernanceService {
  private static canTransitionExport(
    from: string,
    to: ExportLifecycleStatus,
  ): from is ExportLifecycleStatus {
    return (
      from in EXPORT_TRANSITIONS &&
      EXPORT_TRANSITIONS[from as ExportLifecycleStatus].includes(to)
    );
  }

  private static canTransitionDeletion(
    from: string,
    to: DeletionLifecycleStatus,
  ): from is DeletionLifecycleStatus {
    return (
      from in DELETION_TRANSITIONS &&
      DELETION_TRANSITIONS[from as DeletionLifecycleStatus].includes(to)
    );
  }

  /**
   * Initiate a background data export
   */
  static async requestExport(
    storeId: string,
    requestedBy: string,
    scopes: ExportScope[],
  ) {
    const activeRequest = await prisma.dataExportRequest.findFirst({
      where: {
        storeId,
        status: { in: ["PENDING", "RUNNING"] },
      },
      orderBy: { createdAt: "desc" },
    });

    if (activeRequest) {
      const isExpired =
        activeRequest.expiresAt instanceof Date && activeRequest.expiresAt < new Date();

      if (isExpired) {
        await this.updateExportStatus(activeRequest.id, "EXPIRED");
      } else {
        return {
          success: false,
          error: "An export request is already in progress.",
          requestId: activeRequest.id,
          status: activeRequest.status,
        };
      }
    }

    const refreshedActiveRequest = await prisma.dataExportRequest.findFirst({
      where: {
        storeId,
        status: { in: ["PENDING", "RUNNING"] },
      },
      orderBy: { createdAt: "desc" },
    });

    if (refreshedActiveRequest) {
      return {
        success: false,
        error: "An export request is already in progress.",
        requestId: refreshedActiveRequest.id,
        status: refreshedActiveRequest.status,
      };
    }

    const correlationId = randomUUID();
    const request = await prisma.dataExportRequest.create({
      data: {
        storeId,
        requestedBy,
        scopes,
        status: "PENDING",
        correlationId,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7-day expiry
      },
    });
    // In a real system, we would enqueue a job here:
    // await QueueService.enqueue('DATA_EXPORT', { requestId: request.id });
    logger.info("Data export requested", {
      storeId,
      requestId: request.id,
      correlationId,
      scopes,
    });
    return { success: true, request };
  }
  /**
   * Log a PII-redacted AI trace for audit
   */
  static async logAiTrace(params: AiTraceParams) {
    try {
      await prisma.aiTrace.create({
        data: {
          storeId: params.storeId,
          conversationId: params.conversationId,
          requestId: params.requestId,
          model: params.model || "unknown_model",
          toolsUsed: params.toolsUsed ?? Prisma.JsonNull,
          retrievedDocs: params.retrievedDocs ?? Prisma.JsonNull,
          inputSummary: this.redactPII(params.inputSummary),
          outputSummary: this.redactPII(params.outputSummary),
          guardrailFlags: params.guardrailFlags ?? Prisma.JsonNull,
          latencyMs: params.latencyMs,
        },
      });
    } catch (error: unknown) {
      logger.error("[DATA_GOVERNANCE_AI_TRACE_LOG_FAILED]", error, {
        storeId: params.storeId,
        requestId: params.requestId,
      });
    }
  }
  /**
   * Request full account deletion (Soft-to-Hard transition)
   */
  static async requestDeletion(
    storeId: string,
    requestedBy: string,
    reason: string,
  ) {
    const activeRequest = await prisma.dataDeletionRequest.findFirst({
      where: {
        storeId,
        status: { in: ["PENDING_REVIEW", "APPROVED", "SCHEDULED"] },
      },
      orderBy: { createdAt: "desc" },
    });

    if (activeRequest) {
      return {
        success: false,
        error: "A deletion request is already active.",
        requestId: activeRequest.id,
        status: activeRequest.status,
      };
    }

    const request = await prisma.dataDeletionRequest.create({
      data: {
        storeId,
        requestedBy,
        reason,
        status: "PENDING_REVIEW",
        scheduledFor: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Default 30-day wait
      },
    });
    // Trigger notification to Ops
    // await NotificationService.notifyOps('DELETION_REQUEST', { storeId, reason });
    logger.info("Data deletion requested", {
      storeId,
      requestedBy,
      requestId: request.id,
      status: request.status,
    });
    return { success: true, request };
  }

  static async updateExportStatus(
    requestId: string,
    nextStatus: ExportLifecycleStatus,
    errorMessage?: string,
  ) {
    const request = await prisma.dataExportRequest.findUnique({
      where: { id: requestId },
      select: {
        id: true,
        storeId: true,
        status: true,
        correlationId: true,
      },
    });

    if (!request) {
      return { success: false, error: "Export request not found." };
    }

    if (request.status === nextStatus) {
      logger.info("Data export status unchanged (idempotent no-op)", {
        requestId: request.id,
        storeId: request.storeId,
        correlationId: request.correlationId,
        status: request.status,
      });
      return { success: true, noOp: true, currentStatus: request.status };
    }

    if (!this.canTransitionExport(request.status, nextStatus)) {
      return {
        success: false,
        error: `Invalid export status transition: ${request.status} -> ${nextStatus}`,
      };
    }

    const now = new Date();
    const updateResult = await prisma.dataExportRequest.updateMany({
      where: {
        id: request.id,
        status: request.status,
      },
      data: {
        status: nextStatus,
        startedAt: nextStatus === "RUNNING" ? now : undefined,
        completedAt:
          nextStatus === "COMPLETED" ||
          nextStatus === "FAILED" ||
          nextStatus === "EXPIRED"
            ? now
            : undefined,
        errorMessage: nextStatus === "FAILED" ? errorMessage ?? "Unknown failure" : null,
      },
    });

    if (updateResult.count === 0) {
      const latest = await prisma.dataExportRequest.findUnique({
        where: { id: request.id },
        select: { status: true },
      });

      if (latest?.status === nextStatus) {
        return { success: true, noOp: true, currentStatus: latest.status };
      }

      return {
        success: false,
        error: `Concurrent export status update detected for request ${request.id}`,
      };
    }

    logger.info("Data export status updated", {
      requestId: request.id,
      storeId: request.storeId,
      correlationId: request.correlationId,
      from: request.status,
      to: nextStatus,
    });

    return { success: true };
  }

  static async updateDeletionStatus(
    requestId: string,
    nextStatus: DeletionLifecycleStatus,
    options?: {
      notes?: string;
      scheduledFor?: Date;
    },
  ) {
    const request = await prisma.dataDeletionRequest.findUnique({
      where: { id: requestId },
      select: {
        id: true,
        storeId: true,
        status: true,
        scheduledFor: true,
      },
    });

    if (!request) {
      return { success: false, error: "Deletion request not found." };
    }

    if (request.status === nextStatus) {
      logger.info("Data deletion status unchanged (idempotent no-op)", {
        requestId: request.id,
        storeId: request.storeId,
        status: request.status,
      });
      return { success: true, noOp: true, currentStatus: request.status };
    }

    if (!this.canTransitionDeletion(request.status, nextStatus)) {
      return {
        success: false,
        error: `Invalid deletion status transition: ${request.status} -> ${nextStatus}`,
      };
    }

    const now = new Date();
    const scheduledFor =
      nextStatus === "SCHEDULED"
        ? options?.scheduledFor ?? request.scheduledFor ?? new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
        : undefined;

    const updateResult = await prisma.dataDeletionRequest.updateMany({
      where: {
        id: request.id,
        status: request.status,
      },
      data: {
        status: nextStatus,
        scheduledFor,
        completedAt: nextStatus === "COMPLETED" ? now : undefined,
        notes: options?.notes,
      },
    });

    if (updateResult.count === 0) {
      const latest = await prisma.dataDeletionRequest.findUnique({
        where: { id: request.id },
        select: { status: true },
      });

      if (latest?.status === nextStatus) {
        return { success: true, noOp: true, currentStatus: latest.status };
      }

      return {
        success: false,
        error: `Concurrent deletion status update detected for request ${request.id}`,
      };
    }

    logger.info("Data deletion status updated", {
      requestId: request.id,
      storeId: request.storeId,
      from: request.status,
      to: nextStatus,
      scheduledFor,
    });

    return { success: true };
  }

  /**
   * Internal PII Redaction Logic
   * Enhanced regex-based masking.
   * NOTE: For Enterprise usage, integrate with VGS, Google DLP, or AWS Macie.
   */
  static redactPII(text: string | undefined) {
    if (!text) return text;
    return text
      .replace(
        /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
        "[EMAIL_REDACTED]",
      ) // Emails
      .replace(
        /(?:\+?\d{1,3}[- ]?)?\(?\d{3}\)?[- ]?\d{3}[- ]?\d{4}/g,
        "[PHONE_REDACTED]",
      ) // Phone numbers (US/Intl formats)
      .replace(/\b(?:\d[ -]*?){13,16}\b/g, "[CARD_REDACTED]") // Credit Card numbers (Luhn check not enforced here)
      .replace(
        /\b(?!000|666|9\d\d)\d{3}[- ]?(?!00)\d{2}[- ]?(?!0000)\d{4}\b/g,
        "[SSN_REDACTED]",
      ) // SSN (Basic)
      .replace(/sk_live_[0-9a-zA-Z]{24}/g, "[API_KEY_REDACTED]"); // Stripe Live Keys
  }
}
