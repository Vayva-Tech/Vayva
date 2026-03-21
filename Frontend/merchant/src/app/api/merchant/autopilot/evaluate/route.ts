import { NextRequest, NextResponse } from "next/server";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

/**
 * POST /api/merchant/autopilot/evaluate
 * Evaluate autopilot recommendations
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const result = await apiJson<{
      success: boolean;
      data?: any;
      error?: string;
    }>(`${process.env.BACKEND_API_URL}/api/merchant/autopilot/evaluate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!result.success) {
      throw new Error(result.error || 'Failed to evaluate autopilot recommendations');
    }

    return NextResponse.json(result);
  } catch (error) {
    handleApiError(
      error,
      {
        endpoint: '/api/merchant/autopilot/evaluate',
        operation: 'EVALUATE_AUTOPILOT',
      }
    );
    return NextResponse.json(
      { error: 'Failed to evaluate autopilot recommendations' },
      { status: 500 }
    );
  }
}
