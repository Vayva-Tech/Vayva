import { urls } from "@vayva/shared";
import { NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { SupportBotService } from "@/lib/support/support-bot.service";
import { prisma } from "@vayva/db";
import { logger } from "@/lib/logger";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

export const POST = withVayvaAPI(
  PERMISSIONS.SUPPORT_VIEW,
  async (req, { storeId }) => {
    try {
      const parsedBody: unknown = await req.json().catch(() => ({}));
      const body = isRecord(parsedBody) ? parsedBody : {};
      const query = getString(body.query);
      const history = Array.isArray(body.history) ? body.history : [];
      const clientConversationId = getString(body.conversationId);
      if (!query) {
        return NextResponse.json({ error: "Missing query" }, { status: 400 });
      }
      const conversationId =
        clientConversationId || `conv_${storeId}_${Date.now()}`;

      // 0. Feature Flags & Kill Switch
      const envAllowList = process.env.SUPPORT_BOT_ALLOWLIST?.split(",") || [];
      const ALLOWLIST = [...envAllowList];
      const isGlobalEnabled = process.env.SUPPORT_BOT_ENABLED === "true";
      const IS_ENABLED =
        isGlobalEnabled ||
        ALLOWLIST.includes(storeId) ||
        ALLOWLIST.includes("*");
      const MODE = process.env.SUPPORT_BOT_MODE || "normal"; // 'normal' | 'escalate_only' | 'disabled'

      if (!IS_ENABLED || MODE === "disabled") {
        return NextResponse.json(
          {
            error: "Support bot is currently unavailable.",
            message: `Our automated support is offline. Please email ${urls.supportEmail()}.`,
          },
          { status: 503 },
        );
      }

      // Rate Limiting (Distributed via DB - using OtpCode as store)
      const MAX_REQUESTS = 30;
      const WINDOW_MS = 600000; // 10 mins
      const now = new Date();
      const rateLimitKey = `rate_limit_support_${storeId}`;

      const limitEntry = await prisma.otpCode.findFirst({
        where: {
          identifier: rateLimitKey,
          type: "SUPPORT_RATE_LIMIT",
          expiresAt: { gt: now },
        },
      });

      let currentCount = 0;
      if (limitEntry) {
        currentCount = parseInt(limitEntry.code, 10);
        if (currentCount >= MAX_REQUESTS) {
          return NextResponse.json(
            { error: "Rate limit exceeded. Please try again later." },
            { status: 429 },
          );
        }
        await prisma.otpCode.update({
          where: { id: limitEntry.id },
          data: { code: (currentCount + 1).toString() },
        });
      } else {
        await prisma.otpCode.create({
          data: {
            identifier: rateLimitKey,
            code: "1",
            type: "SUPPORT_RATE_LIMIT",
            expiresAt: new Date(now.getTime() + WINDOW_MS),
          },
        });
      }

      // Emergency Mode: Auto-Escalate Everything
      if (MODE === "escalate_only") {
        const { EscalationService } =
          await import("@/lib/support/escalation.service");
        await EscalationService.triggerHandoff({
          storeId,
          conversationId: "emergency_handoff_" + Date.now(),
          trigger: "MANUAL_REQUEST",
          reason: "Kill switch enabled: escalate_only mode",
          aiSummary: `System in emergency mode. User Query: "${query}"`,
        });
        return NextResponse.json({
          messageId: `msg_${Date.now()}_emergency`,
          message:
            "I'm connecting you to a human agent immediately. They will be with you shortly.",
          suggestedActions: [],
        });
      }

      // Use the Orchestrator
      const result = await SupportBotService.processMessage(
        storeId,
        query,
        history,
      );
      const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Telemetry: Log Bot Reply
      await prisma.supportTelemetryEvent.create({
        data: {
          storeId,
          conversationId,
          eventType: "BOT_MESSAGE_CREATED",
          messageId,
          payload: {
            intent: "GENERAL_INQUIRY",
            suggestedActions: result.actions,
            toolFailures: 0,
          },
        },
      });

      return NextResponse.json({
        messageId,
        message: result.reply,
        suggestedActions: result.actions,
      });
    } catch (error) {
      logger.error("[SUPPORT_CHAT_POST]", error, { storeId });
      return NextResponse.json(
        { error: "Internal Server Error" },
        { status: 500 },
      );
    }
  },
);
