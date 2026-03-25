import { NextRequest } from "next/server";
import { buildBackendAuthHeaders } from "@/lib/backend-proxy";

/**
 * GET /api/notifications/stream
 * Server-Sent Events endpoint for real-time notifications
 * Falls back to mock events if backend not connected
 */
export async function GET(request: NextRequest) {
  // Verify authentication
  const sessionCookie = request.cookies.get("vayva_session")?.value;
  if (!sessionCookie) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const encoder = new TextEncoder();

  // Create stream
  const stream = new ReadableStream({
    start(controller) {
      // Send initial connection message
      controller.enqueue(
        encoder.encode(`data: ${JSON.stringify({ type: "connected", timestamp: new Date().toISOString() })}\n\n`)
      );

      // Heartbeat only - real notifications pushed via Redis/EventBus
      const heartbeatInterval = setInterval(() => {
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ type: "heartbeat" })}\n\n`)
        );
      }, 30000);

      // Cleanup on close
      request.signal.addEventListener("abort", () => {
        clearInterval(heartbeatInterval);
        controller.close();
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
}
