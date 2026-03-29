/**
 * Rate Limiting Service for Fastify
 *
 * Protects APIs from abuse and DDoS attacks
 * Implements tier-based rate limiting based on user subscription
 *
 * @see https://github.com/fastify/@fastify/rate-limit
 */

import { FastifyInstance, FastifyRequest } from "fastify";
import fastifyRateLimit from "@fastify/rate-limit";
import Redis from "ioredis";

// Rate limit tiers based on subscription plan
export interface RateLimitTiers {
  FREE: { max: number; timeWindow: string };
  STARTER: { max: number; timeWindow: string };
  PRO: { max: number; timeWindow: string };
  PRO_PLUS: { max: number; timeWindow: string };
}

export const RATE_LIMIT_TIERS: RateLimitTiers = {
  FREE: { max: 100, timeWindow: "1 minute" }, // 100 req/min = 6,000/hr
  STARTER: { max: 300, timeWindow: "1 minute" }, // 300 req/min = 18,000/hr
  PRO: { max: 500, timeWindow: "1 minute" }, // 500 req/min = 30,000/hr
  PRO_PLUS: { max: 1000, timeWindow: "1 minute" }, // 1000 req/min = 60,000/hr
};

// Endpoint-specific limits (overrides tier limits)
export interface EndpointRateLimits {
  "/api/v1/auth/*": { max: number; timeWindow: string };
  "/api/v1/payments/*": { max: number; timeWindow: string };
  "/api/v1/webhooks/*": { max: number; timeWindow: string };
  "/api/v1/billing/*": { max: number; timeWindow: string };
}

export const ENDPOINT_RATE_LIMITS: EndpointRateLimits = {
  "/api/v1/auth/*": { max: 5, timeWindow: "1 minute" }, // Strict for auth (prevent brute force)
  "/api/v1/payments/*": { max: 10, timeWindow: "1 minute" }, // Strict for payments (prevent fraud)
  "/api/v1/webhooks/*": { max: 100, timeWindow: "1 minute" }, // Higher for webhook processing
  "/api/v1/billing/*": { max: 20, timeWindow: "1 minute" }, // Moderate for billing ops
};

// Custom key generator - use userId or IP
async function getKeyGenerator(request: FastifyRequest) {
  // Try to get user ID from JWT token
  const user = (request as any).user;
  if (user?.id) {
    return `user:${user.id}`;
  }

  // Fallback to IP address
  const ip = request.ip || request.headers["x-forwarded-for"] || "unknown";
  return `ip:${ip}`;
}

// Get user's subscription tier from JWT
function getUserTier(request: FastifyRequest): keyof RateLimitTiers {
  const user = (request as any).user;
  if (!user?.tier) return "STARTER"; // Default to STARTER for new users

  const tier = user.tier.toUpperCase();
  if (["STARTER", "PRO", "PRO_PLUS"].includes(tier)) {
    return tier as keyof RateLimitTiers;
  }

  return "FREE";
}

// Check if endpoint has specific rate limit
function getEndpointLimit(
  url: string,
): EndpointRateLimits[keyof EndpointRateLimits] | null {
  for (const [pattern, limit] of Object.entries(ENDPOINT_RATE_LIMITS)) {
    const regex = new RegExp(pattern.replace("*", ".*"));
    if (regex.test(url)) {
      return limit;
    }
  }
  return null;
}

// Custom error response
function getErrorResponse(request: FastifyRequest, tier: keyof RateLimitTiers) {
  return {
    success: false,
    error: "Too Many Requests",
    message: `Rate limit exceeded. Maximum ${RATE_LIMIT_TIERS[tier].max} requests per ${RATE_LIMIT_TIERS[tier].timeWindow}.`,
    retryAfter: 60, // seconds
    upgrade:
      tier === "FREE"
        ? "Consider upgrading to STARTER or PRO for higher limits"
        : undefined,
  };
}

/**
 * Configure Rate Limiting for Fastify Instance
 */
export async function configureRateLimiting(server: any) {
  try {
    await server.register(fastifyRateLimit, {
      max: 100,
      timeWindow: "1 minute",
      allowList: ["127.0.0.1", "::1"],
      keyGenerator: getKeyGenerator,
    });

    server.log.info("✅ Rate limiting configured successfully");
  } catch (error) {
    server.log.error(error, "Failed to configure rate limiting");
    throw error;
  }
}

/**
 * Apply route-specific rate limiting
 * Call this in your route configurations
 */
export function applyRateLimiting(
  urlPattern: string,
  options?: { max?: number; timeWindow?: string },
) {
  const endpointLimit = getEndpointLimit(urlPattern);

  return {
    config: {
      rateLimit: {
        max: options?.max || endpointLimit?.max || 100,
        timeWindow:
          options?.timeWindow || endpointLimit?.timeWindow || "1 minute",
      },
    },
  };
}

/**
 * Decorator to add rate limit info to request context
 */
export function addRateLimitInfo(request: FastifyRequest) {
  const tier = getUserTier(request);
  const tierConfig = RATE_LIMIT_TIERS[tier];

  (request as any).rateLimitInfo = {
    tier,
    maxRequests: tierConfig.max,
    timeWindow: tierConfig.timeWindow,
    isPremium: ["PRO", "PRO_PLUS"].includes(tier),
  };
}
