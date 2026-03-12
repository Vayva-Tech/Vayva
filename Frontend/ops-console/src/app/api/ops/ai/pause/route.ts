import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@vayva/db";
import { withOpsAuth, OpsAuthContext } from "@/lib/withOpsAuth";
import { logger } from "@vayva/shared";

/**
 * POST /api/ops/ai/pause
 * Pause AI agent for a specific phone number
 */
export const POST = withOpsAuth(
  async (req: NextRequest, context: OpsAuthContext) => {
    const { user } = context;
    try {
      if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      const body = await req.json();
      const { phoneNumber, handoffId } = body;

      if (!phoneNumber) {
        return NextResponse.json(
          { error: "Phone number is required" },
          { status: 400 }
        );
      }

      // Evolution API integration for WhatsApp bot control
      // This controls the AI bot for live chat handoffs
      const evolutionApiUrl = process.env.EVOLUTION_API_URL;
      const evolutionApiKey = process.env.EVOLUTION_API_KEY;
      
      if (evolutionApiUrl && evolutionApiKey) {
        try {
          // Call Evolution API to stop bot for this phone number
          const response = await fetch(`${evolutionApiUrl}/chat/pause`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "apikey": evolutionApiKey,
            },
            body: JSON.stringify({
              number: phoneNumber,
              handoffId,
              pausedBy: user.email,
            }),
          });
          
          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            logger.warn("[EVOLUTION_API_PAUSE_FAILED]", {
              status: response.status,
              phoneNumber,
              handoffId,
              error: errorData,
            });
            // Continue - we still want to log the pause in our system
          } else {
            logger.info("[EVOLUTION_API_PAUSED]", {
              phoneNumber,
              handoffId,
            });
          }
        } catch (evolutionError) {
          logger.warn("[EVOLUTION_API_PAUSE_ERROR]", {
            error: evolutionError,
            phoneNumber,
            handoffId,
          });
          // Continue - we still want to log the pause in our system even if Evolution fails
        }
      } else {
        logger.info("[AI_PAUSE_NO_EVOLUTION]", {
          message: "Evolution API not configured, using local pause only",
          phoneNumber,
          handoffId,
        });
      }

      // Log the pause action in ops audit
      await prisma.opsAuditEvent.create({
        data: {
          eventType: "OPS_AI_PAUSED",
          opsUserId: user.id,
          metadata: {
            phoneNumber,
            handoffId,
            pausedBy: user.email,
          },
        },
      });

      logger.info("[AI_PAUSED]", {
        userId: user.id,
        phoneNumber,
        handoffId,
      });

      return NextResponse.json({
        success: true,
        message: `AI agent paused for ${phoneNumber}`,
        pausedAt: new Date().toISOString(),
      });
    } catch (error) {
      logger.error("[AI_PAUSE_ERROR]", { error });
      return NextResponse.json(
        { error: "Failed to pause AI agent" },
        { status: 500 }
      );
    }
  }
);
