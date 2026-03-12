import { NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { Prisma, prisma } from "@vayva/db";
import { logger, standardHeaders } from "@vayva/shared";

function getErrorMessage(error: unknown): { message: string; stack?: string } {
  if (error instanceof Error)
    return { message: error.message, stack: error.stack };
  if (typeof error === "string") return { message: error };
  return { message: "Unknown error" };
}

function formatMinutes(value: number): string {
  if (!Number.isFinite(value) || value <= 0) return "--";
  const mins = Math.round(value);
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  const rem = mins % 60;
  return rem ? `${hrs}h ${rem}m` : `${hrs}h`;
}

export const GET = withVayvaAPI(
  PERMISSIONS.SUPPORT_VIEW,
  async (req, { storeId, correlationId }) => {
    try {
      const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

      const baseWhere: Prisma.ConversationWhereInput = {
        storeId,
        contact: {
          channel: { in: ["WHATSAPP", "INSTAGRAM"] },
        },
        updatedAt: { gte: since },
      };

      const [totalConversations, pendingDMs, responded] = await Promise.all([
        prisma.conversation.count({ where: baseWhere }),
        prisma.conversation.count({
          where: {
            ...baseWhere,
            unreadCount: { gt: 0 },
          },
        }),
        prisma.conversation.count({
          where: {
            ...baseWhere,
            lastRepliedAt: { not: null },
          },
        }),
      ]);

      const conversationsWithTiming = await prisma.conversation.findMany({
        where: {
          ...baseWhere,
          lastInboundAt: { not: null },
          lastRepliedAt: { not: null },
        },
        select: { lastInboundAt: true, lastRepliedAt: true },
        take: 200,
      });

      let totalMinutes = 0;
      let count = 0;
      for (const c of conversationsWithTiming) {
        const inbound = c.lastInboundAt
          ? new Date(c.lastInboundAt).getTime()
          : null;
        const replied = c.lastRepliedAt
          ? new Date(c.lastRepliedAt).getTime()
          : null;
        if (inbound && replied && replied >= inbound) {
          totalMinutes += (replied - inbound) / 60000;
          count += 1;
        }
      }

      const responseRate =
        totalConversations > 0
          ? Math.round((responded / totalConversations) * 100)
          : 0;

      return NextResponse.json(
        {
          totalConversations,
          responseRate,
          avgResponseTime: formatMinutes(count > 0 ? totalMinutes / count : 0),
          satisfactionScore: 0,
          pendingDMs,
          requestId: correlationId,
        },
        { headers: standardHeaders(correlationId) },
      );
    } catch (error: unknown) {
      const { message, stack } = getErrorMessage(error);
      logger.error("[SOCIALS_AI_REPORT_GET]", {
        error: message,
        stack,
        requestId: correlationId,
        storeId,
      });
      return NextResponse.json(
        {
          totalConversations: 0,
          responseRate: 0,
          avgResponseTime: "--",
          satisfactionScore: 0,
          pendingDMs: 0,
          requestId: correlationId,
        },
        { headers: standardHeaders(correlationId) },
      );
    }
  },
);
