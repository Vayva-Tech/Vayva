import { GroqClient } from "./groq-client";
import { MerchantBrainService, } from "./merchant-brain.service";
import { prisma, Prisma } from "@vayva/db";
import { Chat } from "groq-sdk/resources/chat";
import { AiUsageService } from "./ai-usage.service";
import { DataGovernanceService } from "../governance/data-governance.service";
import { EscalationService, } from "../support/escalation.service";
import { ConversionService } from "./conversion.service";
import { reportError } from "../error";
import { NotificationService } from "../../services/notifications";

// Initialize centralised client
const groqClient = new GroqClient("SUPPORT");

type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
    return typeof value === "object" && value !== null;
}

function getMeta(value: unknown): UnknownRecord {
    return isRecord(value) ? value : {};
}

function getString(value: unknown): string {
    return typeof value === "string" ? value : "";
}

type IncomingMessage = {
    role?: unknown;
    content?: unknown;
    tool_call_id?: unknown;
    [key: string]: unknown;
};

type HandleMessageOptions = {
    conversationId?: string;
    requestId?: string;
};

type AiContextItem = {
    sourceType: string;
    content: string;
    sourceId?: string;
};

type MerchantProfile = {
    agentName?: string;
    tonePreset?: string;
    brevityMode?: string;
    persuasionLevel?: number;
};

type StoreMetadata = {
    description?: string;
    hours?: string;
    returnPolicy?: string;
    phone?: string;
};

type PickupPoint = {
    name?: string;
    address?: string;
    city?: string;
    state?: string;
    isDefault?: boolean;
    isPickupPoint?: boolean;
};

type FulfillmentPolicy = {
    pickupEnabled?: boolean;
    deliveryEnabled?: boolean;
    deliveryMode?: string;
    deliveryProvider?: string;
    whatsappAgent?: { allowImageUnderstanding?: boolean };
    pickupPoints?: PickupPoint[];
};

/**
 * Vayva Sales Agent (Profile-Aware, Limit-Enforced & RAG-Powered)
 */
