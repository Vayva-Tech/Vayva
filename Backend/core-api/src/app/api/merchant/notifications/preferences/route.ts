import { NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { prisma, Prisma } from "@vayva/db";
import { PERMISSIONS } from "@/lib/team/permissions";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

const DEFAULT_PREFS = {
  channels: { in_app: true, banner: true, whatsapp: false, email: true },
  categories: { orders: true, payments: true, account: true, system: true },
  quietHours: { enabled: false, start: "22:00", end: "08:00" },
};
export const GET = withVayvaAPI(
  PERMISSIONS.NOTIFICATIONS_VIEW,
  async (_req, { storeId, user }) => {
    const prefs = await prisma.notificationPreference.findUnique({
      where: { storeId },
    });
    if (!prefs) {
      return NextResponse.json({
        ...DEFAULT_PREFS,
        merchantId: user.id,
      });
    }
    return NextResponse.json(
      {
        channels: prefs.channels,
        categories: prefs.categories,
        quietHours: prefs.quietHours,
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  },
);

export const POST = withVayvaAPI(
  PERMISSIONS.ACCOUNT_MANAGE,
  async (req, { storeId }) => {
    try {
      const parsedBody: unknown = await req.json().catch(() => ({}));
      const body = isRecord(parsedBody) ? parsedBody : {};
      const channels = isRecord(body.channels) ? body.channels : undefined;
      const categories = isRecord(body.categories)
        ? body.categories
        : undefined;
      const quietHours = isRecord(body.quietHours)
        ? body.quietHours
        : undefined;

      const updated = await prisma.notificationPreference.upsert({
        where: { storeId },
        update: {
          channels: channels as Prisma.InputJsonValue,
          categories: categories as Prisma.InputJsonValue,
          quietHours: quietHours as Prisma.InputJsonValue,
        },
        create: {
          storeId,
          channels: (channels ||
            DEFAULT_PREFS.channels) as Prisma.InputJsonValue,
          categories: (categories ||
            DEFAULT_PREFS.categories) as Prisma.InputJsonValue,
          quietHours: (quietHours ||
            DEFAULT_PREFS.quietHours) as Prisma.InputJsonValue,
        },
      });
      return NextResponse.json(updated);
    } catch {
      return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
  },
);
