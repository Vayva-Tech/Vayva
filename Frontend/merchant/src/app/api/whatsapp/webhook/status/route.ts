import { NextRequest, NextResponse } from "next/server";
import { apiJson } from "@/lib/api-client-shared";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    // Forward delivery/read status updates to backend for tracking
    await apiJson("/whatsapp/webhook/status", {
      method: "POST",
      body: JSON.stringify(body),
    }).catch(() => {
      // Non-critical — don't fail the webhook acknowledgement
    });
    return NextResponse.json({ success: true }, { status: 200 });
  } catch {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
