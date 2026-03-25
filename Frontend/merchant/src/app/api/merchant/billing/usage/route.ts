/**
 * GET /api/merchant/billing/usage
 * 
 * Get usage statistics for the current store
 */

import { NextRequest, NextResponse } from "next/server";
import { buildBackendAuthHeaders } from "@/lib/backend-proxy";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

 export async function GET(request: NextRequest) {
   try {
    // Fetch billing usage via backend API
    const result = await apiJson<{
      success: boolean;
      data?: any;
      error?: string;
    }>(`${process.env.BACKEND_API_URL}/api/merchant/billing/usage`);

    if (!result.success) {
      throw new Error(result.error || 'Failed to fetch billing usage');
    }

    return NextResponse.json(result.data);
   } catch (error) {
    handleApiError(
      error,
      {
        endpoint: '/api/merchant/billing/usage',
        operation: 'GET_BILLING_USAGE',
      }
    );
     return NextResponse.json(
       { error: "Failed to fetch billing usage" },
       { status: 500 }
     );
   }
}

function getOverageRate(metric: string): number {
  const rates: Record<string, number> = {
    'AI_TOKENS': 0.005,
    'WHATSAPP_MESSAGES': 290,
    'WHATSAPP_MEDIA': 500,
    'STORAGE_GB': 10000,
    'API_CALLS': 1,
    'BANDWIDTH_GB': 5000,
  };
  return rates[metric] || 0;
}
