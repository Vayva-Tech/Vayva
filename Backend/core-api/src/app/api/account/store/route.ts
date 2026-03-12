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

function getBoolean(value: unknown): boolean | undefined {
  return typeof value === "boolean" ? value : undefined;
}

function getAddress(value: unknown): Record<string, unknown> {
  return isRecord(value) ? value : {};
}

function toInputJsonValue(value: unknown): Prisma.InputJsonValue | undefined {
  if (value === null) return undefined;
  const t = typeof value;
  if (t === "string" || t === "number" || t === "boolean") return value;
  if (Array.isArray(value)) {
    const coerced = value
      .map((v) => toInputJsonValue(v))
      .filter((v): v is Prisma.InputJsonValue => v !== undefined);
    return coerced as Prisma.InputJsonValue;
  }
  if (isRecord(value)) {
    const obj: Record<string, Prisma.InputJsonValue> = {};
    for (const [k, v] of Object.entries(value)) {
      const coerced = toInputJsonValue(v);
      if (coerced !== undefined) obj[k] = coerced;
    }
    return obj as Prisma.InputJsonObject;
  }
  return undefined;
}

export const GET = withVayvaAPI(
  PERMISSIONS.ACCOUNT_VIEW,
  async (req, { storeId }) => {
    try {
      const store = await prisma.store.findUnique({
        where: { id: storeId },
        select: {
          name: true,
          slug: true,
          category: true,
          logoUrl: true,
          settings: true,
        },
      });

      if (!store) {
        return NextResponse.json({ error: "Store not found" }, { status: 404 });
      }

      const settings = getSettingsObject(store.settings);
      const address = getAddress(settings.address);

      const profile = {
        name: store.name || "",
        slug: store.slug || "",
        businessType: store.category || "general",
        description: getString(settings.description) || "",
        supportEmail: getString(settings.supportEmail) || "",
        supportPhone: getString(settings.supportPhone) || "",
        logoUrl: store.logoUrl || "",
        whatsappNumber: getString(settings.whatsappNumber) || "",
        address: {
          street: getString(address.street) || "",
          city: getString(address.city) || "",
          state: getString(address.state) || "",
          country: getString(address.country) || "Nigeria",
          landmark: getString(address.landmark) || "",
        },
        isActive: getBoolean(settings.isActive) !== false,
        operatingHours: isRecord(settings.operatingHours)
          ? settings.operatingHours
          : {
              Monday: { isClosed: false, open: "08:00", close: "18:00" },
              Tuesday: { isClosed: false, open: "08:00", close: "18:00" },
              Wednesday: { isClosed: false, open: "08:00", close: "18:00" },
              Thursday: { isClosed: false, open: "08:00", close: "18:00" },
              Friday: { isClosed: false, open: "08:00", close: "18:00" },
              Saturday: { isClosed: false, open: "08:00", close: "18:00" },
              Sunday: { isClosed: true },
            },
      };

      return NextResponse.json(profile, {
        headers: {
          "Cache-Control": "no-store",
        },
      });
    } catch (error: unknown) {
      logger.error("[STORE_PROFILE_GET]", error, { storeId });
      return NextResponse.json(
        { error: "Failed to fetch store profile" },
        { status: 500, headers: { "Cache-Control": "no-store" } },
      );
    }
  },
);

export const POST = withVayvaAPI(
  PERMISSIONS.ACCOUNT_MANAGE,
  async (req, { storeId, user }) => {
    try {
      const parsedBody: unknown = await req.json().catch(() => ({}));
      const body = isRecord(parsedBody) ? parsedBody : {};

      const name = getString(body.name);
      const businessType = getString(body.businessType);
      const description = getString(body.description);
      const supportEmail = getString(body.supportEmail);
      const supportPhone = getString(body.supportPhone);
      const whatsappNumber = getString(body.whatsappNumber);
      const address = isRecord(body.address) ? body.address : undefined;
      const isActive = getBoolean(body.isActive);
      const operatingHours = isRecord(body.operatingHours)
        ? body.operatingHours
        : undefined;

      // Validation
      if (!name || name.trim().length === 0) {
        return NextResponse.json(
          { error: "Store name is required" },
          { status: 400 },
        );
      }

      if (supportEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(supportEmail)) {
        return NextResponse.json(
          { error: "Invalid email format" },
          { status: 400 },
        );
      }

      // Get current store to merge settings
      const currentStore = await prisma.store.findUnique({
        where: { id: storeId },
        select: { settings: true },
      });

      const currentSettings = getSettingsObject(
        currentStore?.settings,
      ) as Prisma.InputJsonObject;

      const addressJson = address ? toInputJsonValue(address) : undefined;
      const operatingHoursJson = operatingHours
        ? toInputJsonValue(operatingHours)
        : undefined;

      // Merge settings
      const updatedSettings: Prisma.InputJsonObject = {
        ...currentSettings,
        description,
        supportEmail,
        supportPhone,
        whatsappNumber,
        address: addressJson,
        isActive,
        operatingHours: operatingHoursJson,
      };

      // Update store
      await prisma.store.update({
        where: { id: storeId },
        data: {
          name: name.trim(),
          category: businessType,
          settings: updatedSettings,
        },
      });

      return NextResponse.json({
        message: "Store profile updated successfully",
      });
    } catch (error: unknown) {
      logger.error("[STORE_PROFILE_PUT]", error, { storeId, userId: user.id });
      return NextResponse.json(
        { error: "Failed to update store profile" },
        { status: 500 },
      );
    }
  },
);
