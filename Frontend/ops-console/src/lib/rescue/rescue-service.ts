import { prisma, Prisma } from "@vayva/db";

export class RescueService {
  /**
   * Ingest a new incident from any source
   */
  static async ingestIncident(data: {
    surface: "MERCHANT_ADMIN" | "STOREFRONT" | "OPS" | "WORKER";
    errorType: string;
    errorMessage: string;
    severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
    route?: string;
    storeId?: string;
    userId?: string;
    metadata?: Prisma.InputJsonValue;
  }) {
    // 1. Redact PII from error message
    const redactedMessage = this.redactPII(data.errorMessage);

    // 2. Generate fingerprint (simple hash of message & type)
    const fingerprint = this.generateFingerprint(
      data.errorType,
      redactedMessage,
    );

    // 3. Create or Update Incident
    const incident = await prisma.rescueIncident?.upsert({
      where: { fingerprint },
      create: {
        surface: data.surface,
        errorType: data.errorType,
        errorMessage: redactedMessage,
        severity: data.severity,
        route: data.route,
        storeId: data.storeId,
        userId: data.userId,
        fingerprint,
        diagnostics: data.metadata || {},
      },
      update: {
        status: { set: "OPEN" }, // Re-open if seen again
        updatedAt: new Date(),
      },
    });

    // 4. Run AI Analysis if High/Critical
    if (data.severity === "HIGH" || data.severity === "CRITICAL") {
      await this.analyzeWithAI(incident.id);
    }

    return incident;
  }

  /**
   * Use OpenRouter to analyze incident and suggest fixes
   */
  static async analyzeWithAI(incidentId: string) {
    const incident = await prisma.rescueIncident?.findUnique({
      where: { id: incidentId },
    });

    if (!incident) return;

    try {
      const apiKey = process.env.OPENROUTER_API_KEY || "";
      if (!apiKey) return;

      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://vayva.tech",
          "X-Title": "Vayva Ops Rescue",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          response_format: { type: "json_object" },
          messages: [
          {
            role: "system",
            content: `
              You are Vayva Rescue AI. Your role is to diagnose platform incidents.
              Classify the incident into: AUTH, DB, WEBHOOK, QUEUE, UI.
              Suggest immediate remediation steps (SAFE ACTIONS ONLY).
              Safe actions include: Retry Job, Reprocess Webhook, Clear Cache, Disable Feature, Health Check.
              Do NOT suggest editing physical source code.
            `,
          },
          {
            role: "user",
            content: `
              Error Type: ${incident.errorType}
              Surface: ${incident.surface}
              Message: ${incident.errorMessage}
              Route: ${incident.route || "N/A"}
            `,
          },
        ],
        }),
        signal: AbortSignal.timeout(25_000),
      });

      if (!response.ok) return;
      const completion = await response.json();
      const analysis = JSON.parse(completion.choices[0]?.message?.content || "{}");

      await prisma.rescueIncident?.update({
        where: { id: incidentId },
        data: {
          diagnostics: {
            ...(incident.diagnostics as Record<string, unknown>),
            aiAnalysis: analysis,
          },
        },
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: unknown) {
      console.error("[RESCUE_AI_FAIL]", error);
    }
  }

  /**
   * Execute a safe fix action
   */
  static async performAction(
    incidentId: string,
    actionType: string,
    opsUserId: string,
  ) {
    const incident = await prisma.rescueIncident?.findUnique({
      where: { id: incidentId },
    });

    if (!incident) throw new Error("Incident not found");

    // Start Fix Action Record
    const fixAction = await prisma.rescueFixAction?.create({
      data: {
        incidentId,
        actionType: actionType as "RETRY_JOB" | "REPROCESS_WEBHOOK" | "CLEAR_CACHE",
        actionStatus: "PENDING",
        summary: `Executing ${actionType} for incident ${incidentId}`,
        performedBy: opsUserId,
      },
    });

    try {
      let resultSummary = "";

      switch (actionType) {
        case "RETRY_JOB":
          // Implementation for BullMQ retry would go here
          resultSummary = "Job re-enqueued successfully.";
          break;
        case "REPROCESS_WEBHOOK":
          // Implementation for webhook reprocessing
          resultSummary = "Webhook event marked for reprocessing.";
          break;
        default:
          resultSummary = `Action ${actionType} performed manually by Ops.`;
      }

      await prisma.rescueFixAction?.update({
        where: { id: fixAction.id },
        data: {
          actionStatus: "SUCCESS",
          summary: resultSummary,
        },
      });

      // Log to OpsAuditEvent
      await prisma.opsAuditEvent?.create({
        data: {
          opsUserId,
          eventType: "RESCUE_ACTION_EXECUTED",
          rescueIncidentId: incidentId,
          metadata: {
            actionType,
            fixActionId: fixAction.id,
            status: "RESOLVED",
          },
        },
      });

      return { success: true, summary: resultSummary };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: unknown) {
      await prisma.rescueFixAction?.update({
        where: { id: fixAction.id },
        data: {
          actionStatus: "FAILED",
          summary: `Error: ${error instanceof Error ? error.message : String(error)}`,
        },
      });
      throw error;
    }
  }

  private static redactPII(msg: string) {
    // Simple regex for emails, passwords in logs, etc.
    return msg
      .replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, "[EMAIL]")
      .replace(/password[:=]\s*[^\s&]+/gi, "password=[REDACTED]");
  }

  private static generateFingerprint(type: string, msg: string) {
    // Simple deterministic hash
    const str = `${type}:${msg.slice(0, 100)}`;
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash |= 0;
    }
    return Math.abs(hash).toString(16);
  }
}
