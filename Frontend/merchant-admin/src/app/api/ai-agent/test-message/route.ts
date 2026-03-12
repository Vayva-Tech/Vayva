import { NextRequest } from "next/server";
import { withVayvaAPI } from "@/lib/api-middleware";
import { z } from "zod";
import { logger } from "@vayva/shared";

const TestMessageSchema = z.object({
  message: z.string().min(1).max(500),
  tone: z.enum(["friendly", "professional", "urgent", "luxurious"]).optional(),
  language: z.enum(["en", "fr", "es", "pidgin"]).optional(),
  context: z.string().optional(),
});

/**
 * POST /api/ai-agent/test-message
 * Test AI agent response to a message
 */
export async function POST(request: NextRequest) {
  return withVayvaAPI(
    request,
    async (session: { storeId?: string; merchantId: string; userId: string }) => {
      const body = await request.json();
      const validated = TestMessageSchema.parse(body);

      const backendResponse = await fetch(
        `${process.env.BACKEND_API_URL}/api/ai-agent/test-message`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-store-id": session.storeId || session.merchantId,
            "x-merchant-id": session.merchantId,
            "x-user-id": session.userId,
          },
          body: JSON.stringify(validated),
        }
      );

      const data = await backendResponse
        .json()
        .catch(() => ({ error: "Failed to test message" }));

      logger.info("[AI Test Message]", {
        merchantId: session.merchantId,
        inputLength: validated.message.length,
      });

      return {
        status: backendResponse.status,
        body: data,
      };
    },
    { requireAuth: true }
  );
}
