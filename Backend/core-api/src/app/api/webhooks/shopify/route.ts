import { NextRequest } from "next/server";
import { prisma } from "@vayva/db";
import { verifyShopifySignature } from "@/lib/webhooks/signature";
import { WebhookSignatureError, WebhookEventError } from "@/lib/webhooks/errors";

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const hmacHeader = request.headers.get("X-Shopify-Hmac-Sha256");
    const topic = request.headers.get("X-Shopify-Topic");
    const shopDomain = request.headers.get("X-Shopify-Shop-Domain");
    
    if (!process.env.SHOPIFY_WEBHOOK_SECRET) {
      console.error("[SHOPIFY] Missing webhook secret");
      return new Response(
        JSON.stringify({ error: "Webhook secret not configured" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    // Verify signature
    try {
      verifyShopifySignature(
        body,
        hmacHeader,
        process.env.SHOPIFY_WEBHOOK_SECRET
      );
    } catch (error) {
      if (error instanceof WebhookSignatureError) {
        console.error("[SHOPIFY WEBHOOK] Signature verification failed:", error.message);
        return new Response(
          JSON.stringify({ error: "Invalid signature" }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }
      throw error;
    }

    const payload = JSON.parse(body);
    console.warn(`[SHOPIFY] Received topic: ${topic} from ${shopDomain}`);

    // Handle different topics
    switch (topic) {
      case "orders/create":
        await handleOrderCreated(payload);
        break;
        
      case "orders/updated":
        await handleOrderUpdated(payload);
        break;
        
      case "orders/cancelled":
        await handleOrderCancelled(payload);
        break;
        
      case "orders/delete":
        await handleOrderDeleted(payload);
        break;
        
      case "products/create":
        await handleProductCreated(payload);
        break;
        
      case "products/update":
        await handleProductUpdated(payload);
        break;
        
      case "products/delete":
        await handleProductDeleted(payload);
        break;
        
      case "customers/create":
        await handleCustomerCreated(payload);
        break;
        
      case "customers/update":
        await handleCustomerUpdated(payload);
        break;
        
      case "fulfillments/create":
        await handleFulfillmentCreated(payload);
        break;
        
      default:
        console.warn(`[SHOPIFY] Unhandled topic: ${topic}`);
    }

    return new Response(
      JSON.stringify({ received: true }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("[SHOPIFY WEBHOOK] Error processing webhook:", error);
    return new Response(
      JSON.stringify({ 
        error: "Webhook handler failed",
        message: error instanceof Error ? error.message : "Unknown error"
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

// Order Handlers
async function handleOrderCreated(order: any) {
  const merchantId = order.merchant_id?.toString() || order.tags?.find((tag: string) => 
    tag.startsWith("merchant_id:")
  )?.split(":")[1];

  if (!merchantId) {
    console.warn("[SHOPIFY] No merchant ID found in order", { orderId: order.id });
    return;
  }

  try {
    // Sync order to Vayva database
    await prisma.order.upsert({
      where: { externalId: `shopify_${order.id}` },
      create: {
        externalId: `shopify_${order.id}`,
        merchantId,
        customerId: order.customer?.id?.toString(),
        total: parseFloat(order.total_price),
        subtotal: parseFloat(order.subtotal_price || "0"),
        tax: parseFloat(order.total_tax || "0"),
        shipping: parseFloat(order.shipping_lines?.[0]?.price || "0"),
        status: mapShopifyOrderStatus(order.financial_status),
        paymentStatus: mapShopifyPaymentStatus(order.financial_status),
        fulfillmentStatus: mapShopifyFulfillmentStatus(order.fulfillment_status),
        currency: order.currency,
        note: order.note,
        tags: order.tags || [],
        items: {
          create: order.line_items?.map((item: any) => ({
            productId: item.product_id?.toString(),
            variantId: item.variant_id?.toString(),
            name: item.name,
            quantity: item.quantity,
            price: parseFloat(item.price),
            sku: item.sku,
            vendor: item.vendor,
          })) || [],
        },
        billingAddress: order.billing_address ? {
          create: {
            firstName: order.billing_address.first_name,
            lastName: order.billing_address.last_name,
            company: order.billing_address.company,
            address1: order.billing_address.address1,
            address2: order.billing_address.address2,
            city: order.billing_address.city,
            province: order.billing_address.province,
            country: order.billing_address.country,
            zip: order.billing_address.zip,
            phone: order.billing_address.phone,
          },
        } : undefined,
        shippingAddress: order.shipping_address ? {
          create: {
            firstName: order.shipping_address.first_name,
            lastName: order.shipping_address.last_name,
            company: order.shipping_address.company,
            address1: order.shipping_address.address1,
            address2: order.shipping_address.address2,
            city: order.shipping_address.city,
            province: order.shipping_address.province,
            country: order.shipping_address.country,
            zip: order.shipping_address.zip,
            phone: order.shipping_address.phone,
          },
        } : undefined,
        metadata: {
          shopifyOrderId: order.id,
          shopifyOrderNumber: order.order_number,
          shopDomain: order.shop_domain,
          gateway: order.gateway,
          landingSite: order.landing_site,
        },
        createdAt: new Date(order.created_at),
        updatedAt: new Date(order.updated_at),
      },
      update: {
        total: parseFloat(order.total_price),
        status: mapShopifyOrderStatus(order.financial_status),
        paymentStatus: mapShopifyPaymentStatus(order.financial_status),
        fulfillmentStatus: mapShopifyFulfillmentStatus(order.fulfillment_status),
        updatedAt: new Date(order.updated_at),
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        app: "merchant",
        action: "ORDER_CREATED",
        targetType: "Order",
        targetId: `shopify_${order.id}`,
        targetStoreId: merchantId,
        metadata: {
          shopifyOrderId: order.id,
          orderNumber: order.order_number,
          total: parseFloat(order.total_price),
          currency: order.currency,
          financialStatus: order.financial_status,
        },
      },
    });

    console.warn(`[SHOPIFY] Order synced: ${order.id} for merchant ${merchantId}`);
  } catch (error) {
    console.error("[SHOPIFY] Error syncing order:", error);
    throw new WebhookEventError(
      "Failed to sync order",
      order.id,
      "orders/create"
    );
  }
}

async function handleOrderUpdated(order: any) {
  const merchantId = order.merchant_id?.toString() || order.tags?.find((tag: string) => 
    tag.startsWith("merchant_id:")
  )?.split(":")[1];

  if (!merchantId) return;

  try {
    await prisma.order.update({
      where: { externalId: `shopify_${order.id}` },
      data: {
        total: parseFloat(order.total_price),
        status: mapShopifyOrderStatus(order.financial_status),
        paymentStatus: mapShopifyPaymentStatus(order.financial_status),
        fulfillmentStatus: mapShopifyFulfillmentStatus(order.fulfillment_status),
        updatedAt: new Date(order.updated_at),
      },
    });

    console.warn(`[SHOPIFY] Order updated: ${order.id}`);
  } catch (error) {
    console.error("[SHOPIFY] Error updating order:", error);
  }
}

async function handleOrderCancelled(order: any) {
  const merchantId = order.merchant_id?.toString() || order.tags?.find((tag: string) => 
    tag.startsWith("merchant_id:")
  )?.split(":")[1];

  if (!merchantId) return;

  try {
    await prisma.order.update({
      where: { externalId: `shopify_${order.id}` },
      data: {
        status: "cancelled",
        cancelledAt: new Date(order.cancelled_at),
        cancelReason: order.cancel_reason,
        updatedAt: new Date(order.updated_at),
      },
    });

    console.warn(`[SHOPIFY] Order cancelled: ${order.id}`);
  } catch (error) {
    console.error("[SHOPIFY] Error cancelling order:", error);
  }
}

async function handleOrderDeleted(order: any) {
  try {
    await prisma.order.delete({
      where: { externalId: `shopify_${order.id}` },
    });

    console.warn(`[SHOPIFY] Order deleted: ${order.id}`);
  } catch (error) {
    console.error("[SHOPIFY] Error deleting order:", error);
  }
}

// Product Handlers
async function handleProductCreated(product: any) {
  const merchantId = product.merchant_id?.toString() || product.tags?.find((tag: string) => 
    tag.startsWith("merchant_id:")
  )?.split(":")[1];

  if (!merchantId) {
    console.warn("[SHOPIFY] No merchant ID found in product", { productId: product.id });
    return;
  }

  try {
    await prisma.product.upsert({
      where: { externalId: `shopify_${product.id}` },
      create: {
        externalId: `shopify_${product.id}`,
        merchantId,
        name: product.title,
        description: product.body_html,
        handle: product.handle,
        productType: product.product_type,
        vendor: product.vendor,
        tags: product.tags || [],
        status: product.status === "active" ? "published" : "draft",
        publishedAt: product.published_at ? new Date(product.published_at) : null,
        variants: {
          create: product.variants?.map((variant: any) => ({
            externalId: `shopify_${variant.id}`,
            title: variant.title,
            price: parseFloat(variant.price || "0"),
            compareAtPrice: variant.compare_at_price ? parseFloat(variant.compare_at_price) : null,
            sku: variant.sku,
            barcode: variant.barcode,
            weight: variant.weight,
            weightUnit: variant.weight_unit,
            inventoryQuantity: variant.inventory_quantity || 0,
            inventoryPolicy: variant.inventory_policy,
            option1: variant.option1,
            option2: variant.option2,
            option3: variant.option3,
          })) || [],
        },
        images: {
          create: product.images?.map((image: any) => ({
            externalId: `shopify_${image.id}`,
            src: image.src,
            alt: image.alt,
            position: image.position,
          })) || [],
        },
        options: product.options?.map((option: any) => ({
          name: option.name,
          position: option.position,
          values: option.values,
        })) || [],
        metadata: {
          shopifyProductId: product.id,
          shopDomain: product.shop_domain,
        },
      },
      update: {
        name: product.title,
        status: product.status === "active" ? "published" : "draft",
      },
    });

    console.warn(`[SHOPIFY] Product synced: ${product.id}`);
  } catch (error) {
    console.error("[SHOPIFY] Error syncing product:", error);
    throw new WebhookEventError(
      "Failed to sync product",
      product.id,
      "products/create"
    );
  }
}

async function handleProductUpdated(product: any) {
  const merchantId = product.merchant_id?.toString() || product.tags?.find((tag: string) => 
    tag.startsWith("merchant_id:")
  )?.split(":")[1];

  if (!merchantId) return;

  try {
    await prisma.product.update({
      where: { externalId: `shopify_${product.id}` },
      data: {
        name: product.title,
        status: product.status === "active" ? "published" : "draft",
        updatedAt: new Date(),
      },
    });

    console.warn(`[SHOPIFY] Product updated: ${product.id}`);
  } catch (error) {
    console.error("[SHOPIFY] Error updating product:", error);
  }
}

async function handleProductDeleted(product: any) {
  try {
    await prisma.product.delete({
      where: { externalId: `shopify_${product.id}` },
    });

    console.warn(`[SHOPIFY] Product deleted: ${product.id}`);
  } catch (error) {
    console.error("[SHOPIFY] Error deleting product:", error);
  }
}

// Customer Handlers
async function handleCustomerCreated(customer: any) {
  const merchantId = customer.merchant_id?.toString() || customer.tags?.find((tag: string) => 
    tag.startsWith("merchant_id:")
  )?.split(":")[1];

  if (!merchantId) return;

  try {
    await prisma.customer.upsert({
      where: { externalId: `shopify_${customer.id}` },
      create: {
        externalId: `shopify_${customer.id}`,
        merchantId,
        firstName: customer.first_name,
        lastName: customer.last_name,
        email: customer.email,
        phone: customer.phone,
        verifiedEmail: customer.verified_email,
        acceptsMarketing: customer.accepts_marketing,
        state: mapShopifyCustomerState(customer.state),
        tags: customer.tags || [],
        addresses: {
          create: customer.addresses?.map((address: any) => ({
            externalId: `shopify_${address.id}`,
            firstName: address.first_name,
            lastName: address.last_name,
            company: address.company,
            address1: address.address1,
            address2: address.address2,
            city: address.city,
            province: address.province,
            country: address.country,
            zip: address.zip,
            phone: address.phone,
            isDefault: address.default,
          })) || [],
        },
        metadata: {
          shopifyCustomerId: customer.id,
          shopDomain: customer.shop_domain,
          note: customer.note,
        },
        createdAt: new Date(customer.created_at),
        updatedAt: new Date(customer.updated_at),
      },
      update: {
        firstName: customer.first_name,
        lastName: customer.last_name,
        email: customer.email,
        phone: customer.phone,
        state: mapShopifyCustomerState(customer.state),
        updatedAt: new Date(customer.updated_at),
      },
    });

    console.warn(`[SHOPIFY] Customer synced: ${customer.id}`);
  } catch (error) {
    console.error("[SHOPIFY] Error syncing customer:", error);
  }
}

async function handleCustomerUpdated(customer: any) {
  const merchantId = customer.merchant_id?.toString() || customer.tags?.find((tag: string) => 
    tag.startsWith("merchant_id:")
  )?.split(":")[1];

  if (!merchantId) return;

  try {
    await prisma.customer.update({
      where: { externalId: `shopify_${customer.id}` },
      data: {
        firstName: customer.first_name,
        lastName: customer.last_name,
        email: customer.email,
        phone: customer.phone,
        state: mapShopifyCustomerState(customer.state),
        updatedAt: new Date(customer.updated_at),
      },
    });

    console.warn(`[SHOPIFY] Customer updated: ${customer.id}`);
  } catch (error) {
    console.error("[SHOPIFY] Error updating customer:", error);
  }
}

// Fulfillment Handler
async function handleFulfillmentCreated(fulfillment: any) {
  try {
    const order = await prisma.order.findUnique({
      where: { externalId: `shopify_${fulfillment.order_id}` },
    });

    if (!order) {
      console.warn("[SHOPIFY] Order not found for fulfillment", { orderId: fulfillment.order_id });
      return;
    }

    await prisma.fulfillment.create({
      data: {
        orderId: order.id,
        externalId: `shopify_${fulfillment.id}`,
        status: "success",
        trackingCompany: fulfillment.tracking_company,
        trackingNumber: fulfillment.tracking_number,
        trackingUrl: fulfillment.tracking_url,
        shippedAt: new Date(fulfillment.created_at),
        metadata: {
          shopifyFulfillmentId: fulfillment.id,
          locationId: fulfillment.location_id,
        },
      },
    });

    // Update order fulfillment status
    await prisma.order.update({
      where: { id: order.id },
      data: {
        fulfillmentStatus: "fulfilled",
        updatedAt: new Date(),
      },
    });

    console.warn(`[SHOPIFY] Fulfillment created: ${fulfillment.id} for order ${fulfillment.order_id}`);
  } catch (error) {
    console.error("[SHOPIFY] Error creating fulfillment:", error);
  }
}

// Mapping Functions
function mapShopifyOrderStatus(status: string): string {
  const mapping: Record<string, string> = {
    "pending": "pending",
    "authorized": "approved",
    "partially_paid": "partial",
    "paid": "completed",
    "partially_refunded": "refunded",
    "refunded": "refunded",
    "voided": "cancelled",
  };
  return mapping[status] || "pending";
}

function mapShopifyPaymentStatus(status: string): string {
  return mapShopifyOrderStatus(status);
}

function mapShopifyFulfillmentStatus(status: string): string {
  const mapping: Record<string, string> = {
    "fulfilled": "fulfilled",
    "partial": "partial",
    "restocked": "pending",
    null: "pending",
    undefined: "pending",
  };
  return mapping[status] || "pending";
}

function mapShopifyCustomerState(state: string): string {
  const mapping: Record<string, string> = {
    "disabled": "disabled",
    "declined": "declined",
    "invited": "invited",
    "enabled": "active",
  };
  return mapping[state] || "active";
}