export class SalesAgent {
    /**
     * Handle a message from a customer
     */
    static async handleMessage(storeId: string, messages: IncomingMessage[], options?: HandleMessageOptions) {
        try {
            // Safe access to last message content
            const lastMsg = messages[messages.length - 1];
            const lastMessage = typeof lastMsg?.content === "string" ? lastMsg.content : "";
            const conversationId = options?.conversationId || "anon";
            // 1. Pre-Check Limits
            const limitCheck = await AiUsageService.checkLimits(storeId, conversationId);
            if (!limitCheck.allowed) {
                const reasonText = (limitCheck.reason || "").toLowerCase();
                const isTrialEnded = reasonText.includes("trial") || reasonText.includes("ended");
                const friendlyMessage = isTrialEnded
                    ? "I’d love to keep chatting, but this store’s free AI trial has ended so I need to pause here. I’ve flagged this for the owner so they can top things up."
                    : "I’ve hit the current AI limit for this store, so I have to pause my replies for now. I’ve let the store owner know so they can upgrade or add more messages.";
                return {
                    message: friendlyMessage,
                    data: {
                        requiredAction: "BUY_ADDON_OR_UPGRADE",
                        reason: limitCheck.reason,
                        usage: limitCheck.usage,
                    },
                };
            }
            // 1.5. Escalation Trigger Detection
            const trigger = this.detectEscalationTrigger(lastMessage);
            if (trigger) {
                await EscalationService.triggerHandoff({
                    storeId,
                    conversationId: conversationId,
                    trigger,
                    reason: `Detected escalation trigger in customer message: ${lastMessage.substring(0, 80)}`,
                    aiSummary: `Rule-based escalation (${trigger}) from last customer message.`,
                });
                return {
                    message: this.getHandoffCopy(trigger),
                    data: {
                        status: "HANDED_OFF",
                        trigger,
                        escalation: {
                            trigger,
                            source: "rule_based",
                            conversationId,
                        },
                    },
                };
            }
            // 2. Load Context (Persona + RAG + Conversion Policies + Store Metadata)
            const [store, profile, context, fulfillmentPolicy] = await Promise.all([
                prisma.store?.findUnique({
                    where: { id: storeId },
                    select: { name: true, category: true, settings: true, id: true },
                }),
                prisma.merchantAiProfile?.findUnique({ where: { storeId } }),
                MerchantBrainService.retrieveContext(storeId, lastMessage, 3),
                MerchantBrainService.getStoreFulfillmentPolicy(storeId),
            ]);

            const contextItems: AiContextItem[] = Array.isArray(context) ? (context as AiContextItem[]) : [];
            const fulfillment = (isRecord(fulfillmentPolicy) ? (fulfillmentPolicy as FulfillmentPolicy) : undefined);
            // 2.5 Conversion Intelligence (Prompt 9)
            const objection = ConversionService.classifyObjection(lastMessage);
            const strategy = await ConversionService.decidePersuasion({
                storeId,
                intent: "BROWSING", // In real app, derived from LLM or classifier
                sentiment: 0.5, // Derived from sentiment service
                confidence: 0.9,
                intensity: profile?.persuasionLevel || 1,
            });
            if (objection) {
                await prisma.objectionEvent?.create({
                    data: {
                        storeId,
                        conversationId,
                        category: objection,
                        rawText: lastMessage,
                    },
                });
            }
            // 3. Construct System Prompt (Enhanced with Persuasion Strategy & Store Meta)
            const contextString = contextItems
                .map((c: AiContextItem) => `[${c.sourceType}]: ${c.content}`)
                .join("\n");
            const persuasionAdvice = strategy !== "NONE"
                ? `STRATEGY: Use ${strategy}. Focus on benefits and trust. No pressure.`
                : "STRATEGY: Be helpful but stay neutral. No active selling.";
            const settings = getMeta(store?.settings);
            const supportPhone = getString(settings.supportPhone);
            const storeMetadata: StoreMetadata = {
                description: getString(settings.description) || undefined,
                hours: getString(settings.hours) || undefined,
                returnPolicy: getString(settings.returnPolicy) || undefined,
                phone: supportPhone || undefined,
            };

            const pickupPoints = Array.isArray(fulfillment?.pickupPoints) ? fulfillment.pickupPoints : [];
            const pickupPointSummary = pickupPoints.length
                ? pickupPoints
                    .filter((p) => Boolean(p) && (p.isDefault || p.isPickupPoint))
                    .slice(0, 2)
                    .map((p) => `${getString(p.name)}: ${[getString(p.address), getString(p.city), getString(p.state)].filter(Boolean).join(", ")}`)
                    .join(" | ")
                : "N/A";

            const fulfillmentSnapshot = fulfillment
                ? `FULFILLMENT POLICY SNAPSHOT:\n- pickupEnabled: ${Boolean(fulfillment.pickupEnabled)}\n- deliveryEnabled: ${Boolean(fulfillment.deliveryEnabled)}\n- deliveryMode: ${getString(fulfillment.deliveryMode) || "UNKNOWN"}\n- provider: ${getString(fulfillment.deliveryProvider) || "UNKNOWN"}\n- allowImageUnderstanding: ${Boolean(fulfillment.whatsappAgent?.allowImageUnderstanding)}\n- defaultPickupPoints: ${pickupPointSummary}`
                : "FULFILLMENT POLICY SNAPSHOT: unavailable";

            const normalizedProfile: MerchantProfile | null = profile
                ? {
                    agentName: profile.agentName || undefined,
                    tonePreset: profile.tonePreset || undefined,
                    brevityMode: profile.brevityMode || undefined,
                    persuasionLevel: typeof profile.persuasionLevel === "number" ? profile.persuasionLevel : undefined,
                }
                : null;
            const systemPrompt = this.getSystemPrompt(store?.name || "the store", store?.category, normalizedProfile, contextString + "\n" + persuasionAdvice + "\n" + fulfillmentSnapshot, storeMetadata);
            // 4. Tool Definitions - Industry-aware tools
            const tools = this.getToolsForIndustry(store?.category) as unknown as Chat.ChatCompletionTool[];
            // 5. LLM Execution
            const llmMessages = [
                { role: "system", content: systemPrompt },
                ...messages.map((m: IncomingMessage) => ({
                    role: m.role === "system" ? "system" : m.role === "assistant" ? "assistant" : "user",
                    content: typeof m.content === "string" ? m.content : "",
                }))
            ];
            const response = await groqClient.chatCompletion(llmMessages, {
                model: "llama-3.1-70b-versatile",
                temperature: 0.1,
                tools,
                tool_choice: "auto",
                storeId,
                requestId: options?.requestId,
            });
            if (!response) {
                return { message: "I'm having trouble connecting right now." };
            }
            let choice = response.choices[0].message;
            // Handle Tool Calls
            if (choice.tool_calls) {
                const toolResults = [];
                for (const tool of choice.tool_calls) {
                    if (tool.function?.name === "get_inventory") {
                        const args = JSON.parse(tool.function?.arguments);
                        const result = await MerchantBrainService.getInventoryStatus(storeId, args.productId);
                        toolResults.push({
                            role: "tool",
                            tool_call_id: tool.id,
                            content: JSON.stringify(result),
                        });
                    }
                    else if (tool.function?.name === "get_delivery_quote") {
                        const args = JSON.parse(tool.function?.arguments);
                        const result = await MerchantBrainService.getDeliveryQuote(storeId, args.location);
                        toolResults.push({
                            role: "tool",
                            tool_call_id: tool.id,
                            content: JSON.stringify(result),
                        });
                    }
                    else if (tool.function?.name === "get_delivery_quote_v2") {
                        const args = JSON.parse(tool.function?.arguments);
                        const result = await MerchantBrainService.getDeliveryQuoteV2(storeId, args.location);
                        toolResults.push({
                            role: "tool",
                            tool_call_id: tool.id,
                            content: JSON.stringify(result),
                        });
                    }
                    else if (tool.function?.name === "get_store_fulfillment_policy") {
                        const result = await MerchantBrainService.getStoreFulfillmentPolicy(storeId);
                        toolResults.push({
                            role: "tool",
                            tool_call_id: tool.id,
                            content: JSON.stringify(result),
                        });
                    }
                    else if (tool.function?.name === "describe_image") {
                        const args = JSON.parse(tool.function?.arguments);
                        const result = await MerchantBrainService.describeImage(storeId, args.imageUrl);
                        toolResults.push({
                            role: "tool",
                            tool_call_id: tool.id,
                            content: JSON.stringify(result),
                        });
                    }
                    else if (tool.function?.name === "search_catalog") {
                        const args = JSON.parse(tool.function?.arguments);
                        const result = await MerchantBrainService.searchCatalog(storeId, args.query);
                        toolResults.push({
                            role: "tool",
                            tool_call_id: tool.id,
                            content: JSON.stringify(result),
                        });
                    }
                    else if (tool.function?.name === "get_promotions") {
                        const result = await MerchantBrainService.getActivePromotions(storeId);
                        toolResults.push({
                            role: "tool",
                            tool_call_id: tool.id,
                            content: JSON.stringify(result),
                        });
                    }
                    // Nightlife-specific tools
                    else if (tool.function?.name === "get_available_tables") {
                        const args = JSON.parse(tool.function?.arguments);
                        const result = await this.getAvailableTables(storeId, args.date);
                        toolResults.push({
                            role: "tool",
                            tool_call_id: tool.id,
                            content: JSON.stringify(result),
                        });
                    }
                    else if (tool.function?.name === "get_bottle_menu") {
                        const result = await this.getBottleMenu(storeId);
                        toolResults.push({
                            role: "tool",
                            tool_call_id: tool.id,
                            content: JSON.stringify(result),
                        });
                    }
                    else if (tool.function?.name === "create_reservation") {
                        const args = JSON.parse(tool.function?.arguments);
                        const result = await this.createReservation(storeId, args);
                        toolResults.push({
                            role: "tool",
                            tool_call_id: tool.id,
                            content: JSON.stringify(result),
                        });
                    }
                    else if (tool.function?.name === "get_upcoming_events") {
                        const result = await this.getUpcomingEvents(storeId);
                        toolResults.push({
                            role: "tool",
                            tool_call_id: tool.id,
                            content: JSON.stringify(result),
                        });
                    }
                    // Services & Bookings tools
                    else if (tool.function?.name === "get_available_slots") {
                        const args = JSON.parse(tool.function?.arguments);
                        const result = await this.getAvailableSlots(storeId, args.serviceId, args.date);
                        toolResults.push({
                            role: "tool",
                            tool_call_id: tool.id,
                            content: JSON.stringify(result),
                        });
                    }
                    else if (tool.function?.name === "get_services") {
                        const result = await this.getServices(storeId);
                        toolResults.push({
                            role: "tool",
                            tool_call_id: tool.id,
                            content: JSON.stringify(result),
                        });
                    }
                    else if (tool.function?.name === "book_appointment") {
                        const args = JSON.parse(tool.function?.arguments);
                        const result = await this.bookAppointment(storeId, args);
                        toolResults.push({
                            role: "tool",
                            tool_call_id: tool.id,
                            content: JSON.stringify(result),
                        });
                    }
                    // Food & Restaurant tools
                    else if (tool.function?.name === "get_menu") {
                        const result = await this.getMenu(storeId);
                        toolResults.push({
                            role: "tool",
                            tool_call_id: tool.id,
                            content: JSON.stringify(result),
                        });
                    }
                    else if (tool.function?.name === "place_order") {
                        const args = JSON.parse(tool.function?.arguments);
                        const result = await this.placeOrder(storeId, args);
                        toolResults.push({
                            role: "tool",
                            tool_call_id: tool.id,
                            content: JSON.stringify(result),
                        });
                    }
                    else if (tool.function?.name === "check_order_status") {
                        const args = JSON.parse(tool.function?.arguments);
                        const result = await this.checkOrderStatus(storeId, args.orderNumber);
                        toolResults.push({
                            role: "tool",
                            tool_call_id: tool.id,
                            content: JSON.stringify(result),
                        });
                    }
                    // Real Estate tools
                    else if (tool.function?.name === "search_properties") {
                        const args = JSON.parse(tool.function?.arguments);
                        const result = await this.searchProperties(storeId, args);
                        toolResults.push({
                            role: "tool",
                            tool_call_id: tool.id,
                            content: JSON.stringify(result),
                        });
                    }
                    else if (tool.function?.name === "schedule_viewing") {
                        const args = JSON.parse(tool.function?.arguments);
                        const result = await this.scheduleViewing(storeId, args);
                        toolResults.push({
                            role: "tool",
                            tool_call_id: tool.id,
                            content: JSON.stringify(result),
                        });
                    }
                    // Automotive tools
                    else if (tool.function?.name === "search_vehicles") {
                        const args = JSON.parse(tool.function?.arguments);
                        const result = await this.searchVehicles(storeId, args);
                        toolResults.push({
                            role: "tool",
                            tool_call_id: tool.id,
                            content: JSON.stringify(result),
                        });
                    }
                    else if (tool.function?.name === "schedule_test_drive") {
                        const args = JSON.parse(tool.function?.arguments);
                        const result = await this.scheduleTestDrive(storeId, args);
                        toolResults.push({
                            role: "tool",
                            tool_call_id: tool.id,
                            content: JSON.stringify(result),
                        });
                    }
                    // Travel & Hospitality tools
                    else if (tool.function?.name === "check_availability") {
                        const args = JSON.parse(tool.function?.arguments);
                        const result = await this.checkAccommodationAvailability(storeId, args);
                        toolResults.push({
                            role: "tool",
                            tool_call_id: tool.id,
                            content: JSON.stringify(result),
                        });
                    }
                    else if (tool.function?.name === "book_stay") {
                        const args = JSON.parse(tool.function?.arguments);
                        const result = await this.bookStay(storeId, args);
                        toolResults.push({
                            role: "tool",
                            tool_call_id: tool.id,
                            content: JSON.stringify(result),
                        });
                    }
                    // Education tools
                    else if (tool.function?.name === "get_courses") {
                        const result = await this.getCourses(storeId);
                        toolResults.push({
                            role: "tool",
                            tool_call_id: tool.id,
                            content: JSON.stringify(result),
                        });
                    }
                    else if (tool.function?.name === "enroll_course") {
                        const args = JSON.parse(tool.function?.arguments);
                        const result = await this.enrollCourse(storeId, args);
                        toolResults.push({
                            role: "tool",
                            tool_call_id: tool.id,
                            content: JSON.stringify(result),
                        });
                    }
                    // B2B tools
                    else if (tool.function?.name === "get_wholesale_pricing") {
                        const args = JSON.parse(tool.function?.arguments);
                        const result = await this.getWholesalePricing(storeId, args.productId, args.quantity);
                        toolResults.push({
                            role: "tool",
                            tool_call_id: tool.id,
                            content: JSON.stringify(result),
                        });
                    }
                    else if (tool.function?.name === "request_quote") {
                        const args = JSON.parse(tool.function?.arguments);
                        const result = await this.requestQuote(storeId, args);
                        toolResults.push({
                            role: "tool",
                            tool_call_id: tool.id,
                            content: JSON.stringify(result),
                        });
                    }
                    // Nonprofit tools
                    else if (tool.function?.name === "get_campaigns") {
                        const result = await this.getCampaigns(storeId);
                        toolResults.push({
                            role: "tool",
                            tool_call_id: tool.id,
                            content: JSON.stringify(result),
                        });
                    }
                    else if (tool.function?.name === "make_donation") {
                        const args = JSON.parse(tool.function?.arguments);
                        const result = await this.makeDonation(storeId, args);
                        toolResults.push({
                            role: "tool",
                            tool_call_id: tool.id,
                            content: JSON.stringify(result),
                        });
                    }
                }
                const secondResponse = await groqClient.chatCompletion([
                    { role: "system", content: systemPrompt },
                    ...messages,
                    choice,
                    ...toolResults,
                ], {
                    model: "llama-3.1-70b-versatile",
                    temperature: 0.1,
                    storeId,
                    requestId: options?.requestId,
                });
                if (secondResponse && secondResponse.choices[0]) {
                    choice = secondResponse.choices[0].message;
                }
            }
            // 6. Log Usage & Governance
            const retrievedDocIds = contextItems
                .map((c: AiContextItem) => c.sourceId)
                .filter((id): id is string => typeof id === "string");
            if (response && response.usage) {
                await AiUsageService.logUsage({
                    storeId,
                    model: "llama-3.1-70b-versatile",
                    inputTokens: response.usage?.prompt_tokens,
                    outputTokens: response.usage?.completion_tokens,
                    requestId: options?.requestId,
                    conversationId,
                });
                await DataGovernanceService.logAiTrace({
                    storeId,
                    conversationId: conversationId,
                    requestId: options?.requestId,
                    model: "llama-3.1-70b-versatile",
                    toolsUsed: (choice.tool_calls || []).map((t) => t.function?.name),
                    retrievedDocs: retrievedDocIds,
                    inputSummary: lastMessage,
                    outputSummary: choice.content || "",
                    guardrailFlags: [],
                    latencyMs: 0,
                });
            }
            // 7. Merchant "Hot Lead" Notification
            // If the AI shared a product link or checkout link, tell the merchant!
            if (choice.content?.includes("vayva.shop") ||
                choice.content?.includes("/checkout")) {
                // Fire and forget - use store data for context
                NotificationService.sendMilestone("first_sale", {
                    name: store?.name || "Merchant",
                    phone: supportPhone || "",
                    storeName: store?.name,
                }).catch(e => console.error("Failed to notify merchant of lead", e));
            }
            // 5.5. AI-Driven Escalation Filter
            if (choice.content?.includes("[HANDOFF_REQUIRED]")) {
                const trigger = "SENTIMENT"; // Default as proxy
                await EscalationService.triggerHandoff({
                    storeId,
                    conversationId: conversationId,
                    trigger,
                    reason: "AI agent determined this conversation should be handed to a human.",
                    aiSummary: `Model-requested escalation after last customer message: ${lastMessage.substring(0, 80)}`,
                });
                return {
                    message: this.getHandoffCopy(trigger),
                    data: {
                        status: "HANDED_OFF",
                        trigger,
                        escalation: {
                            trigger,
                            source: "model_signal",
                            conversationId,
                        },
                    },
                };
            }
            return {
                message: choice.content || "I'm checking that for you right now.",
                suggestedActions: this.deriveActions(choice.content),
            };
        }
        catch (error: unknown) {
            reportError(error, { context: "SalesAgent.handleMessage", storeId });
            return {
                message: "I'm having a quiet moment to think. Please message back in 5 minutes!",
            };
        }
    }
    static getSystemPrompt(storeName: string, category: string | null | undefined, profile: MerchantProfile | null, context: string, storeMetadata: StoreMetadata) {
        const agentName = profile?.agentName || "Assistant";
        const tone = profile?.tonePreset || "Friendly";
        const brevity = profile?.brevityMode === "Short"
            ? "Keep replies under 3 sentences."
            : "Be detailed.";
        const storeInfo = storeMetadata ? `
STORE INFO:
- Description: ${storeMetadata.description || "N/A"}
- Hours: ${storeMetadata.hours || "9am - 5pm"}
- Return Policy: ${storeMetadata.returnPolicy || "Standard"}
- Contact: ${storeMetadata.phone || "N/A"}
` : "";

        // Tone-specific personality traits
        const toneGuides: Record<string, string> = {
            Friendly: "Be warm, use casual language, add occasional emojis (1-2 max). Sound like a helpful friend.",
            Professional: "Be polite and efficient. Use proper grammar but stay approachable.",
            Luxury: "Be elegant and refined. Use sophisticated language. Make the customer feel special.",
            Playful: "Be fun and energetic! Use emojis freely. Keep things light and engaging.",
            Minimal: "Be direct and concise. No fluff. Get to the point quickly.",
        };
        const toneGuide = toneGuides[tone] || "Be warm and helpful.";

        // Nightlife-specific instructions
        const isNightlife = category?.toLowerCase().includes("nightlife") || 
                           category?.toLowerCase().includes("club") || 
                           category?.toLowerCase().includes("lounge") ||
                           storeMetadata?.description?.toLowerCase().includes("club") ||
                           storeMetadata?.description?.toLowerCase().includes("nightlife");

        const nightlifeInstructions = isNightlife ? `
NIGHTLIFE RESERVATION FLOW:
You can help guests book tables and buy tickets. When someone wants to make a reservation:
1. Ask for the DATE they want to visit (use get_available_tables tool)
2. Show available tables with minimum spend requirements
3. Ask about PARTY SIZE (how many guests)
4. Ask if they want to PRE-ORDER BOTTLES (use get_bottle_menu tool)
5. Collect their NAME and PHONE NUMBER
6. Use create_reservation tool to complete the booking

IMPORTANT FOR RESERVATIONS:
- Always confirm minimum spend requirements upfront
- Mention dress code if applicable
- Be enthusiastic about their night out! 🎉
- If they ask about events, use get_upcoming_events tool
- Nigerian phone format: 080XXXXXXXX or +234XXXXXXXXXX
` : "";

        return `You are ${agentName}, a friendly sales assistant for ${storeName}.

PERSONALITY: ${toneGuide}
BREVITY: ${brevity}
PERSUASION: Level ${profile?.persuasionLevel || 1} (1=gentle suggestions, 3=active selling).

${storeInfo}
${nightlifeInstructions}

FULFILLMENT & DELIVERY POLICY (CRITICAL):
1. Always call the tool get_store_fulfillment_policy early (before you present pickup/delivery options or totals).
2. Do NOT force pickup vs delivery. If the customer is unclear, ask ONE question: "Pickup or delivery?".
3. If deliveryMode is MANUAL (CUSTOM/manual):
   - Do NOT quote or charge a delivery fee inside the payment link.
   - Offer BOTH options depending on customer preference:
     A) Customer sends their own dispatch: share the pickup point/address from the policy.
     B) Merchant-arranged manual dispatch: collect the delivery address for coordination and respond with exactly "[HANDOFF_REQUIRED]" to notify a human to agree delivery price.
4. If deliveryMode is KWIK:
   - Ask for delivery address first (area + street/landmark).
   - Use get_delivery_quote_v2 to calculate delivery fee.
   - The customer should see ONE delivery fee number. Do not mention platform margin.
   - Margin is dynamic but must never exceed ₦1000 added.
5. Pickup:
   - If pickup is chosen, do not add any delivery fee. Share pickup location(s) from the policy.

IMAGE HANDLING (CRITICAL):
1. Customers may send images to describe what they want. Never ignore an image.
2. If the last user message contains IMAGE_META with an imageUrl:
   - If allowImageUnderstanding is true, call describe_image(imageUrl).
   - Use the returned description/keywords to call search_catalog(query).
   - Present up to 3 closest matches with price and whether it is in stock.
   - Ask ONE question to confirm the exact option (e.g. "Which one do you mean, 1/2/3?").
3. If allowImageUnderstanding is false OR imageUrl is missing/invalid:
   - Do NOT guess what the image is.
   - Ask ONE question requesting a short description (name/brand/type + size/colour), then you can use search_catalog.

CORE RULES:
1. BE HUMAN: Write like a real person texting, not a corporate bot. Use contractions (I'm, you'll, we've).
2. BE HELPFUL: Answer questions directly. If you don't know, say so honestly.
3. ONE QUESTION: Ask only ONE follow-up question per message to keep conversation flowing.
4. NIGERIA CONTEXT: You're in Nigeria. Use ₦ for prices. Understand local context.
5. TRUTHFULNESS: Only mention products/prices you find in the context below.
6. ESCALATION: If user mentions "human", "scam", "fraud", "manager", "supervisor", or seems very angry, respond with exactly "[HANDOFF_REQUIRED]" and nothing else.

VERIFIED KNOWLEDGE:
${context || "No specific knowledge found."}

Remember: You're helping a real person. Be genuine, be helpful, be human.`;
    }
    static detectEscalationTrigger(text: string) {
        if (!text)
            return null;
        const lowerText = text.toLowerCase();
        const includesAny = (terms: string[]) => terms.some((t) => lowerText.includes(t));
        // Clear fraud / scam signals
        if (includesAny([" scam", "fraud", "fraudulent", "fake", "419"]))
            return "FRAUD_RISK";
        // Payment / billing issues
        if (includesAny([
            "refund",
            "refunded",
            "double charge",
            "charged twice",
            "chargeback",
            "payment issue",
            "billing error",
        ]))
            return "PAYMENT_DISPUTE";
        // Strong negative sentiment or explicit frustration
        if (includesAny([
            "i am angry",
            "i'm angry",
            "angry",
            "upset",
            "frustrated",
            "annoyed",
            "stupid bot",
            "useless bot",
            "hate this",
        ]))
            return "SENTIMENT";
        // Direct request for a human in a heated context
        if (includesAny(["speak to a human", "real person", "live agent", "supervisor", "manager"]))
            return "SENTIMENT";
        return null;
    }
    static getHandoffCopy(trigger: string) {
        switch (trigger) {
            case "PAYMENT_DISPUTE":
            case "BILLING_ERROR":
                return "I'm really sorry this payment looks confusing. I've asked a human on our billing team to step in and review it with you directly.";
            case "FRAUD_RISK":
                return "I understand this feels worrying. I've flagged this for a human on our team to review urgently and respond to you directly.";
            case "SENTIMENT":
                return "I don't want to make this more frustrating. I've asked a human teammate to take over this chat and respond to you personally.";
            default:
                return "I've passed this conversation to a human teammate so they can follow up with you directly.";
        }
    }
    static deriveActions(content: string | null | undefined) {
        if (!content)
            return [];
        const actions = [];
        if (content.toLowerCase().includes("price"))
            actions.push("Check Delivery Cost");
        if (content.toLowerCase().includes("item"))
            actions.push("View Similar Items");
        return actions.length > 0 ? actions : ["Ask about Delivery"];
    }

