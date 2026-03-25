import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { z } from "zod";
import { logger } from "@/lib/logger";

const DeliverySettingsSchema = z.object({
  isEnabled: z.boolean(),
  provider: z.enum(["CUSTOM", "KWIK"]),
  pickupName: z.string().min(2).optional().nullable(),
  pickupPhone: z.string().min(7).optional().nullable(),
  pickupAddressLine1: z.string().min(5).optional().nullable(),
  pickupCity: z.string().min(2).optional().nullable(),
  pickupState: z.string().min(2).optional().nullable(),

  // Store defaults for payment policy (used by UI; dispatch can override per-order)
  codEnabledByDefault: z.boolean().optional(),
  codIncludesDeliveryByDefault: z.boolean().optional(),
  deliveryFeePayerDefault: z.enum(["CUSTOMER", "MERCHANT"]).optional(),
});

export const GET = withVayvaAPI(
  PERMISSIONS.ACCOUNT_VIEW,
  async (_req: NextRequest, { storeId }) => {
    try {
      const settings = await prisma.storeDeliverySettings.findUnique({
        where: { storeId },
      });

      // UI defaults live inside Store.settings to avoid schema migrations
      const store = await prisma.store.findUnique({
        where: { id: storeId },
        select: { settings: true },
      });
      const s = (store?.settings && typeof store.settings === "object"
        ? (store.settings as Record<string, unknown>)
        : {}) as Record<string, unknown>;
      const deliveryPolicy =
        s.deliveryPolicy && typeof s.deliveryPolicy === "object"
          ? (s.deliveryPolicy as Record<string, unknown>)
          : {};

      return NextResponse.json(
        {
          isEnabled: settings?.isEnabled ?? false,
          provider: (settings?.provider ?? "CUSTOM") as "CUSTOM" | "KWIK",
          pickupName: settings?.pickupName ?? null,
          pickupPhone: settings?.pickupPhone ?? null,
          pickupAddressLine1: settings?.pickupAddressLine1 ?? null,
          pickupCity: settings?.pickupCity ?? null,
          pickupState: settings?.pickupState ?? null,

          codEnabledByDefault: Boolean(deliveryPolicy.codEnabledByDefault),
          codIncludesDeliveryByDefault: Boolean(
            deliveryPolicy.codIncludesDeliveryByDefault,
          ),
          deliveryFeePayerDefault:
            deliveryPolicy.deliveryFeePayerDefault === "MERCHANT"
              ? "MERCHANT"
              : "CUSTOMER",
        },
        { headers: { "Cache-Control": "no-store" } },
      );
    } catch (e) {
      logger.error("[SETTINGS_DELIVERY_GET]", e, { storeId });
      return NextResponse.json(
        { success: false, error: "Failed to load delivery settings" },
        { status: 500 },
      );
    }
  },
);

export const POST = withVayvaAPI(
  PERMISSIONS.ACCOUNT_MANAGE,
  async (req: NextRequest, { storeId }) => {
    try {
      const parsedBody: unknown = await req.json().catch(() => ({}));
      const parsed = DeliverySettingsSchema.safeParse(parsedBody);
      if (!parsed.success) {
        return NextResponse.json(
          { success: false, error: "Invalid input", details: parsed.error.flatten() },
          { status: 400 },
        );
      }

      const body = parsed.data;

      await prisma.storeDeliverySettings.upsert({
        where: { storeId },
        create: {
          storeId,
          isEnabled: body.isEnabled,
          provider: body.provider,
          pickupName: body.pickupName ?? null,
          pickupPhone: body.pickupPhone ?? null,
          pickupAddressLine1: body.pickupAddressLine1 ?? null,
          pickupCity: body.pickupCity ?? null,
          pickupState: body.pickupState ?? null,
        },
        update: {
          isEnabled: body.isEnabled,
          provider: body.provider,
          pickupName: body.pickupName ?? null,
          pickupPhone: body.pickupPhone ?? null,
          pickupAddressLine1: body.pickupAddressLine1 ?? null,
          pickupCity: body.pickupCity ?? null,
          pickupState: body.pickupState ?? null,
        },
      });

      // Persist UI policy defaults into Store.settings JSON (no DB migration)
      const store = await prisma.store.findUnique({
        where: { id: storeId },
        select: { settings: true },
      });
      const current =
        store?.settings && typeof store.settings === "object"
          ? (store.settings as Record<string, unknown>)
          : {};

      const next = {
        ...current,
        deliveryPolicy: {
          ...(typeof (current as any).deliveryPolicy === "object"
            ? (current as any).deliveryPolicy
            : {}),
          codEnabledByDefault: Boolean(body.codEnabledByDefault),
          codIncludesDeliveryByDefault: Boolean(
            body.codIncludesDeliveryByDefault,
          ),
          deliveryFeePayerDefault:
            body.deliveryFeePayerDefault === "MERCHANT" ? "MERCHANT" : "CUSTOMER",
        },
      };

      await prisma.store.update({
        where: { id: storeId },
        data: { settings: next as any },
      });

      return NextResponse.json({ success: true });
    } catch (e) {
      logger.error("[SETTINGS_DELIVERY_POST]", e, { storeId });
      return NextResponse.json(
        { success: false, error: "Failed to update delivery settings" },
        { status: 500 },
      );
    }
  },
);

