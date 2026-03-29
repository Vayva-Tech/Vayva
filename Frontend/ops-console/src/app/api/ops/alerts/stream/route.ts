import { NextRequest } from "next/server";
import { OpsAuthService } from "@/lib/ops-auth";
import { apiClient } from "@/lib/api-client";
import { logger } from "@vayva/shared";

export const dynamic = "force-dynamic";

/**
 * GET /api/ops/alerts/stream
 * Server-Sent Events endpoint for real-time critical alerts
 */
export async function GET(req: NextRequest) {
  try {
    // Authenticate ops user
    const { user } = await OpsAuthService.requireSession();
    
    // Only allow ops roles
    const allowedRoles = ["OPS_OWNER", "SUPERVISOR", "OPERATOR", "OPS_SUPPORT", "OPS_ADMIN"];
    if (!allowedRoles.includes(user.role)) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 403, headers: { "Content-Type": "application/json" } }
      );
    }

    const encoder = new TextEncoder();
    
    // Create readable stream with SSE events proxied from backend
    const stream = new ReadableStream({
      async start(controller) {
        // Send initial connection message
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ type: "connected", timestamp: Date.now() })}\n\n`)
        );

        // Keep track of last check time
        let lastCheckTime = new Date();
        
        // Interval for checking new alerts from backend
        const checkInterval = setInterval(async () => {
          try {
            // Fetch alerts from backend SSE proxy
            const response = await apiClient.get('/api/v1/admin/alerts/stream', {
              since: lastCheckTime.toISOString(),
            });

            // Send alerts to client
            for (const alert of response.alerts || []) {
              controller.enqueue(
                encoder.encode(
                  `data: ${JSON.stringify({
                    type: "alert",
                    alert,
                  })}\n\n`
                )
              );
            }

            // Send keepalive ping
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ type: "ping" })}\n\n`)
            );

            lastCheckTime = new Date();
          } catch (error: unknown) {
            logger.error("[SSE Alerts] Error checking for alerts:", { error: error instanceof Error ? error.message : String(error) });
          }
        }, 15000); // Check every 15 seconds

        // Cleanup on client disconnect
        req.signal?.addEventListener("abort", () => {
          clearInterval(checkInterval);
          controller.close();
          logger.info("[SSE Alerts] Client disconnected", { userId: user.id });
        });
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });
  } catch (error: unknown) {
    logger.error("[SSE Alerts] Setup error:", { error: error instanceof Error ? error.message : String(error) });
    return new Response(
      JSON.stringify({ error: "Internal Server Error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
