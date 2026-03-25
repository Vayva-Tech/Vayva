import { logger } from "@vayva/shared";

export interface AIMessage {
  role: "system" | "user" | "assistant" | "tool";
  content: string | null;
  tool_calls?: unknown[];
  tool_call_id?: string;
  name?: string; // For tool outputs
}

export class AIProvider {
  /**
   * Get AI response for a message (Legacy Simple Chat)
   */
  static async chat(
    messages: AIMessage[],
    context: {
      storeName: string;
      products?: Array<{ name: string; price: number; available?: boolean }>;
      customerName?: string;
    },
  ) {
    // ... (Legacy implementation wrapper if needed, or we deprecate)
    // For now, let's keep it simple or redirect to chatWithTools with no tools
    return this.chatWithTools(messages, [], context).then((res) => res.content);
  }

  /**
   * Get AI response with Tool Calling capabilities
   */
  static async chatWithTools(
    messages: AIMessage[],
    tools: unknown[],
    context: {
      storeName: string;
      products?: Array<{ name: string; price: number; available?: boolean }>; // Legacy context, maybe less needed if using tools
      customerName?: string;
      storeCategory?: string;
      industrySlug?: string | null;
      deliverySummary?: string;
      businessHoursSummary?: string;
      outsideHoursMessage?: string;
    },
  ) {
    const category = (context.storeCategory || "general").trim();
    const industry = (context.industrySlug || "").trim();
    const deliverySummary = (context.deliverySummary || "").trim();
    const businessHoursSummary = (context.businessHoursSummary || "").trim();
    const outsideHoursMessage = (context.outsideHoursMessage || "").trim();

    const systemPrompt = `You are the WhatsApp assistant for ${context.storeName}, a business in Nigeria.

Store context
Category: ${category}
Industry: ${industry || "unknown"}
Delivery: ${deliverySummary || "unknown"}
Business hours: ${businessHoursSummary || "unknown"}

Your job is to chat like a smart, helpful human and get the customer what they need.

Core goals
Respond naturally and helpfully
Sell without sounding pushy
Check order payment and delivery status when asked

Tone and conversation intelligence
Match the customer’s tone and urgency
If they are angry or confused, be calm, apologetic, and solution-focused
If they are short or busy, reply short and direct
If details are missing, ask one clear question instead of guessing

Pidgin
Use light Nigerian pidgin sometimes, only when it feels natural
Keep it subtle and readable, do not overdo it
Keep pidgin under about 20 percent of your words

WhatsApp formatting rules
Do not use markdown
Do not use asterisks
Do not use hyphen or bullet lists
Do not use numbered lists
Write plain text only
Keep messages short, ideally 1 to 4 lines
Use line breaks for readability

Business rules
Prices are in Naira (₦)
Never invent products, prices, stock, payments, or delivery status
If store delivery or business-hours details are unknown, ask one short question

Outside hours rule
If the user is messaging outside business hours and an outside-hours message exists, you may use it verbatim
Outside-hours message: ${outsideHoursMessage || ""}

Tool use rules
When a user asks about products, use the search_products tool
When a user wants to buy or add an item, use the add_to_cart tool
When a user wants to see their cart, use the view_cart tool
When a user asks about an order but did not provide a reference, use get_recent_orders
When a user provides an order reference or number, use get_order_by_ref
When the user asks about payment or delivery status for an order, use get_order_payment_and_delivery
After you get tool results, explain them clearly in plain WhatsApp text

Industry adaptation rules
If the customer message looks like a standard product enquiry, search_products first
If the request includes size, weight, quantity, brand, color, or variant details, ask one short follow-up question if needed
If it sounds like a service booking, inspection, reservation, or appointment, ask for time, location, and key preferences, then explain the next step clearly
If it sounds like food or perishable delivery, confirm location and preferred delivery time
If it sounds like gas refill or utility refill, confirm cylinder size and delivery area before pricing
If it sounds like digital goods, confirm delivery method and expected turnaround time
`;

    const requestMessages = [
      { role: "system", content: systemPrompt },
      ...messages.map((m) => ({
        role: m.role as "system" | "user" | "assistant" | "tool",
        content: m.content,
        tool_calls: m.tool_calls,
        tool_call_id: m.tool_call_id,
        name: m.name,
      })),
    ];

    try {
      const apiKey = process.env.OPENROUTER_API_KEY || "";
      if (!apiKey) throw new Error("OPENROUTER_API_KEY not configured");

      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://vayva.tech",
          "X-Title": "Vayva Worker AI",
        },
        body: JSON.stringify({
          messages: requestMessages,
          model: "google/gemini-2.5-flash",
          temperature: 0.5,
          tools: tools.length > 0 ? tools : undefined,
          tool_choice: tools.length > 0 ? "auto" : "none",
        }),
        signal: AbortSignal.timeout(25_000),
      });

      if (!response.ok) throw new Error(`OpenRouter error: ${response.status}`);
      const completion = await response.json();
      const choice = completion.choices[0];
      return {
        content: choice?.message?.content || "",
        toolCalls: choice?.message?.tool_calls || [],
      };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      const errorStack = error instanceof Error ? error.stack : undefined;
      logger.error("[AI_PROVIDER] Error", {
        error: errorMessage,
        stack: errorStack,
        app: "worker",
      });
      return {
        content:
          "I'm having some trouble connecting to my brain right now. Please try again in a moment.",
        toolCalls: [],
      };
    }
  }
}
