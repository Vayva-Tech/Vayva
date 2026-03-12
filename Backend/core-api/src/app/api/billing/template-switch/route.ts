import { NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { prisma } from "@/lib/db";
import { PERMISSIONS } from "@/lib/team/permissions";
import {
  calculateTemplateSwitchPrice,
  formatPrice,
  normalizePlan,
} from "@/lib/templates/pricing";
import { randomUUID } from "crypto";
import { Paystack } from "@vayva/payments";
import { logger } from "@/lib/logger";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

export const runtime = "nodejs";

export const POST = withVayvaAPI(
  PERMISSIONS.BILLING_MANAGE,
  async (req, { storeId, user }) => {
    try {
      const parsedBody: unknown = await req.json().catch(() => ({}));
      const body = isRecord(parsedBody) ? parsedBody : {};
      const templateId = getString(body.templateId);

      if (!templateId) {
        return NextResponse.json(
          { error: "Template ID required" },
          { status: 400 },
        );
      }

      // Get store details
      const store = await prisma.store.findUnique({
        where: { id: storeId },
        select: {
          plan: true,
          firstTemplateSelectedAt: true,
          currentTemplateId: true,
        },
      });

      if (!store) {
        return NextResponse.json({ error: "Store not found" }, { status: 404 });
      }

      // Get template details
      const template = await prisma.templateManifest.findUnique({
        where: { id: templateId },
        select: {
          id: true,
          name: true,
        },
      });

      if (!template) {
        return NextResponse.json(
          { error: "Template not found" },
          { status: 404 },
        );
      }

      // Normalize plan tiers
      const storePlan = normalizePlan(store.plan);
      const templateTier = storePlan;

      // Calculate pricing
      const pricing = calculateTemplateSwitchPrice(
        storePlan,
        store.currentTemplateId,
        templateId,
        templateTier,
        store.firstTemplateSelectedAt,
      );

      // If no payment required, apply template directly
      if (!pricing.requiresPayment) {
        await applyTemplateToStore(storeId, templateId);

        return NextResponse.json({
          success: true,
          requiresPayment: false,
          message: "Template applied successfully",
        });
      }

      // Create TemplateSwitch record
      const switchId = randomUUID();
      await prisma.templateSwitch.create({
        data: {
          id: switchId,
          storeId,
          fromTemplateId: store.currentTemplateId,
          toTemplateId: templateId,
          storePlan,
          templateTier,
          chargedAmount: pricing.amount,
          paymentStatus: "pending",
          paymentReference: switchId,
        },
      });

      // Initialize Paystack payment via canonical module
      const init = await Paystack.initializeTransaction({
        email: user.email,
        amountKobo: pricing.amount,
        reference: switchId,
        callbackUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/control-center/payment-success`,
        metadata: {
          storeId,
          templateId,
          type: "template_switch",
          storePlan,
          templateTier,
        },
      });

      return NextResponse.json(
        {
          success: true,
          requiresPayment: true,
          amount: pricing.amount,
          amountFormatted: formatPrice(pricing.amount),
          paymentUrl: init.authorizationUrl,
          switchId,
        },
        { headers: { "Cache-Control": "no-store" } },
      );
    } catch (error: unknown) {
      const errMsg = error instanceof Error ? error.message : String(error);
      const _errStack = error instanceof Error ? error.stack : undefined;
      logger.error("[TEMPLATE_SWITCH_POST]", error, { storeId });
      return NextResponse.json(
        { error: errMsg || "Failed to process template switch" },
        { status: 500, headers: { "Cache-Control": "no-store" } },
      );
    }
  },
);

async function applyTemplateToStore(storeId: string, templateId: string) {
  const now = new Date();

  await prisma.store.update({
    where: { id: storeId },
    data: {
      currentTemplateId: templateId,
    },
  });

  await prisma.store.updateMany({
    where: { id: storeId, firstTemplateSelectedAt: null },
    data: { firstTemplateSelectedAt: now },
  });

  // Update or create draft
  await prisma.storefrontDraft.upsert({
    where: { storeId },
    create: {
      storeId,
      activeTemplateId: templateId,
      themeConfig: {},
      sectionConfig: {},
      sectionOrder: [],
      assets: {},
    },
    update: {
      activeTemplateId: templateId,
    },
  });
}
