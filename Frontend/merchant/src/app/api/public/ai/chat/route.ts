import { NextRequest, NextResponse } from "next/server";
import { buildBackendUrl } from "@/lib/backend-proxy";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

export async function POST(request: NextRequest) {
  try {
    const raw: unknown = await request.json().catch(() => null);
    if (!raw || typeof raw !== "object" || Array.isArray(raw) || !("messages" in raw)) {
      return NextResponse.json({ error: "Invalid messages" }, { status: 400 });
    }
    const messages = (raw as { messages?: unknown }).messages;
    if (!Array.isArray(messages)) {
      return NextResponse.json({ error: "Invalid messages" }, { status: 400 });
    }

    const aiResult = await apiJson<{
      success: boolean;
      data?: { response?: string };
      error?: string;
    }>(buildBackendUrl("/public/ai/chat"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ messages }),
    });

    if (!aiResult.success) {
      throw new Error(aiResult.error || "Failed to process chat");
    }

    return NextResponse.json(aiResult.data || { response: "" });
  } catch (error: unknown) {
    handleApiError(error, { endpoint: "/public/ai/chat", operation: "POST" });
    return NextResponse.json(
      { error: "Failed to complete operation" },
      { status: 500 }
    );
  }
}
