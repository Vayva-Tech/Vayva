import { NextRequest, NextResponse } from "next/server";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";
import { z } from "zod";

const TemplateSwitchSchema = z.object({
  templateId: z.string(),
  confirmed: z.boolean().optional(),
});

// POST /api/billing/template-switch - Check billing requirements for template switch
export async function POST(request: NextRequest) {
  try {
    const storeId = request.headers.get("x-store-id") || "";
    const body = await request.json();
    const validated = TemplateSwitchSchema.parse(body);

    // Call backend API to process template switch
    const result = await apiJson<{
      success: boolean;
      data?: { requiresPayment?: boolean; amount?: number };
      error?: string;
    }>(
      `${process.env.BACKEND_API_URL}/api/billing/template-switch`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-store-id": storeId,
        },
        body: JSON.stringify(validated),
      }
    );

    return NextResponse.json(result);
  } catch (error) {
    handleApiError(error, {
      endpoint: '/api/billing/template-switch',
      operation: 'POST_TEMPLATE_SWITCH',
    });
    return NextResponse.json(
      { error: 'Failed to complete operation' },
      { status: 500 }
    );
  }
}
