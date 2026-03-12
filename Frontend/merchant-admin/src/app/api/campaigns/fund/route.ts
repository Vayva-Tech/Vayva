/**
 * Campaign Funding API Route
 * Handles Paystack payments for campaign funding
 */

import { NextRequest, NextResponse } from "next/server";
import { PaystackService } from "@/lib/payment/paystack";
import { logger } from "@vayva/shared";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { amount, platform, method } = body;

    // Get merchant session info from headers
    const email = req.headers.get("x-merchant-email") || "merchant@vayva.ng";
    const storeId = req.headers.get("x-store-id") || "unknown";
    const storeName = req.headers.get("x-store-name") || "Unknown Store";

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: "Invalid amount" },
        { status: 400 }
      );
    }

    if (method === "card") {
      // Initialize Paystack transaction for card payment
      const reference = `camp_${platform}_${storeId}_${Date.now()}`;
      
      const response = await PaystackService.initializeTransaction({
        email,
        amount,
        reference,
        metadata: {
          storeId,
          storeName,
          platform,
          type: "campaign_funding",
        },
        callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/marketing/campaigns?funding=success&ref=${reference}`,
      });

      return NextResponse.json({
        authorization_url: response.data.authorization_url,
        reference: response.data.reference,
      });
    }

    return NextResponse.json(
      { error: "Invalid payment method" },
      { status: 400 }
    );
  } catch (error) {
    logger.error("[Campaign Funding API]", { error });
    return NextResponse.json(
      { error: "Failed to initiate payment" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const reference = searchParams.get("reference");

    if (!reference) {
      return NextResponse.json(
        { error: "Reference required" },
        { status: 400 }
      );
    }

    // Verify transaction
    const verification = await PaystackService.verifyTransaction(reference);
    
    return NextResponse.json({
      status: verification.status,
      data: verification.data,
    });
  } catch (error) {
    logger.error("[Campaign Funding Verify]", { error });
    return NextResponse.json(
      { error: "Failed to verify payment" },
      { status: 500 }
    );
  }
}
