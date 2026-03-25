import { NextRequest, NextResponse } from "next/server";
import { buildBackendAuthHeaders } from "@/lib/backend-proxy";
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
    const auth = await buildBackendAuthHeaders(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const storeId = auth.user.storeId;
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
        headers: { ...auth.headers },
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
