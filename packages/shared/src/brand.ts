/**
 * BRAND CONFIGURATION - Monorepo Source of Truth
 */

import { urls } from "./urls";

export const BRAND = {
    name: "Vayva",
    domain: "vayva.ng",
    supportEmail: "support@vayva.ng",
    helloEmail: "hello@vayva.ng",
} as const;

export function getMarketingUrl(path: string = ""): string {
    const base = urls.marketingBase();
    const normalizedPath = path.startsWith("/") ? path : `/${path}`;
    return `${base}${normalizedPath}`;
}
