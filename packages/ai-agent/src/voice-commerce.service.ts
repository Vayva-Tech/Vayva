import { prisma } from "@vayva/db";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = prisma as any;

export enum AgentIntent {
  SEARCH_PRODUCTS = "SEARCH_PRODUCTS",
  ADD_TO_CART = "ADD_TO_CART",
  REMOVE_FROM_CART = "REMOVE_FROM_CART",
  VIEW_CART = "VIEW_CART",
  CHECKOUT = "CHECKOUT",
  TRACK_ORDER = "TRACK_ORDER",
  GET_HELP = "GET_HELP",
}

export interface AgentContext {
  storeId: string;
  customerId?: string;
  [key: string]: unknown;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const aiAgentService = {
  processIntent: async (_intent: any, _ctx: any): Promise<{ metadata?: Record<string, unknown> }> => ({}),
  parseIntent: async (_text: string, _ctx: any): Promise<{ confidence: number; intent: AgentIntent; entities: Array<{ type: string; value: string; confidence: number }> }> => ({
    confidence: 0.9,
    intent: AgentIntent.GET_HELP,
    entities: [],
  }),
};

export interface VoiceSession {
  id: string;
  storeId: string;
  customerId?: string;
  phoneNumber?: string;
  deviceId?: string;
  status: "active" | "paused" | "completed" | "error";
  language: string;
  currentIntent?: AgentIntent;
  cartItems: Array<{
    productId: string;
    variantId?: string;
    quantity: number;
    name: string;
    price: number;
  }>;
  orderId?: string;
  context: {
    lastQuery: string;
    lastResponse: string;
    browsingHistory: string[];
    preferences: Record<string, unknown>;
  };
  startedAt: Date;
  lastActivityAt: Date;
  endedAt?: Date;
}

export interface VoiceCommand {
  text: string;
  confidence: number;
  intent: AgentIntent;
  entities: Array<{
    type: string;
    value: string;
    confidence: number;
  }>;
  requiresConfirmation: boolean;
  suggestedAction: string;
}

export interface VoiceResponse {
  text: string;
  ssml?: string;
  actions: Array<{
    type: "speak" | "play_audio" | "redirect" | "add_to_cart" | "checkout" | "transfer";
    payload: Record<string, unknown>;
  }>;
  display?: {
    title?: string;
    items?: Array<{
      name: string;
      description: string;
      price: string;
      imageUrl?: string;
    }>;
    buttons?: Array<{
      label: string;
      action: string;
    }>;
  };
}

export class VoiceCommerceService {
  private readonly SUPPORTED_LANGUAGES = ["en", "en-NG", "yo", "ha", "ig"];
  private readonly SESSION_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes

  /**
   * Start a new voice commerce session
   */
  async startSession(
    storeId: string,
    data: {
      phoneNumber?: string;
      deviceId?: string;
      language?: string;
      customerId?: string;
    }
  ): Promise<VoiceSession> {
    const session = await db.voiceSession.create({
      data: {
        storeId,
        phoneNumber: data.phoneNumber,
        deviceId: data.deviceId,
        customerId: data.customerId,
        status: "active",
        language: data.language || "en-NG",
        cartItems: [],
        context: {
          lastQuery: "",
          lastResponse: "",
          browsingHistory: [],
          preferences: {},
        },
        startedAt: new Date(),
        lastActivityAt: new Date(),
      },
    });

    return this.mapSession(session);
  }

  /**
   * Process voice command and generate response
   */
  async processCommand(
    sessionId: string,
    audioData?: Buffer,
    transcribedText?: string
  ): Promise<VoiceResponse> {
    const session = await this.getSession(sessionId);
    if (!session) throw new Error("Session not found");

    // Update last activity
    await db.voiceSession.update({
      where: { id: sessionId },
      data: { lastActivityAt: new Date() },
    });

    // If audio provided, transcribe it
    let text = transcribedText;
    if (audioData && !text) {
      text = await this.transcribeAudio(audioData, session.language);
    }

    if (!text) {
      return this.buildErrorResponse("I didn't catch that. Could you please repeat?");
    }

    // Parse command using AI agent
    const command = await this.parseCommand(text, session);

    // Update session context
    session.context.lastQuery = text;

    // Execute intent
    const response = await this.executeIntent(command.intent, command.entities, session);

    // Update session
    session.context.lastResponse = response.text;
    session.context.browsingHistory.push(text);

    await db.voiceSession.update({
      where: { id: sessionId },
      data: {
        currentIntent: command.intent,
        context: session.context,
        cartItems: session.cartItems,
      },
    });

    return response;
  }

  /**
   * Handle text-based command (for testing or text-to-speech flows)
   */
  async processTextCommand(sessionId: string, text: string): Promise<VoiceResponse> {
    return this.processCommand(sessionId, undefined, text);
  }

