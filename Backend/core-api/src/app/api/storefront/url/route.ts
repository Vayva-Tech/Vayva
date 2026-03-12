import { urls } from "@vayva/shared";
import { NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger } from "@/lib/logger";

export const GET = withVayvaAPI(
  [PERMISSIONS.STOREFRONT_VIEW, PERMISSIONS.STOREFRONT_MANAGE],
  async (req, { storeId }) => {
    try {
      const store = await prisma.store.findUnique({
        where: { id: storeId },
        select: { slug: true },
      });
      const slug = store?.slug || "store";
      return NextResponse.json(
        {
          slug,
          url: urls.storefrontHost(slug),
          custom_domain_url: null,
        },
        {
          headers: {
            "Cache-Control": "no-store",
          },
        },
      );
    } catch (error: unknown) {
      logger.error("[STOREFRONT_URL_GET]", error, { storeId });
      const slug = "store";
      return NextResponse.json(
        {
          slug,
          url: urls.storefrontHost(slug),
          custom_domain_url: null,
        },
        {
          headers: {
            "Cache-Control": "no-store",
          },
        },
      );
    }
  },
);