    // ==================== NIGHTLIFE TOOLS ====================

    /**
     * Get available tables for a specific date
     */
    static async getAvailableTables(storeId: string, date: string) {
        try {
            // Get all tables (products with productType containing 'table' or 'SERVICE')
            const tables = await prisma.product?.findMany({
                where: {
                    storeId,
                    OR: [
                        { productType: "SERVICE" },
                        { productType: { contains: "table", mode: "insensitive" } },
                    ],
                    status: "ACTIVE",
                },
                select: {
                    id: true,
                    title: true,
                    price: true,
                    metadata: true,
                },
            });

            // Check existing bookings for that date
            const startOfDay = new Date(date);
            startOfDay.setHours(0, 0, 0, 0);
            const endOfDay = new Date(date);
            endOfDay.setHours(23, 59, 59, 999);

            const existingBookings = await prisma.booking?.findMany({
                where: {
                    storeId,
                    startsAt: { gte: startOfDay, lte: endOfDay },
                    status: { in: ["PENDING", "CONFIRMED"] },
                },
                select: { serviceId: true },
            });

            const bookedTableIds = new Set(existingBookings.map((b) => b.serviceId));

            const availableTables = tables
                .filter((t) => !bookedTableIds.has(t.id))
                .map((t) => {
                    const meta = getMeta(t.metadata);
                    return {
                        id: t.id,
                        name: t.title,
                        type: getString(meta.tableType) || "Standard",
                        capacity: typeof meta.capacity === "number" ? meta.capacity : 6,
                        minimumSpend: Number(meta.minimumSpend) || Number(t.price) || 0,
                        location: getString(meta.location),
                    };
                });

            if (availableTables.length === 0) {
                return { available: false, message: "No tables available for this date. Try another date." };
            }

            return {
                available: true,
                date,
                tables: availableTables,
                message: `${availableTables.length} tables available for ${date}`,
            };
        } catch (error) {
            console.error("getAvailableTables error:", error);
            return { available: false, message: "Unable to check table availability right now." };
        }
    }

