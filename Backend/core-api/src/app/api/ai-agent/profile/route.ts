import { NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger } from "@/lib/logger";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function getSettingsObject(settings: unknown): Record<string, unknown> {
  return isRecord(settings) ? settings : {};
}

function getDraftSettings(settings: Record<string, unknown>) {
  const draftValue = settings.aiAgentProfileDraft;
  const draft = isRecord(draftValue) ? draftValue : {};
  return {
    name: String(draft.name || ""),
    avatarUrl: String(draft.avatarUrl || ""),
    tone: String(draft.tone || "professional"),
    signature: String(draft.signature || ""),
  };
}

export const GET = withVayvaAPI(
  PERMISSIONS.SUPPORT_VIEW,
  async (_req, { storeId }) => {
    try {
      const [profile, store] = await Promise.all([
        prisma.merchantAiProfile.findUnique({ where: { storeId } }),
        prisma.store.findUnique({
          where: { id: storeId },
          select: { settings: true },
        }),
      ]);

      const settings = getSettingsObject(store?.settings);
      const draft = getDraftSettings(settings);

      return NextResponse.json(
        {
          profile: profile
            ? {
                id: profile.id,
                name: profile.agentName,
                prompt: "",
                isLive: false,
                features: [],
              }
            : null,
          store: {
            id: storeId,
            slug: "",
            name: "",
          },
          config: draft,
        },
        {
          headers: {
            "Cache-Control": "no-store",
          },
        },
      );
    } catch (error: unknown) {
      logger.error("[AI_AGENT_PROFILE_GET]", error, { storeId });
      return NextResponse.json(
        { error: "Internal Server Error" },
        { status: 500 },
      );
    }
  },
);

export const PUT = withVayvaAPI(
  PERMISSIONS.SUPPORT_MANAGE,
  async (req, { storeId, user }) => {
    try {
      const parsedBody: unknown = await req.json().catch(() => ({}));
      const body = isRecord(parsedBody) ? parsedBody : {};
      const incoming = {
        name: String(body.name || ""),
        avatarUrl: String(body.avatarUrl || ""),
        tone: String(body.tone || "professional"),
        signature: String(body.signature || ""),
      };

      const store = await prisma.store.findUnique({
        where: { id: storeId },
        select: { settings: true },
      });
      const currentSettings = getSettingsObject(store?.settings);

      const updatedSettings = {
        ...currentSettings,
        aiAgentProfileDraft: incoming,
      };

      await prisma.store.update({
        where: { id: storeId },
        data: { settings: updatedSettings },
      });

      return NextResponse.json({ ok: true, config: incoming });
    } catch (error: unknown) {
      logger.error("[AI_AGENT_PROFILE_PUT]", error, {
        storeId,
        userId: user.id,
      });
      return NextResponse.json(
        { error: "Internal Server Error" },
        { status: 500 },
      );
    }
  },
);
