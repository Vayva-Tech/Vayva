import { prisma } from "@vayva/db";
import Groq from "groq-sdk";
import { logger } from "@vayva/shared";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY_RESCUE || process.env.GROQ_API_KEY || "",
});

export class MarketingRescueService {
  static async reportIncident(data: {
    route: string;
    errorMessage: string;
    stackHash?: string;
    fingerprint?: string;
  }) {
    // 1. Redact PII
    const redactedMessage = this.redactPII(data.errorMessage);

    // 2. Generate fingerprint
    const fingerprint =
      data.fingerprint ||
      this.generateFingerprint("MARKETING_ERROR", redactedMessage);

    // 3. Create Incident
    const incident = await prisma.rescueIncident.upsert({
      where: { fingerprint },
      create: {
        surface: "STOREFRONT", // "Marketing" falls under public storefront usually, or we can use dedicated enum if available
        errorType: "UI_CRASH",
        errorMessage: redactedMessage,
        severity: "LOW", // Marketing site crashes are usually less critical than merchant admin
        route: data.route,
        fingerprint,
        status: "OPEN",
        diagnostics: {
          stackHash: data.stackHash,
        },
      },
      update: {
        status: "OPEN",
        updatedAt: new Date(),
      },
    });

    // 4. Trigger Analysis
    this.analyzeAndSuggest(incident.id).catch((err) =>
      logger.error("Marketing Rescue background fail", { error: err?.message }),
    );

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

  private static async analyzeAndSuggest(incidentId: string) {
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
              You are Vayva Rescue Assistant for the Marketing Site.
              Classify the error: UI_RENDER, NETWORK, ASSET_MISSING, UNKNOWN.
              Suggest a USER-FACING-ACTION: "REFRESH", "WAIT", "CONTACT_SUPPORT".
              Suggest a remediation for engineers.
              
              Context:
              - App: Marketing / Storefront
              - Error: ${incident.errorMessage}
              
              Return JSON: { "classification": "...", "USER_FACING_ACTION": "...", "remediation": "..." }
            `,
          },
          { role: "user", content: "Analyze." },
        ],
        model: "llama-3.1-70b-versatile",
        response_format: { type: "json_object" },
      });

      const analysis = JSON.parse(
        completion.choices[0]?.message?.content || "{}",
      );

      let nextStatus: "ACKED" | "RESOLVED" = "ACKED";
      if (analysis.USER_FACING_ACTION === "REFRESH") {
        nextStatus = "RESOLVED";
      }

      await prisma.rescueIncident.update({
        where: { id: incidentId },
        data: {
          status: nextStatus,
          diagnostics: {
            ...(incident.diagnostics as Record<string, unknown>),
            aiAnalysis: analysis,
          },
        },
      });
    } catch (error) {
      logger.error("Rescue Analysis Error", {
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  private static redactPII(msg: string) {
    return msg.replace(
      /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
      "[EMAIL]",
    );
  }

  private static generateFingerprint(type: string, msg: string) {
    const str = `${type}:${msg.slice(0, 100)}`;
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash).toString(16);
  }
}