    /**
     * Get bottle/drinks menu
     */
    static async getBottleMenu(storeId: string) {
        try {
            // Get bottles (products with productType 'bottle' or category containing bottle/drink)
            const bottles = await prisma.product?.findMany({
                where: {
                    storeId,
                    status: "ACTIVE",
                    OR: [
                        { productType: { contains: "bottle", mode: "insensitive" } },
                        { productType: { contains: "drink", mode: "insensitive" } },
                        { tags: { has: "bottle" } },
                    ],
                },
                select: {
                    id: true,
                    title: true,
                    price: true,
                    description: true,
                    metadata: true,
                    productImages: { take: 1, select: { url: true } },
                },
                orderBy: { price: "asc" },
            });

            if (bottles.length === 0) {
                // Fallback: return some default bottle info from store settings
                return {
                    available: false,
                    message: "Bottle menu not configured. Contact the venue directly for bottle service.",
                };
            }

            const menu = bottles.map((b) => {
                const meta = getMeta(b.metadata);
                return {
                    id: b.id,
                    name: b.title,
                    price: Number(b.price),
                    category: getString(meta.category) || "Spirits",
                    volume: getString(meta.volume) || "",
                    description: b.description || "",
                };
            });

            // Group by category
            const categories: Record<string, unknown[]> = {};
            menu.forEach((item) => {
                if (!categories[item.category]) categories[item.category] = [];
                categories[item.category].push(item);
            });

            return {
                available: true,
                menu: categories,
                totalItems: menu.length,
            };
        } catch (error) {
            console.error("getBottleMenu error:", error);
            return { available: false, message: "Unable to load bottle menu right now." };
        }
    }

    /**
     * Create a table reservation
     */
    static async createReservation(storeId: string, data: {
        guestName: string;
        guestPhone: string;
        date: string;
        time?: string;
        tableType: string;
        partySize: number;
        bottles?: { name: string; quantity: number }[];
        specialRequests?: string;
    }) {
        try {
            const { guestName, guestPhone, date, time, tableType, partySize, bottles, specialRequests } = data;

            // Find a matching table
            const table = await prisma.product?.findFirst({
                where: {
                    storeId,
                    status: "ACTIVE",
                    OR: [
                        { productType: "SERVICE" },
                        { title: { contains: tableType, mode: "insensitive" } },
                    ],
                },
                select: { id: true, title: true, price: true, metadata: true },
            });

            if (!table) {
                return {
                    success: false,
                    message: `No ${tableType} table found. Available types: Standard, VIP, Premium.`,
                };
            }

            const tableMetadata = getMeta(table.metadata);
            const minimumSpend = Number(tableMetadata.minimumSpend) || Number(table.price) || 0;

            // Calculate bottle total if pre-ordering
            let bottleTotal = 0;
            const bottleDetails: UnknownRecord[] = [];
            if (bottles && bottles.length > 0) {
                for (const bottle of bottles) {
                    const bottleProduct = await prisma.product?.findFirst({
                        where: {
                            storeId,
                            title: { contains: bottle.name, mode: "insensitive" },
                            status: "ACTIVE",
                        },
                        select: { id: true, title: true, price: true },
                    });
                    if (bottleProduct) {
                        const price = Number(bottleProduct.price);
                        bottleTotal += price * bottle.quantity;
                        bottleDetails.push({
                            id: bottleProduct.id,
                            name: bottleProduct.title,
                            quantity: bottle.quantity,
                            price,
                        });
                    }
                }
            }

            const totalAmount = Math.max(bottleTotal, minimumSpend);

            // Create the booking
            const startsAt = new Date(`${date}T${time || "22:00"}:00`);
            const endsAt = new Date(startsAt.getTime() + 4 * 60 * 60 * 1000);

            const booking = await prisma.booking?.create({
                data: {
                    storeId,
                    serviceId: table.id,
                    startsAt,
                    endsAt,
                    status: "PENDING",
                    notes: specialRequests || "",
                    metadata: {
                        guestName,
                        guestPhone,
                        partySize,
                        tableType,
                        bottles: bottleDetails,
                        totalAmount,
                        minimumSpend,
                        specialRequests,
                        source: "whatsapp",
                    } as Prisma.InputJsonValue,
                },
            });

            return {
                success: true,
                reservationId: booking.id,
                message: `Reservation confirmed! 🎉`,
                details: {
                    name: guestName,
                    date: date,
                    time: time || "10:00 PM",
                    table: table.title,
                    partySize,
                    minimumSpend: `₦${minimumSpend.toLocaleString()}`,
                    bottlePreOrder: bottleDetails.length > 0 ? bottleDetails : "None",
                    estimatedTotal: `₦${totalAmount.toLocaleString()}`,
                    status: "Pending Confirmation",
                },
                nextSteps: "The venue will confirm your reservation shortly. You'll receive a confirmation message.",
            };
        } catch (error) {
            console.error("createReservation error:", error);
            return {
                success: false,
                message: "Unable to complete reservation. Please try again or contact the venue directly.",
            };
        }
    }

    /**
     * Get upcoming events at the venue
     */
    static async getUpcomingEvents(storeId: string) {
        try {
            const now = new Date();

            const events = await prisma.product?.findMany({
                where: {
                    storeId,
                    productType: "event",
                    status: "ACTIVE",
                },
                include: {
                    productVariants: true,
                    productImages: { take: 1, select: { url: true } },
                },
                orderBy: { createdAt: "desc" },
                take: 5,
            });

            // Filter to upcoming events only
            const upcomingEvents = events
                .filter((e) => {
                    const meta = getMeta(e.metadata);
                    const eventDateRaw = meta.eventDate;
                    const eventDate = typeof eventDateRaw === "string" || eventDateRaw instanceof Date ? new Date(String(eventDateRaw)) : null;
                    return eventDate && eventDate >= now;
                })
                .map((e) => {
                    const meta = getMeta(e.metadata);
                    return {
                        id: e.id,
                        name: e.title,
                        date: getString(meta.eventDate),
                        time: getString(meta.eventTime) || "10:00 PM",
                        venue: getString(meta.venue),
                        description: e.description?.substring(0, 100) || "",
                        dressCode: getString(meta.dressCode),
                        ticketTypes: e.productVariants?.map((v: { title: string; price: unknown }) => ({
                            name: v.title,
                            price: `₦${Number(v.price).toLocaleString()}`,
                        })),
                    };
                });

            if (upcomingEvents.length === 0) {
                return {
                    available: false,
                    message: "No upcoming events scheduled. Check back soon!",
                };
            }

            return {
                available: true,
                events: upcomingEvents,
                message: `${upcomingEvents.length} upcoming event(s)`,
            };
        } catch (error) {
            console.error("getUpcomingEvents error:", error);
            return { available: false, message: "Unable to load events right now." };
        }
    }

    // ==================== INDUSTRY-AWARE TOOL DEFINITIONS ====================

