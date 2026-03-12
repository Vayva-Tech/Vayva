import { NextResponse } from "next/server";
import { prisma } from "@vayva/db";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { logger } from "@/lib/logger";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getBoolean(value: unknown): boolean | undefined {
  return typeof value === "boolean" ? value : undefined;
}

function getString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

type AiAgentSettings = {
  enabled: boolean;
  tone: string;
  knowledgeBase: string;
  automationScope: string;
  agentName?: string;
  openingMessage?: string;
  brevityMode?: string;
  persuasionLevel?: number;
  allowImageUnderstanding?: boolean;
  allowVoiceNotes?: boolean;
  lastUpdated?: string;
};

function getSettingsObject(settings: unknown): Record<string, unknown> {
  return isRecord(settings) ? settings : {};
}

function getAiAgentSettingsFromSettings(
  settings: Record<string, unknown>,
): AiAgentSettings {
  const aiAgentValue = settings.aiAgent;
  const aiAgent = isRecord(aiAgentValue) ? aiAgentValue : {};

  return {
    enabled: getBoolean(aiAgent.enabled) ?? false,
    tone: getString(aiAgent.tone) ?? "PROFESSIONAL",
    knowledgeBase: getString(aiAgent.knowledgeBase) ?? "",
    automationScope: getString(aiAgent.automationScope) ?? "NONE",
    agentName: getString(aiAgent.agentName),
    openingMessage: getString(aiAgent.openingMessage),
    brevityMode: getString(aiAgent.brevityMode) ?? "Short",
    persuasionLevel: typeof aiAgent.persuasionLevel === "number" ? aiAgent.persuasionLevel : 1,
    allowImageUnderstanding: getBoolean(aiAgent.allowImageUnderstanding) ?? false,
    allowVoiceNotes: getBoolean(aiAgent.allowVoiceNotes) ?? true,
    lastUpdated: getString(aiAgent.lastUpdated),
  };
}

