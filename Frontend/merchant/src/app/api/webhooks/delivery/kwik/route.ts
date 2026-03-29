import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest): Promise<Response> {
  // Proxy to backend
  const backendUrl = `${process.env.BACKEND_API_URL}/api/v1/platform/webhooks/delivery/kwik`;
  
  const body = await req.json().catch(() => ({}));
  const signature = req.headers.get("x-kwik-signature") || "";
  
  try {
    const response = await fetch(backendUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-kwik-signature": signature,
      },
      body: JSON.stringify(body),
    });
    
    const result = await response.json();
    
    return NextResponse.json(result, { 
      status: response.status,
    });
  } catch (error) {
    console.error("[KWIK_WEBHOOK] Proxy error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to process webhook" },
      { status: 500 }
    );
  }
}