    /**
     * Returns the appropriate tools based on store industry/category
     */
    static getToolsForIndustry(category: string | null | undefined): unknown[] {
        // Base tools available to all industries
        const baseTools = [
            {
                type: "function",
                function: {
                    name: "get_inventory",
                    description: "Check real-time stock for a product",
                    parameters: {
                        type: "object",
                        properties: { productId: { type: "string" } },
                        required: ["productId"],
                    },
                },
            },
            {
                type: "function",
                function: {
                    name: "get_store_fulfillment_policy",
                    description: "Get store pickup/delivery capabilities, pickup points, and delivery mode (Kwik vs Manual)",
                    parameters: { type: "object", properties: {} },
                },
            },
            {
                type: "function",
                function: {
                    name: "describe_image",
                    description: "Describe what is in an image URL sent by a customer (use only if allowImageUnderstanding is true).",
                    parameters: {
                        type: "object",
                        properties: { imageUrl: { type: "string" } },
                        required: ["imageUrl"],
                    },
                },
            },
            {
                type: "function",
                function: {
                    name: "search_catalog",
                    description: "Search the store catalog by text (e.g. from an image description) and return candidate products.",
                    parameters: {
                        type: "object",
                        properties: { query: { type: "string" } },
                        required: ["query"],
                    },
                },
            },
            {
                type: "function",
                function: {
                    name: "get_delivery_quote",
                    description: "Calculate delivery fee and ETA for a location",
                    parameters: {
                        type: "object",
                        properties: { location: { type: "string" } },
                        required: ["location"],
                    },
                },
            },
            {
                type: "function",
                function: {
                    name: "get_delivery_quote_v2",
                    description: "Calculate delivery fee and ETA for a location, including dynamic platform margin (capped) and whether delivery is chargeable (Kwik only)",
                    parameters: {
                        type: "object",
                        properties: { location: { type: "string" } },
                        required: ["location"],
                    },
                },
            },
            {
                type: "function",
                function: {
                    name: "get_promotions",
                    description: "Get active discounts and special offers",
                    parameters: { type: "object", properties: {} },
                },
            },
        ];

        const cat = (category || "").toLowerCase();

        // Nightlife tools
        if (cat.includes("nightlife") || cat.includes("club") || cat.includes("lounge")) {
            return [
                ...baseTools,
                {
                    type: "function",
                    function: {
                        name: "get_available_tables",
                        description: "Get available tables for reservation. Use when customer wants to book a table.",
                        parameters: {
                            type: "object",
                            properties: { date: { type: "string", description: "Date (YYYY-MM-DD)" } },
                            required: ["date"],
                        },
                    },
                },
                {
                    type: "function",
                    function: {
                        name: "get_bottle_menu",
                        description: "Get bottle/drinks menu with prices.",
                        parameters: { type: "object", properties: {} },
                    },
                },
                {
                    type: "function",
                    function: {
                        name: "create_reservation",
                        description: "Create a table reservation. Collect: name, phone, date, table type, party size first.",
                        parameters: {
                            type: "object",
                            properties: {
                                guestName: { type: "string" },
                                guestPhone: { type: "string" },
                                date: { type: "string" },
                                time: { type: "string" },
                                tableType: { type: "string" },
                                partySize: { type: "number" },
                                bottles: { type: "array", items: { type: "object" } },
                                specialRequests: { type: "string" },
                            },
                            required: ["guestName", "guestPhone", "date", "tableType", "partySize"],
                        },
                    },
                },
                {
                    type: "function",
                    function: {
                        name: "get_upcoming_events",
                        description: "Get upcoming events at the venue.",
                        parameters: { type: "object", properties: {} },
                    },
                },
            ];
        }

        // Services & Bookings (salons, spas, consultants, etc.)
        if (cat.includes("service") || cat.includes("salon") || cat.includes("spa") || cat.includes("consult")) {
            return [
                ...baseTools,
                {
                    type: "function",
                    function: {
                        name: "get_services",
                        description: "Get list of available services with prices and durations.",
                        parameters: { type: "object", properties: {} },
                    },
                },
                {
                    type: "function",
                    function: {
                        name: "get_available_slots",
                        description: "Get available appointment slots for a service on a specific date.",
                        parameters: {
                            type: "object",
                            properties: {
                                serviceId: { type: "string", description: "Service ID" },
                                date: { type: "string", description: "Date (YYYY-MM-DD)" },
                            },
                            required: ["date"],
                        },
                    },
                },
                {
                    type: "function",
                    function: {
                        name: "book_appointment",
                        description: "Book an appointment. Collect: name, phone, service, date, time first.",
                        parameters: {
                            type: "object",
                            properties: {
                                customerName: { type: "string" },
                                customerPhone: { type: "string" },
                                serviceId: { type: "string" },
                                date: { type: "string" },
                                time: { type: "string" },
                                notes: { type: "string" },
                            },
                            required: ["customerName", "customerPhone", "serviceId", "date", "time"],
                        },
                    },
                },
            ];
        }

        // Food & Restaurant
        if (cat.includes("food") || cat.includes("restaurant") || cat.includes("cafe") || cat.includes("kitchen")) {
            return [
                ...baseTools,
                {
                    type: "function",
                    function: {
                        name: "get_menu",
                        description: "Get the restaurant menu with categories and prices.",
                        parameters: { type: "object", properties: {} },
                    },
                },
                {
                    type: "function",
                    function: {
                        name: "place_order",
                        description: "Place a food order. Collect: items, delivery address, phone first.",
                        parameters: {
                            type: "object",
                            properties: {
                                customerName: { type: "string" },
                                customerPhone: { type: "string" },
                                items: { type: "array", items: { type: "object", properties: { name: { type: "string" }, quantity: { type: "number" } } } },
                                deliveryAddress: { type: "string" },
                                orderType: { type: "string", description: "delivery or pickup" },
                                notes: { type: "string" },
                            },
                            required: ["customerName", "customerPhone", "items"],
                        },
                    },
                },
                {
                    type: "function",
                    function: {
                        name: "check_order_status",
                        description: "Check the status of an existing order.",
                        parameters: {
                            type: "object",
                            properties: { orderNumber: { type: "string" } },
                            required: ["orderNumber"],
                        },
                    },
                },
            ];
        }

        // Real Estate
        if (cat.includes("real_estate") || cat.includes("property") || cat.includes("realty")) {
            return [
                ...baseTools,
                {
                    type: "function",
                    function: {
                        name: "search_properties",
                        description: "Search available properties by criteria.",
                        parameters: {
                            type: "object",
                            properties: {
                                type: { type: "string", description: "rent or sale" },
                                minPrice: { type: "number" },
                                maxPrice: { type: "number" },
                                bedrooms: { type: "number" },
                                location: { type: "string" },
                            },
                        },
                    },
                },
                {
                    type: "function",
                    function: {
                        name: "schedule_viewing",
                        description: "Schedule a property viewing. Collect: name, phone, property, preferred date/time.",
                        parameters: {
                            type: "object",
                            properties: {
                                customerName: { type: "string" },
                                customerPhone: { type: "string" },
                                propertyId: { type: "string" },
                                preferredDate: { type: "string" },
                                preferredTime: { type: "string" },
                                notes: { type: "string" },
                            },
                            required: ["customerName", "customerPhone", "propertyId", "preferredDate"],
                        },
                    },
                },
            ];
        }

        // Automotive
        if (cat.includes("auto") || cat.includes("car") || cat.includes("vehicle") || cat.includes("dealer")) {
            return [
                ...baseTools,
                {
                    type: "function",
                    function: {
                        name: "search_vehicles",
                        description: "Search available vehicles by criteria.",
                        parameters: {
                            type: "object",
                            properties: {
                                make: { type: "string" },
                                model: { type: "string" },
                                minYear: { type: "number" },
                                maxYear: { type: "number" },
                                minPrice: { type: "number" },
                                maxPrice: { type: "number" },
                                condition: { type: "string", description: "new or used" },
                            },
                        },
                    },
                },
                {
                    type: "function",
                    function: {
                        name: "schedule_test_drive",
                        description: "Schedule a test drive. Collect: name, phone, vehicle, preferred date/time.",
                        parameters: {
                            type: "object",
                            properties: {
                                customerName: { type: "string" },
                                customerPhone: { type: "string" },
                                vehicleId: { type: "string" },
                                preferredDate: { type: "string" },
                                preferredTime: { type: "string" },
                                notes: { type: "string" },
                            },
                            required: ["customerName", "customerPhone", "vehicleId", "preferredDate"],
                        },
                    },
                },
            ];
        }

        // Travel & Hospitality
        if (cat.includes("travel") || cat.includes("hotel") || cat.includes("hospitality") || cat.includes("stay") || cat.includes("airbnb")) {
            return [
                ...baseTools,
                {
                    type: "function",
                    function: {
                        name: "check_availability",
                        description: "Check room/accommodation availability for dates.",
                        parameters: {
                            type: "object",
                            properties: {
                                checkIn: { type: "string", description: "Check-in date (YYYY-MM-DD)" },
                                checkOut: { type: "string", description: "Check-out date (YYYY-MM-DD)" },
                                guests: { type: "number" },
                                roomType: { type: "string" },
                            },
                            required: ["checkIn", "checkOut"],
                        },
                    },
                },
                {
                    type: "function",
                    function: {
                        name: "book_stay",
                        description: "Book accommodation. Collect: name, phone, dates, room type, guests first.",
                        parameters: {
                            type: "object",
                            properties: {
                                guestName: { type: "string" },
                                guestPhone: { type: "string" },
                                guestEmail: { type: "string" },
                                checkIn: { type: "string" },
                                checkOut: { type: "string" },
                                roomType: { type: "string" },
                                guests: { type: "number" },
                                specialRequests: { type: "string" },
                            },
                            required: ["guestName", "guestPhone", "checkIn", "checkOut"],
                        },
                    },
                },
            ];
        }

        // Education & Courses
        if (cat.includes("education") || cat.includes("course") || cat.includes("training") || cat.includes("school")) {
            return [
                ...baseTools,
                {
                    type: "function",
                    function: {
                        name: "get_courses",
                        description: "Get available courses with details and pricing.",
                        parameters: { type: "object", properties: {} },
                    },
                },
                {
                    type: "function",
                    function: {
                        name: "enroll_course",
                        description: "Enroll in a course. Collect: name, phone, email, course first.",
                        parameters: {
                            type: "object",
                            properties: {
                                studentName: { type: "string" },
                                studentPhone: { type: "string" },
                                studentEmail: { type: "string" },
                                courseId: { type: "string" },
                                notes: { type: "string" },
                            },
                            required: ["studentName", "studentPhone", "courseId"],
                        },
                    },
                },
            ];
        }

        // B2B & Wholesale
        if (cat.includes("b2b") || cat.includes("wholesale") || cat.includes("bulk")) {
            return [
                ...baseTools,
                {
                    type: "function",
                    function: {
                        name: "get_wholesale_pricing",
                        description: "Get wholesale/bulk pricing for a product.",
                        parameters: {
                            type: "object",
                            properties: {
                                productId: { type: "string" },
                                quantity: { type: "number" },
                            },
                            required: ["productId", "quantity"],
                        },
                    },
                },
                {
                    type: "function",
                    function: {
                        name: "request_quote",
                        description: "Request a quote for bulk order. Collect: company, contact, items, quantities.",
                        parameters: {
                            type: "object",
                            properties: {
                                companyName: { type: "string" },
                                contactName: { type: "string" },
                                contactPhone: { type: "string" },
                                contactEmail: { type: "string" },
                                items: { type: "array", items: { type: "object", properties: { productId: { type: "string" }, quantity: { type: "number" } } } },
                                notes: { type: "string" },
                            },
                            required: ["companyName", "contactName", "contactPhone", "items"],
                        },
                    },
                },
            ];
        }

        // Nonprofit & Donations
        if (cat.includes("nonprofit") || cat.includes("charity") || cat.includes("donation") || cat.includes("ngo")) {
            return [
                ...baseTools,
                {
                    type: "function",
                    function: {
                        name: "get_campaigns",
                        description: "Get active fundraising campaigns.",
                        parameters: { type: "object", properties: {} },
                    },
                },
                {
                    type: "function",
                    function: {
                        name: "make_donation",
                        description: "Process a donation. Collect: name, email, amount, campaign.",
                        parameters: {
                            type: "object",
                            properties: {
                                donorName: { type: "string" },
                                donorEmail: { type: "string" },
                                donorPhone: { type: "string" },
                                amount: { type: "number" },
                                campaignId: { type: "string" },
                                isRecurring: { type: "boolean" },
                                message: { type: "string" },
                            },
                            required: ["donorName", "amount"],
                        },
                    },
                },
            ];
        }

        // Events & Ticketing
        if (cat.includes("event") || cat.includes("ticket") || cat.includes("concert")) {
            return [
                ...baseTools,
                {
                    type: "function",
                    function: {
                        name: "get_upcoming_events",
                        description: "Get upcoming events with ticket info.",
                        parameters: { type: "object", properties: {} },
                    },
                },
            ];
        }

        // Default: return base tools for commerce/retail
        return baseTools;
    }

