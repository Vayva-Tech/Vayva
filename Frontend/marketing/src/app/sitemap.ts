import { urls } from "@vayva/shared";
import { MetadataRoute } from "next";
import { prisma } from "@vayva/db";
import { industriesContent } from "@/data/marketing-content";

const MARKETING_ROUTES = [
  "",
  "/pricing",
  "/checkout",
  "/checkout/confirm",
  "/about",
  "/contact",
  "/legal",
  "/help",
  "/templates",
  "/ai-agent",
  "/trust",
  "/how-vayva-works",
  "/all-features",
  "/autopilot",
  "/system-status",
];

function isDatabaseUnreachableError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const e = error as { code?: string; message?: string };
  if (e.code === "P1001" || e.code === "P1000") return true;
  const m = e.message ?? "";
  return /Can't reach database|connection (refused|timeout)|ECONNREFUSED|ENOTFOUND|P1001|P1000/i.test(
    m,
  );
}

const LEGAL_ROUTES = [
  "/legal/terms",
  "/legal/privacy",
  "/legal/cookies",
  "/legal/security",
  "/legal/accessibility",
  "/legal/refund-policy",
  "/legal/prohibited-items",
  "/legal/kyc-safety",
  "/legal/eula",
  "/legal/dpa",
  "/legal/copyright",
  "/legal/acceptable-use",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteOrigin = urls.marketingBase().replace(/\/$/, "");

  const industryPaths = Object.keys(industriesContent).map(
    (slug) => `/industries/${slug}`,
  );
  const staticPaths = [...MARKETING_ROUTES, ...LEGAL_ROUTES];
  const corePages = [...staticPaths, ...industryPaths].map(
    (p) => ({
      url: `${siteOrigin}${p}`,
      lastModified: new Date(),
      changeFrequency: (p === "" ? "daily" : "weekly") as "daily" | "weekly",
      priority: p === "" ? 1 : p.startsWith("/industries") ? 0.75 : 0.8,
    }),
  );

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
    if (isDatabaseUnreachableError(error)) {
      if (process.env.NODE_ENV === "development") {
        console.warn(
          "Sitemap: skipping live storefront URLs (database unreachable).",
        );
      }
    } else {
      const message =
        error instanceof Error ? error.message : "Unknown sitemap DB error";
      console.warn("Sitemap: merchant slug fetch failed:", message);
    }
  }

  return [...corePages, ...merchantPages];
}
