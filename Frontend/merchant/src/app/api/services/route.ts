import { NextRequest, NextResponse } from "next/server";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

// Create new Service (Product)
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    // Create service via backend API
    const result = await apiJson<{
      success: boolean;
      data?: any;
      error?: string;
    }>(`${process.env.BACKEND_API_URL}/api/services`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!result.success) {
      throw new Error(result.error || 'Failed to create service');
    }

    return NextResponse.json(result.data);
  } catch (error) {
    handleApiError(
      error,
      {
        endpoint: '/api/services',
        operation: 'CREATE_SERVICE',
      }
    );
    return NextResponse.json({ error: (error as Error).message }, { status: 400 });
  }
}