    // ==================== SERVICES & BOOKINGS TOOLS ====================

    static async getServices(storeId: string) {
        try {
            const services = await prisma.product?.findMany({
                where: { storeId, status: "ACTIVE", productType: "SERVICE" },
                select: {
                    id: true,
                    title: true,
                    description: true,
                    price: true,
                    metadata: true,
                    productImages: { take: 1, select: { url: true } },
                },
                orderBy: { title: "asc" },
            });

            if (services.length === 0) {
                return { available: false, message: "No services available at the moment." };
            }

            return {
                available: true,
                services: services.map((s) => {
                    const meta = getMeta(s.metadata);
                    return {
                        id: s.id,
                        name: s.title,
                        description: s.description?.substring(0, 60) || "",
                        price: `₦${Number(s.price).toLocaleString()}`,
                        duration: meta.duration_min ? `${Number(meta.duration_min)} mins` : "60 mins",
                        category: getString(meta.category) || "General",
                    };
                }),
            };
        } catch (error) {
            console.error("getServices error:", error);
            return { available: false, message: "Unable to load services." };
        }
    }

    static async getAvailableSlots(storeId: string, serviceId: string | undefined, date: string) {
        try {
            const startOfDay = new Date(date);
            startOfDay.setHours(0, 0, 0, 0);
            const endOfDay = new Date(date);
            endOfDay.setHours(23, 59, 59, 999);

            // Get existing bookings for the day
            const existingBookings = await prisma.booking?.findMany({
                where: {
                    storeId,
                    startsAt: { gte: startOfDay, lte: endOfDay },
                    status: { in: ["PENDING", "CONFIRMED"] },
                },
                select: { startsAt: true, endsAt: true },
            });

            // Generate available slots (9 AM to 6 PM, 1-hour slots)
            const slots: string[] = [];
            for (let hour = 9; hour <= 17; hour++) {
                const slotTime = new Date(date);
                slotTime.setHours(hour, 0, 0, 0);
                
                const isBooked = existingBookings.some((b) => {
                    return slotTime >= b.startsAt && slotTime < b.endsAt;
                });

                if (!isBooked) {
                    slots.push(`${hour.toString().padStart(2, "0")}:00`);
                }
            }

            if (slots.length === 0) {
                return { available: false, message: `No available slots for ${date}. Try another date.` };
            }

            return {
                available: true,
                date,
                slots,
                message: `${slots.length} slots available`,
            };
        } catch (error) {
            console.error("getAvailableSlots error:", error);
            return { available: false, message: "Unable to check availability." };
        }
    }

    static async bookAppointment(storeId: string, data: {
        customerName: string;
        customerPhone: string;
        serviceId: string;
        date: string;
        time: string;
        notes?: string;
    }) {
        try {
            const { customerName, customerPhone, serviceId, date, time, notes } = data;

            const service = await prisma.product?.findFirst({
                where: { id: serviceId, storeId, status: "ACTIVE" },
                select: { id: true, title: true, price: true, metadata: true },
            });

            if (!service) {
                return { success: false, message: "Service not found." };
            }

            const meta = getMeta(service.metadata);
            const durationMin = Number(meta.duration_min) || 60;

            const startsAt = new Date(`${date}T${time}:00`);
            const endsAt = new Date(startsAt.getTime() + durationMin * 60 * 1000);

            const booking = await prisma.booking?.create({
                data: {
                    storeId,
                    serviceId: service.id,
                    startsAt,
                    endsAt,
                    status: "PENDING",
                    notes: notes || "",
                    metadata: {
                        customerName,
                        customerPhone,
                        source: "whatsapp",
                    },
                },
            });

            return {
                success: true,
                bookingId: booking.id,
                message: "Appointment booked! ",
                details: {
                    service: service.title,
                    date,
                    time,
                    duration: `${durationMin} mins`,
                    price: `₦${Number(service.price).toLocaleString()}`,
                },
                nextSteps: "You'll receive a confirmation shortly.",
            };
        } catch (error) {
            console.error("bookAppointment error:", error);
            return { success: false, message: "Unable to book appointment. Please try again." };
        }
    }

    // ==================== FOOD & RESTAURANT TOOLS ====================

    static async getMenu(storeId: string) {
        try {
            const items = await prisma.product?.findMany({
                where: { storeId, status: "ACTIVE" },
                select: {
                    id: true,
                    title: true,
                    description: true,
                    price: true,
                    productType: true,
                    metadata: true,
                    productImages: { take: 1, select: { url: true } },
                },
                orderBy: { title: "asc" },
            });

            if (items.length === 0) {
                return { available: false, message: "Menu not available." };
            }

            // Group by category/type
            const categories: Record<string, unknown[]> = {};
            items.forEach((item) => {
                const cat = item.productType || "Other";
                if (!categories[cat]) categories[cat] = [];
                const meta = getMeta(item.metadata);
                categories[cat].push({
                    id: item.id,
                    name: item.title,
                    description: item.description?.substring(0, 50) || "",
                    price: `₦${Number(item.price).toLocaleString()}`,
                    prepTime: meta.prep_time ? `${Number(meta.prep_time)} mins` : "",
                });
            });

            return { available: true, menu: categories, totalItems: items.length };
        } catch (error) {
            console.error("getMenu error:", error);
            return { available: false, message: "Unable to load menu." };
        }
    }

    static async placeOrder(storeId: string, data: {
        customerName: string;
        customerPhone: string;
        items: { name: string; quantity: number }[];
        deliveryAddress?: string;
        orderType?: string;
        notes?: string;
    }) {
        try {
            const { customerName, customerPhone, items, deliveryAddress, orderType, notes } = data;

            // Find products and calculate total
            let total = 0;
            const orderItems: UnknownRecord[] = [];

            for (const item of items) {
                const product = await prisma.product?.findFirst({
                    where: { storeId, title: { contains: item.name, mode: "insensitive" }, status: "ACTIVE" },
                    select: { id: true, title: true, price: true },
                });

                if (product) {
                    const lineTotal = Number(product.price) * item.quantity;
                    total += lineTotal;
                    orderItems.push({
                        productId: product.id,
                        name: product.title,
                        quantity: item.quantity,
                        unitPrice: Number(product.price),
                        lineTotal,
                    });
                }
            }

            if (orderItems.length === 0) {
                return { success: false, message: "No valid items found. Please check the menu." };
            }

            // Create order
            const orderNumber = `ORD-${Date.now().toString(36).toUpperCase()}`;

            // For now, store as a booking with order metadata
            const order = await prisma.booking?.create({
                data: {
                    storeId,
                    serviceId: (orderItems[0]?.productId as string) || "unknown_service", // Use first item as service reference
                    startsAt: new Date(),
                    endsAt: new Date(Date.now() + 60 * 60 * 1000),
                    status: "PENDING",
                    notes: notes || "",
                    metadata: {
                        type: "food_order",
                        orderNumber,
                        customerName,
                        customerPhone,
                        items: orderItems,
                        total,
                        deliveryAddress,
                        orderType: orderType || "delivery",
                        source: "whatsapp",
                    } as Prisma.InputJsonValue,
                },
            });

            return {
                success: true,
                orderNumber,
                message: "Order placed! ",
                details: {
                    items: orderItems.map((i) => `${i.quantity}x ${i.name}`),
                    total: `₦${total.toLocaleString()}`,
                    type: orderType || "delivery",
                    address: deliveryAddress || "Pickup",
                },
                nextSteps: "Your order is being prepared. You'll receive updates shortly.",
            };
        } catch (error) {
            console.error("placeOrder error:", error);
            return { success: false, message: "Unable to place order. Please try again." };
        }
    }

    static async checkOrderStatus(storeId: string, orderNumber: string) {
        try {
            const order = await prisma.booking?.findFirst({
                where: {
                    storeId,
                    metadata: { path: ["orderNumber"], equals: orderNumber },
                },
            });

            if (!order) {
                return { found: false, message: "Order not found. Please check the order number." };
            }

            const meta = getMeta(order.metadata);
            const itemsArr = Array.isArray(meta.items) ? meta.items : [];

            return {
                found: true,
                orderNumber,
                status: (order as any).status,
                items: itemsArr.map((i) => {
                    const rec = getMeta(i);
                    return `${getString(rec.quantity)}x ${getString(rec.name)}`;
                }),
                total: typeof meta.total === "number" ? `₦${meta?.total?.toLocaleString()}` : "N/A",
                message: `Order ${orderNumber} is ${(order as any).status.toLowerCase()}.`,
            };
        } catch (error) {
            console.error("checkOrderStatus error:", error);
            return { found: false, message: "Unable to check order status." };
        }
    }

