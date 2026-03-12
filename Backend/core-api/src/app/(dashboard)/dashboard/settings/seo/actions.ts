"use server";

import { prisma } from "@vayva/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { logger } from "@/lib/logger";

interface SeoData {
  seoTitle?: string | null;
  seoDescription?: string | null;
  socialImage?: string | null;
}

export async function updateStoreSeo(
  data: SeoData,
): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.storeId) {
      return { success: false, error: "Unauthorized" };
    }

    const storeId = session.user.storeId;

    const store = await prisma.store.findUnique({
      where: { id: storeId },
      select: { settings: true },
    });

    if (!store) {
      return { success: false, error: "Store not found" };
    }

    const currentSettings =
      typeof store.settings === "object" && store.settings !== null
        ? (store.settings as Record<string, unknown>)
        : {};

    await prisma.store.update({
      where: { id: storeId },
      data: {
        settings: {
          ...currentSettings,
          seoTitle: data.seoTitle ?? null,
          seoDescription: data.seoDescription ?? null,
          socialImage: data.socialImage ?? null,
        },
      },
    });

    return { success: true };
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : String(error);
    logger.error("[SEO_ACTIONS_UPDATE_ERROR]", { error: errMsg });
    return { success: false, error: "Failed to update SEO settings" };
  }
}
