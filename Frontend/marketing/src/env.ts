import { z } from "zod";
import {
  parseEnv,
  DomainEnvSchema,
  validateDomainConsistency,
} from "@vayva/shared";

const MarketingEnvSchema = DomainEnvSchema.extend({
  /** Optional GA4 measurement ID; analytics runs only when set and the user consents. */
  NEXT_PUBLIC_GA_MEASUREMENT_ID: z.string().optional(),
});

export type MarketingEnv = z.infer<typeof MarketingEnvSchema>;

export function validateEnv() {
  const env = parseEnv(MarketingEnvSchema);

  // Domain consistency
  validateDomainConsistency(env);

  return env;
}

export const env = validateEnv();
