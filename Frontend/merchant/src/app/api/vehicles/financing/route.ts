// @ts-nocheck
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";
import { PERMISSIONS } from "@/lib/team/permissions";

export async function POST(request: NextRequest) {
  try {
    const storeId = request.headers.get("x-store-id") || "";
    const body = await request.json().catch(() => ({}));
    const validated = calculateSchema.parse(body);
    
    // Call backend API to calculate financing
    const result = await apiJson<{
      calculation: FinancingCalculation;
    }>(
      `${process.env.BACKEND_API_URL}/api/vehicles/financing/calculate`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-store-id": storeId,
        },
        body: JSON.stringify(validated),
      }
    );
    
    return NextResponse.json(result);
  } catch (error) {
    handleApiError(error, { endpoint: "/api/vehicles/financing", operation: "POST" });
    return NextResponse.json(
      { error: "Failed to complete operation" },
      { status: 500 }
    );
  }
}