    // ==================== REAL ESTATE TOOLS ====================

    static async searchProperties(storeId: string, filters: {
        type?: string;
        minPrice?: number;
        maxPrice?: number;
        bedrooms?: number;
        location?: string;
    }) {
        try {
            const properties = await prisma.product?.findMany({
                where: {
                    storeId,
                    status: "ACTIVE",
                    ...(filters.minPrice && { price: { gte: filters.minPrice } }),
                    ...(filters.maxPrice && { price: { lte: filters.maxPrice } }),
                },
                select: {
                    id: true,
                    title: true,
                    description: true,
                    price: true,
                    metadata: true,
                    productImages: { take: 1, select: { url: true } },
                },
                take: 10,
            });

            // Filter by metadata fields
            const filtered = properties.filter((p) => {
                const meta = getMeta(p.metadata);
                if (filters.bedrooms && meta.rooms !== filters.bedrooms) return false;
                if (filters.location && !getString(meta.location).toLowerCase().includes(filters.location?.toLowerCase())) return false;
                if (filters.type && meta.type !== filters.type) return false;
                return true;
            });

            if (filtered.length === 0) {
                return { found: false, message: "No properties match your criteria. Try adjusting your filters." };
            }

            return {
                found: true,
                count: filtered.length,
                properties: filtered.map((p) => {
                    const meta = getMeta(p.metadata);
                    return {
                        id: p.id,
                        title: p.title,
                        price: `₦${Number(p.price).toLocaleString()}`,
                        location: getString(meta.location),
                        type: getString(meta.type),
                        bedrooms: typeof meta.rooms === "number" ? meta.rooms : 0,
                        bathrooms: typeof meta.bathrooms === "number" ? meta.bathrooms : 0,
                        area: meta.area ? `${Number(meta.area)} sqm` : "",
                        image: p.productImages[0]?.url || null,
                    };
                }),
            };
        } catch (error) {
            console.error("searchProperties error:", error);
            return { found: false, message: "Unable to search properties." };
        }
    }

    static async scheduleViewing(storeId: string, data: {
        customerName: string;
        customerPhone: string;
        propertyId: string;
        preferredDate: string;
        preferredTime?: string;
        notes?: string;
    }) {
        try {
            const { customerName, customerPhone, propertyId, preferredDate, preferredTime, notes } = data;

            const property = await prisma.product?.findFirst({
                where: { id: propertyId, storeId },
                select: { id: true, title: true },
            });

            if (!property) {
                return { success: false, message: "Property not found." };
            }

            const startsAt = new Date(`${preferredDate}T${preferredTime || "10:00"}:00`);
            const endsAt = new Date(startsAt.getTime() + 60 * 60 * 1000);

            const booking = await prisma.booking?.create({
                data: {
                    storeId,
                    serviceId: property.id,
                    startsAt,
                    endsAt,
                    status: "PENDING",
                    notes: notes || "",
                    metadata: {
                        type: "property_viewing",
                        customerName,
                        customerPhone,
                        propertyTitle: property.title,
                        source: "whatsapp",
                    },
                },
            });

            return {
                success: true,
                viewingId: booking.id,
                message: "Viewing scheduled! 🏠",
                details: {
                    property: property.title,
                    date: preferredDate,
                    time: preferredTime || "10:00 AM",
                },
                nextSteps: "An agent will confirm your viewing appointment shortly.",
            };
        } catch (error) {
            console.error("scheduleViewing error:", error);
            return { success: false, message: "Unable to schedule viewing." };
        }
    }

    // ==================== AUTOMOTIVE TOOLS ====================

    static async searchVehicles(storeId: string, filters: {
        make?: string;
        model?: string;
        minYear?: number;
        maxYear?: number;
        minPrice?: number;
        maxPrice?: number;
        condition?: string;
    }) {
        try {
            const vehicles = await prisma.product?.findMany({
                where: {
                    storeId,
                    status: "ACTIVE",
                    ...(filters.minPrice && { price: { gte: filters.minPrice } }),
                    ...(filters.maxPrice && { price: { lte: filters.maxPrice } }),
                },
                include: {
                    vehicleProduct: true,
                    productImages: { take: 1, select: { url: true } },
                },
                take: 10,
            });

            const filtered = vehicles.filter((v) => {
                const vp = v.vehicleProduct;
                if (!vp) return false;
                if (filters.make && !vp.make?.toLowerCase().includes(filters.make?.toLowerCase())) return false;
                if (filters.model && !vp.model?.toLowerCase().includes(filters.model?.toLowerCase())) return false;
                if (filters.minYear && vp.year && vp.year < filters.minYear) return false;
                if (filters.maxYear && vp.year && vp.year > filters.maxYear) return false;
                if (filters.condition && vp.condition !== filters.condition?.toUpperCase()) return false;
                return true;
            });

            if (filtered.length === 0) {
                return { found: false, message: "No vehicles match your criteria." };
            }

            return {
                found: true,
                count: filtered.length,
                vehicles: filtered.map((v) => ({
                    id: v.id,
                    title: v.title,
                    price: `₦${Number(v.price).toLocaleString()}`,
                    make: v.vehicleProduct?.make || "",
                    model: v.vehicleProduct?.model || "",
                    year: v.vehicleProduct?.year || "",
                    mileage: v.vehicleProduct?.mileage ? `${v?.vehicleProduct?.mileage.toLocaleString()} km` : "",
                    condition: v.vehicleProduct?.condition || "",
                })),
            };
        } catch (error) {
            console.error("searchVehicles error:", error);
            return { found: false, message: "Unable to search vehicles." };
        }
    }

    static async scheduleTestDrive(storeId: string, data: {
        customerName: string;
        customerPhone: string;
        vehicleId: string;
        preferredDate: string;
        preferredTime?: string;
        notes?: string;
    }) {
        try {
            const { customerName, customerPhone, vehicleId, preferredDate, preferredTime, notes } = data;

            const vehicle = await prisma.product?.findFirst({
                where: { id: vehicleId, storeId },
                select: { id: true, title: true },
            });

            if (!vehicle) {
                return { success: false, message: "Vehicle not found." };
            }

            const startsAt = new Date(`${preferredDate}T${preferredTime || "10:00"}:00`);
            const endsAt = new Date(startsAt.getTime() + 60 * 60 * 1000);

            const booking = await prisma.booking?.create({
                data: {
                    storeId,
                    serviceId: vehicle.id,
                    startsAt,
                    endsAt,
                    status: "PENDING",
                    notes: notes || "",
                    metadata: {
                        type: "test_drive",
                        customerName,
                        customerPhone,
                        vehicleTitle: vehicle.title,
                        source: "whatsapp",
                    },
                },
            });

            return {
                success: true,
                testDriveId: booking.id,
                message: "Test drive scheduled! 🚗",
                details: {
                    vehicle: vehicle.title,
                    date: preferredDate,
                    time: preferredTime || "10:00 AM",
                },
                nextSteps: "A sales rep will confirm your test drive appointment.",
            };
        } catch (error) {
            console.error("scheduleTestDrive error:", error);
            return { success: false, message: "Unable to schedule test drive." };
        }
    }

    // ==================== TRAVEL & HOSPITALITY TOOLS ====================

    static async checkAccommodationAvailability(storeId: string, data: {
        checkIn: string;
        checkOut: string;
        guests?: number;
        roomType?: string;
    }) {
        try {
            const { checkIn, checkOut, guests, roomType } = data;

            const checkInDate = new Date(checkIn);
            const checkOutDate = new Date(checkOut);

            // Get all rooms/stays
            const rooms = await prisma.product?.findMany({
                where: { storeId, status: "ACTIVE" },
                include: { accommodationProduct: true },
            });

            // Check for overlapping bookings
            const existingBookings = await prisma.booking?.findMany({
                where: {
                    storeId,
                    OR: [
                        { startsAt: { gte: checkInDate, lt: checkOutDate } },
                        { endsAt: { gt: checkInDate, lte: checkOutDate } },
                    ],
                    status: { in: ["PENDING", "CONFIRMED"] },
                },
                select: { serviceId: true },
            });

            const bookedIds = new Set(existingBookings.map((b) => b.serviceId));

            const available = rooms.filter((r) => {
                if (bookedIds.has(r.id)) return false;
                const ap = r.accommodationProduct;
                if (guests && ap?.maxGuests && ap.maxGuests < guests) return false;
                if (roomType && !r.title?.toLowerCase().includes(roomType.toLowerCase())) return false;
                return true;
            });

            if (available.length === 0) {
                return { available: false, message: "No rooms available for these dates." };
            }

            const nights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));

