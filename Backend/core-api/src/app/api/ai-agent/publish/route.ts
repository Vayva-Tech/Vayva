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

export const POST = withVayvaAPI(
  PERMISSIONS.SUPPORT_MANAGE,
  async (_req, { storeId }) => {
    try {
      const store = await prisma.store.findUnique({
        where: { id: storeId },
        select: { settings: true },
      });

      const settings = getSettingsObject(store?.settings);
      const draftValue = settings.aiAgentProfileDraft;
      const draft = isRecord(draftValue) ? draftValue : {};

      const agentName = String(draft.name || "");
      const signature = String(draft.signature || "");
      const tonePreset = String(draft.tone || "Friendly");

      const profile = await prisma.merchantAiProfile.upsert({
        where: { storeId },
        update: {
          agentName,
          signoffTemplate: signature,
          tonePreset,
        },
        create: {
          storeId,
          agentName,
          signoffTemplate: signature,
          tonePreset,
        },
      });

      await prisma.store.update({
        where: { id: storeId },
        data: {
          settings: {
            ...settings,
            aiAgentProfileDraft: {},
          },
        },
      });

      return NextResponse.json({ ok: true, profile });
    } catch (error: unknown) {
      logger.error("[AI_AGENT_PUBLISH]", error);
      return NextResponse.json(
        { error: "Internal Server Error" },
        { status: 500 },
      );
    }
  },
);
