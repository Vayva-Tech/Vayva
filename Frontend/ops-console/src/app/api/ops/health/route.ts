import { NextResponse } from "next/server";
import { apiClient } from "@/lib/api-client";

export async function GET() {
  const response = await apiClient.get('/api/v1/admin/health');
  
  const status = response.status === "healthy" ? 200 : 503;
  
  return NextResponse.json(response, { 
    status,
    headers: {
      "Cache-Control": "no-cache, no-store, must-revalidate",
      "Pragma": "no-cache",
      "Expires": "0",
    },
  });
}
