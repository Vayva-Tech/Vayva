import { Worker, Queue } from "bullmq";
import { prisma } from "@vayva/db";
import { QUEUES, logger } from "@vayva/shared";
import { AIProvider, AIMessage } from "../lib/ai";
import type { RedisConnection, AgentActionsJobData } from "../types";

// Helper to format currency
const formatMoney = (amount: number) => `₦${amount.toLocaleString()}`;

function formatWhatsAppText(raw: string): string {
  const cleaned = String(raw || "")
    .replace(/\r\n/g, "\n")
    .replace(/[\u2022]/g, "")
    .replace(/\*/g, "")
    .split("\n")
    .map((line) => line.replace(/^\s*[-•]+\s*/g, "").trim())
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  return cleaned;
}

function safeJson<T>(value: string): T | null {
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

function safeString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function safeNumber(value: unknown, fallback: number): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const n = Number(value);
    if (Number.isFinite(n)) return n;
  }
  return fallback;
}

function summarizeBusinessHours(value: unknown): string {
  if (!value) return "unknown";
  if (typeof value === "string") return value.slice(0, 160);
  try {
    const s = JSON.stringify(value);
    return s.length > 160 ? `${s.slice(0, 160)}...` : s;
  } catch {
    return "unknown";
  }
}

function summarizeDeliverySettings(value: unknown): string {
  if (!value || typeof value !== "object") return "unknown";
  const v = value as Record<string, unknown>;
  const provider = typeof v.provider === "string" ? v.provider : "unknown";
  const isEnabled = typeof v.isEnabled === "boolean" ? v.isEnabled : undefined;
  const autoDispatchEnabled =
    typeof v.autoDispatchEnabled === "boolean" ? v.autoDispatchEnabled : undefined;

  const parts: string[] = [];
  parts.push(`provider ${provider}`);
  if (typeof isEnabled === "boolean") parts.push(isEnabled ? "enabled" : "disabled");
  if (typeof autoDispatchEnabled === "boolean") {
    parts.push(autoDispatchEnabled ? "auto dispatch on" : "auto dispatch off");
  }
  return parts.join(", ");
}

function parseHHMM(value: unknown): { h: number; m: number } | null {
  if (typeof value !== "string") return null;
  const match = value.trim().match(/^([01]?\d|2[0-3]):([0-5]\d)$/);
  if (!match) return null;
  const h = Number(match[1]);
  const m = Number(match[2]);
  if (!Number.isFinite(h) || !Number.isFinite(m)) return null;
  return { h, m };
}

function getLagosParts(now: Date): { day: number; hour: number; minute: number } {
  const dtf = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Africa/Lagos",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  const parts = dtf.formatToParts(now);
  const weekday = parts.find((p) => p.type === "weekday")?.value || "Mon";
  const hourStr = parts.find((p) => p.type === "hour")?.value || "00";
  const minuteStr = parts.find((p) => p.type === "minute")?.value || "00";

  const dayMap: Record<string, number> = {
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
    Sun: 0,
  };

  return {
    day: dayMap[weekday] ?? 1,
    hour: Number(hourStr) || 0,
    minute: Number(minuteStr) || 0,
  };
}

function isOutsideBusinessHours(
  businessHours: unknown,
  now: Date = new Date(),
): boolean | null {
  if (!businessHours || typeof businessHours !== "object") return null;

  const { day, hour, minute } = getLagosParts(now);
  const minutesNow = hour * 60 + minute;

  const bh = businessHours as Record<string, unknown>;
  const windowsRaw = bh.windows;

  // Shape A: { windows: [{ day: 0-6, start: "09:00", end: "18:00" }, ...] }
  if (Array.isArray(windowsRaw)) {
    const todays = windowsRaw
      .filter((w) => w && typeof w === "object")
      .map((w) => w as Record<string, unknown>)
      .filter((w) => typeof w.day === "number" && w.day === day);

    if (todays.length === 0) return true;

    for (const w of todays) {
      const start = parseHHMM(w.start);
      const end = parseHHMM(w.end);
      if (!start || !end) continue;
      const startMin = start.h * 60 + start.m;
      const endMin = end.h * 60 + end.m;
      if (minutesNow >= startMin && minutesNow <= endMin) return false;
    }

    return true;
  }

  // Shape B: { weekly: { mon: { start: "09:00", end: "18:00" }, ... } }
  const weeklyRaw = bh.weekly;
  if (weeklyRaw && typeof weeklyRaw === "object") {
    const weekly = weeklyRaw as Record<string, unknown>;
    const dayKeyMap: Record<number, string> = {
      0: "sun",
      1: "mon",
      2: "tue",
      3: "wed",
      4: "thu",
      5: "fri",
      6: "sat",
    };
    const key = dayKeyMap[day];
    const dayVal = weekly[key];
    if (!dayVal || typeof dayVal !== "object") return true;
    const dv = dayVal as Record<string, unknown>;
    const start = parseHHMM(dv.start);
    const end = parseHHMM(dv.end);
    if (!start || !end) return null;
    const startMin = start.h * 60 + start.m;
    const endMin = end.h * 60 + end.m;
    return !(minutesNow >= startMin && minutesNow <= endMin);
  }

  return null;
}

