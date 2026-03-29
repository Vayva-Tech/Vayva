import { NextRequest, NextResponse } from "next/server";
import { buildBackendAuthHeaders } from "@/lib/backend-proxy";
import { handleApiError } from "@/lib/api-error-handler";

export async function POST(request: NextRequest) {
  try {
    const auth = await buildBackendAuthHeaders(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const body = await request.json().catch(() => ({}));
    const { eventName, properties } = body;
    
    // Proxy to backend
    const backendUrl = `${process.env.BACKEND_API_URL}/api/v1/platform/telemetry/event`;
    
    const response = await fetch(backendUrl, {
      method: "POST",
      headers: {
        ...auth.headers,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ eventName, properties }),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || `Backend returned ${response.status}`);
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    handleApiError(error, {
      endpoint: "/telemetry/event",
      operation: "POST",
    });
    return NextResponse.json(
      { error: "Failed to complete operation" },
      { status: 500 }
    );
  }
}
