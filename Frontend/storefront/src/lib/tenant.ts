import { headers } from "next/headers";

const ROOT = process.env.STOREFRONT_ROOT_DOMAIN || "vayva.ng";

const RESERVED = new Set([
  "vayva",
  "www",
  "merchant",
  "ops",
  "api",
  "payments",
  "cdn",
  "static",
]);

function getAllowedHostSuffixes() {
  const raw = process.env.STOREFRONT_ALLOWED_HOST_SUFFIXES;
  if (!raw) return [ROOT];
  return raw
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

function stripPort(host: string) {
  return host.split(":")[0];
}

function resolveSlugForAllowedSuffix(host: string, suffix: string) {
  if (suffix === "localhost") {
    if (!host.endsWith(".localhost")) return null;
    const slug = host.replace(/\.localhost$/, "");
    return slug || null;
  }

  if (!host.endsWith(`.${suffix}`)) return null;
  const slug = host.slice(0, -`.${suffix}`.length);
  const firstLabel = slug.split(".")[0];
  return firstLabel || null;
}

export async function getTenantFromHost(explicitHost?: string) {
  const host = explicitHost
    ? explicitHost
    : ((await headers()).get("host") ?? "");
  const normalizedHost = host.toLowerCase();
  const cleanHost = stripPort(normalizedHost);

  const allowedSuffixes = getAllowedHostSuffixes();
  const matchingSuffix = allowedSuffixes.find((sfx) => {
    if (sfx === "localhost")
      return cleanHost.endsWith(".localhost") || cleanHost === "localhost";
    return cleanHost === sfx || cleanHost.endsWith(`.${sfx}`);
  });

  if (!matchingSuffix) {
    return {
      ok: false as const,
      reason: "not_storefront_domain",
      host: cleanHost,
    };
  }

  const slug = resolveSlugForAllowedSuffix(cleanHost, matchingSuffix);

  if (!slug || RESERVED.has(slug)) {
    return {
      ok: false as const,
      reason: "reserved_or_missing_slug",
      host: cleanHost,
    };
  }

  if (!/^[a-z0-9-]{2,63}$/.test(slug)) {
    return { ok: false as const, reason: "invalid_slug", host: cleanHost };
  }

  return { ok: true as const, slug, host: cleanHost };
}
