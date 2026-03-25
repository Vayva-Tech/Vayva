import { SupportContextService } from "./support-context.service";
import { EscalationService } from "./escalation.service";
import { EscalationPolicy } from "./escalation-policy";
import { logger } from "@/lib/logger";
import fs from "fs";
import path from "path";
import type { prisma as PrismaClient } from "@vayva/db";

interface ChatMessage {
    role: "system" | "user" | "assistant";
    content: string;
}

interface QueryResult {
    message: string;
    suggestedActions?: string[];
}

export class MerchantSupportBot {
    static async handleQuery(storeId: string, query: string, history: ChatMessage[] = []): Promise<QueryResult> {
        try {
            const snapshot = await SupportContextService.getMerchantSnapshot(storeId);
            const playbooks = this.getRelevantPlaybooks(query);
            
            const systemPrompt = `You are the Vayva Merchant Advisor. Your job is to help busy business owners manage their store efficiently.
            
Tone: Professional, direct, and efficient. 
Rule: Keep responses to the point (under 2 sentences). Time is money for our merchants.

Context:
${JSON.stringify(snapshot, null, 2)}

Playbooks:
${playbooks}

Support Guidelines:
1. Always use the MERCHANT CONTEXT to answer. 
2. If the merchant is on a FREE trial, weave in a helpful reminder about their status. Example: "I've fixed that for you! By the way, your trial ends in ${snapshot?.plan?.daysRemaining || "a few"} days—would you like me to show you how to upgrade so your store stays live and you don't lose your ${snapshot?.stats?.totalProducts || 0} products?" 
3. If they don't see the info in the context, say: "I can't see that specific detail right now. Let me connect you to a human expert to check."
4. For billing or payment issues, always offer to escalate immediately.
5. If they seem frustrated, skip the AI talk and offer a human handoff.`;
            
            const apiKey = process.env.OPENROUTER_API_KEY;
            if (!apiKey) {
                return {
                    message: "AI support bot is temporarily unavailable (not configured).",
                };
            }

            const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${apiKey}`,
                    "Content-Type": "application/json",
                    "HTTP-Referer": "https://vayva.tech",
                    "X-Title": "Vayva Merchant Support Bot",
                },
                body: JSON.stringify({
                    model: "google/gemini-2.5-flash",
                    messages: [
                        { role: "system", content: systemPrompt },
                        ...history,
                        { role: "user", content: query },
                    ],
                    temperature: 0.2,
                }),
                signal: AbortSignal.timeout(20_000),
            });

            if (!response.ok) {
                throw new Error(`OpenRouter error: ${response.status}`);
            }

            const data = await response.json();
            const reply = data.choices[0]?.message?.content ||
                "I'm here to help. How can I assist you with your store today?";
            
            const decision = EscalationPolicy.evaluate(query, 0.95);
            if (decision.shouldEscalate) {
                await EscalationService.triggerHandoff({
                    storeId,
                    conversationId: "support_bot_" + Date.now(),
                    trigger: decision.trigger,
                    reason: decision.reason,
                    aiSummary: `Auto-escalation triggered. Reason: ${decision.reason}. User Query: "${query}"`,
                });
                
                const prismaCtx = (global as { prisma?: typeof PrismaClient }).prisma || (await import("@vayva/db")).prisma;
                await prismaCtx.supportTelemetryEvent.create({
                    data: {
                        storeId,
                        conversationId: "support_bot_" + Date.now(),
                        eventType: "BOT_ESCALATED",
                        payload: {
                            trigger: decision.trigger,
                            reason: decision.reason,
                            policyVersion: "2025-12-28_v1",
                        },
                    },
                });
            }
            
            return {
                message: reply,
                suggestedActions: this.deriveSupportActions(reply),
            };
        }
        catch (error) {
            logger.error("[SupportBot] Error", error);
            return {
                message: "I'm currently having trouble accessing our support systems. Please opening a support ticket manually.",
            };
        }
    }
    
    static getRelevantPlaybooks(query: string): string {
        const kbPath = path.join(process.cwd(), "support/knowledge/playbooks");
        try {
            const files = fs.readdirSync(kbPath);
            let context = "";
            for (const file of files) {
                if (file.endsWith(".md")) {
                    const content = fs.readFileSync(path.join(kbPath, file), "utf-8");
                    context += `\n--- PLAYBOOK: ${file} ---\n${content}`;
                }
            }
            return context;
        }
        catch (e) {
            return "No playbooks found.";
        }
    }
    
    static shouldEscalate(reply: string, query: string): string | null {
        const lower = (reply + query).toLowerCase();
        if (lower.includes("billing error") ||
            lower.includes("refund") ||
            lower.includes("chargeback"))
            return "PAYMENT";
        if (lower.includes("escalat") ||
            lower.includes("human") ||
            lower.includes("agent"))
            return "MANUAL";
        return null;
    }
    
    static deriveSupportActions(reply: string): string[] {
        const actions: string[] = [];
        if (reply.toLowerCase().includes("domain"))
            actions.push("Check Domains");
        if (reply.toLowerCase().includes("whatsapp"))
            actions.push("Check WhatsApp");
        if (reply.toLowerCase().includes("plan"))
            actions.push("View Billing");
        return actions.length > 0 ? actions : ["Talk to Human"];
    }
}
