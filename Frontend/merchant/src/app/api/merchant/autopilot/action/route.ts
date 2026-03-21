import { NextRequest, NextResponse } from "next/server";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

/**
 * POST /api/merchant/autopilot/action
 * Execute autopilot action
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const result = await apiJson<{
      success: boolean;
      data?: any;
      error?: string;
    }>(`${process.env.BACKEND_API_URL}/api/merchant/autopilot/action`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!result.success) {
      throw new Error(result.error || 'Failed to execute autopilot action');
    }

    return NextResponse.json(result);
  } catch (error) {
    handleApiError(
      error,
      {
        endpoint: '/api/merchant/autopilot/action',
        operation: 'EXECUTE_AUTOPILOT_ACTION',
      }
    );
    return NextResponse.json(
      { error: 'Failed to execute autopilot action' },
      { status: 500 }
    );
  }
}
