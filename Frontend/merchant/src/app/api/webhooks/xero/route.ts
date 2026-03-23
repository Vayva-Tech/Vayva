// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

export async function POST(request: NextRequest) {
  try {
    const storeId = request.headers.get("x-store-id") || "";
    // Verify webhook signature (Xero specific)
    const isValid = verifyXeroWebhook(request);
    
    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid webhook signature' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const eventType = body.event ? body.event.category : 'unknown';

    // Xero webhook received - eventType logged by backend

    // Store webhook event for processing
    await apiJson<{
        success: boolean;
        data?: any;
        error?: string;
      }>(`${process.env.BACKEND_API_URL}/api/webhookevent`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-store-id": storeId,
        },
        body: JSON.stringify(body),
      });

    // Process different event types
    switch (eventType) {
      case 'invoices':
        await handleInvoiceEvent(body);
        break;
      case 'payments':
        await handlePaymentEvent(body);
        break;
      case 'contacts':
        await handleContactEvent(body);
        break;
      default:
        // Unhandled Xero event type
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    handleApiError(error, { endpoint: "/api/webhooks/xero", operation: "POST" });
    return NextResponse.json(
      { error: "Failed to complete operation" },
      { status: 500 }
    );
  }
}
