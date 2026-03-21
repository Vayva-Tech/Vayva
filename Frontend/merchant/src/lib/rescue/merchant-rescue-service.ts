import { prisma, type RescueIncident } from "@vayva/db";
import { logger } from "@vayva/shared";
import Groq from "groq-sdk";

interface IncidentReport {
    errorMessage: string;
    fingerprint?: string;
    route?: string;
    storeId?: string;
    userId?: string;
    stackHash?: string;
}

interface AiAnalysis {
    classification?: string;
    USER_FACING_ACTION?: string;
    remediation?: string;
}

const groq = new Groq({
    apiKey: process.env?.GROQ_API_KEY_RESCUE || process.env?.GROQ_API_KEY || "",
});

export class MerchantRescueService {
    static async reportIncident(data: IncidentReport): Promise<RescueIncident> {
        const redactedMessage = this.redactPII(data.errorMessage);
        const fingerprint = data.fingerprint || this.generateFingerprint("UI_ERROR", redactedMessage);
        
        const incident = await prisma.rescueIncident?.upsert({
            where: { fingerprint },
            create: {
                surface: "MERCHANT_ADMIN",
                errorType: "UI_CRASH",
                errorMessage: redactedMessage,
                severity: "MEDIUM",
                route: data.route,
                storeId: data.storeId,
                userId: data.userId,
                fingerprint,
                status: status as any,
                diagnostics: {
                    stackHash: data.stackHash
                },
            },
            update: {
                status: status as any,
                updatedAt: new Date(),
            },
        });
        
        this.analyzeAndSuggest(incident.id).catch(err => logger.error("Rescue AI background fail", err));
        return incident;
    }
    
    static async getIncidentStatus(id: string): Promise<RescueIncident | null> {
        return prisma.rescueIncident?.findUnique({
            where: { id }
        }) as Promise<RescueIncident | null>;
    }
    
    static async analyzeAndSuggest(incidentId: string): Promise<void> {
        const incident = await prisma.rescueIncident?.findUnique({ where: { id: incidentId } });
        if (!incident)
            return;
        try {
            const completion = await groq.chat?.completions.create({
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
            
            const analysis = JSON.parse(completion.choices[0]?.message?.content || "{}") as AiAnalysis;
            let nextStatus = "NEEDS_ENGINEERING";
            if (analysis.USER_FACING_ACTION === "REFRESH") {
                nextStatus = "READY_TO_REFRESH";
            }
            else if (analysis.USER_FACING_ACTION === "RELOGIN") {
                nextStatus = "READY_TO_REFRESH";
            }
            
            await prisma.rescueIncident?.update({
                where: { id: incidentId },
                data: {
                    status: nextStatus as any,
                    diagnostics: {
                        ...(incident.diagnostics as Record<string, unknown>),
                        aiAnalysis: analysis,
                    } as any,
                },
            });
        }
        catch (error) {
            logger.error("Rescue Analysis Error", { error: error instanceof Error ? error.message : String(error) });
        }
    }
    
    static redactPII(msg: string): string {
        return msg
            .replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, "[EMAIL]")
            .replace(/password[:=]\s*[^\s&]+/gi, "password=[REDACTED]");
    }
    
    static generateFingerprint(type: string, msg: string): string {
        const str = `${type}:${msg.slice(0, 100)}`;
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            hash = ((hash << 5) - hash) + str.charCodeAt(i);
            hash |= 0;
        }
        return Math.abs(hash).toString(16);
    }
}
