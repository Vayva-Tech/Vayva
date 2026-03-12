import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@vayva/db";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { logger } from "@/lib/logger";

interface AIAgentConfig {
  enabled?: boolean;
  tone?: string;
  knowledgeBase?: string;
  automationScope?: string;
  lastUpdated?: string;
}

interface StoreSettings {
  aiAgent?: AIAgentConfig;
  [key: string]: unknown;
}

export const GET = withVayvaAPI(PERMISSIONS.SUPPORT_VIEW, async (req: NextRequest, { storeId }: { storeId: string }) => {
    try {
        const store = await prisma.store?.findUnique({
            where: { id: storeId },
            select: { settings: true }
        });
        const settings = (store?.settings as StoreSettings | null) ?? {};
        const aiAgent = settings.aiAgent ?? {
            enabled: false,
            tone: "PROFESSIONAL",
            knowledgeBase: "",
            automationScope: "NONE",
            publishedAt: new Date(),
        } as any;
        return NextResponse.json(aiAgent, {
            headers: {
                "Cache-Control": "no-store",
            },
        });
    }
    catch (error) {
        logger.error("[AI_AGENT_SETTINGS_GET] Failed to fetch AI agent settings", { storeId, error });
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
});

export const PATCH = withVayvaAPI(PERMISSIONS.SUPPORT_MANAGE, async (req: NextRequest, { storeId, correlationId }: { storeId: string; correlationId: string }) => {
    try {
        const body = await req.json();
        const { enabled, tone, knowledgeBase, automationScope } = body;
        const store = await prisma.store?.findUnique({
            where: { id: storeId },
            select: { settings: true }
        });
        const currentSettings = (store?.settings as StoreSettings | null) ?? {};
        const updatedAiAgent: AIAgentConfig = {
            ...(currentSettings.aiAgent ?? {}),
            enabled: enabled ?? currentSettings.aiAgent?.enabled,
            tone: tone ?? currentSettings.aiAgent?.tone,
            knowledgeBase: knowledgeBase ?? currentSettings.aiAgent?.knowledgeBase,
            automationScope: automationScope ?? currentSettings.aiAgent?.automationScope,
            lastUpdated: new Date().toISOString()
        };
        const updatedStore = await prisma.store?.update({
            where: { id: storeId },
            data: {
                settings: {
                    ...currentSettings,
                    aiAgent: updatedAiAgent
                } as any
            }
        });
        // Trigger sync with WhatsApp Service
        try {
            const whatsappServiceUrl = process.env?.WHATSAPP_SERVICE_URL || "http://localhost:3005";
            await fetch(`${whatsappServiceUrl}/internal/agent/sync`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-internal-secret": process.env?.INTERNAL_API_SECRET || "",
                    "x-correlation-id": correlationId,
                },
                body: JSON.stringify({ storeId })
            });
        }
        catch (syncError) {
            logger.warn("[AI_AGENT_SETTINGS_PATCH] Sync trigger failed", { error: syncError });
        }
        return NextResponse.json(updatedAiAgent);
    }
    catch (error) {
        logger.error("[AI_AGENT_SETTINGS_PATCH] Failed to update AI agent settings", { storeId, error });
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
});
