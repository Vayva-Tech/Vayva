import { z } from "zod";
import { urls, logger } from "@vayva/shared";

const envSchema = z.object({
    BACKEND_API_URL: z.string().url().optional().default("http://localhost:3001"),
    REDIS_URL: z.string().url().optional().default("redis://localhost:6379"),
    MARKETING_BASE_URL: z.string().url().optional().default("https://vayva.ng"),
    MERCHANT_BASE_URL: z
        .string()
        .url()
        .optional()
        .default("https://merchant.vayva.ng"),
    OPS_BASE_URL: z.string().url().optional().default("https://ops.vayva.ng"),
    STOREFRONT_ROOT_DOMAIN: z.string().optional().default("vayva.ng"),
    STOREFRONT_PROTOCOL: z.string().optional().default("https"),
    PUBLIC_ASSETS_BASE_URL: z
        .string()
        .url()
        .optional()
        .default("https://vayva.ng"),
    NEXT_PUBLIC_APP_URL: z.string().url().optional(),
    NEXTAUTH_SECRET: z.string().min(1).optional().default("ci-build-secret-key"),
    NEXTAUTH_URL: z.string().url().optional(),
    WHATSAPP_ACCESS_TOKEN: z.string().min(1).optional(),
    WHATSAPP_VERIFY_TOKEN: z.string().min(1).optional(),
    WHATSAPP_PHONE_NUMBER_ID: z.string().min(1).optional(),
    PAYSTACK_SECRET_KEY: z.string().startsWith("sk_").optional(),
    PAYSTACK_PUBLIC_KEY: z.string().startsWith("pk_").optional(),
    NEXT_PUBLIC_PAYSTACK_KEY: z.string().startsWith("pk_").optional(),
    NODE_ENV: z
        .enum(["development", "test", "production"])
        .default("development"),
    ADMIN_ALLOWLIST: z.string().optional().describe("Comma separated emails"),
    RESEND_API_KEY: z.string().min(1).optional(),
    RESEND_FROM_EMAIL: z.string().email().optional(),
    KWIK_API_KEY: z.string().optional(),
    KWIK_MERCHANT_ID: z.string().optional(),
    KWIK_EMAIL: z.string().email().optional(),
    KWIK_PASSWORD: z.string().optional(),
    BLOB_READ_WRITE_TOKEN: z.string().optional(),
    SENTRY_DSN: z.string().url().optional(),
    GROQ_ADMIN_KEY: z.string().optional(),
    GROQ_MARKETING_KEY: z.string().optional(),
    GROQ_WHATSAPP_KEY: z.string().optional(),
});

const _env = envSchema.safeParse(process.env);
if (!_env.success) {
    logger.error("❌ Invalid environment variables:", _env.error.format());
    if (process.env.NODE_ENV === "production" || process.env.STRICT_ENV) {
        throw new Error("Invalid environment variables");
    }
}

type EnvSchema = z.infer<typeof envSchema>;

const parsed = _env.success
    ? _env.data
    : (process.env as unknown as EnvSchema);

const vercelUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : undefined;
const resolvedAppUrl =
    parsed.NEXT_PUBLIC_APP_URL ||
    parsed.NEXTAUTH_URL ||
    vercelUrl ||
    urls.merchantBase();

export const env = {
    ...parsed,
    NEXT_PUBLIC_APP_URL: resolvedAppUrl,
} as EnvSchema & { NEXT_PUBLIC_APP_URL: string };
