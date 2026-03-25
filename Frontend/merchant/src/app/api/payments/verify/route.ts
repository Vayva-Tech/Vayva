import { NextRequest, NextResponse } from "next/server";
import { buildBackendAuthHeaders } from "@/lib/backend-proxy";
import { z } from "zod";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

const verifySchema = z.object({
  reference: z.string().min(1, "Reference is required"),
});

type PaymentType = "order" | "subscription" | "template_purchase" | "unknown";

export async function POST(request: NextRequest) {
  try {
    const auth = await buildBackendAuthHeaders(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const body = await request.json();
    const { reference } = z.object({
      reference: z.string().min(1, "Reference is required"),
    }).parse(body);

    // Call backend API to verify payment with Paystack
    const result = await apiJson<{
      success: boolean;
      data?: {
        verified?: boolean;
        paymentType?: PaymentType;
        amount?: number;
        subscriptionId?: string;
        orderId?: string;
      };
      error?: string;
      message?: string;
    }>(
      `${process.env.BACKEND_API_URL}/api/payments/verify`,
      {
        method: "POST",
        headers: { ...auth.headers },
        body: JSON.stringify({ reference }),
      }
    );
    
    return NextResponse.json(result);
  } catch (error) {
    handleApiError(
      error,
      {
        endpoint: "/api/payments/verify",
        operation: "VERIFY_PAYMENT",
      }
    );
    throw error;
  }
}
