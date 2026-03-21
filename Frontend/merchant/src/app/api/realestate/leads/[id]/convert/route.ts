// @ts-nocheck
import { NextRequest, NextResponse } from "next/server";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

// POST /api/realestate/leads/[id]/convert - Convert a lead to client
export async function POST(request: NextRequest, { params }: { params: Promise<{ id?: string }> }) {
  try {
    const { id } = await params;
    const storeId = request.headers.get("x-store-id") || "";
    const body = await request.json();
    const {
      propertyId,
      contractType,
      agentId,
      notes
    } = body;

    const result = await apiJson<{
      success: boolean;
      data?: { lead: any; message: string; opportunity?: any };
      error?: string;
    }>(`${process.env.BACKEND_API_URL}/api/realestate/leads/${id}/convert`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-store-id": storeId,
      },
      body: JSON.stringify({
        propertyId,
        contractType,
        agentId,
        notes
      }),
    });

    return NextResponse.json(result);
  } catch (error) {
    handleApiError(error, {
      endpoint: "/api/realestate/leads/[id]/convert",
      operation: "CONVERT_LEAD",
    });
    return NextResponse.json(
      { error: "Failed to convert lead" },
      { status: 500 }
    );
  }
}
