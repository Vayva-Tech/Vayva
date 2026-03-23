// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

export async function POST(request: NextRequest) {
  try {
    const storeId = request.headers.get("x-store-id") || "";
    // Verify webhook signature (QuickBooks specific)
    const isValid = await verifyQuickBooksWebhook(request);
    
    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid webhook signature' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const eventType = request.headers.get('event-type') || 'unknown';

    // QuickBooks webhook received

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
      case 'com.intuit.quickbooks.invoice':
        await handleInvoiceEvent(body);
        break;
      case 'com.intuit.quickbooks.payment':
        await handlePaymentEvent(body);
        break;
      case 'com.intuit.quickbooks.customer':
        await handleCustomerEvent(body);
        break;
      default:
        // Unhandled QuickBooks event type
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    handleApiError(error, { endpoint: "/api/webhooks/quickbooks", operation: "POST" });
    return NextResponse.json(
      { error: "Failed to complete operation" },
      { status: 500 }
    );
  }
}
