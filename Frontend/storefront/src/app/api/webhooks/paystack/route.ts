import { NextRequest, NextResponse } from "next/server";
import { apiClient, handleApiError } from "@/lib/api-client";
import crypto from "crypto";

export const runtime = "nodejs";

const PAYSTACK_SECRET_KEY = process.env.NODE_ENV === "production"
  ? process.env.PAYSTACK_LIVE_SECRET_KEY
  : process.env.PAYSTACK_SECRET_KEY;

function verifyPaystackSignature(body: string, signature: string | null): boolean {
  if (!signature || !PAYSTACK_SECRET_KEY) return false;
  const hash = crypto
    .createHmac("sha512", PAYSTACK_SECRET_KEY)
    .update(body)
    .digest("hex");
  return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(signature));
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get('paystack-signature');
    
    // Verify webhook signature
    if (!verifyPaystackSignature(body, signature)) {
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 401 }
      );
    }
    
    const eventData = JSON.parse(body);
    
    // Forward webhook to backend for processing
    const response = await apiClient.post<any>('/api/v1/webhooks/paystack', eventData, {
      headers: {
        'paystack-signature': signature || '',
      },
    });
    
    return NextResponse.json({ received: true, event: eventData.event });
  } catch (error) {
    const { message, code } = handleApiError(error);
    return NextResponse.json(
      { error: message, code },
      { status: 500 }
    );
  }
}
