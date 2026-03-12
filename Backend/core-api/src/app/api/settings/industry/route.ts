import { NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { INDUSTRY_CONFIG } from "@/config/industry";
import { IndustrySlug } from "@/lib/templates/types";

import { logger } from "@/lib/logger";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

export const GET = withVayvaAPI(
  PERMISSIONS.ACCOUNT_VIEW,
  async (req, { storeId }) => {
    try {
      const store = await prisma.store.findUnique({
        where: { id: storeId },
        select: { industrySlug: true },
      });

      if (!store) {
        return NextResponse.json({ error: "Store not found" }, { status: 404 });
      }

      const industrySlug = store.industrySlug as IndustrySlug | null;
      const config = industrySlug ? INDUSTRY_CONFIG[industrySlug] : null;

      return NextResponse.json(
        {
          industrySlug,
          config: config
            ? {
                displayName: config.displayName,
                primaryObject: config.primaryObject,
                modules: config.modules,
                moduleLabels: config.moduleLabels,
              }
            : null,
        },
        {
          headers: {
            "Cache-Control": "no-store",
          },
        },
      );
    } catch (error: unknown) {
      logger.error("[SETTINGS_INDUSTRY_GET]", error, { storeId });
      return NextResponse.json(
        { error: "Internal Server Error" },
        {
          status: 500,
          headers: {
            "Cache-Control": "no-store",
          },
        },
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
      const industrySlug = getString(body.industrySlug);

      // Validate industry slug
      if (!industrySlug || !INDUSTRY_CONFIG[industrySlug as IndustrySlug]) {
        return NextResponse.json(
          { error: "Invalid industry slug" },
          { status: 400 },
        );
      }

      // Update store
      const updatedStore = await prisma.store.update({
        where: { id: storeId },
        data: { industrySlug },
        select: { id: true, industrySlug: true },
      });

      const config = INDUSTRY_CONFIG[industrySlug as IndustrySlug];

      return NextResponse.json({
        success: true,
        industrySlug: updatedStore.industrySlug,
        config: {
          displayName: config.displayName,
          primaryObject: config.primaryObject,
          modules: config.modules,
        },
      });
    } catch (error: unknown) {
      logger.error("[SETTINGS_INDUSTRY_POST]", error, {
        storeId,
        userId: user.id,
      });
      return NextResponse.json(
        { error: "Internal Server Error" },
        { status: 500 },
      );
    }
  },
);
