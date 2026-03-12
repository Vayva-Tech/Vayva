import { NextRequest, NextResponse } from "next/server";
import { Prisma, prisma } from "@vayva/db";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { sanitizeHTML } from "@/lib/input-sanitization";
import { z } from "zod";
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
    return obj as Prisma.InputJsonValue;
  }
  return undefined;
}

const SettingsSchema = z.object({
  name: z.string().min(1).optional(),
  supportEmail: z.string().email().optional(),
  businessCategory: z.string().optional(),
});

export const GET = withVayvaAPI(
  PERMISSIONS.ACCOUNT_VIEW,
  async (req: NextRequest, { storeId, correlationId }) => {
    try {
      const store = await prisma.store.findUnique({
        where: { id: storeId },
        select: {
          name: true,
          category: true,
          settings: true,
        },
      });

      if (!store) {
        return NextResponse.json(
          { error: "Store not found", correlationId },
          { status: 404 },
        );
      }

      const settings = getSettingsObject(store.settings);
      const supportEmail = getString(settings.supportEmail) ?? "";

      return NextResponse.json(
        {
          name: store.name,
          supportEmail,
          businessCategory: store.category,
        },
        {
          headers: {
            "Cache-Control": "no-store",
          },
        },
      );
    } catch (error: unknown) {
      logger.error("[SETTINGS_GET]", error, { storeId });
      return NextResponse.json(
        { error: "Internal server error", correlationId },
        { status: 500 },
      );
    }
  },
);

export const POST = withVayvaAPI(
  PERMISSIONS.ACCOUNT_MANAGE,
  async (req: NextRequest, { storeId, correlationId }) => {
    try {
      const parsedBody: unknown = await req.json().catch(() => ({}));
      const body = isRecord(parsedBody) ? parsedBody : {};
      const parsed = SettingsSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json(
          { error: "Invalid input", correlationId },
          { status: 400 },
        );
      }
      const data = parsed.data;
      const store = await prisma.store.findUnique({
        where: { id: storeId },
        select: { settings: true },
      });

      const currentSettings = getSettingsObject(store?.settings);
      const updatedSettings: Record<string, unknown> = {
        ...currentSettings,
        ...(data.supportEmail && { supportEmail: data.supportEmail }),
      };

      await prisma.store.update({
        where: { id: storeId },
        data: {
          ...(data.name && { name: sanitizeHTML(data.name) }),
          ...(data.businessCategory && {
            category: sanitizeHTML(data.businessCategory || ""),
          }),
          settings: {
            ...(toInputJsonValue(updatedSettings) as
              | Prisma.InputJsonObject
              | undefined),
          },
        },
      });
      return NextResponse.json({ success: true });
    } catch (error: unknown) {
      logger.error("[SETTINGS_POST]", error, { storeId, correlationId });
      return NextResponse.json(
        { error: "Internal server error", correlationId },
        { status: 500 },
      );
    }
  },
);
