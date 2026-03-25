import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { buildBackendUrl } from "@/lib/backend-proxy";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

function verifyQuickBooksSignature(rawBody: string, request: NextRequest): boolean {
  const secret = process.env.QUICKBOOKS_WEBHOOK_SECRET ?? "";
  if (!secret) return false;
  const signature =
    request.headers.get("intuit-signature") ?? request.headers.get("x-intuit-signature") ?? "";
  if (!signature) return false;
  try {
    const expected = crypto.createHmac("sha256", secret).update(rawBody).digest("base64");
    const a = Buffer.from(signature.trim(), "utf8");
    const b = Buffer.from(expected, "utf8");
    if (a.length !== b.length) return false;
    return crypto.timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

async function handleInvoiceEvent(_body: unknown): Promise<void> {
  /* Forwarded to backend / reserved for merchant-side handling */
}

async function handlePaymentEvent(_body: unknown): Promise<void> {
  /* Forwarded to backend / reserved for merchant-side handling */
}

async function handleCustomerEvent(_body: unknown): Promise<void> {
  /* Forwarded to backend / reserved for merchant-side handling */
}

export async function POST(request: NextRequest): Promise<Response> {
  try {
    const storeId = request.headers.get("x-store-id") ?? "";
    const rawBody = await request.text();
    const isValid = verifyQuickBooksSignature(rawBody, request);

    if (!isValid) {
      return NextResponse.json({ error: "Invalid webhook signature" }, { status: 401 });
    }

    let body: Record<string, unknown>;
    try {
      body = JSON.parse(rawBody) as Record<string, unknown>;
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const eventType = request.headers.get("event-type") ?? "unknown";

    await apiJson<{
      success: boolean;
      data?: unknown;
      error?: string;
    }>(buildBackendUrl("/api/webhookevent"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-store-id": storeId,
      },
      body: JSON.stringify(body),
    });

    switch (eventType) {
      case "com.intuit.quickbooks.invoice":
        await handleInvoiceEvent(body);
        break;
      case "com.intuit.quickbooks.payment":
        await handlePaymentEvent(body);
        break;
      case "com.intuit.quickbooks.customer":
        await handleCustomerEvent(body);
        break;
      default:
        break;
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    handleApiError(error, { endpoint: "/api/webhooks/quickbooks", operation: "POST" });
    return NextResponse.json({ error: "Failed to complete operation" }, { status: 500 });
  }
}
