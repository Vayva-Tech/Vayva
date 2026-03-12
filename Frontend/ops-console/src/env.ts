import { z } from "zod";
import {
  parseEnv,
  DomainEnvSchema,
  validateDomainConsistency,
} from "@vayva/shared";

const OpsEnvSchema = DomainEnvSchema.extend({
  // Auth
  NEXTAUTH_URL: z.string().url(),
  NEXTAUTH_SECRET: z.string().min(1),
  AUTH_TRUST_HOST: z.string().optional().default("true"),

  // Database
  DATABASE_URL: z.string().min(1),

  // Platform Specific
  VAYVA_PLATFORM_ADMIN_EMAILS: z.string().optional(),

  // Tracing/Observability (Optional)
  HONEYCOMB_API_KEY: z.string().optional(),
});

export type OpsEnv = z.infer<typeof OpsEnvSchema>;

export function validateEnv() {
  const env = parseEnv(OpsEnvSchema);

  // Domain consistency
  validateDomainConsistency(env);

  // Ops specific invariants
  if (env.NEXTAUTH_URL !== env.OPS_ORIGIN) {
    throw new Error(
      `NEXTAUTH_URL (${env.NEXTAUTH_URL}) must match OPS_ORIGIN (${env.OPS_ORIGIN})`,
    );
  }

  return env;
}

export const env = validateEnv();
