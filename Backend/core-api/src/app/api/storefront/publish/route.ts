import { NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger } from "@/lib/logger";

export const POST = withVayvaAPI(
  PERMISSIONS.STOREFRONT_MANAGE,
  async (req, { storeId }) => {
    try {
      // 1. Get current draft
      const draft = await prisma.storefrontDraft.findUnique({
        where: { storeId },
      });
      if (!draft) {
        return NextResponse.json(
          { error: "No unpublished storefront found to publish" },
          { status: 400 },
        );
      }
      // 2. Upsert Published Snapshot
      const published = await prisma.storefrontPublished.upsert({
        where: { storeId },
        create: {
          storeId,
          activeTemplateId: draft.activeTemplateId,
          themeConfig: draft.themeConfig ?? {},
          sectionConfig: draft.sectionConfig ?? {},
          assets: draft.assets ?? {},
          publishedAt: new Date(),
        },
        update: {
          activeTemplateId: draft.activeTemplateId,
          themeConfig: draft.themeConfig ?? {},
          sectionConfig: draft.sectionConfig ?? {},
          assets: draft.assets ?? {},
          publishedAt: new Date(),
        },
      });
      // 3. Update Draft to reflect publish time (optional but good for UI "Saved & Published")
      await prisma.storefrontDraft.update({
        where: { storeId },
        data: {
          publishedAt: new Date(),
        },
      });
      return NextResponse.json({ success: true, published });
    } catch (error) {
      logger.error("[STOREFRONT_PUBLISH_POST]", error, { storeId });
      return NextResponse.json(
        { error: "Internal Server Error" },
        { status: 500 },
      );
    }
  },
);
