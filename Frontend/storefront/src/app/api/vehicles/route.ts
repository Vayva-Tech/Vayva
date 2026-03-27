import { NextRequest, NextResponse } from "next/server";
import { apiClient, handleApiError } from "@/lib/api-client";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");
    
    const params: Record<string, string> = {};
    if (type) params.type = type;
    if (searchParams.get("year")) params.year = searchParams.get("year")!;
    if (searchParams.get("make")) params.make = searchParams.get("make")!;
    if (searchParams.get("model")) params.model = searchParams.get("model")!;
    
    // Call backend vehicles endpoint
    const response = await apiClient.publicGet<any>('/api/v1/vehicles', params);
    
    return NextResponse.json({
      years: response.data.years,
      makes: response.data.makes,
      models: response.data.models,
      vehicles: response.data.vehicles,
    });
  } catch (error) {
    console.error("[VEHICLES] Error:", error);
    const { message, code } = handleApiError(error);
    return NextResponse.json(
      { error: message, code },
      { status: 500 }
    );
  }
}
