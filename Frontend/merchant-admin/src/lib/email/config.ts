import { urls } from "@vayva/shared";

export const SENDER_IDENTITIES = {
  SECURITY: { email: urls.noReplyEmail(), name: "Vayva Security" },
  BILLING: { email: `billing@${urls.storefrontRoot()}`, name: "Vayva Billing" },
  TEAM: { email: urls.noReplyEmail(), name: "Vayva Team" },
  SUPPORT: { email: urls.supportEmail(), name: "Vayva Support" },
};
export const REPLY_TO_ADDRESSES = {
  SUPPORT: urls.supportEmail(),
  BILLING: `billing@${urls.storefrontRoot()}`,
};
/**
 * Enforces strict Reply-To rules based on the Sender Identity.
 *
 * Rules:
 * - NO-REPLY -> Support
 * - TEAM -> Support
 * - SUPPORT -> Support
 * - BILLING -> Support (default)
 */
export function getReplyTo(senderEmail: unknown) {
  switch (senderEmail) {
    case SENDER_IDENTITIES.SECURITY.email:
    case SENDER_IDENTITIES.TEAM.email:
    case SENDER_IDENTITIES.SUPPORT.email:
      return REPLY_TO_ADDRESSES.SUPPORT;
    case SENDER_IDENTITIES.BILLING.email:
      // Could strictly be billing, but prompt says "default Reply-To = support unless product requires billing inbox"
      // For MVP/Safest: Route to support.
      return REPLY_TO_ADDRESSES.SUPPORT;
    default:
      return REPLY_TO_ADDRESSES.SUPPORT;
  }
}
