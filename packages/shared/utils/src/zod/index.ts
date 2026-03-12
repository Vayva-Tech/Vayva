import { z } from "zod";

export const EnvSchema = z.object({
  DATABASE_URL: z.string().url(),
  REDIS_URL: z.string().url(),
  PORT: z.string().optional().default("4000"),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
});

export const PaginationSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
});

export const TenantSchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2),
});
