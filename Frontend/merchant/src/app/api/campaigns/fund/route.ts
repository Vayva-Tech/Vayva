import { NextRequest, NextResponse } from "next/server";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

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

    // Process campaign funding via backend API (handles Paystack integration)
    const result = await apiJson<{
      success: boolean;
      data?: {
        authorization_url?: string;
        reference?: string;
      };
      error?: string;
    }>(`${process.env.BACKEND_API_URL}/api/campaigns/fund`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-merchant-email': email,
        'x-store-id': storeId,
        'x-store-name': storeName,
      },
      body: JSON.stringify({ amount, platform, method }),
    });

    if (!result.success) {
      throw new Error(result.error || 'Failed to initiate payment');
    }

    return NextResponse.json(result.data);
  } catch (error) {
    handleApiError(
      error,
      {
        endpoint: '/api/campaigns/fund',
        operation: 'FUND_CAMPAIGN',
      }
    );
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

    // Verify payment via backend API
    const result = await apiJson<{
      success: boolean;
      data?: any;
      error?: string;
    }>(`${process.env.BACKEND_API_URL}/api/campaigns/fund/verify?reference=${reference}`);

    if (!result.success) {
      throw new Error(result.error || 'Failed to verify payment');
    }

    return NextResponse.json(result.data);
  } catch (error) {
    handleApiError(
      error,
      {
        endpoint: '/api/campaigns/fund/verify',
        operation: 'VERIFY_PAYMENT',
      }
    );
    return NextResponse.json(
      { error: "Failed to verify payment" },
      { status: 500 }
    );
  }
}
