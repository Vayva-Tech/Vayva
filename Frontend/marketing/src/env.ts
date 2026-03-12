import { z } from "zod";
import {
  parseEnv,
  DomainEnvSchema,
  validateDomainConsistency,
} from "@vayva/shared";

const MarketingEnvSchema = DomainEnvSchema.extend({
  // No extra required vars for marketing yet
});

export type MarketingEnv = z.infer<typeof MarketingEnvSchema>;

export function validateEnv() {
  const env = parseEnv(MarketingEnvSchema);

  // Domain consistency
  validateDomainConsistency(env);

  return env;
}

export const env = validateEnv();
