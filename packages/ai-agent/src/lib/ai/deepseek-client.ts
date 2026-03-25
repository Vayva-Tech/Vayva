import { logger, ErrorCategory } from "../logger";
import { prisma } from "@vayva/db";

// Regex to identify potential emails and phone numbers for stripping
const PII_REGEX = {
    EMAIL: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
    PHONE: /(\+\d{1,3}[-.]?)?\(?\d{3}\)?[-.]?\d{3,4}[-.]?\d{4}/g,
    CARD: /\b(?:\d[ -]*?){13,16}\b/g,
};

type MessageRole = "system" | "user" | "assistant" | "tool";

interface Message {
    role: MessageRole;
    content: string;
    name?: string;
    tool_call_id?: string;
}

interface ChatCompletionResponse {
    id: string;
    object: string;
    created: number;
    model: string;
    choices: Array<{
        index: number;
        message: {
            role: string;
            content: string;
            tool_calls?: Array<{
                id: string;
                type: string;
                function: {
                    name: string;
                    arguments: string;
                };
            }>;
        };
        finish_reason: string | null;
    }>;
    usage: {
        prompt_tokens: number;
        completion_tokens: number;
        total_tokens: number;
    };
}

type ChatCompletionOptions = {
    model?: string;
    temperature?: number;
    maxTokens?: number;
    jsonMode?: boolean;
    tools?: Array<{
        type: "function";
        function: {
            name: string;
            description: string;
            parameters: Record<string, unknown>;
        };
    }> | null;
    tool_choice?: "none" | "auto" | { type: "function"; function: { name: string } } | null;
    storeId?: string;
    requestId?: string;
};

export class DeepSeekClient {
    context: string;
    apiKey: string;
    baseUrl: string;

    constructor(context: string = "GENERAL") {
        this.context = context;
        this.apiKey = process.env.DEEPSEEK_API_KEY || "";
        this.baseUrl = "https://api.deepseek.com";

        if (!this.apiKey) {
            logger.warn(`[DeepSeekClient] No API key found. AI features will fallback.`);
        }
    }

    /**
     * Strip PII from input text
     */
    sanitizeInput(text: string): string {
        return text
            .replace(PII_REGEX.EMAIL, "[REDACTED_EMAIL]")
            .replace(PII_REGEX.PHONE, "[REDACTED_PHONE]")
            .replace(PII_REGEX.CARD, "[REDACTED_SENSITIVE]");
    }

    /**
     * Generate a completion with safe handling
     */
    async chatCompletion(
        messages: Message[],
        options: ChatCompletionOptions = {}
    ): Promise<ChatCompletionResponse | null> {
        if (!this.apiKey) {
            logger.warn("[DeepSeekClient] Call skipped due to missing API key");
            return null;
        }

        try {
            // 1. Sanitize user messages
            const safeMessages: Message[] = messages.map((m) => {
                if (typeof m.content === "string") {
                    return { ...m, content: this.sanitizeInput(m.content) };
                }
                return m;
            });

            // 2. Call API with Timeout
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout

            const response = await fetch(`${this.baseUrl}/chat/completions`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${this.apiKey}`,
                },
                body: JSON.stringify({
                    model: options.model || "deepseek-chat",
                    messages: safeMessages,
                    temperature: options.temperature ?? 0.7,
                    max_tokens: options.maxTokens ?? 1024,
                    response_format: options.jsonMode ? { type: "json_object" } : undefined,
                    tools: options.tools ?? undefined,
                    tool_choice: options.tool_choice ?? undefined,
                }),
                signal: controller.signal,
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                const errorText = await response.text();
                logger.error("[DeepSeekClient] API error", {
                    status: response.status,
                    error: errorText,
                });
                return null;
            }

            const data = (await response.json()) as ChatCompletionResponse;

            // 3. Real Audit Logging (No secrets)
            if (options.storeId) {
                const model = data.model;
                const usage = data.usage;
                const firstChoice = data.choices[0];
                const toolCallsCount = firstChoice?.message?.tool_calls?.length || 0;

                await prisma.aiUsageEvent.create({
                    data: {
                        storeId: options.storeId,
                        model: model || (options.model || "deepseek-chat"),
                        inputTokens: usage?.prompt_tokens || 0,
                        outputTokens: usage?.completion_tokens || 0,
                        toolCallsCount,
                        requestId: options.requestId || "",
                        success: true,
                        channel: this.context === "MERCHANT" ? "INAPP" : "WHATSAPP",
                    },
                }).catch((e: unknown) => logger.warn("[DeepSeekClient] Audit log failed", ErrorCategory.DATABASE, { error: e }));
            }

            return data;
        } catch (error: unknown) {
            if (error instanceof Error && error.name === "AbortError") {
                logger.error("[DeepSeekClient] Request timeout", { error });
            } else {
                logger.error("[DeepSeekClient] API call failed", { error });
            }
            return null;
        }
    }

    /**
     * Quick text completion helper
     */
    async complete(prompt: string, options: Omit<ChatCompletionOptions, "jsonMode" | "tools" | "tool_choice"> = {}): Promise<string | null> {
        const messages: Message[] = [{ role: "user", content: prompt }];
        const response = await this.chatCompletion(messages, options);
        
        if (!response || !response.choices[0]?.message?.content) {
            return null;
        }

        return response.choices[0].message.content;
    }

    /**
     * JSON mode completion for structured outputs
     */
    async completeJSON<T = unknown>(
        prompt: string,
        options: Omit<ChatCompletionOptions, "jsonMode" | "tools" | "tool_choice"> = {}
    ): Promise<T | null> {
        const messages: Message[] = [
            {
                role: "system",
                content: "You are a helpful assistant that always responds in valid JSON format.",
            },
            { role: "user", content: prompt },
        ];

        const response = await this.chatCompletion(messages, {
            ...options,
            jsonMode: true,
        });

        if (!response || !response.choices[0]?.message?.content) {
            return null;
        }

        try {
            return JSON.parse(response.choices[0].message.content) as T;
        } catch (parseError) {
            logger.error("[DeepSeekClient] Failed to parse JSON response", parseError);
            return null;
        }
    }
}