            return {
                available: true,
                checkIn,
                checkOut,
                nights,
                rooms: available.map((r) => ({
                    id: r.id,
                    name: r.title,
                    pricePerNight: `₦${Number(r.price).toLocaleString()}`,
                    totalPrice: `₦${(Number(r.price) * nights).toLocaleString()}`,
                    maxGuests: r.accommodationProduct?.maxGuests || 2,
                })),
            };
        } catch (error) {
            console.error("checkAccommodationAvailability error:", error);
            return { available: false, message: "Unable to check availability." };
        }
    }

    static async bookStay(storeId: string, data: {
        guestName: string;
        guestPhone: string;
        guestEmail?: string;
        checkIn: string;
        checkOut: string;
        roomType?: string;
        guests?: number;
        specialRequests?: string;
    }) {
        try {
            const { guestName, guestPhone, guestEmail, checkIn, checkOut, roomType, guests, specialRequests } = data;

            // Find available room
            const room = await prisma.product?.findFirst({
                where: {
                    storeId,
                    status: "ACTIVE",
                    ...(roomType && { title: { contains: roomType, mode: "insensitive" } }),
                },
                select: { id: true, title: true, price: true },
            });

            if (!room) {
                return { success: false, message: "No matching room found." };
            }

            const checkInDate = new Date(checkIn);
            const checkOutDate = new Date(checkOut);
            const nights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));
            const total = Number(room.price) * nights;

            const booking = await prisma.booking?.create({
                data: {
                    storeId,
                    serviceId: room.id,
                    startsAt: checkInDate,
                    endsAt: checkOutDate,
                    status: "PENDING",
                    notes: specialRequests || "",
                    metadata: {
                        type: "accommodation",
                        guestName,
                        guestPhone,
                        guestEmail,
                        guests: guests || 1,
                        nights,
                        total,
                        roomTitle: room.title,
                        source: "whatsapp",
                    },
                },
            });

            return {
                success: true,
                bookingId: booking.id,
                message: "Stay booked! 🏨",
                details: {
                    room: room.title,
                    checkIn,
                    checkOut,
                    nights,
                    guests: guests || 1,
                    total: `₦${total.toLocaleString()}`,
                },
                nextSteps: "You'll receive a confirmation with check-in details.",
            };
        } catch (error) {
            console.error("bookStay error:", error);
            return { success: false, message: "Unable to complete booking." };
        }
    }

    // ==================== EDUCATION TOOLS ====================

    static async getCourses(storeId: string) {
        try {
            const courses = await prisma.product?.findMany({
                where: { storeId, status: "ACTIVE" },
                select: {
                    id: true,
                    title: true,
                    description: true,
                    price: true,
                    metadata: true,
                    productImages: { take: 1, select: { url: true } },
                },
                orderBy: { title: "asc" },
            });

            if (courses.length === 0) {
                return { available: false, message: "No courses available." };
            }

            return {
                available: true,
                courses: courses.map((c) => {
                    const meta = getMeta(c.metadata);
                    return {
                        id: c.id,
                        name: c.title,
                        description: c.description?.substring(0, 100) || "",
                        price: `₦${Number(c.price).toLocaleString()}`,
                        duration: getString(meta.duration),
                        instructor: getString(meta.instructor),
                    };
                }),
            };
        } catch (error) {
            console.error("getCourses error:", error);
            return { available: false, message: "Unable to load courses." };
        }
    }

    static async enrollCourse(storeId: string, data: {
        studentName: string;
        studentPhone: string;
        studentEmail?: string;
        courseId: string;
        notes?: string;
    }) {
        try {
            const { studentName, studentPhone, studentEmail, courseId, notes } = data;

            const course = await prisma.product?.findFirst({
                where: { id: courseId, storeId },
                select: { id: true, title: true, price: true },
            });

            if (!course) {
                return { success: false, message: "Course not found." };
            }

            const booking = await prisma.booking?.create({
                data: {
                    storeId,
                    serviceId: course.id,
                    startsAt: new Date(),
                    endsAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year access
                    status: "PENDING",
                    notes: notes || "",
                    metadata: {
                        type: "course_enrollment",
                        studentName,
                        studentPhone,
                        studentEmail,
                        courseTitle: course.title,
                        price: Number(course.price),
                        source: "whatsapp",
                    },
                },
            });

            return {
                success: true,
                enrollmentId: booking.id,
                message: "Enrollment submitted! 📚",
                details: {
                    course: course.title,
                    price: `₦${Number(course.price).toLocaleString()}`,
                },
                nextSteps: "Complete payment to access the course. You'll receive payment instructions shortly.",
            };
        } catch (error) {
            console.error("enrollCourse error:", error);
            return { success: false, message: "Unable to process enrollment." };
        }
    }

    // ==================== B2B & WHOLESALE TOOLS ====================

    static async getWholesalePricing(storeId: string, productId: string, quantity: number) {
        try {
            const product = await prisma.product?.findFirst({
                where: { id: productId, storeId },
            });

            if (!product) {
                return { found: false, message: "Product not found." };
            }

            // Get pricing tiers separately
            const pricingTiers = await prisma.pricingTier?.findMany({
                where: { productId },
                orderBy: { minQuantity: "asc" },
            });

            const basePrice = Number(product.price);
            let finalPrice = basePrice;
            let tier = "Standard";

            // Find applicable tier
            for (const t of pricingTiers) {
                if (quantity >= t.minQuantity) {
                    finalPrice = Number(t.price);
                    tier = `${t.minQuantity}+ units`;
                }
            }

            const total = finalPrice * quantity;
            const savings = (basePrice - finalPrice) * quantity;

            return {
                found: true,
                product: product.title,
                quantity,
                tier,
                unitPrice: `₦${finalPrice.toLocaleString()}`,
                total: `₦${total.toLocaleString()}`,
                savings: savings > 0 ? `₦${savings.toLocaleString()} saved` : null,
                moq: product.moq || 1,
            };
        } catch (error) {
            console.error("getWholesalePricing error:", error);
            return { found: false, message: "Unable to get pricing." };
        }
    }

    static async requestQuote(storeId: string, data: {
        companyName: string;
        contactName: string;
        contactPhone: string;
        contactEmail?: string;
        items: { productId: string; quantity: number }[];
        notes?: string;
    }) {
        try {
            const { companyName, contactName, contactPhone, contactEmail, items, notes } = data;

            // Calculate quote
            const quoteItems: UnknownRecord[] = [];
            let total = 0;

            for (const item of items) {
                const product = await prisma.product?.findFirst({
                    where: { id: item.productId, storeId },
                });

                if (product) {
                    const pricingTiers = await prisma.pricingTier?.findMany({
                        where: { productId: product.id },
                        orderBy: { minQuantity: "asc" },
                    });
                    let unitPrice = Number(product.price);
                    for (const t of pricingTiers) {
                        if (item.quantity >= t.minQuantity) {
                            unitPrice = Number(t.price);
                        }
                    }
                    const lineTotal = unitPrice * item.quantity;
                    total += lineTotal;
                    quoteItems.push({
                        productId: product.id,
                        name: product.title,
                        quantity: item.quantity,
                        unitPrice,
                        lineTotal,
                    });
                }
            }

            const quoteNumber = `QT-${Date.now().toString(36).toUpperCase()}`;

            const booking = await prisma.booking?.create({
                data: {
                    storeId,
                    serviceId: (quoteItems[0]?.productId as string) || "unknown_service", // Use first item as reference
                    startsAt: new Date(),
                    endsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Valid 30 days
                    status: "PENDING",
                    notes: notes || "",
                    metadata: {
                        type: "quote_request",
                        quoteNumber,
                        companyName,
                        contactName,
                        contactPhone,
                        contactEmail,
                        items: quoteItems,
                        total,
                        source: "whatsapp",
                    } as Prisma.InputJsonValue,
                },
            });

            return {
                success: true,
                quoteNumber,
                message: "Quote request submitted! 📋",
                details: {
                    company: companyName,
                    items: quoteItems.map((i) => `${i.quantity}x ${i.name}`),
                    estimatedTotal: `₦${total.toLocaleString()}`,
                    validFor: "30 days",
                },
                nextSteps: "Our sales team will review and send you a formal quote.",
            };
        } catch (error) {
            console.error("requestQuote error:", error);
            return { success: false, message: "Unable to submit quote request." };
        }
    }

    // ==================== NONPROFIT TOOLS ====================

    static async getCampaigns(storeId: string) {
        try {
            const campaigns = await prisma.product?.findMany({
                where: { storeId, status: "ACTIVE" },
                select: {
                    id: true,
                    title: true,
                    description: true,
                    price: true, // Goal amount
                    metadata: true,
                    productImages: { take: 1, select: { url: true } },
                },
            });

            if (campaigns.length === 0) {
                return { available: false, message: "No active campaigns." };
            }

            return {
                available: true,
                campaigns: campaigns.map((c) => {
                    const meta = getMeta(c.metadata);
                    return {
                        id: c.id,
                        name: c.title,
                        description: c.description?.substring(0, 100) || "",
                        goal: `₦${Number(c.price).toLocaleString()}`,
                        raised: typeof meta.raised === "number" ? `₦${meta?.raised?.toLocaleString()}` : "₦0",
                        cause: getString(meta.cause),
                    };
                }),
            };
        } catch (error) {
            console.error("getCampaigns error:", error);
            return { available: false, message: "Unable to load campaigns." };
        }
    }

    static async makeDonation(storeId: string, data: {
        donorName: string;
        donorEmail?: string;
        donorPhone?: string;
        amount: number;
        campaignId?: string;
        isRecurring?: boolean;
        message?: string;
    }) {
        try {
            const { donorName, donorEmail, donorPhone, amount, campaignId, isRecurring, message } = data;

            let campaignTitle = "General Fund";
            if (campaignId) {
                const campaign = await prisma.product?.findFirst({
                    where: { id: campaignId, storeId },
                    select: { title: true },
                });
                if (campaign) campaignTitle = campaign.title;
            }

            const donationRef = `DON-${Date.now().toString(36).toUpperCase()}`;

            const booking = await prisma.booking?.create({
                data: {
                    storeId,
                    serviceId: campaignId || "", // Empty string if no campaign
                    startsAt: new Date(),
                    endsAt: new Date(),
                    status: "PENDING",
                    notes: message || "",
                    metadata: {
                        type: "donation",
                        donationRef,
                        donorName,
                        donorEmail,
                        donorPhone,
                        amount,
                        campaignTitle,
                        isRecurring: isRecurring || false,
                        source: "whatsapp",
                    },
                },
            });

            return {
                success: true,
                donationRef,
                message: "Thank you for your generosity! 💝",
                details: {
                    amount: `₦${amount.toLocaleString()}`,
                    campaign: campaignTitle,
                    type: isRecurring ? "Monthly recurring" : "One-time",
                },
                nextSteps: "You'll receive payment instructions to complete your donation.",
            };
        } catch (error) {
            console.error("makeDonation error:", error);
            return { success: false, message: "Unable to process donation." };
        }
    }
}
