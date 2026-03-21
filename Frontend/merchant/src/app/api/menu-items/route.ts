// @ts-nocheck
import { NextRequest, NextResponse } from "next/server";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    const result = await apiJson<{
      success: boolean;
      data?: any;
      error?: string;
    }>(`${process.env.BACKEND_API_URL}/api/menu-items`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-store-id": storeId,
      },
      body: JSON.stringify(data),
    });

    if (!result.success) {
      throw new Error(result.error || 'Failed to create menu item');
    }

    return NextResponse.json(result.data);
  } catch (error: unknown) {
    handleApiError(
      error,
      {
        endpoint: "/api/menu-items",
        operation: "CREATE_MENU_ITEM",
      }
    );
    return NextResponse.json({ error: (error as Error).message }, { status: 400 });
  }
}
