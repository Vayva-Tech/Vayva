import { SupportContextService } from "./support-context.service";
import { EscalationService } from "./escalation.service";
import { EscalationPolicy } from "./escalation-policy";
import { logger } from "@/lib/logger";
import { prisma as prismaClient } from "@vayva/db";
import fs from "fs";
import path from "path";
export class MerchantSupportBot {
  private static getNumber(value: unknown): number | null {
    return typeof value === "number" && Number.isFinite(value) ? value : null;
  }

  private static getPlanDaysRemaining(snapshot: unknown): string {
    if (snapshot && typeof snapshot === "object" && "plan" in snapshot) {
      const plan = (snapshot as { plan?: unknown }).plan;
      if (plan && typeof plan === "object" && "daysRemaining" in plan) {
        const days = this.getNumber((plan as { daysRemaining?: unknown }).daysRemaining);
        return days !== null ? String(days) : "a few";
      }
    }
    return "a few";
  }

  private static getTotalProducts(snapshot: unknown): number {
    if (snapshot && typeof snapshot === "object" && "stats" in snapshot) {
      const stats = (snapshot as { stats?: unknown }).stats;
      if (stats && typeof stats === "object" && "totalProducts" in stats) {
        const total = this.getNumber((stats as { totalProducts?: unknown }).totalProducts);
        return total ?? 0;
      }
    }
    return 0;
  }

  /**
   * Handle support message from a merchant
   */
  static async handleQuery(
    storeId: string,
    query: string,
    history: Array<{
      role: "system" | "user" | "assistant";
      content: string;
    }> = [],
  ) {
    try {
      // 1. Fetch Real Context (Account Facts)
      const snapshot = await SupportContextService.getMerchantSnapshot(storeId);
      const daysRemaining = this.getPlanDaysRemaining(snapshot);
      const totalProducts = this.getTotalProducts(snapshot);
      // 2. Fetch Relevant Playbooks (Simple file search for MVP)
      const playbooks = this.getRelevantPlaybooks(query);
      // 3. System Prompt
      const systemPrompt = `You are the Vayva Merchant Advisor. Your job is to help busy business owners manage their store efficiently.
            
Tone: Professional, direct, and efficient. 
Rule: Keep responses to the point (under 2 sentences). Time is money for our merchants.

Context:
${JSON.stringify(snapshot, null, 2)}

Playbooks:
${playbooks}

Support Guidelines:
1. Always use the MERCHANT CONTEXT to answer. 
2. If the merchant is on a FREE trial, weave in a helpful reminder about their status. Example: "I've fixed that for you! By the way, your trial ends in ${daysRemaining} days—would you like me to show you how to upgrade so your store stays live and you don't lose your ${totalProducts} products?" 
3. If they don't see the info in the context, say: "I can't see that specific detail right now. Let me connect you to a human expert to check."
4. For billing or payment issues, always offer to escalate immediately.
5. If they seem frustrated, skip the AI talk and offer a human handoff.`;
      // 4. LLM Call via OpenRouter
      const apiKey = process.env.OPENROUTER_API_KEY;
      let reply = "I'm here to help. How can I assist you with your store today?";
      
      if (apiKey) {
        try {
          const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${apiKey}`,
              "Content-Type": "application/json",
              "HTTP-Referer": "https://vayva.tech",
              "X-Title": "Vayva Support Bot",
            },
            body: JSON.stringify({
              model: "openai/gpt-4o-mini",
              messages: [
                { role: "system", content: systemPrompt },
                ...history,
                { role: "user", content: query },
              ],
              temperature: 0.2,
            }),
          });
          
          if (response.ok) {
            const data = await response.json();
            reply = data.choices[0].message.content || reply;
          }
        } catch (error) {
          logger.warn("[SupportBot] AI generation failed, using fallback");
        }
      }
      // 5. Auto-Escalation Check (Using Policy)
      // We use a test confidence score for now, but RAG could return this
      const decision = EscalationPolicy.evaluate(query, 0.95);
      if (decision.shouldEscalate) {
        await EscalationService.triggerHandoff({
          storeId,
          conversationId: "support_bot_" + Date.now(),
          trigger: decision.trigger as string,
          reason: decision.reason,
          aiSummary: `Auto-escalation triggered. Reason: ${decision.reason}. User Query: "${query}"`,
        });
        // Telemetry: Log Escalation
        const prismaCtx = global.prisma ?? (await import("@vayva/db")).prisma;
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
    } catch (error) {
      logger.error("[SupportBot] Error", error);
      return {
        message:
          "I'm currently having trouble accessing our support systems. Please open a support ticket manually.",
      };
    }
  }

  static getRelevantPlaybooks(_query: string) {
    // Simple keyword matcher for file-based knowledge
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
    } catch {
      return "No playbooks found.";
    }
  }
  static shouldEscalate(reply: string, query: string) {
    const lower = (reply + query).toLowerCase();
    if (
      lower.includes("billing error") ||
      lower.includes("refund") ||
      lower.includes("chargeback")
    )
      return "PAYMENT";
    if (
      lower.includes("escalat") ||
      lower.includes("human") ||
      lower.includes("agent")
    )
      return "MANUAL";
    return null;
  }
  static deriveSupportActions(reply: string) {
    const actions = [];
    if (reply.toLowerCase().includes("domain")) actions.push("Check Domains");
    if (reply.toLowerCase().includes("whatsapp"))
      actions.push("Check WhatsApp");
    if (reply.toLowerCase().includes("plan")) actions.push("View Billing");
    return actions.length > 0 ? actions : ["Talk to Human"];
  }
}
