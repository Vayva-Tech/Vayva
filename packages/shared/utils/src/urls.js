"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.urls = void 0;
function must(name) {
    const v = process.env[name];
    if (!v) {
        if (process.env.VERCEL_ENV === "production") {
            console.error(`[CRITICAL] Environment variable ${name} is not set.`);
            throw new Error(`${name} is not set`);
        }
        switch (name) {
            case "MARKETING_ORIGIN":
                return "https://www.vayva.ng";
            case "MERCHANT_ORIGIN":
                return "https://merchant.vayva.ng";
            case "OPS_ORIGIN":
                return "https://ops.vayva.ng";
            case "STOREFRONT_ROOT_DOMAIN":
                return "vayva.ng";
            case "API_ORIGIN":
                return "https://api.vayva.ng";
            case "PAYMENTS_ORIGIN":
                return "https://payments.vayva.ng";
            case "PUBLIC_ASSETS_BASE_URL":
                return "https://vayva.ng";
            // Legacy fallbacks
            case "MARKETING_BASE_URL":
                return "https://www.vayva.ng";
            case "MERCHANT_BASE_URL":
                return "https://merchant.vayva.ng";
            case "OPS_BASE_URL":
                return "https://ops.vayva.ng";
            default:
                return "";
        }
    }
    return v.replace(/\/$/, "");
}
exports.urls = {
    marketingBase: () => process.env.MARKETING_ORIGIN || must("MARKETING_BASE_URL"),
    merchantBase: () => process.env.MERCHANT_ORIGIN || must("MERCHANT_BASE_URL"),
    opsBase: () => process.env.OPS_ORIGIN || must("OPS_BASE_URL"),
    storefrontOrigin: (storeSlug) => {
        const root = must("STOREFRONT_ROOT_DOMAIN")
            .replace(/^https?:\/\//, "")
            .replace(/\/$/, "");
        const proto = (process.env.STOREFRONT_PROTOCOL || "https").replace(/:\/\//, "");
        return `${proto}://${storeSlug}.${root}`;
    },
    storefrontRoot: () => must("STOREFRONT_ROOT_DOMAIN"),
    apiBase: () => process.env.API_ORIGIN || must("API_ORIGIN"),
    paymentsBase: () => process.env.PAYMENTS_ORIGIN || must("PAYMENTS_ORIGIN"),
    // External Service Base URLs
    webstudioBase: () => process.env.WEBSTUDIO_BASE_URL || "https://apps.webstudio.is",
    resendBase: () => "https://api.resend.com",
    metaBase: () => "https://graph.facebook.com/v17.0",
    openaiBase: () => "https://api.openai.com/v1",
    groqBase: () => "https://api.groq.com/openai/v1",
    kwikBase: () => process.env.KWIK_BASE_URL || "https://api.kwik.delivery/api/v1",
    kwikStagingBase: () => "https://staging-api-test.kwik.delivery/api/v2",
    // Merchant deep links
    merchantInvite: (token) => `${exports.urls.merchantBase()}/invite/${encodeURIComponent(token)}`,
    merchantResetPassword: (token) => `${exports.urls.merchantBase()}/reset-password?token=${encodeURIComponent(token)}`,
    merchantDashboard: () => `${exports.urls.merchantBase()}/dashboard`,
    // Storefront deep links
    storefrontOrder: (storeSlug, refCode) => `${exports.urls.storefrontOrigin(storeSlug)}/order/${encodeURIComponent(refCode)}`,
    storefrontOrderConfirmation: (storeSlug, refCodeOrId) => `${exports.urls.storefrontOrigin(storeSlug)}/order/confirmation?reference=${encodeURIComponent(refCodeOrId)}`,
    storefrontReceipt: (storeSlug, refCode) => `${exports.urls.storefrontOrigin(storeSlug)}/order/${encodeURIComponent(refCode)}/receipt`,
    // Assets for emails
    emailLogo: () => `${must("PUBLIC_ASSETS_BASE_URL")}/logos/brand-logo.png`,
    // Legacy/Helper support
    supportEmail: () => "support@vayva.ng",
    noReplyEmail: () => "no-reply@vayva.ng",
    // Official Vayva Phone & WhatsApp Number
    officialPhone: () => "+234 810 769 2393",
    officialWhatsApp: () => "+234 810 769 2393",
    officialWhatsAppLink: () => "https://wa.me/2348107692393",
    // Backwards-compatible aliases (avoid breaking existing imports)
    storefrontHost: (storeSlug) => exports.urls.storefrontOrigin(storeSlug),
    merchantInviteUrl: (token) => exports.urls.merchantInvite(token),
    merchantResetPasswordUrl: (token) => exports.urls.merchantResetPassword(token),
    storefrontOrderUrl: (storeSlug, refCode) => exports.urls.storefrontOrder(storeSlug, refCode),
    storefrontOrderConfirmationUrl: (storeSlug, refCodeOrId) => exports.urls.storefrontOrderConfirmation(storeSlug, refCodeOrId),
    storefrontReceiptUrl: (storeSlug, refCode) => exports.urls.storefrontReceipt(storeSlug, refCode),
};
//# sourceMappingURL=urls.js.map