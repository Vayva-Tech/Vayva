import { NextRequest, NextResponse } from "next/server";
import { apiClient, handleApiError } from "@/lib/api-client";

export async function GET(req: NextRequest) {
  try {
    // Call backend menu endpoint for restaurant/meal services
    const response = await apiClient.publicGet<any>('/api/v1/menu', {
      status: "ACTIVE",
    });

    const menu = response.data || [];
    
    return NextResponse.json({
      weeks: menu.weeks || [],
      products: menu.products || [],
      collections: menu.collections || [],
    });
  } catch (error) {
    const { message, code } = handleApiError(error);
    return NextResponse.json(
      { error: message, code },
      { status: 500 }
    );
  }
}
