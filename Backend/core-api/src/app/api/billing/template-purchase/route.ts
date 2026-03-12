import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { TemplatePurchaseService } from "@/services/TemplatePurchaseService";
import { logger } from "@vayva/shared";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { templateId, amount } = body;

    if (!templateId || !amount) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: templateId, amount" },
        { status: 400 }
      );
    }

    // Get merchant ID from session
    const merchantId = session.user.id;
    if (!merchantId) {
      return NextResponse.json(
        { success: false, error: "Merchant ID not found" },
        { status: 400 }
      );
    }

    // Build callback URL
    const callbackUrl = `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings/subscription?payment=success&type=template`;

    // Initiate purchase
    const result = await TemplatePurchaseService.initiatePurchase({
      merchantId,
      templateId,
      amount,
      email: session.user.email,
      callbackUrl,
    });

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      authorization_url: result.authorization_url,
      reference: result.reference,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    logger.error("[TEMPLATE_PURCHASE_API_ERROR]", {
      error: errorMessage,
    });
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
