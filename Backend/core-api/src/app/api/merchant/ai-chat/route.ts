import { NextResponse } from "next/server";
import { prisma } from "@vayva/db";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { logger } from "@/lib/logger";
import { SalesAgent } from "@vayva/ai-agent";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

/**
 * POST /api/merchant/ai-chat
 * Allows merchants to chat with their AI Agent for business insights
 */
export const POST = withVayvaAPI(
  PERMISSIONS.SUPPORT_VIEW,
  async (req, { storeId, user, correlationId }) => {
    const merchantId = user.id;
    try {
      const body = (await req.json()) as {
        messages: ChatMessage[];
        conversationId?: string;
      };

      const { messages, conversationId } = body;

      if (!Array.isArray(messages) || messages.length === 0) {
        return NextResponse.json(
          { error: "Messages are required" },
          { status: 400 }
        );
      }

      // Get merchant context for better AI responses
      const store = await prisma.store.findUnique({
        where: { id: storeId },
      });

      if (!store) {
        return NextResponse.json({ error: "Store not found" }, { status: 404 });
      }

      // Enforce store-level AI settings: merchants can disable AI functions per store.
      const storeSettings = store.settings as Record<string, unknown> | null;
      const aiAgentSettings = (storeSettings?.aiAgent ??
        null) as Record<string, unknown> | null;
      const aiEnabled = Boolean(aiAgentSettings?.enabled);
      if (!aiEnabled) {
        return NextResponse.json(
          {
            error:
              "AI is disabled for this store. Enable it in Settings → AI Agent.",
            code: "AI_DISABLED",
          },
          { status: 403 },
        );
      }

      // Get recent products
      const products = await prisma.product.findMany({
        where: { storeId },
        take: 50,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          title: true,
          description: true,
          price: true,
          status: true,
        },
      });

      // Get recent analytics data
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const [recentOrders, customerCount, deliverySettings, shipmentStats] =
        await Promise.all([
        prisma.order.findMany({
          where: {
            storeId,
            createdAt: { gte: thirtyDaysAgo },
            status: { not: "CANCELLED" },
          },
          take: 100,
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            total: true,
            status: true,
            createdAt: true,
            items: {
              select: {
                productId: true,
                quantity: true,
                price: true,
              },
            },
          },
        }),
        prisma.customer.count({
          where: { storeId },
        }),
        prisma.storeDeliverySettings.findUnique({
          where: { storeId },
        }),
        prisma.shipment.groupBy({
          by: ["status", "provider"],
          where: { storeId },
          _count: { _all: true },
        }),
      ]);

      // Calculate top products from orders
      const productSales: Record<string, { name: string; quantity: number }> =
        {};
      recentOrders.forEach((order) => {
        order.items.forEach((item) => {
          const product = products.find((p) => p.id === item.productId);
          if (product) {
            if (!productSales[product.id]) {
              productSales[product.id] = { name: product.title, quantity: 0 };
            }
            productSales[product.id].quantity += item.quantity;
          }
        });
      });

      const topProducts = Object.entries(productSales)
        .sort((a, b) => b[1].quantity - a[1].quantity)
        .slice(0, 10)
        .map(([, data]) => data);

      // Calculate business metrics
      const totalRevenue = recentOrders.reduce(
        (sum, order) => sum + Number(order.total),
        0
      );
      const orderCount = recentOrders.length;
      const avgOrderValue = orderCount > 0 ? totalRevenue / orderCount : 0;

      // Enrich the system message with merchant context
      const knowledgeBase = (aiAgentSettings?.knowledgeBase as string) || "";

      const codDefaults = (() => {
        const dp =
          storeSettings?.deliveryPolicy &&
          typeof storeSettings.deliveryPolicy === "object"
            ? (storeSettings.deliveryPolicy as Record<string, unknown>)
            : {};
        return {
          codEnabledByDefault: Boolean(dp.codEnabledByDefault),
          codIncludesDeliveryByDefault: Boolean(dp.codIncludesDeliveryByDefault),
          deliveryFeePayerDefault:
            dp.deliveryFeePayerDefault === "MERCHANT" ? "MERCHANT" : "CUSTOMER",
        };
      })();

      const shipmentSummary = shipmentStats
        .slice(0, 20)
        .map((row) => {
          const status = (row as any).status;
          const provider = (row as any).provider;
          const count = (row as any)._count?._all ?? 0;
          return `- ${provider}/${status}: ${count}`;
        })
        .join("\n");

      const enrichedContext = `
## Your Merchant Context (INTERNAL - Not shared with customers)

**Store Name:** ${store.name}
**Business Type:** ${store.businessType || "Not specified"}

**Current Product Catalog (${products.length} products):**
${products.slice(0, 20).map((p) => `- ${p.title}: ₦${p.price} (${p.status})`).join("\n")}

**Recent Performance (Last 30 Days):**
- Total Orders: ${orderCount}
- Revenue: ₦${totalRevenue.toFixed(2)}
- Average Order Value: ₦${avgOrderValue.toFixed(2)}
- Total Customers: ${customerCount}

**Top Selling Products:**
${topProducts.map((p) => `- ${p.name}: ${p.quantity} sold`).join("\n")}

**Your Knowledge Base:**
${knowledgeBase}

**Delivery & Logistics (Operational):**
- deliveryEnabled: ${Boolean(deliverySettings?.isEnabled)}
- provider: ${deliverySettings?.provider || "CUSTOM"}
- pickup: ${[
        deliverySettings?.pickupAddressLine1,
        deliverySettings?.pickupCity,
        deliverySettings?.pickupState,
      ]
        .filter(Boolean)
        .join(", ") || "not set"}
- COD default enabled: ${codDefaults.codEnabledByDefault}
- COD includes delivery by default: ${codDefaults.codIncludesDeliveryByDefault}
- Delivery fee payer default: ${codDefaults.deliveryFeePayerDefault}

**Shipment Health (All time, grouped):**
${shipmentSummary || "No shipments yet"}

**AI Configuration:**
- Tone: ${aiAgentSettings?.tone || "PROFESSIONAL"}
- Agent Name: ${aiAgentSettings?.agentName || "Vayva Assistant"}
- Persuasion Level: ${aiAgentSettings?.persuasionLevel || 1}/3

## Your Role
You are an AI business advisor for this merchant. You have access to their store data, products, and performance metrics. Help them with:
- Business strategy and pricing decisions
- Product recommendations and inventory gaps
- Customer behavior insights
- Marketing suggestions
- Answering questions about their store performance

Be direct, data-driven, and actionable. Cite specific numbers when relevant.
`;

      // Prepend system context to messages
      const enrichedMessages = [
        { role: "system", content: enrichedContext },
        ...messages,
      ];

      // Call SalesAgent with merchant context
      const response = await SalesAgent.handleMessage(
        storeId,
        enrichedMessages.map((m) => ({
          role: m.role as "user" | "assistant" | "system",
          content: m.content,
        })),
        { conversationId: conversationId || `merchant-chat-${Date.now()}` }
      );

      logger.info("[MERCHANT_AI_CHAT]", {
        storeId,
        merchantId,
        conversationId,
        hasResponse: !!response?.message,
        messageCount: messages.length,
      });

      return NextResponse.json({
        message: response?.message || "I'm not sure how to help with that.",
        conversationId: conversationId || `merchant-chat-${Date.now()}`,
        metadata: {
          productsCount: products.length,
          recentOrders: orderCount,
          contextUsed: true,
        },
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error("[MERCHANT_AI_CHAT_ERROR]", error, {
        storeId,
        correlationId,
      });

      return NextResponse.json(
        { error: "Failed to process chat", details: errorMessage },
        { status: 500 }
      );
    }
  }
);
