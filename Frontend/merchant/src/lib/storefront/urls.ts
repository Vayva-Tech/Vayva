import { urls } from "@vayva/shared";

export type StorePlanSlug =
  | "FREE"
  | "STARTER"
  | "GROWTH"
  | "PRO"
  | "free"
  | "starter"
  | "growth"
  | "pro"
  | string
  | null
  | undefined;

export function getAppDomain(): string {
  return process.env.NEXT_PUBLIC_APP_DOMAIN || urls.storefrontRoot();
}

export function buildLiveStorefrontUrl(
  slug: string,
  customDomainUrl?: string | null,
): string {
  if (customDomainUrl) return customDomainUrl;
  const domain = getAppDomain();
  return `https://${slug}.${domain}`;
}

export function buildPreviewStorefrontUrl(slug: string): string {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  const base = appUrl ? appUrl.replace(/\/$/, "") : "";
  return `${base}/store/${slug}?preview=true`;
}

export function isFreePlan(plan: StorePlanSlug): boolean {
  const normalized = String(plan || "").toLowerCase();
  return normalized === "free" || normalized === "starter";
}
