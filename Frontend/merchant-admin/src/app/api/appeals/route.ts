import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger } from "@/lib/logger";

interface Appeal {
  id: string;
  status: string;
  createdAt: string;
  createdBy: string;
  severity: string;
  channel?: string;
  reason: string;
  message: string;
  customerEmail?: string;
  customerPhone?: string;
  evidenceUrls: string[];
  history: Array<{
    at: string;
    by: string;
    type: string;
    status: string;
    notes: string;
  }>;
}

interface StoreSettings {
  appeals?: Appeal[];
  warnings?: unknown[];
  restrictions?: {
    ordersDisabled?: boolean;
    productsDisabled?: boolean;
    marketingDisabled?: boolean;
    settingsEditsDisabled?: boolean;
    salesDisabled?: boolean;
    paymentsDisabled?: boolean;
    uploadsDisabled?: boolean;
    aiDisabled?: boolean;
  };
}

export const GET = withVayvaAPI(PERMISSIONS.SUPPORT_VIEW, async (req: NextRequest, { storeId }: { storeId: string }) => {
    try {
        const store = await prisma.store?.findUnique({
            where: { id: storeId },
            select: {
                id: true,
                settings: true,
            },
        });

        if (!store) {
            return NextResponse.json({ error: "Store not found" }, { status: 404 });
        }

        const settings = (store.settings as StoreSettings | null) ?? {};
        const appeals = Array.isArray(settings.appeals) ? settings.appeals : [];
        const warnings = Array.isArray(settings.warnings) ? settings.warnings : [];

        // Get current restrictions (assuming stored in settings or separate field)
        const restrictions = settings.restrictions ?? {};

        return NextResponse.json({
            success: true,
            data: {
                appeals,
                warnings,
                restrictions: {
                    ordersDisabled: restrictions.ordersDisabled || false,
                    productsDisabled: restrictions.productsDisabled || false,
                    marketingDisabled: restrictions.marketingDisabled || false,
                    settingsEditsDisabled: restrictions.settingsEditsDisabled || false,
                    salesDisabled: restrictions.salesDisabled || false,
                    paymentsDisabled: restrictions.paymentsDisabled || false,
                    uploadsDisabled: restrictions.uploadsDisabled || false,
                    aiDisabled: restrictions.aiDisabled || false,
                }
            }
        }, {
            headers: {
                "Cache-Control": "no-store",
            },
        });
    } catch (error: unknown) {
        const err = error instanceof Error ? error : new Error(String(error));
        logger.error("[APPEALS_GET] Failed to fetch appeals", { storeId, error: err.message });
        return NextResponse.json({ error: "Failed to fetch appeals" }, { status: 500 });
    }
});

export const POST = withVayvaAPI(PERMISSIONS.SUPPORT_MANAGE, async (req: NextRequest, { storeId, user }: { storeId: string; user: { id: string } }) => {
    try {
        const body = await req.json().catch(() => ({}));
        const { reason, message, channel, customerEmail, customerPhone, evidenceUrls } = body;

        if (!reason || reason.length < 10) {
            return NextResponse.json(
                { error: "Reason must be at least 10 characters" },
                { status: 400 }
            );
        }

        if (!message || message.length < 5) {
            return NextResponse.json(
                { error: "Message must be at least 5 characters" },
                { status: 400 }
            );
        }

        const store = await prisma.store?.findUnique({
            where: { id: storeId },
            select: { id: true, name: true, settings: true },
        });

        if (!store) {
            return NextResponse.json({ error: "Store not found" }, { status: 404 });
        }

        const prevSettings = (store.settings as StoreSettings | null) ?? {};
        const prevAppeals = Array.isArray(prevSettings.appeals) ? prevSettings.appeals : [];

        const appealId = `appeal_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
        const nowIso = new Date().toISOString();

        const appeal: Appeal = {
            id: appealId,
            status: "CREATED",
            createdAt: nowIso,
            createdBy: "merchant", // Since it's from merchant side
            severity: "MEDIUM", // Default
            channel: channel || undefined,
            reason,
            message,
            customerEmail: customerEmail || undefined,
            customerPhone: customerPhone || undefined,
            evidenceUrls: Array.isArray(evidenceUrls) ? evidenceUrls : [],
            history: [
                {
                    at: nowIso,
                    by: "merchant",
                    type: "SUBMITTED",
                    status: "CREATED",
                    notes: message,
                },
            ],
        };

        const nextSettings = {
            ...prevSettings,
            appeals: [...prevAppeals, appeal],
        };

        await prisma.store?.update({
            where: { id: storeId },
            data: { settings: nextSettings as any },
        });

        return NextResponse.json({
            success: true,
            appeal
        });
    } catch (error: unknown) {
        const err = error instanceof Error ? error : new Error(String(error));
        logger.error("[APPEALS_POST] Failed to submit appeal", { storeId, error: err.message });
        return NextResponse.json({ error: "Failed to submit appeal" }, { status: 500 });
    }
});
