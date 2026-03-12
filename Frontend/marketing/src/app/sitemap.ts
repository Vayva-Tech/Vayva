import { urls } from "@vayva/shared";
import { MetadataRoute } from "next";
import { prisma } from "@vayva/db";

const SITE_ORIGIN = process.env.NEXT_PUBLIC_SITE_URL || "https://vayva.ng";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const corePages = [
    "",
    "/pricing",
    "/features",
    "/about",
    "/contact",
    "/legal",
    "/help",
  ].map((p) => ({
    url: `${SITE_ORIGIN}${p}`,
    lastModified: new Date(),
    changeFrequency: (p === "" ? "daily" : "weekly") as "daily" | "weekly",
    priority: p === "" ? 1 : 0.8,
  }));

  let merchantPages: MetadataRoute.Sitemap = [];
  try {
    if (!process.env.DATABASE_URL) {
      console.warn(
        "Skipping merchant sitemap generation: DATABASE_URL not set",
      );
    } else {
      const merchants = await prisma.store.findMany({
        where: { isLive: true },
        select: { slug: true, updatedAt: true },
        take: 5000,
      });

      merchantPages = merchants.map((m) => ({
        url: urls.storefrontHost(m.slug),
        lastModified: m.updatedAt,
        changeFrequency: "daily" as const,
        priority: 0.9,
      }));
    }
  } catch (error: unknown) {
    console.error("Failed to fetch merchant slugs for sitemap:", error);
  }

  return [...corePages, ...merchantPages];
}
