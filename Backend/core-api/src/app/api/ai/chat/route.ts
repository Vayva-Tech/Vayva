import { NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { logger } from "@/lib/logger";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export const POST = withVayvaAPI(
  PERMISSIONS.DASHBOARD_VIEW,
  async (req, { storeId }) => {
    try {
      const parsedBody: unknown = await req.json().catch(() => ({}));
      const body = isRecord(parsedBody) ? parsedBody : {};
      const messages = Array.isArray(body.messages) ? body.messages : [];

      // Validate input
      if (!messages || !Array.isArray(messages) || messages.length === 0) {
        return NextResponse.json(
          { error: "Messages array is required" },
          { status: 400 },
        );
      }

      // Check if AI is enabled
      if (process.env.ENABLE_AI_ASSISTANT !== "true") {
        return NextResponse.json(
          { error: "AI assistant is currently disabled" },
          { status: 503 },
        );
      }

      // Check if Groq API key is configured
      const isConfigured = !!process.env.GROQ_ADMIN_KEY;
      if (!isConfigured) {
        return NextResponse.json(
          {
            error:
              "AI service not configured. Please add GROQ_ADMIN_KEY to your .env file.",
            setup_url: "https://console.groq.com/keys",
          },
          { status: 503 },
        );
      }

      // Get AI response using SalesAgent
      const { SalesAgent } = await import("@vayva/ai-agent");
      const response = await SalesAgent.handleMessage(storeId, messages);

      return NextResponse.json({
        success: true,
        data: response,
        timestamp: new Date().toISOString(),
      });
    } catch (error: unknown) {
      logger.error("[AI_CHAT_POST]", error, { storeId });
      return NextResponse.json(
        {
          error: "Failed to process AI request",
          message: error instanceof Error ? error.message : "Unknown error",
        },
        { status: 500 },
      );
    }
  },
);

// Health check endpoint
export const GET = withVayvaAPI(PERMISSIONS.DASHBOARD_VIEW, async () => {
  const isConfigured = !!process.env.GROQ_ADMIN_KEY;
  const isEnabled = process.env.ENABLE_AI_ASSISTANT === "true";
  return NextResponse.json(
    {
      status: isConfigured && isEnabled ? "ready" : "not_configured",
      ai_enabled: isEnabled,
      api_key_configured: isConfigured,
      model: process.env.AI_MODEL || "llama-3.1-70b-versatile",
      setup_guide: !isConfigured
        ? "See SETUP_GUIDE.md for instructions"
        : undefined,
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
});
