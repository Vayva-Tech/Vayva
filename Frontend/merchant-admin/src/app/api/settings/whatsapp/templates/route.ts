import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { WhatsAppAgentService } from "@/services/whatsapp-agent.service";
import { z } from "zod";
import { logger } from "@/lib/logger";

const CreateTemplateSchema = z.object({
    name: z.string().min(1),
    language: z.string().default("en"),
    category: z.string().default("UTILITY"), // MARKETING, UTILITY, AUTHENTICATION
    status: z.string().default("PENDING"), // Templates start as PENDING until approved by WhatsApp
    components: z.array(z.any()).optional(),
});

export const POST = withVayvaAPI(PERMISSIONS.INTEGRATIONS_MANAGE, async (req: NextRequest, { storeId }: { storeId: string }) => {
    try {
        const body = await req.json().catch(() => ({}));
        const validation = CreateTemplateSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json({ error: "Invalid input", details: validation.error }, { status: 400 });
        }
        const template = await WhatsAppAgentService.createTemplate(storeId, validation.data);
        return NextResponse.json(template);
    }
    catch (error: unknown) {
        logger.error("[WHATSAPP_TEMPLATES_POST] Failed to create template", { storeId, error });
        return NextResponse.json({ error: "Failed to create template" }, { status: 500 });
    }
});

export const GET = withVayvaAPI(PERMISSIONS.INTEGRATIONS_MANAGE, async (req: NextRequest, { storeId }: { storeId: string }) => {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");
        if (!id) {
            return NextResponse.json({ error: "ID required" }, { status: 400 });
        }
        const template = await WhatsAppAgentService.getTemplate(storeId, id);
        return NextResponse.json(template, {
            headers: {
                "Cache-Control": "no-store",
            },
        });
    }
    catch (error: unknown) {
        logger.error("[WHATSAPP_TEMPLATES_GET] Failed to get template", { storeId, error });
        return NextResponse.json({ error: "Failed to get template" }, { status: 500 });
    }
});

export const DELETE = withVayvaAPI(PERMISSIONS.INTEGRATIONS_MANAGE, async (req: NextRequest, { storeId }: { storeId: string }) => {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");
        if (!id) {
            return NextResponse.json({ error: "ID required" }, { status: 400 });
        }
        await WhatsAppAgentService.deleteTemplate(storeId, id);
        return NextResponse.json({ success: true });
    }
    catch (error: unknown) {
        logger.error("[WHATSAPP_TEMPLATES_DELETE] Failed to delete template", { storeId, error });
        return NextResponse.json({ error: "Failed to delete template" }, { status: 500 });
    }
});
