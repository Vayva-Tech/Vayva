import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { TEMPLATE_REGISTRY } from "@/lib/templates/index";
import { checkRateLimitCustom } from "@/lib/ratelimit";
import { FlagService } from "@/lib/flags/flagService";
import { logger } from "@/lib/logger";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function getSettingsObject(value: unknown): Record<string, unknown> {
  return isRecord(value) ? value : {};
}

function isTemplateRegistryKey(
  value: string,
): value is keyof typeof TEMPLATE_REGISTRY {
  return value in TEMPLATE_REGISTRY;
}

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

function isPlanTier(value: unknown): value is PlanTier {
  return value === "free" || value === "growth" || value === "pro";
}
// Hardcoded map removed in favor of TEMPLATE_REGISTRY
// to ensure single source of truth
export async function POST(req: NextRequest) {
  try {
    // 1. Auth & Permission Check
    const { checkPermission } = await import("@/lib/team/rbac");
    const { PERMISSIONS } = await import("@/lib/team/permissions");
    const session = await checkPermission(PERMISSIONS.TEMPLATES_MANAGE);
    const user = session.user;
    const userId = user.id;
    const storeId = user.storeId;
    if (!storeId) {
      return NextResponse.json(
        { error: "No active store found for user" },
        { status: 400 },
      );
    }
    // Kill Switch & Rate Limit
    const isEnabled = await FlagService.isEnabled("templates.enabled", {
      merchantId: storeId,
    });
    if (!isEnabled) {
      return NextResponse.json(
        { error: "Template switching is temporarily disabled" },
        { status: 503 },
      );
    }
    await checkRateLimitCustom(userId, "template_apply", 5, 3600);
    const body = getSettingsObject(await req.json().catch(() => ({})));
    const templateId = getString(body.templateId);
    if (!templateId) {
      return NextResponse.json(
        { error: "Missing templateId" },
        { status: 400 },
      );
    }
    if (!isTemplateRegistryKey(templateId)) {
      return NextResponse.json(
        { error: "TEMPLATE_NOT_FOUND" },
        { status: 404 },
      );
    }
    const template = TEMPLATE_REGISTRY[templateId];
    const requiredPlan = template?.requiredPlan;
    if (!isPlanTier(requiredPlan)) {
      return NextResponse.json(
        { error: "TEMPLATE_NOT_FOUND" },
        { status: 404 },
      );
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
      const requiredDisplay =
        requiredPlan.charAt(0).toUpperCase() + requiredPlan.slice(1);
      return NextResponse.json(
        {
          error: "TEMPLATE_LOCKED",
          requiredPlan,
          currentPlan,
          message: `Upgrade to ${requiredDisplay} to unlock this template`,
        },
        { status: 403 },
      );
    }
    // 4. Verification Passed - Idempotent Apply
    const currentSettings = getSettingsObject(store.settings);
    const activeTemplate =
      typeof currentSettings.templateId === "string"
        ? currentSettings.templateId
        : undefined;
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
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : String(error);
    logger.error("[TEMPLATES_APPLY_POST]", error);
    if (error instanceof Error && errMsg === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof Error && errMsg.startsWith("Forbidden")) {
      return NextResponse.json({ error: errMsg }, { status: 403 });
    }
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
