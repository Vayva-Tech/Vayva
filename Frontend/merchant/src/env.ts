import { z } from "zod";
import {
  parseEnv,
  DomainEnvSchema,
  validateDomainConsistency,
} from "@vayva/shared";

const MerchantEnvSchema = DomainEnvSchema.extend({
  // Auth
  NEXTAUTH_URL: z.string().url(),
  NEXTAUTH_SECRET: z.string().min(1),
  AUTH_TRUST_HOST: z.string().optional().default("true"),

  // Backend API
  BACKEND_API_URL: z.string().url(),
  REDIS_URL: z.string().url().optional().default("redis://localhost:6379"),

  // Email
  EMAIL_FROM: z.string().email().default("no-reply@vayva.ng"),
  EMAIL_PROVIDER: z.enum(["resend", "sendgrid", "mock"]).default("resend"),

  // Uploads
  UPLOADS_BUCKET: z.string().optional(),
  UPLOADS_PUBLIC_BASE_URL: z.string().url().optional(),
  UPLOADS_SIGNING_SECRET: z.string().optional(),
});

export type MerchantEnv = z.infer<typeof MerchantEnvSchema>;

export function validateEnv() {
  const env = parseEnv(MerchantEnvSchema);

  // Domain consistency
  validateDomainConsistency(env);

  // Merchant specific invariants (skip in dev — localhost won't match production origins)
  if (
    process.env.NODE_ENV === "production" &&
    !process.env.CI &&
    env.NEXTAUTH_URL !== env.MERCHANT_ORIGIN
  ) {
    throw new Error(
      `NEXTAUTH_URL (${env.NEXTAUTH_URL}) must match MERCHANT_ORIGIN (${env.MERCHANT_ORIGIN})`,
    );
  }

  return env;
}

export const env = validateEnv();
