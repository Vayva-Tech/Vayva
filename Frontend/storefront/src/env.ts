import { z } from "zod";
import {
  parseEnv,
  DomainEnvSchema,
  validateDomainConsistency,
} from "@vayva/shared";

const StorefrontEnvSchema = DomainEnvSchema.extend({
  // Database (Optional, if reading directly)
  DATABASE_URL: z.string().min(1).optional(),

  // Payments
  PAYMENTS_ORIGIN: z.string().url().optional(),
});

export type StorefrontEnv = z.infer<typeof StorefrontEnvSchema>;

export function validateEnv() {
  const env = parseEnv(StorefrontEnvSchema);

  // Domain consistency
  validateDomainConsistency(env);

  return env;
}

export const env = validateEnv();
