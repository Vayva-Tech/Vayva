import { env } from "./env";
/**
 * FEATURE FLAGS
 *
 * derived strictly from valid environment variables.
 */
export const FEATURES = {
  PAYMENTS_ENABLED: Boolean(
    env.PAYSTACK_SECRET_KEY &&
    (env.PAYSTACK_PUBLIC_KEY || process.env.NEXT_PUBLIC_PAYSTACK_KEY),
  ),
  EMAIL_ENABLED: Boolean(env.RESEND_API_KEY && env.RESEND_FROM_EMAIL),
  WHATSAPP_ENABLED: Boolean(process.env.EVOLUTION_API_URL && process.env.EVOLUTION_API_KEY),
  DELIVERY_ENABLED: Boolean(
    (env.KWIK_API_KEY && env.KWIK_MERCHANT_ID) ||
    (env.KWIK_EMAIL && env.KWIK_PASSWORD),
  ),
  KYC_ENABLED: true,
  STORAGE_ENABLED: Boolean(
    env.BLOB_READ_WRITE_TOKEN || process.env.MINIO_ENDPOINT,
  ),
  SENTRY_ENABLED: Boolean(env.SENTRY_DSN),
  AI_ASSISTANT_ENABLED: Boolean(env.OPENROUTER_API_KEY),
  MARKETING_AI_ENABLED: Boolean(env.OPENROUTER_API_KEY),
  // Future flags
  CONTROL_CENTER_ENABLED: false,
};
export function isFeatureEnabled(feature: string) {
  return FEATURES[feature as keyof typeof FEATURES];
}
export function assertFeatureEnabled(feature: string) {
  if (!isFeatureEnabled(feature)) {
    throw new Error(
      `Feature ${feature} is disabled due to missing configuration.`,
    );
  }
}
