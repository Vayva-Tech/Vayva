import { z } from "zod";
import {
  parseEnv,
  DomainEnvSchema,
  validateDomainConsistency,
} from "@vayva/shared";

const WorkerEnvSchema = DomainEnvSchema.extend({
  // Database
  DATABASE_URL: z.string().min(1),

  // Email
  EMAIL_FROM: z.string().email().default("no-reply@vayva.ng"),
  EMAIL_PROVIDER: z.enum(["resend", "sendgrid", "mock"]).default("resend"),
  RESEND_API_KEY: z.string().optional(),

  // Schedule
  OUTBOX_DRAIN_INTERVAL_SEC: z.coerce.number().int().positive().default(30),

  // Runner
  WORKER_RUNNER: z.enum(["loop", "cron-endpoint"]).default("loop"),
});

export type WorkerEnv = z.infer<typeof WorkerEnvSchema>;

export function validateEnv() {
  const env = parseEnv(WorkerEnvSchema);

  // Domain consistency
  validateDomainConsistency(env);

  return env;
}

export const env = validateEnv();