export const GET = withVayvaAPI(
  PERMISSIONS.SUPPORT_VIEW,
  async (req, { storeId }) => {
    try {
      const store = await prisma.store.findUnique({
        where: { id: storeId },
        select: { settings: true },
      });

      const settings = getSettingsObject(store?.settings);
      const aiAgent = getAiAgentSettingsFromSettings(settings);
      return NextResponse.json(aiAgent, {
        headers: {
          "Cache-Control": "no-store",
        },
      });
    } catch (error: unknown) {
      logger.error("[AI_AGENT_SETTINGS_GET]", error, { storeId });
      return NextResponse.json(
        { error: "Internal Server Error" },
        { status: 500 },
      );
    }
  },
);
export const PATCH = withVayvaAPI(
  PERMISSIONS.SUPPORT_MANAGE,
  async (req, { storeId, correlationId }) => {
    try {
      const parsedBody: unknown = await req.json().catch(() => ({}));
      const body = isRecord(parsedBody) ? parsedBody : {};

      const enabled = getBoolean(body.enabled);
      const tone = getString(body.tone);
      const knowledgeBase = getString(body.knowledgeBase);
      const automationScope = getString(body.automationScope);
      const agentName = getString(body.agentName);
      const openingMessage = getString(body.openingMessage);
      const brevityMode = getString(body.brevityMode);
      const persuasionLevel = typeof body.persuasionLevel === "number" ? body.persuasionLevel : undefined;
      const allowImageUnderstanding = getBoolean(body.allowImageUnderstanding);
      const allowVoiceNotes = getBoolean(body.allowVoiceNotes);
      const store = await prisma.store.findUnique({
        where: { id: storeId },
        select: { settings: true },
      });
      const currentSettings = getSettingsObject(store?.settings);
      const currentAiAgentValue = currentSettings.aiAgent;
      const currentAiAgent = isRecord(currentAiAgentValue)
        ? currentAiAgentValue
        : {};
      const updatedAiAgent = {
        ...currentAiAgent,
        enabled: enabled ?? getBoolean(currentAiAgent.enabled),
        tone: tone ?? getString(currentAiAgent.tone),
        knowledgeBase: knowledgeBase ?? getString(currentAiAgent.knowledgeBase),
        automationScope:
          automationScope ?? getString(currentAiAgent.automationScope),
        agentName: agentName ?? getString(currentAiAgent.agentName),
        openingMessage: openingMessage ?? getString(currentAiAgent.openingMessage),
        brevityMode: brevityMode ?? getString(currentAiAgent.brevityMode),
        persuasionLevel: persuasionLevel ?? (typeof currentAiAgent.persuasionLevel === "number" ? currentAiAgent.persuasionLevel : 1),
        allowImageUnderstanding: allowImageUnderstanding ?? getBoolean(currentAiAgent.allowImageUnderstanding),
        allowVoiceNotes: allowVoiceNotes ?? getBoolean(currentAiAgent.allowVoiceNotes),
        lastUpdated: new Date().toISOString(),
      };
      await prisma.store.update({
        where: { id: storeId },
        data: {
          settings: {
            ...currentSettings,
            aiAgent: updatedAiAgent,
          },
        },
      });

      // Sync to MerchantAiProfile for AI to use these settings
      try {
        await prisma.merchantAiProfile.upsert({
          where: { storeId },
          create: {
            storeId,
            agentName: updatedAiAgent.agentName || "Vayva Assistant",
            tonePreset: updatedAiAgent.tone === "PROFESSIONAL" ? "Professional" :
                       updatedAiAgent.tone === "FRIENDLY" ? "Friendly" :
                       updatedAiAgent.tone === "WITTY" ? "Playful" :
                       updatedAiAgent.tone === "MINIMALIST" ? "Minimal" : "Friendly",
            brevityMode: updatedAiAgent.brevityMode || "Short",
            persuasionLevel: typeof updatedAiAgent.persuasionLevel === "number" ? updatedAiAgent.persuasionLevel : 1,
            greetingTemplate: updatedAiAgent.openingMessage,
          },
          update: {
            agentName: updatedAiAgent.agentName || undefined,
            tonePreset: updatedAiAgent.tone === "PROFESSIONAL" ? "Professional" :
                       updatedAiAgent.tone === "FRIENDLY" ? "Friendly" :
                       updatedAiAgent.tone === "WITTY" ? "Playful" :
                       updatedAiAgent.tone === "MINIMALIST" ? "Minimal" : undefined,
            brevityMode: updatedAiAgent.brevityMode || undefined,
            persuasionLevel: typeof updatedAiAgent.persuasionLevel === "number" ? updatedAiAgent.persuasionLevel : undefined,
            greetingTemplate: updatedAiAgent.openingMessage || undefined,
          },
        });
      } catch (profileError) {
        logger.warn("[AI_PROFILE_SYNC_FAILED]", undefined, { profileError, storeId });
      }

      // Sync image understanding to WhatsAppAgentSettings
      if (allowImageUnderstanding !== undefined) {
        try {
          await prisma.whatsAppAgentSettings.upsert({
            where: { storeId },
            create: {
              storeId,
              enabled: enabled ?? false,
              allowImageUnderstanding: allowImageUnderstanding,
            },
            update: {
              allowImageUnderstanding: allowImageUnderstanding,
            },
          });
        } catch (waError) {
          logger.warn("[WA_SETTINGS_SYNC_FAILED]", undefined, { waError, storeId });
        }
      }

      // Trigger sync with WhatsApp Service
      const whatsappServiceUrl = process.env.WHATSAPP_SERVICE_URL;
      const internalApiSecret = process.env.INTERNAL_API_SECRET;
      if (whatsappServiceUrl && internalApiSecret) {
        try {
          await fetch(`${whatsappServiceUrl}/internal/agent/sync`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-internal-secret": internalApiSecret,
              "x-correlation-id": correlationId,
            },
            body: JSON.stringify({ storeId }),
          });
        } catch (syncError) {
          logger.warn("[AI_AGENT_SYNC_TRIGGER_FAILED]", undefined, {
            syncError,
            storeId,
            correlationId,
          });
        }
      }
      return NextResponse.json(updatedAiAgent);
    } catch (error: unknown) {
      logger.error("[AI_AGENT_SETTINGS_PATCH]", error, {
        storeId,
        correlationId,
      });
      return NextResponse.json(
        { error: "Internal Server Error" },
        { status: 500 },
      );
    }
  },
);
