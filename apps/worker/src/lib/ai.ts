import { logger } from "@vayva/shared";

export interface AIMessage {
    role: "system" | "user" | "assistant";
    content: string;
}

export class AIProvider {
    /**
     * Get AI response for a message
     */
    static async chat(
        messages: AIMessage[],
        context: {
            storeName: string;
            products?: Array<{ name: string; price: number; available?: boolean }>;
            customerName?: string;
        }
    ) {
        const systemPrompt = `You are a helpful AI assistant for ${context.storeName}, an e-commerce business in Nigeria.
Your role is to:
1. Answer customer questions about products, orders, and services.
2. Help customers place orders.
3. Provide order status updates.
4. Handle complaints professionally.

Guidelines:
- Be friendly, professional, and concise.
- Use Nigerian English and local context.
- Mention prices in Nigerian Naira (₦).
- For orders, collect: full name, delivery address, phone number.

${context.products ? `Available Products:\n${context.products.map(p => `- ${p.name}: ₦${p.price.toLocaleString()} ${p.available ? "(In Stock)" : "(Out of Stock)"}`).join('\n')}` : ""}
`;

        try {
            const apiKey = process.env.OPENROUTER_API_KEY || "";
            if (!apiKey) throw new Error("OPENROUTER_API_KEY not configured");

            const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${apiKey}`,
                    "Content-Type": "application/json",
                    "HTTP-Referer": "https://vayva.tech",
                    "X-Title": "Vayva Apps Worker",
                },
                body: JSON.stringify({
                    messages: [{ role: "system", content: systemPrompt }, ...messages],
                    model: "google/gemini-2.5-flash",
                    temperature: 0.7,
                }),
                signal: AbortSignal.timeout(25_000),
            });

            if (!res.ok) throw new Error(`OpenRouter error: ${res.status}`);
            const completion = await res.json();
            return completion.choices[0]?.message?.content || "I apologize, I'm currently unable to assist. Please wait for a human agent.";
        } catch (error: any) {
            logger.error("[AI_PROVIDER] Error", { error: error.message, stack: error.stack, app: "worker" });
            return "I'm having some trouble connecting to my brain right now. Please try again in a moment.";
        }
    }
}
