// @ts-nocheck
import { NextRequest, NextResponse } from "next/server";
import { PERMISSIONS } from "@/lib/team/permissions";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

// GET /api/automation/rules - Get automation rules
export async function GET(request: NextRequest) {
  try {
    const result = await apiJson(`${process.env.BACKEND_API_URL}/api/automation/rules`, {
      headers: {
        "x-store-id": storeId,
      },
    });
    
    return NextResponse.json(result);
  } catch (error) {
    handleApiError(error, {
      endpoint: "/api/automation/rules",
      operation: "GET_AUTOMATION_RULES",
    });
    return NextResponse.json(
      { error: "Failed to fetch automation rules" },
      { status: 500 }
    );
  }
}
