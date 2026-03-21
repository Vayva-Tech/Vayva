// @ts-nocheck
import { NextRequest, NextResponse } from "next/server";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json();
         if (!messages || !Array.isArray(messages)) {
             return NextResponse.json({ error: "Invalid messages" }, { status: 400 });
         }

        // Process chat via backend AI API
        const aiResult = await apiJson<{
          success: boolean;
          data?: { response?: string };
          error?: string;
        }>(`${process.env.BACKEND_API_URL}/api/public/ai/chat`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ messages }),
        });

        if (!aiResult.success) {
          throw new Error(aiResult.error || 'Failed to process chat');
        }

        return NextResponse.json(aiResult.data || { response: '' });
  } catch (error) {
    handleApiError(error, { endpoint: "/api/public/ai/chat", operation: "POST" });
    return NextResponse.json(
      { error: "Failed to complete operation" },
      { status: 500 }
    );
  }
}
