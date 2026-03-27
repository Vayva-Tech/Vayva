import { NextRequest, NextResponse } from "next/server";
import { apiClient, handleApiError } from "@/lib/api-client";

export async function GET(req: NextRequest) {
  try {
    const response = await apiClient.publicGet<any>('/api/v1/policies');
    
    return NextResponse.json({
      success: true,
      data: response.data,
    });
  } catch (error) {
    const { message, code } = handleApiError(error);
    return NextResponse.json(
      { error: message, code },
      { status: 500 }
    );
  }
}