  /**
   * Add item to voice cart
   */
  async addToCart(
    sessionId: string,
    productId: string,
    quantity: number,
    variantId?: string
  ): Promise<VoiceResponse> {
    const session = await this.getSession(sessionId);
    if (!session) throw new Error("Session not found");

    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: { variants: true } as Record<string, unknown>,
    });

    if (!product) {
      return this.buildResponse(
        "Sorry, I couldn't find that product. Would you like to search for something else?"
      );
    }

    let price = Number(product.price);
    let name = product.title;

    if (variantId) {
      const variant = product.variants.find((v: Record<string, unknown>) => String(v.id) === variantId);
      if (variant) {
        price = Number((variant as unknown as { price: number }).price);
        name = `${product.title} - ${(variant as { name: string }).name}`;
      }
    }

    const existingIndex = session.cartItems.findIndex(
      (item) => item.productId === productId && item.variantId === variantId
    );

    if (existingIndex >= 0) {
      session.cartItems[existingIndex].quantity += quantity;
    } else {
      session.cartItems.push({
        productId,
        variantId,
        quantity,
        name,
        price,
      });
    }

    await db.voiceSession.update({
      where: { id: sessionId },
      data: { cartItems: session.cartItems },
    });

    const totalItems = session.cartItems.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = session.cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

