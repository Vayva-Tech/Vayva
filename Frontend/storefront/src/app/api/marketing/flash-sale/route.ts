import { NextRequest, NextResponse } from "next/server";
import { apiClient, handleApiError } from "@/lib/api-client";

export async function GET(req: NextRequest) {
  try {
    // Call backend flash sale endpoint
    const response = await apiClient.publicGet<any>('/api/v1/marketing/flash-sales/active');
    
    return NextResponse.json(response.data || {});
  } catch (error) {
    const { message, code } = handleApiError(error);
    return NextResponse.json(
      { error: message, code },
      { status: 500 }
    );
  }
}