export function registerAgentActionsWorker(connection: RedisConnection): void {
  const whatsappOutboundQueue = new Queue(QUEUES.WHATSAPP_OUTBOUND, {
    connection,
  });

  new Worker<AgentActionsJobData>(
    QUEUES.AGENT_ACTIONS,
    async (job) => {
      const { messageId, storeId } = job.data;

      // 1. Fetch Context
      const message = await prisma.message.findUnique({
        where: { id: messageId },
        include: {
          conversation: {
            include: { contact: true },
          },
        },
      });

      if (!message || !message.textBody) return;

      const store = await prisma.store.findUnique({
        where: { id: storeId },
        include: { deliverySettings: true, agent: true },
      });

      if (!store) return;

      const shouldAutoReplyOutsideHours =
        Boolean(store.agent?.autoReplyOutsideHours) &&
        typeof store.agent?.outsideHoursMessage === "string" &&
        store.agent.outsideHoursMessage.trim().length > 0;

      if (shouldAutoReplyOutsideHours) {
        const outside = isOutsideBusinessHours(store.agent?.businessHours);
        if (outside === true) {
          await whatsappOutboundQueue.add("send", {
            to: message.conversation.contact.phoneE164,
            body: formatWhatsAppText(store.agent!.outsideHoursMessage!),
            storeId,
            messageId: message.id,
            instanceName: `merchant_${storeId}`,
          });
          return;
        }
      }

      const conversationId = message.conversationId;
      const history = await prisma.message.findMany({
        where: { storeId, conversationId },
        orderBy: { createdAt: "desc" },
        take: 12,
      });

      const messages: AIMessage[] = history
        .reverse()
        .map((m) => ({
          role: m.direction === "INBOUND" ? "user" : "assistant",
          content: m.textBody || "",
        }));

      // 3. Define Tools
      const tools: unknown[] = [
        {
          type: "function",
          function: {
            name: "search_products",
            description: "Search for products in the store catalog",
            parameters: {
              type: "object",
              properties: {
                query: {
                  type: "string",
                  description: "The search term (e.g., 'red shoes')",
                },
              },
              required: ["query"],
            },
          },
        },
        {
          type: "function",
          function: {
            name: "get_recent_orders",
            description:
              "Get the customer's most recent orders for this store. Use when the user asks about an order but did not provide an order number or reference.",
            parameters: {
              type: "object",
              properties: {
                limit: {
                  type: "number",
                  description: "How many orders to return (default 3)",
                },
              },
            },
          },
        },
        {
          type: "function",
          function: {
            name: "get_order_by_ref",
            description:
              "Look up an order using an order reference or order number provided by the customer.",
            parameters: {
              type: "object",
              properties: {
                ref: {
                  type: "string",
                  description:
                    "Order reference or order number (e.g. refCode or orderNumber)",
                },
              },
              required: ["ref"],
            },
          },
        },
        {
          type: "function",
          function: {
            name: "get_order_payment_and_delivery",
            description:
              "Get payment and delivery status for a specific order id.",
            parameters: {
              type: "object",
              properties: {
                orderId: { type: "string", description: "The order id" },
              },
              required: ["orderId"],
            },
          },
        },
        {
          type: "function",
          function: {
            name: "get_tracking_info",
            description:
              "Get delivery tracking info by tracking code OR order reference/number. Use when the customer asks 'track my order' or 'where is my rider'.",
            parameters: {
              type: "object",
              properties: {
                trackingCode: { type: "string" },
                orderRef: { type: "string" },
              },
            },
          },
        },
        {
          type: "function",
          function: {
            name: "add_to_cart",
            description:
              "Add a product to the customer's cart. If the product has options/variants, use the most common one unless specified.",
            parameters: {
              type: "object",
              properties: {
                productId: {
                  type: "string",
                  description: "The ID of the product",
                },
                quantity: {
                  type: "number",
                  description: "Quantity to add (default 1)",
                },
              },
              required: ["productId"],
            },
          },
        },
        {
          type: "function",
          function: {
            name: "view_cart",
            description: "View items in the customer's cart",
            parameters: {
              type: "object",
              properties: {},
            },
          },
        },
      ];

      // 4. Execution Loop (Max 4 turns)
      let finalResponse = "";
      let turns = 0;

      while (turns < 4) {
        turns++;

        const aiResponse = await AIProvider.chatWithTools(messages, tools, {
          storeName: store.name,
          customerName: message.conversation.contact.displayName || "Customer",
          storeCategory: store.category,
          industrySlug: store.industrySlug,
          deliverySummary: summarizeDeliverySettings(store.deliverySettings),
          businessHoursSummary: summarizeBusinessHours(store.agent?.businessHours),
          outsideHoursMessage:
            typeof store.agent?.outsideHoursMessage === "string"
              ? store.agent.outsideHoursMessage
              : "",
        });

        // Helper to add assistant message
        if (aiResponse.content) {
          messages.push({ role: "assistant", content: aiResponse.content });
          finalResponse = aiResponse.content;
        }

        // If no tool calls, we are done
        if (!aiResponse.toolCalls || aiResponse.toolCalls.length === 0) {
          break;
        }

        // Execute Tools
        for (const toolCall of aiResponse.toolCalls) {
          const functionName = toolCall.function.name;
          const args =
            safeJson<Record<string, unknown>>(toolCall.function.arguments) || {};
          let toolResult = "";
          const phone = message.conversation.contact.phoneE164;

          try {
            if (functionName === "search_products") {
              const query = safeString(args.query).trim();
              if (!query) {
                toolResult = JSON.stringify([]);
              } else {
                const products = await prisma.product.findMany({
                  where: {
                    storeId,
                    status: "ACTIVE",
                    OR: [
                      { title: { contains: query, mode: "insensitive" } },
                      {
                        description: {
                          contains: query,
                          mode: "insensitive",
                        },
                      },
                    ],
                  },
                  take: 5,
                  select: {
                    id: true,
                    title: true,
                    price: true,
                    trackInventory: true,
                    inventoryItems: { select: { available: true } },
                  },
                });

                toolResult = JSON.stringify(
                  products.map((p) => {
                    const totalStock = p.trackInventory
                      ? p.inventoryItems.reduce(
                          (sum: number, item: { available: number }) =>
                            sum + item.available,
                          0,
                        )
                      : 999;
                    return {
                      id: p.id,
                      name: p.title,
                      price: formatMoney(Number(p.price)),
                      stock: totalStock > 0 ? "In Stock" : "Out of Stock",
                    };
                  }),
                );
              }
            } else if (functionName === "get_recent_orders") {
              const limit =
                typeof args.limit === "number" && args.limit > 0
                  ? Math.min(args.limit, 5)
                  : 3;
              const customerPhone = message.conversation.contact.phoneE164;

              const orders = await prisma.order.findMany({
                where: {
                  storeId,
                  OR: [
                    { customerPhone: customerPhone },
                    {
                      customer: {
                        is: {
                          phone: customerPhone,
                        },
                      },
                    },
                  ],
                },
                orderBy: { createdAt: "desc" },
                take: limit,
                select: {
                  id: true,
                  refCode: true,
                  orderNumber: true,
                  status: true,
                  paymentStatus: true,
                  total: true,
                  createdAt: true,
                },
              });

              toolResult = JSON.stringify(
                orders.map((o) => ({
                  id: o.id,
                  ref: o.refCode || String(o.orderNumber),
                  status: o.status,
                  paymentStatus: o.paymentStatus,
                  total: formatMoney(Number(o.total)),
                  createdAt: o.createdAt.toISOString(),
                })),
              );
            } else if (functionName === "get_order_by_ref") {
              const ref = String(args.ref || "").trim();
              if (!ref) {
                toolResult = JSON.stringify({ found: false });
              } else {
                const maybeNumber = Number(ref);
                const order = await prisma.order.findFirst({
                  where: {
                    storeId,
                    OR: [
                      { refCode: ref },
                      ...(Number.isFinite(maybeNumber)
                        ? [{ orderNumber: maybeNumber }]
                        : []),
                    ],
                  },
                  select: {
                    id: true,
                    refCode: true,
                    orderNumber: true,
                    status: true,
                    paymentStatus: true,
                    fulfillmentStatus: true,
                    total: true,
                    createdAt: true,
                  },
                });

                toolResult = JSON.stringify(
                  order
                    ? {
                        found: true,
                        id: order.id,
                        ref: order.refCode || String(order.orderNumber),
                        status: order.status,
                        paymentStatus: order.paymentStatus,
                        fulfillmentStatus: order.fulfillmentStatus,
                        total: formatMoney(Number(order.total)),
                        createdAt: order.createdAt.toISOString(),
                      }
                    : { found: false },
                );
              }
            } else if (functionName === "get_order_payment_and_delivery") {
              const orderId = String(args.orderId || "").trim();
              if (!orderId) {
                toolResult = JSON.stringify({ found: false });
              } else {
                const order = await prisma.order.findFirst({
                  where: { id: orderId, storeId },
                  select: {
                    id: true,
                    status: true,
                    paymentStatus: true,
                    fulfillmentStatus: true,
                    refCode: true,
                    orderNumber: true,
                  },
                });
                const shipment = await prisma.shipment.findFirst({
                  where: { orderId, storeId },
                  select: {
                    status: true,
                    trackingUrl: true,
                    provider: true,
                    courierName: true,
                    courierPhone: true,
                  },
                });

                toolResult = JSON.stringify({
                  found: Boolean(order),
                  order: order
                    ? {
                        id: order.id,
                        ref: order.refCode || String(order.orderNumber),
                        status: order.status,
                        paymentStatus: order.paymentStatus,
                        fulfillmentStatus: order.fulfillmentStatus,
                      }
                    : null,
                  delivery: shipment
                    ? {
                        status: shipment.status,
                        trackingUrl: shipment.trackingUrl,
                        provider: shipment.provider,
                        courierName: shipment.courierName,
                        courierPhone: shipment.courierPhone,
                      }
                    : null,
                });
              }
            } else if (functionName === "get_tracking_info") {
              const trackingCode = safeString(args.trackingCode).trim();
              const orderRef = safeString(args.orderRef).trim();
              const ref = trackingCode || orderRef;

              if (!ref) {
                toolResult = JSON.stringify({ ok: false, error: "IDENTIFIER_REQUIRED" });
              } else {
                const maybeNumber = Number(ref);
                const shipment = await prisma.shipment.findFirst({
                  where: {
                    storeId,
                    OR: [
                      ...(trackingCode ? [{ trackingCode }] : []),
                      ...(orderRef
                        ? [
                            {
                              order: {
                                is: {
                                  OR: [
                                    { refCode: orderRef },
                                    ...(Number.isFinite(maybeNumber)
                                      ? [{ orderNumber: maybeNumber }]
                                      : []),
                                  ],
                                },
                              },
                            },
                          ]
                        : []),
                    ],
                  },
                  include: {
                    store: { select: { slug: true, settings: true } },
                    order: {
                      select: {
                        refCode: true,
                        orderNumber: true,
                        total: true,
                        shippingTotal: true,
                        paymentStatus: true,
                        createdAt: true,
                      },
                    },
                    trackingEvents: {
                      orderBy: { createdAt: "desc" },
                      take: 10,
                      select: {
                        status: true,
                        locationText: true,
                        description: true,
                        occurredAt: true,
                      },
                    },
                  },
                  orderBy: { updatedAt: "desc" },
                });

                if (!shipment) {
                  toolResult = JSON.stringify({ ok: false, error: "NOT_FOUND" });
                } else {
                  // Parse COD meta from notes when present (best-effort)
                  let cod: unknown = null;
                  let notesMeta: Record<string, unknown> = {};
                  if (shipment.notes) {
                    try {
                      notesMeta = JSON.parse(shipment.notes) as Record<string, unknown>;
                      if ("cod" in notesMeta) cod = notesMeta.cod;
                    } catch {
                      // ignore
                    }
                  }

                  const storeSettings =
                    shipment.store?.settings && typeof shipment.store.settings === "object"
                      ? (shipment.store.settings as Record<string, unknown>)
                      : {};
                  const customDomain =
                    typeof storeSettings.customDomain === "string"
                      ? storeSettings.customDomain
                      : "";
                  const root = process.env.STOREFRONT_ROOT_DOMAIN || "vayva.ng";
                  const storeSlug = shipment.store?.slug || "";
                  const base =
                    customDomain
                      ? (customDomain.startsWith("http") ? customDomain : `https://${customDomain}`)
                      : (storeSlug ? `https://${storeSlug}.${root}` : "");

                  const merchantTrackingUrl =
                    shipment.trackingCode && base
                      ? `${base}/order/track?code=${encodeURIComponent(shipment.trackingCode)}`
                      : null;

                  toolResult = JSON.stringify({
                    ok: true,
                    tracking: {
                      code: shipment.trackingCode,
                      provider: shipment.provider,
                      status: shipment.status,
                      merchantTrackingUrl,
                      externalTrackingUrl: shipment.trackingUrl || null,
                      payment: { cod },
                      order: shipment.order
                        ? {
                            refCode: shipment.order.refCode,
                            orderNumber: shipment.order.orderNumber,
                            total: Number(shipment.order.total),
                            shippingTotal: Number(shipment.order.shippingTotal),
                            paymentStatus: shipment.order.paymentStatus,
                            createdAt: shipment.order.createdAt.toISOString(),
                          }
                        : null,
                      timeline: (shipment.trackingEvents || []).map((e) => ({
                        status: e.status,
                        note: e.description,
                        location: e.locationText,
                        timestamp: e.occurredAt.toISOString(),
                      })),
                    },
                  });
                }
              }
            } else if (functionName === "add_to_cart") {
              if (!phone) throw new Error("Customer phone number not found.");

              const productId = safeString(args.productId).trim();
              if (!productId) {
                toolResult = "Product not found or unavailable.";
              } else {

                // 1. Find or Create Cart
                let cart = await prisma.cart.findFirst({
                  where: { phone, checkoutUrl: null },
                });

                if (!cart) {
                  cart = await prisma.cart.create({
                    data: { phone },
                  });
                }

                const product = await prisma.product.findUnique({
                  where: { id: productId },
                  select: { id: true, title: true, price: true },
                });

                const variant = await prisma.productVariant.findFirst({
                  where: { productId },
                  orderBy: { position: "asc" },
                  select: { id: true, price: true },
                });

                if (!product || !variant) {
                  toolResult = "Product not found or unavailable.";
                } else {
                  const qty = Math.max(1, safeNumber(args.quantity, 1));

                  await prisma.cartItem.upsert({
                    where: {
                      cartId_variantId: {
                        cartId: cart.id,
                        variantId: variant.id,
                      },
                    },
                    update: {
                      quantity: { increment: qty },
                    },
                    create: {
                      cartId: cart.id,
                      variantId: variant.id,
                      quantity: qty,
                    },
                  });

                  toolResult = `Added ${qty} x ${product.title} to cart.`;
                }
              }
            } else if (functionName === "view_cart") {
              if (!phone) {
                toolResult = "No cart found (no phone number).";
              } else {
                const cart = await prisma.cart.findFirst({
                  where: { phone, checkoutUrl: null },
                  include: {
                    items: {
                      include: {
                        variant: {
                          include: { product: true },
                        },
                      },
                    },
                  },
                });

                if (!cart || cart.items.length === 0) {
                  toolResult = "Cart is empty.";
                } else {
                  const items = cart.items
                    .map(
                      (item) =>
                        `${item.quantity} x ${item.variant.product.title} (${formatMoney(Number(item.variant.price || item.variant.product.price))})`,
                    )
                    .join(", ");
                  // Calculate total roughly for display
                  const total = cart.items.reduce(
                    (sum, item) =>
                      sum +
                      Number(item.variant.price || item.variant.product.price) *
                        item.quantity,
                    0,
                  );

                  toolResult = `Cart (${formatMoney(total)}):\n${items}`;
                }
              }
            } else {
              toolResult = "Unknown tool";
            }
          } catch (err: unknown) {
            const errMsg = err instanceof Error ? err.message : String(err);
            toolResult = `Error executing tool: ${errMsg}`;
            logger.error("Tool Execution Error", {
              error: errMsg,
              tool: functionName,
            });
          }

          // Append Tool Output
          messages.push({
            role: "tool",
            content: toolResult,
            tool_call_id: toolCall.id,
            name: functionName,
          });
        }
        // Loop again to let AI interpret the tool results
      }

      // 5. Send Final Response
      if (finalResponse) {
        const formatted = formatWhatsAppText(finalResponse);
        await whatsappOutboundQueue.add("send", {
          to: message.conversation.contact.phoneE164,
          body: formatted,
          storeId,
          messageId: message.id,
          instanceName: `merchant_${storeId}`,
        });
      }
    },
    { connection },
  );

  logger.info("Registered agent actions worker", {
    queue: QUEUES.AGENT_ACTIONS,
    app: "worker",
  });
}