    return this.buildResponse(
      `Added ${quantity} ${name} to your cart. You now have ${totalItems} items totaling ₦${
        totalPrice / 100
      }. Would you like to continue shopping or proceed to checkout?`,
      {
        display: {
          title: "Cart Updated",
          items: session.cartItems.map((item) => ({
            name: item.name,
            description: `Quantity: ${item.quantity}`,
            price: `₦${item.price / 100}`,
          })),
          buttons: [
            { label: "Continue Shopping", action: "continue" },
            { label: "Checkout", action: "checkout" },
          ],
        },
      }
    );
  }

  /**
   * Remove item from voice cart
   */
  async removeFromCart(sessionId: string, productId: string, variantId?: string): Promise<VoiceResponse> {
    const session = await this.getSession(sessionId);
    if (!session) throw new Error("Session not found");

    const index = session.cartItems.findIndex(
      (item) => item.productId === productId && item.variantId === variantId
    );

    if (index >= 0) {
      const removed = session.cartItems.splice(index, 1)[0];
      await db.voiceSession.update({
        where: { id: sessionId },
        data: { cartItems: session.cartItems },
      });
      
      return this.buildResponse(`Removed ${removed.name} from your cart.`);
    }

    return this.buildResponse("I couldn't find that item in your cart.");
  }

  /**
   * Get cart summary
   */
  async getCartSummary(sessionId: string): Promise<VoiceResponse> {
    const session = await this.getSession(sessionId);
    if (!session) throw new Error("Session not found");

    if (session.cartItems.length === 0) {
      return this.buildResponse("Your cart is empty. What would you like to order?");
    }

    const totalItems = session.cartItems.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = session.cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const itemList = session.cartItems
      .map((item) => `${item.quantity} ${item.name} at ₦${item.price / 100} each`)
      .join(", ");

    return this.buildResponse(
      `You have ${totalItems} items in your cart: ${itemList}. Total is ₦${
        totalPrice / 100
      }. Would you like to checkout or add more items?`,
      {
        display: {
          title: "Your Cart",
          items: session.cartItems.map((item) => ({
            name: item.name,
            description: `Qty: ${item.quantity}`,
            price: `₦${(item.price * item.quantity) / 100}`,
          })),
          buttons: [
            { label: "Checkout", action: "checkout" },
            { label: "Continue", action: "continue" },
          ],
        },
      }
    );
  }

  /**
   * Process checkout from voice session
   */
  async checkout(sessionId: string, data: {
    paymentMethod: string;
    deliveryAddress?: {
      name: string;
      phone: string;
      address: string;
      city: string;
      state: string;
    };
  }): Promise<VoiceResponse> {
    const session = await this.getSession(sessionId);
    if (!session) throw new Error("Session not found");

    if (session.cartItems.length === 0) {
      return this.buildResponse("Your cart is empty. Please add items before checking out.");
    }

    // Get customer info
    const customer = session.customerId
      ? await prisma.customer.findUnique({ where: { id: session.customerId } })
      : null;

    // Create order
    const orderItems = session.cartItems.map((item) => ({
      productId: item.productId,
      variantId: item.variantId,
      quantity: item.quantity,
      price: item.price,
      name: item.name,
    }));

    const subtotal = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const order = await prisma.order.create({
      data: {
        storeId: session.storeId,
        customerId: session.customerId,
        items: orderItems as any,
        subtotal,
        total: subtotal,
        status: "PENDING" as any,
        paymentMethod: data.paymentMethod,
        paymentStatus: "PENDING" as any,
        source: "VOICE" as any,
        metadata: { voiceSessionId: sessionId } as any,
      } as any,
    });

    // Update session with order
    await db.voiceSession.update({
      where: { id: sessionId },
      data: { orderId: order.id },
    });

    // Generate payment instructions
    let paymentInstructions = "";
    if (data.paymentMethod === "pay_on_delivery") {
      paymentInstructions = "You will pay cash on delivery. ";
    } else if (data.paymentMethod === "transfer") {
      paymentInstructions = "Please complete payment via bank transfer. ";
    } else if (data.paymentMethod === "card") {
      paymentInstructions = "A payment link has been sent to your phone. ";
    }

    return this.buildResponse(
      `Order placed successfully! Your order number is ${order.orderNumber}. ${paymentInstructions}` +
        `Your items will be delivered to ${data.deliveryAddress?.address || "your default address"}. ` +
        `Is there anything else I can help you with?`,
      {
        display: {
          title: "Order Confirmed",
          items: [
            { name: "Order Number", description: String(order.orderNumber), price: "" },
            { name: "Total", description: "", price: `₦${subtotal / 100}` },
          ],
          buttons: [
            { label: "Track Order", action: `track:${order.id}` },
            { label: "New Order", action: "new_order" },
          ],
        },
      }
    );
  }

  /**
   * Search products by voice
   */
  async searchProducts(sessionId: string, query: string): Promise<VoiceResponse> {
    const session = await this.getSession(sessionId);
    if (!session) throw new Error("Session not found");

    // Use AI agent for semantic product search
    const searchResults = await aiAgentService.processIntent(
      {
        intent: AgentIntent.SEARCH_PRODUCTS,
        entities: [{ type: "query", value: query, confidence: 0.9 }],
        confidence: 0.9,
        rawText: query,
      },
      { storeId: session.storeId } as AgentContext
    );

    const products = searchResults.metadata?.products as Array<{
      id: string;
      name: string;
      price: number;
      description: string;
    }>;

    if (!products || products.length === 0) {
      return this.buildResponse(
        `I couldn't find any products matching "${query}". Would you like to try a different search?`
      );
    }

    const topProducts = products.slice(0, 3);
    const productList = topProducts
      .map((p, i) => `${i + 1}. ${p.name} at ₦${p.price / 100}`)
      .join(", ");

    return this.buildResponse(
      `I found ${products.length} products. Here are the top ${topProducts.length}: ${productList}. ` +
        `Which one would you like to add to your cart?`,
      {
        display: {
          title: `Search Results for "${query}"`,
          items: topProducts.map((p) => ({
            name: p.name,
            description: p.description.substring(0, 50) + "...",
            price: `₦${p.price / 100}`,
          })),
          buttons: topProducts.map((p) => ({
            label: `Add ${p.name}`,
            action: `add:${p.id}`,
          })),
        },
      }
    );
  }

  /**
   * End voice session
   */
  async endSession(sessionId: string): Promise<void> {
    await db.voiceSession.update({
      where: { id: sessionId },
      data: {
        status: "completed",
        endedAt: new Date(),
      },
    });
  }

  /**
   * Get active sessions
   */
  async getActiveSessions(storeId: string): Promise<VoiceSession[]> {
    const timeoutDate = new Date(Date.now() - this.SESSION_TIMEOUT_MS);

    const sessions = await db.voiceSession.findMany({
      where: {
        storeId,
        status: "active",
        lastActivityAt: { gte: timeoutDate },
      },
      orderBy: { lastActivityAt: "desc" },
    });

    return sessions.map((s: Record<string, unknown>) => this.mapSession(s));
  }

  // Private methods
  private async getSession(sessionId: string): Promise<VoiceSession | null> {
    const session = await db.voiceSession.findUnique({
      where: { id: sessionId },
    });

    return session ? this.mapSession(session) : null;
  }

  private async transcribeAudio(audioData: Buffer, language: string): Promise<string> {
    // In production, use Google Speech-to-Text, AWS Transcribe, or Azure Speech
    // For now, simulate transcription
    console.log(`[Voice] Transcribing audio in ${language}`);
    return "simulated transcription";
  }

  private async parseCommand(text: string, session: VoiceSession): Promise<VoiceCommand> {
    // Use AI agent to parse intent
    const parsed = await aiAgentService.parseIntent(text, {
      storeId: session.storeId,
      customerId: session.customerId,
    } as AgentContext);

    return {
      text,
      confidence: parsed.confidence,
      intent: parsed.intent,
      entities: parsed.entities,
      requiresConfirmation: this.requiresConfirmation(parsed.intent),
      suggestedAction: this.getSuggestedAction(parsed.intent),
    };
  }

  private async executeIntent(
    intent: AgentIntent,
    entities: Array<{ type: string; value: string }>,
    session: VoiceSession
  ): Promise<VoiceResponse> {
    switch (intent) {
      case AgentIntent.SEARCH_PRODUCTS: {
        const query = entities.find((e) => e.type === "query")?.value || "";
        return this.searchProducts(session.id, query);
      }

      case AgentIntent.ADD_TO_CART: {
        const productId = entities.find((e) => e.type === "product_id")?.value;
        const quantity = parseInt(entities.find((e) => e.type === "quantity")?.value || "1");
        if (productId) {
          return this.addToCart(session.id, productId, quantity);
        }
        return this.buildResponse("Which product would you like to add to your cart?");
      }

      case AgentIntent.VIEW_CART:
        return this.getCartSummary(session.id);

      case AgentIntent.REMOVE_FROM_CART: {
        const removeProductId = entities.find((e) => e.type === "product_id")?.value;
        if (removeProductId) {
          return this.removeFromCart(session.id, removeProductId);
        }
        return this.buildResponse("Which item would you like to remove?");
      }

      case AgentIntent.CHECKOUT:
        return this.buildResponse(
          "I'll help you complete your purchase. What payment method would you prefer: cash on delivery, bank transfer, or card payment?"
        );

      case AgentIntent.TRACK_ORDER: {
        const orderId = entities.find((e) => e.type === "order_id")?.value;
        if (orderId) {
          return this.trackOrder(orderId, session);
        }
        return this.buildResponse("Which order would you like to track?");
      }

      case AgentIntent.GET_HELP:
        return this.buildResponse(
          "I can help you search for products, add items to your cart, view your cart, and place orders. What would you like to do?"
        );

      default:
        return this.buildResponse(
          "I'm not sure I understood. You can say things like 'find rice', 'add to cart', 'what's in my cart', or 'checkout'."
        );
    }
  }

  private async trackOrder(orderId: string, session: VoiceSession): Promise<VoiceResponse> {
    const order = await prisma.order.findFirst({
      where: { id: orderId, storeId: session.storeId },
    });

    if (!order) {
      return this.buildResponse("I couldn't find that order. Please check the order number.");
    }

    const status = order.status;
    const tracking = null as { status: string; estimatedDelivery?: Date } | null;

    let statusMessage = `Your order ${order.orderNumber} is currently ${status}. `;
    if (tracking) {
      statusMessage += `Delivery status: ${tracking.status}. `;
      if (tracking.estimatedDelivery) {
        statusMessage += `Estimated delivery: ${new Date(tracking.estimatedDelivery).toDateString()}.`;
      }
    }

    return this.buildResponse(statusMessage);
  }

  private requiresConfirmation(intent: AgentIntent): boolean {
    const confirmingIntents = [AgentIntent.CHECKOUT, AgentIntent.REMOVE_FROM_CART];
    return confirmingIntents.includes(intent);
  }

  private getSuggestedAction(intent: AgentIntent): string {
    const actionMap: Record<string, string> = {
      [AgentIntent.SEARCH_PRODUCTS]: "search",
      [AgentIntent.ADD_TO_CART]: "add",
      [AgentIntent.VIEW_CART]: "cart",
      [AgentIntent.CHECKOUT]: "checkout",
      [AgentIntent.TRACK_ORDER]: "track",
    };
    return actionMap[intent] || "help";
  }

  private buildResponse(text: string, options?: { display?: VoiceResponse["display"] }): VoiceResponse {
    return {
      text,
      ssml: `<speak>${text}</speak>`,
      actions: [{ type: "speak", payload: { text } }],
      display: options?.display,
    };
  }

  private buildErrorResponse(text: string): VoiceResponse {
    return {
      text,
      ssml: `<speak>${text}</speak>`,
      actions: [{ type: "speak", payload: { text, error: true } }],
    };
  }

  private mapSession(data: Record<string, unknown>): VoiceSession {
    return {
      id: String(data.id),
      storeId: String(data.storeId),
      customerId: data.customerId ? String(data.customerId) : undefined,
      phoneNumber: data.phoneNumber ? String(data.phoneNumber) : undefined,
      deviceId: data.deviceId ? String(data.deviceId) : undefined,
      status: data.status as VoiceSession["status"],
      language: String(data.language),
      currentIntent: data.currentIntent as AgentIntent,
      cartItems: (data.cartItems as VoiceSession["cartItems"]) || [],
      orderId: data.orderId ? String(data.orderId) : undefined,
      context: data.context as VoiceSession["context"],
      startedAt: data.startedAt as Date,
      lastActivityAt: data.lastActivityAt as Date,
      endedAt: data.endedAt as Date,
    };
  }
}

// Export singleton instance
export const voiceCommerceService = new VoiceCommerceService();
