import { NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

// GET /api/storefront/settings - Get storefront settings
export const GET = withVayvaAPI(
  PERMISSIONS.SETTINGS_VIEW,
  async (req, { storeId }) => {
    try {
      const store = await prisma.store.findUnique({
        where: { id: storeId },
        select: {
          settings: true,
        },
      });

      if (!store) {
        return NextResponse.json(
          { error: "Store not found" },
          { status: 404 },
        );
      }

      // Parse settings or return defaults
      const settings = (store.settings as Record<string, unknown>) || {};
      const storefrontSettings = (settings.storefront as Record<string, unknown>) || {};

      const defaultSettings = {
        requirePhone: true,
        requireEmail: true,
        guestCheckout: true,
        saveCards: true,
        requireTerms: true,
        termsUrl: "",
        privacyUrl: "",
        customCss: "",
        brandColor: "#22C55E",
        logoUrl: "",
        faviconUrl: "",
        receiptEmailTemplate: "default",
        sendReceiptEmail: true,
        sendReceiptWhatsApp: false,
        enableOrderTracking: true,
        enableGuestReviews: true,
      };

      return NextResponse.json(
        { settings: { ...defaultSettings, ...storefrontSettings } },
        {
          headers: {
            "Cache-Control": "no-store",
          },
        },
      );
    } catch (error: unknown) {
      logger.error("[STOREFRONT_SETTINGS_GET]", error, { storeId });
      return NextResponse.json(
        { error: "Failed to load storefront settings" },
        { status: 500 },
      );
    }
  },
);

// PUT /api/storefront/settings - Update storefront settings
export const PUT = withVayvaAPI(
  PERMISSIONS.SETTINGS_MANAGE,
  async (req, { storeId }) => {
    try {
      const body = await req.json();

      const store = await prisma.store.findUnique({
        where: { id: storeId },
        select: { settings: true },
      });

      if (!store) {
        return NextResponse.json(
          { error: "Store not found" },
          { status: 404 },
        );
      }

      const currentSettings = (store.settings as Record<string, unknown>) || {};

      await prisma.store.update({
        where: { id: storeId },
        data: {
          settings: {
            ...currentSettings,
            storefront: body,
          },
        },
      });

      return NextResponse.json(
        { success: true, settings: body },
        {
          headers: {
            "Cache-Control": "no-store",
          },
        },
      );
    } catch (error: unknown) {
      logger.error("[STOREFRONT_SETTINGS_PUT]", error, { storeId });
      return NextResponse.json(
        { error: "Failed to update storefront settings" },
        { status: 500 },
      );
    }
  },
);
