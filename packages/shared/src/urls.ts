function must(name: string) {
  const v = process.env[name];
  if (!v) {
    if (process.env.VERCEL_ENV === "production") {
      console.error(`[CRITICAL] Environment variable ${name} is not set.`);
      throw new Error(`${name} is not set`);
    }
    
    switch (name) {
      case "MARKETING_ORIGIN": return "https://www.vayva.ng";
      case "MERCHANT_ORIGIN": return "https://merchant.vayva.ng";
      case "OPS_ORIGIN": return "https://ops.vayva.ng";
      case "STOREFRONT_ROOT_DOMAIN": return "vayva.ng";
      case "API_ORIGIN": return "https://api.vayva.ng";
      case "PAYMENTS_ORIGIN": return "https://payments.vayva.ng";
      case "PUBLIC_ASSETS_BASE_URL": return "https://www.vayva.ng";
      // Legacy fallbacks
      case "MARKETING_BASE_URL": return "https://vayva.ng";
      case "MERCHANT_BASE_URL": return "https://merchant.vayva.ng";
      case "OPS_BASE_URL": return "https://ops.vayva.ng";
      default: return "";
    }
  }
  return v.replace(/\/$/, "");
}

export const urls = {
  marketingBase: () => process.env.MARKETING_ORIGIN || must("MARKETING_BASE_URL"),
  merchantBase: () => process.env.MERCHANT_ORIGIN || must("MERCHANT_BASE_URL"),
  opsBase: () => process.env.OPS_ORIGIN || must("OPS_BASE_URL"),

  storefrontOrigin: (storeSlug: string) => {
    const root = must("STOREFRONT_ROOT_DOMAIN").replace(/^https?:\/\//, "").replace(/\/$/, "");
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
  merchantInvite: (token: string) =>
    `${urls.merchantBase()}/invite/${encodeURIComponent(token)}`,
  merchantResetPassword: (token: string) =>
    `${urls.merchantBase()}/reset-password?token=${encodeURIComponent(token)}`,
  merchantDashboard: () =>
    `${urls.merchantBase()}/dashboard`,

  // Storefront deep links
  storefrontOrder: (storeSlug: string, refCode: string) =>
    `${urls.storefrontOrigin(storeSlug)}/order/${encodeURIComponent(refCode)}`,
  storefrontOrderConfirmation: (storeSlug: string, refCodeOrId: string) =>
    `${urls.storefrontOrigin(storeSlug)}/order/confirmation?reference=${encodeURIComponent(refCodeOrId)}`,
  storefrontReceipt: (storeSlug: string, refCode: string) =>
    `${urls.storefrontOrigin(storeSlug)}/order/${encodeURIComponent(refCode)}/receipt`,

  // Assets for emails
  emailLogo: () =>
    `${must("PUBLIC_ASSETS_BASE_URL")}/logos/brand-logo.png`,

  // Legacy/Helper support
  supportEmail: () => "support@vayva.ng",
  noReplyEmail: () => "no-reply@vayva.ng",

  // Backwards-compatible aliases (avoid breaking existing imports)
  storefrontHost: (storeSlug: string) => urls.storefrontOrigin(storeSlug),
  merchantInviteUrl: (token: string) => urls.merchantInvite(token),
  merchantResetPasswordUrl: (token: string) => urls.merchantResetPassword(token),
  storefrontOrderUrl: (storeSlug: string, refCode: string) =>
    urls.storefrontOrder(storeSlug, refCode),
  storefrontOrderConfirmationUrl: (storeSlug: string, refCodeOrId: string) =>
    urls.storefrontOrderConfirmation(storeSlug, refCodeOrId),
  storefrontReceiptUrl: (storeSlug: string, refCode: string) =>
    urls.storefrontReceipt(storeSlug, refCode),
};
