import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { logger } from "@/lib/logger";

export const POST = withVayvaAPI(PERMISSIONS.DASHBOARD_VIEW, async (req: NextRequest, { storeId, user }: { storeId: string; user: { id: string } }) => {
    try {
        const body = await req.json().catch(() => ({}));
        const { messages, context } = body;
        
        // Validate input
        if (!messages || !Array.isArray(messages) || messages.length === 0) {
            return NextResponse.json({ error: "Messages array is required" }, { status: 400 });
        }
        
        // Check if AI is enabled
        if (process.env?.ENABLE_AI_ASSISTANT !== "true") {
            return NextResponse.json({ error: "AI assistant is currently disabled" }, { status: 503 });
        }
        
        // Check if Groq API key is configured
        const isConfigured = !!process.env?.GROQ_ADMIN_KEY;
        if (!isConfigured) {
            return NextResponse.json({
                error: "AI service not configured. Please add GROQ_ADMIN_KEY to your .env file.",
                setup_url: "https://console.groq?.com/keys",
            }, { status: 503 });
        }
        
        // Get AI response using SalesAgent
        const { SalesAgent } = await import("@vayva/ai-agent");
        const response = await SalesAgent.handleMessage(storeId, messages, context);
        
        return NextResponse.json({
            success: true,
            data: response,
            timestamp: new Date().toISOString(),
        });
    }
    catch (error) {
        logger.error("[AI_CHAT_POST] Failed to process AI request", { storeId, error });
        return NextResponse.json({
            error: "Failed to process AI request",
        }, { status: 500 });
    }
});

// Health check endpoint
export const GET = withVayvaAPI(PERMISSIONS.DASHBOARD_VIEW, async () => {
    const isConfigured = !!process.env?.GROQ_ADMIN_KEY;
    const isEnabled = process.env?.ENABLE_AI_ASSISTANT === "true";
    return NextResponse.json({
        status: isConfigured && isEnabled ? "ready" : "not_configured",
        ai_enabled: isEnabled,
        api_key_configured: isConfigured,
        model: process.env?.AI_MODEL || "llama-3.1-70b-versatile",
        setup_guide: !isConfigured
            ? "See SETUP_GUIDE.md for instructions"
            : undefined,
    }, {
        headers: {
            "Cache-Control": "no-store",
        },
    });
});
