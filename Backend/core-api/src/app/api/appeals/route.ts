import { NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { Prisma, prisma } from "@vayva/db";
import { logger } from "@/lib/logger";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function getSettingsObject(settings: unknown): Record<string, unknown> {
  return isRecord(settings) ? settings : {};
}

function getString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

export const GET = withVayvaAPI(
  PERMISSIONS.SUPPORT_VIEW,
  async (req, { storeId }) => {
    try {
      const store = await prisma.store.findUnique({
        where: { id: storeId },
        select: {
          id: true,
          settings: true,
        },
      });

      if (!store) {
        return NextResponse.json({ error: "Store not found" }, { status: 404 });
      }

      const settings = getSettingsObject(store.settings);
      const appeals = Array.isArray(settings.appeals) ? settings.appeals : [];
      const warnings = Array.isArray(settings.warnings)
        ? settings.warnings
        : [];

      // Get current restrictions (assuming stored in settings or separate field)
      const restrictions = isRecord(settings.restrictions)
        ? settings.restrictions
        : {};

      return NextResponse.json(
        {
          success: true,
          data: {
            appeals,
            warnings,
            restrictions: {
              ordersDisabled: restrictions.ordersDisabled === true,
              productsDisabled: restrictions.productsDisabled === true,
              marketingDisabled: restrictions.marketingDisabled === true,
              settingsEditsDisabled:
                restrictions.settingsEditsDisabled === true,
              salesDisabled: restrictions.salesDisabled === true,
              paymentsDisabled: restrictions.paymentsDisabled === true,
              uploadsDisabled: restrictions.uploadsDisabled === true,
              aiDisabled: restrictions.aiDisabled === true,
            },
          },
        },
        {
          headers: {
            "Cache-Control": "no-store",
          },
        },
      );
    } catch (error: unknown) {
      logger.error("[APPEALS_GET]", error, { storeId });
      return NextResponse.json(
        { error: "Failed to fetch appeals" },
        { status: 500 },
      );
    }
  },
);

export const POST = withVayvaAPI(
  PERMISSIONS.SUPPORT_MANAGE,
  async (req, { storeId, user }) => {
    try {
      const parsedBody: unknown = await req.json().catch(() => ({}));
      const body = isRecord(parsedBody) ? parsedBody : {};

      const reason = getString(body.reason);
      const message = getString(body.message);
      const channel = getString(body.channel);
      const customerEmail = getString(body.customerEmail);
      const customerPhone = getString(body.customerPhone);
      const evidenceUrls = Array.isArray(body.evidenceUrls)
        ? body.evidenceUrls
        : [];

      if (!reason || reason.length < 10) {
        return NextResponse.json(
          { error: "Reason must be at least 10 characters" },
          { status: 400 },
        );
      }

      if (!message || message.length < 5) {
        return NextResponse.json(
          { error: "Message must be at least 5 characters" },
          { status: 400 },
        );
      }

      const store = await prisma.store.findUnique({
        where: { id: storeId },
        select: { id: true, name: true, settings: true },
      });

      if (!store) {
        return NextResponse.json({ error: "Store not found" }, { status: 404 });
      }

      const prevSettings = getSettingsObject(store.settings);
      const prevAppeals = Array.isArray(prevSettings.appeals)
        ? prevSettings.appeals
        : [];

      const appealId = `appeal_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      const nowIso = new Date().toISOString();

      const appeal = {
        id: appealId,
        status: "OPEN",
        createdAt: nowIso,
        createdBy: "merchant", // Since it's from merchant side
        severity: "MEDIUM", // Default
        channel: channel || undefined,
        reason,
        message,
        customerEmail: customerEmail || undefined,
        customerPhone: customerPhone || undefined,
        evidenceUrls,
        history: [
          {
            at: nowIso,
            by: "merchant",
            type: "SUBMITTED",
            status: "OPEN",
            notes: message,
          },
        ],
      };

      const nextSettings = {
        ...prevSettings,
        appeals: [...prevAppeals, appeal],
      };

      await prisma.store.update({
        where: { id: storeId },
        data: { settings: nextSettings as Prisma.InputJsonValue },
      });

      return NextResponse.json({
        success: true,
        appeal,
      });
    } catch (error: unknown) {
      logger.error("[APPEALS_POST]", error, { storeId, userId: user.id });
      return NextResponse.json(
        { error: "Failed to submit appeal" },
        { status: 500 },
      );
    }
  },
);
