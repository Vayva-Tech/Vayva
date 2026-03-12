import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { TEMPLATE_REGISTRY } from "@/lib/templates-registry";
import { checkRateLimitCustom } from "@/lib/rate-limit";
import { FlagService } from "@/lib/flags/flagService";
const PLAN_HIERARCHY = {
    free: 0,
    growth: 1,
    pro: 2,
};
type PlanTier = keyof typeof PLAN_HIERARCHY;

function canUseTemplate(userPlan: PlanTier, requiredPlan: PlanTier) {
    const u = PLAN_HIERARCHY[userPlan] ?? 0;
    const r = PLAN_HIERARCHY[requiredPlan] ?? 0;
    return u >= r;
}
// Hardcoded map removed in favor of TEMPLATE_REGISTRY
// to ensure single source of truth
export async function POST(req: NextRequest) {
    let storeId: string | undefined;
    try {
        // 1. Auth & Permission Check
        const { checkPermission } = await import("@/lib/team/rbac");
        const { PERMISSIONS } = await import("@/lib/team/permissions");
        const session = await checkPermission(PERMISSIONS.TEMPLATES_MANAGE);
        const user = session.user;
        const userId = user.id;
        storeId = user.storeId;
        if (!storeId) {
            return NextResponse.json({ error: "No active store found for user" }, { status: 400 });
        }
        // Kill Switch & Rate Limit
        const isEnabled = await FlagService.isEnabled("templates.enabled", {
            merchantId: storeId,
        });
        if (!isEnabled) {
            return NextResponse.json({ error: "Template switching is temporarily disabled" }, { status: 503 });
        }
        await checkRateLimitCustom(userId, "template_apply", 5, 3600);
        const body = await req.json();
        const { templateId } = body;
        if (!templateId) {
            return NextResponse.json({ error: "Missing templateId" }, { status: 400 });
        }
        const template = TEMPLATE_REGISTRY[templateId as keyof typeof TEMPLATE_REGISTRY] as { requiredPlan?: PlanTier } | undefined;
        const requiredPlan = template?.requiredPlan;
        if (!requiredPlan) {
            return NextResponse.json({ error: "TEMPLATE_NOT_FOUND" }, { status: 404 });
        }
        // 2. Resolve Plan Tier from DB
        const store = await prisma.store.findUnique({
            where: { id: storeId },
        });
        if (!store) {
            return NextResponse.json({ error: "Store not found" }, { status: 404 });
        }
        // Determine effective plan
        let dbPlan = "free";
        if (store.plan) {
            dbPlan = store.plan.toLowerCase();
        }
        // Normalize to free/growth/pro
        let currentPlan: PlanTier = "free";
        switch (dbPlan) {
            case "free":
                currentPlan = "free";
                break;
            case "growth":
                currentPlan = "growth";
                break;
            case "pro":
                currentPlan = "pro";
                break;
            case "business":
                currentPlan = "pro";
                break;
            case "enterprise":
                currentPlan = "pro";
                break;
        }
        // 3. Enforcement
        if (!canUseTemplate(currentPlan, requiredPlan)) {
            // Capitalize for display in message if desired, but payload strictly lowercase
            const requiredDisplay = requiredPlan.charAt(0).toUpperCase() + requiredPlan.slice(1);
            return NextResponse.json({
                error: "TEMPLATE_LOCKED",
                requiredPlan,
                currentPlan,
                message: `Upgrade to ${requiredDisplay} to unlock this template`,
            }, { status: 403 });
        }
        // 4. Verification Passed - Idempotent Apply
        const currentSettings = (store.settings && typeof store.settings === "object"
            ? (store.settings as Record<string, unknown>)
            : {}) as Record<string, unknown>;
        const activeTemplate = typeof currentSettings.templateId === "string" ? currentSettings.templateId : undefined;
        if (activeTemplate === templateId) {
            return NextResponse.json({
                success: true,
                message: "Template already active",
            });
        }
        await prisma.store.update({
            where: { id: storeId },
            data: {
                settings: {
                    ...currentSettings,
                    templateId: templateId,
                },
            },
        });
        return NextResponse.json({ success: true, templateId });
    }
    catch (error: unknown) {
        const err = error instanceof Error ? error : new Error(String(error));
        logger.error("[TEMPLATE_APPLY_POST] Failed to apply template", { storeId, error: err.message });
        if (error instanceof Error && error.message === "Unauthorized") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        if (error instanceof Error && error.message.startsWith("Forbidden")) {
            return NextResponse.json({ error: error.message }, { status: 403 });
        }
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
