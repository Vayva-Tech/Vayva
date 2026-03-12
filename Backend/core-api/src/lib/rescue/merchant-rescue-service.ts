import { prisma, RescueIncidentStatus, Prisma } from "@vayva/db";
import { logger } from "@vayva/shared";
import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY_RESCUE || process.env.GROQ_API_KEY || "",
});

export class MerchantRescueService {
  /**
   * Ingest a new incident from the merchant frontend
   */
  static async reportIncident(data: Record<string, unknown>) {
    // 1. Redact PII
    const errorMessage =
      typeof data.errorMessage === "string"
        ? data.errorMessage
        : "Unknown error";
    const redactedMessage = this.redactPII(errorMessage);
    // 2. Generate fingerprint if not provided
    const fingerprintInput =
      typeof data.fingerprint === "string" ? data.fingerprint : undefined;
    const fingerprint =
      fingerprintInput || this.generateFingerprint("UI_ERROR", redactedMessage);
    // 3. Create or Update Incident
    // We strive for idempotency
    const incident = await prisma.rescueIncident.upsert({
      where: { fingerprint },
      create: {
        surface: "MERCHANT_ADMIN",
        errorType: "UI_CRASH", // Assuming mostly UI reports
        errorMessage: redactedMessage,
        severity: "MEDIUM",
        route: typeof data.route === "string" ? data.route : undefined,
        storeId: typeof data.storeId === "string" ? data.storeId : undefined,
        userId: typeof data.userId === "string" ? data.userId : undefined,
        fingerprint,
        status: "OPEN",
        diagnostics: {
          stackHash:
            typeof data.stackHash === "string" ? data.stackHash : undefined,
        },
      },
      update: {
        status: "OPEN",
        updatedAt: new Date(),
        // Update user if different? Maybe not needed for simple reporting
      },
    });
    // 4. Trigger Analysis (Async but awaited for demo/speed)
    // In a real high-throughput system, this might be offloaded to a queue
    this.analyzeAndSuggest(incident.id).catch((err) => {
      const msg = err instanceof Error ? err.message : String(err);
      logger.error("Rescue AI background fail", {
        error: msg,
        incidentId: incident.id,
      });
    });
    return incident;
  }
  static async getIncidentStatus(id: string) {
    return prisma.rescueIncident.findUnique({
      where: { id },
      select: {
        id: true,
        status: true,
        diagnostics: true,
      },
    });
  }
  /**
   * AI Analysis
   */
  static async analyzeAndSuggest(incidentId: string) {
    const incident = await prisma.rescueIncident.findUnique({
      where: { id: incidentId },
    });
    if (!incident) return;
    try {
      const completion = await groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content: `
              You are Vayva Rescue AI.
              Classify the error: AUTH, DATABASE, NETWORK, UI_RENDER, UNKNOWN.
              Suggest a USER-FACING-ACTION: "REFRESH", "RELOGIN", "WAIT", "CONTACT_SUPPORT".
              Suggest a remediation for engineers (short codes snippet idea).
              
              Return JSON: { "classification": "...", "USER_FACING_ACTION": "...", "remediation": "..." }
              
              Context:
              - App: Merchant Admin
              - Error: ${incident.errorMessage}
            `,
          },
          { role: "user", content: "Analyze this incident." },
        ],
        model: "llama-3.1-70b-versatile",
        response_format: { type: "json_object" },
      });
      const analysis = JSON.parse(
        completion.choices[0]?.message?.content || "{}",
      );
      // Determine next status based on analysis
      let nextStatus: RescueIncidentStatus = "NEEDS_ENGINEERING" as RescueIncidentStatus;
      if (analysis.USER_FACING_ACTION === "REFRESH") {
        nextStatus = "READY_TO_REFRESH" as RescueIncidentStatus;
      } else if (analysis.USER_FACING_ACTION === "RELOGIN") {
        // In a fuller implementation, we might trigger a signout on client
        nextStatus = "READY_TO_REFRESH" as RescueIncidentStatus;
      }
      await prisma.rescueIncident.update({
        where: { id: incidentId },
        data: {
          status: nextStatus,
          diagnostics: {
            ...(incident.diagnostics as Prisma.JsonObject),
            aiAnalysis: analysis,
          },
        },
      });
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      logger.error("Rescue Analysis Error", { error: msg, incidentId });
    }
  }
  static redactPII(msg: string) {
    return msg
      .replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, "[EMAIL]")
      .replace(/password[:=]\s*[^\s&]+/gi, "password=[REDACTED]");
  }
  static generateFingerprint(type: string, msg: string) {
    const str = `${type}:${msg.slice(0, 100)}`;
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash).toString(16);
  }
}
