/**
 * Environment Configuration
 */

import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  PORT: z.string().default('3004'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  REDIS_URL: z.string().default('redis://localhost:6379'),
  DATABASE_URL: z.string(),
  WORKFLOW_EXECUTION_TIMEOUT: z.string().default('30000'),
  WORKFLOW_MAX_NODES: z.string().default('100'),
  WORKFLOW_RATE_LIMIT: z.string().default('100'),
  CORS_ORIGIN: z.string().default('*'),
});

export const env = envSchema.parse(process.env);

export const config = {
  port: parseInt(env.PORT, 10),
  nodeEnv: env.NODE_ENV,
  redis: {
    url: env.REDIS_URL,
  },
  database: {
    url: env.DATABASE_URL,
  },
  workflow: {
    executionTimeout: parseInt(env.WORKFLOW_EXECUTION_TIMEOUT, 10),
    maxNodes: parseInt(env.WORKFLOW_MAX_NODES, 10),
    rateLimit: parseInt(env.WORKFLOW_RATE_LIMIT, 10),
  },
  cors: {
    origin: env.CORS_ORIGIN,
  },
};

export default config;
