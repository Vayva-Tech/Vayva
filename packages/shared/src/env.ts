import { z } from "zod";

export const DomainEnvSchema = z.object({
  MARKETING_ORIGIN: z.string().url().default("https://vayva.ng"),
  MERCHANT_ORIGIN: z.string().url().default("https://merchant.vayva.ng"),
  OPS_ORIGIN: z.string().url().default("https://ops.vayva.ng"),
  STOREFRONT_ROOT_DOMAIN: z.string().default("vayva.ng"),
});

export type DomainEnv = z.infer<typeof DomainEnvSchema>;

export function validateDomainConsistency(env: DomainEnv) {
  // Skip domain pattern checks in development and CI (localhost doesn't match production patterns)
  if (process.env.NODE_ENV !== "production" || process.env.CI) return;

  const marketingHost = new URL(env.MARKETING_ORIGIN).hostname;
  const merchantHost = new URL(env.MERCHANT_ORIGIN).hostname;
  const opsHost = new URL(env.OPS_ORIGIN).hostname;

  if (marketingHost !== env.STOREFRONT_ROOT_DOMAIN) {
    throw new Error(
      `MARKETING_ORIGIN host (${marketingHost}) must match STOREFRONT_ROOT_DOMAIN (${env.STOREFRONT_ROOT_DOMAIN})`
    );
  }

  if (!merchantHost.startsWith("merchant.")) {
    throw new Error(`MERCHANT_ORIGIN host (${merchantHost}) must start with "merchant."`);
  }

  if (!opsHost.startsWith("ops.")) {
    throw new Error(`OPS_ORIGIN host (${opsHost}) must start with "ops."`);
  }
}

type RawEnv = Record<string, string | undefined>;

export function parseEnv<TSchema extends z.ZodTypeAny>(
  schema: TSchema,
  rawEnv: RawEnv = process.env as RawEnv
): z.infer<TSchema> {
  const result = schema.safeParse(rawEnv);
  if (!result.success) {
    const details = result.error.issues
      .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
      .join(", ");
    console.error("❌ Environment validation failed:", details);
    throw new Error(`Env validation failed: ${details}`);
  }
  return result.data;
}
