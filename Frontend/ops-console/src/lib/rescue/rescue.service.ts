import { prisma } from "@vayva/db";
import { logger } from "@/lib/logger";
import { RescueGroqClient } from "./rescue-client";

export interface IncidentReport {
  requestId: string;
  source: string;
  errorSnippet: string;
  stackTrace?: string;
  sentryEventId?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  context?: any;
}

export interface IncidentAnalysis {
  incidentId: string; // The OpsAuditEvent ID
  status: "ANALYZED" | "QUEUED" | "FAILED";
  diagnosis: string;
  suggestedRemediation: string[];
  escalationPath: string;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
}

const rescueClient = new RescueGroqClient();

export class RescueService {
  /**
   * Ingest an incident, audit it, and perform read-only diagnostics.
   */
  static async intakeIncident(
    report: IncidentReport,
    actorOpsUserId?: string, // If triggered manually by an operator
  ): Promise<IncidentAnalysis> {
    const isEnabled = process.env.OPS_RESCUE_ENABLE === "true";

    // 1. Create Audit Record (Intake)
    const auditEvent = await prisma.opsAuditEvent.create({
      data: {
        eventType: "SYSTEM_RESCUE_INTAKE",
        opsUserId: actorOpsUserId,
        metadata: {
          requestId: report.requestId,
          sentryEventId: report.sentryEventId,
          source: report.source,
          snippet: report.errorSnippet.substring(0, 500), // Cap length
        },
      },
    });

    if (!isEnabled) {
      return {
        incidentId: auditEvent.id,
        status: "QUEUED",
        diagnosis: "Rescue system disabled via feature flag.",
        suggestedRemediation: ["Enable OPS_RESCUE_ENABLE to run diagnostics."],
        escalationPath: "None (system disabled)",
        severity: "LOW",
      };
    }

    try {
      // 2. Perform Diagnostics
      const diagnosis = await this.diagnoseError(report);

      // 3. Update Audit Record with Analysis
      // Note: OpsAuditEvent is generally immutable logs, but we might create a second follow-up event
      // OR if the model allows updates (usually logs shouldn't change).
      // Let's create a RESULT event to effectively 'close' the trace.
      // 3. Update Audit Record with Analysis
      await prisma.opsAuditEvent.create({
        data: {
          eventType: "SYSTEM_RESCUE_RESULT",
          opsUserId: actorOpsUserId,
          metadata: {
            intakeEventId: auditEvent.id,
            classification: this.extractClassification(diagnosis || ""),
            diagnosisSnapshot: diagnosis?.substring(0, 1000),
            severity: diagnosis?.includes("CRITICAL")
              ? "CRITICAL"
              : diagnosis?.includes("HIGH")
                ? "HIGH"
                : "MEDIUM",
          },
        },
      });

      return {
        incidentId: auditEvent.id,
        status: diagnosis ? "ANALYZED" : "FAILED",
        diagnosis: diagnosis || "AI Analysis failed or returned empty.",
        suggestedRemediation: this.extractRemediation(diagnosis || ""),
        escalationPath: this.extractEscalation(diagnosis || ""),
        severity: diagnosis?.includes("CRITICAL")
          ? "CRITICAL"
          : diagnosis?.includes("HIGH")
            ? "HIGH"
            : "MEDIUM",
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: unknown) {
      logger.error("[RescueService] Diagnosis failed", {
        auditEventId: auditEvent.id,
        error,
      });
      return {
        incidentId: auditEvent.id,
        status: "FAILED",
        diagnosis: "Internal error during diagnosis.",
        suggestedRemediation: ["Check Ops Console logs manually."],
        escalationPath: "Notify @engineering-on-call on Slack immediately.",
        severity: "HIGH",
      };
    }
  }

  private static async diagnoseError(
    report: IncidentReport,
  ): Promise<string | null> {
    const systemPrompt = `
You are Vayva Rescue, an automated Tier-3 DevOps SRE.
YOUR MODE IS: READ-ONLY DIAGNOSTIC.

TASK:
Analyze the provided error report and classify it into one of the following categories:
- AUTH: Authentication or Authorization failures.
- DATABASE: Prisma, Postgres, or indexing issues.
- PAYMENTS: Paystack or wallet transaction failures.
- DELIVERY: Kwik, logistics, or shipment status issues.
- NETWORKING: API Gateway, service-to-service timeouts, or CORS.
- AI_LOGIC: SalesAgent, MerchantBrain, or prompt engineering issues.

Identify the likely root cause.
Suggest 3 step-by-step SAFE remediation actions for a HUMAN operator.
Determine the ESCALATION PATH (e.g., @eng-payments, @eng-logistics, @eng-platform).
Assess Severity (LOW/MEDIUM/HIGH/CRITICAL).

CONSTRAINTS:
- DO NOT suggest running database mutation commands (UPDATE/DELETE/INSERT) directly.
- DO NOT hallucinate file paths or command names.
- IF output implies writing to DB, prefix with [REQUIRES APPROVAL] and describe the needed Approval object.
- Provide a clear 'Classification' and 'Escalation Path' section.
- Output format: markdown.

CONTEXT:
Source: ${report.source}
RequestID: ${report.requestId}
`;

    const userContent = `
Error: ${report.errorSnippet}
Stack:
${report.stackTrace || "No stack trace provided."}

Context:
${JSON.stringify(report.context || {})}
`;

    return await rescueClient.diagnosticCompletion(
      [
        { role: "system", content: systemPrompt },
        { role: "user", content: userContent },
      ],
      { model: "llama-3.1-70b-versatile" },
    );
  }

  private static extractRemediation(diagnosis: string): string[] {
    const lines = diagnosis.split("\n");
    return lines
      .filter((l) => l.trim().startsWith("-") || l.trim().match(/^\d\./))
      .slice(0, 3)
      .map((l) => l.replace(/^[-*]\s+|\d\.\s+/, "").trim());
  }

  private static extractClassification(diagnosis: string): string {
    const lines = diagnosis.split("\n");
    const classIdx = lines.findIndex((l) =>
      l.toLowerCase().includes("classification"),
    );
    if (classIdx !== -1) {
      const line = lines[classIdx];
      if (line.includes(":")) {
        return line.split(":")[1].trim();
      }
      if (lines[classIdx + 1]) {
        return lines[classIdx + 1].replace(/^[-*]\s+/, "").trim();
      }
    }
    return "GENERAL";
  }

  private static extractEscalation(diagnosis: string): string {
    const lines = diagnosis.split("\n");
    const escalationIdx = lines.findIndex((l) =>
      l.toLowerCase().includes("escalation path"),
    );
    if (escalationIdx !== -1) {
      const line = lines[escalationIdx];
      // If the path is on the same line after a colon
      if (line.includes(":")) {
        const parts = line.split(":");
        if (parts[1]?.trim()) return parts[1].trim();
      }
      // If the path is on the next line
      if (lines[escalationIdx + 1]) {
        return lines[escalationIdx + 1].replace(/^[-*]\s+/, "").trim();
      }
    }
    return "Standard @engineering-on-call escalation.";
  }
}
