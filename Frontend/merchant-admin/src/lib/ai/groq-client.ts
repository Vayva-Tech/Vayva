import { Groq } from "groq-sdk";
import { logger } from "@/lib/logger";
import { prisma } from "@vayva/db";
import type { ChatCompletionMessageParam } from "groq-sdk/resources/chat/completions";

interface CompletionOptions {
    model?: string;
    temperature?: number;
    maxTokens?: number;
    jsonMode?: boolean;
    tools?: unknown[];
    tool_choice?: string;
    storeId?: string;
    requestId?: string;
}

interface CompletionResponse {
    model: string;
    usage?: {
        prompt_tokens: number;
        completion_tokens: number;
    };
    choices: Array<{
        message: {
            tool_calls?: unknown[];
        };
    }>;
}

const PII_REGEX = {
    EMAIL: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
    PHONE: /(\+\d{1,3}[-.]?)?\(?\d{3}\)?[-.]?\d{3,4}[-.]?\d{4}/g,
    CARD: /\b(?:\d[ -]*?){13,16}\b/g,
};

export class GroqClient {
    context: string;
    client: Groq;
    
    constructor(context: string = "MERCHANT") {
        this.context = context;
        const apiKey = context === "MERCHANT"
            ? process.env?.GROQ_API_KEY_MERCHANT
            : process.env?.GROQ_API_KEY_SUPPORT;
        if (!apiKey) {
            logger.warn(`[GroqClient] No API key found for ${context} context. AI features will fallback.`);
        }
        this.client = new Groq({
            apiKey: apiKey || "placeholder-key",
            dangerouslyAllowBrowser: false,
        });
    }
    
    sanitizeInput(text: string): string {
        return text
            .replace(PII_REGEX.EMAIL, "[REDACTED_EMAIL]")
            .replace(PII_REGEX.PHONE, "[REDACTED_PHONE]")
            .replace(PII_REGEX.CARD, "[REDACTED_SENSITIVE]");
    }
    
    async chatCompletion(messages: ChatCompletionMessageParam[], options: CompletionOptions = {}): Promise<CompletionResponse | null> {
        if (!this.client?.apiKey || this.client?.apiKey === "placeholder-key") {
            logger.warn("[GroqClient] Call skipped due to missing API key");
            return null;
        }
        try {
            const safeMessages = messages.map((m) => ({
                ...m,
                content: m.content ? this.sanitizeInput(String(m.content)) : null,
            }));
            
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 15000);
            
            const response = await (this.client as any)?.chat.completions.create({
                messages: safeMessages,
                model: options.model || "llama3-70b-8192",
                temperature: options.temperature ?? 0.7,
                max_tokens: options.maxTokens ?? 1024,
                response_format: options.jsonMode ? { type: "json_object" } : undefined,
                tools: options.tools,
                tool_choice: options.tool_choice,
            }, { signal: controller.signal }) as CompletionResponse;
            
            clearTimeout(timeoutId);
            
            if (options.storeId) {
                await prisma.aiUsageEvent?.create({
                    data: {
                        storeId: options.storeId,
                        model: response.model,
                        inputTokens: response.usage?.prompt_tokens ?? 0,
                        outputTokens: response.usage?.completion_tokens ?? 0,
                        toolCallsCount: response.choices[0]?.message.tool_calls?.length ?? 0,
                        requestId: options.requestId || "",
                        success: true,
                        channel: this.context === "MERCHANT" ? "INAPP" : "WHATSAPP",
                    }
                }).catch((e: unknown) => logger.warn("[GroqClient] Audit log failed", undefined, { error: e }));
            }
            
            return response;
        }
        catch (error) {
            logger.error("[GroqClient] API call failed", { error });
            return null;
        }
    }
}
