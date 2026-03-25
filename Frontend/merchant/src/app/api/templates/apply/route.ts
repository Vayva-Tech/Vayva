import { NextRequest, NextResponse } from "next/server";
import { buildBackendAuthHeaders } from "@/lib/backend-proxy";
import { logger } from "@/lib/logger";
import { TEMPLATE_REGISTRY } from "@/lib/templates-registry";
import { checkRateLimitCustom } from "@/lib/rate-limit";
import { FlagService } from "@/lib/flags/flagService";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

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
        const auth = await buildBackendAuthHeaders(req);
        if (!auth?.user?.storeId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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
        
        // Call backend API to apply template
        const result = await apiJson<{
            success: boolean;
            templateId: string;
            message?: string;
        }>(
            `${process.env.BACKEND_API_URL}/api/templates/apply`,
            {
                method: "POST",
                headers: auth.headers,
                body: JSON.stringify({ templateId }),
            }
        );
        
        return NextResponse.json(result);
    } catch (error: unknown) {
        handleApiError(
            error,
            {
                endpoint: "/api/templates/apply",
                operation: "APPLY_TEMPLATE",
                storeId,
            }
        );
        throw error;
    }
}
