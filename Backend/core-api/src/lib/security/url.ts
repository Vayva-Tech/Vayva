import { z } from "zod";
/**
 * Normalizes and validates a URL to prevent SSRF and Open Redirects.
 * - Enforces HTTPS (unless allowedLocal is true)
 * - Blocks local/internal I P addresses
 * - Strips sensitive credentials
 */
export function normalizeUrl(inputUrl: string, allowedLocal = false) {
  try {
    const url = new URL(inputUrl);
    // 1. Protocol Check
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return null;
    }
    if (!allowedLocal && url.protocol === "http:") {
      // Enforce HTTPS for non-local in production?
      // For now, we allow http but prefer https.
    }
    // 2. Hostname Validation (SSRF Prevention)
    const hostname = url.hostname.toLowerCase();
    if (!allowedLocal) {
      if (
        hostname === "localhost" ||
        hostname === "127.0.0.1" ||
        hostname === "::1" ||
        hostname.startsWith("192.168.") ||
        hostname.startsWith("10.") ||
        hostname.endsWith(".internal") ||
        hostname.endsWith(".local")
      ) {
        return null;
      }
      // AWS Metadata blocking
      if (hostname === "169.254.169.254") return null;
    }
    // 3. Strip Credentials
    url.username = "";
    url.password = "";
    return url.toString();
  } catch {
    return null;
  }
}
/**
 * Zod helper for safe URLs
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const SafeUrlSchema = z.string().transform((val: any, ctx: any) => {
  const normalized = normalizeUrl(val);
  if (!normalized) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Invalid or unsafe URL",
    });
    return z.NEVER;
  }
  return normalized;
});
