/**
 * CSRF Protection Implementation
 * Prevents cross-site request forgery attacks
 */

import { randomBytes, createHash } from "crypto";
import { getRedis } from "@/lib/redis";
import { logger } from "@vayva/shared";

const CSRF_TOKEN_LENGTH = 32;
const CSRF_TOKEN_EXPIRY = 3600; // 1 hour in seconds

/**
 * Generate a cryptographically secure CSRF token
 */
export function generateCSRFToken(): string {
  return randomBytes(CSRF_TOKEN_LENGTH).toString("hex");
}

/**
 * Hash a CSRF token for secure storage
 */
function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

/**
 * Store CSRF token in Redis with expiration
 */
export async function storeCSRFToken(userId: string, token: string): Promise<void> {
  try {
    const redis = getRedis();
    const key = `csrf:${userId}:${hashToken(token)}`;
    await redis.setex(key, CSRF_TOKEN_EXPIRY, "1");
  } catch (error) {
    logger.error("[CSRF] Failed to store token", { userId, error });
    throw new Error("Failed to store CSRF token");
  }
}

/**
 * Validate CSRF token from request
 */
export async function validateCSRFToken(
  userId: string,
  token: string
): Promise<boolean> {
  if (!token || token.length !== CSRF_TOKEN_LENGTH * 2) {
    return false;
  }

  try {
    const redis = getRedis();
    const key = `csrf:${userId}:${hashToken(token)}`;
    const exists = await redis.get(key);
    
    if (!exists) {
      logger.warn("[CSRF] Invalid or expired token", { userId });
      return false;
    }

    return true;
  } catch (error) {
    logger.error("[CSRF] Validation failed", { userId, error });
    // Fail closed on error - reject the request
    return false;
  }
}

/**
 * Remove used CSRF token (one-time use)
 */
export async function consumeCSRFToken(userId: string, token: string): Promise<void> {
  try {
    const redis = getRedis();
    const key = `csrf:${userId}:${hashToken(token)}`;
    await redis.del(key);
  } catch (error) {
    logger.error("[CSRF] Failed to consume token", { userId, error });
  }
}

/**
 * Clean up expired CSRF tokens for a user
 */
export async function cleanupExpiredTokens(userId: string): Promise<void> {
  try {
    const redis = getRedis();
    const pattern = `csrf:${userId}:*`;
    const keys = await redis.keys(pattern);
    
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  } catch (error) {
    logger.error("[CSRF] Cleanup failed", { userId, error });
  }
}

/**
 * Middleware helper for CSRF protection
 * Use this in API route handlers
 */
export async function requireCSRF(
  request: Request,
  userId: string
): Promise<{ valid: boolean; error?: string }> {
  const csrfToken = request.headers.get("x-csrf-token");
  
  if (!csrfToken) {
    return {
      valid: false,
      error: "Missing CSRF token",
    };
  }

  const isValid = await validateCSRFToken(userId, csrfToken);
  
  if (!isValid) {
    return {
      valid: false,
      error: "Invalid or expired CSRF token",
    };
  }

  // Consume token after successful validation (one-time use)
  await consumeCSRFToken(userId, csrfToken);

  return {
    valid: true,
  };
}

/**
 * Get CSRF token from cookie (alternative method)
 */
export function getCSRFTokenFromCookie(request: Request): string | null {
  const cookieHeader = request.headers.get("cookie");
  
  if (!cookieHeader) {
    return null;
  }

  const cookies = cookieHeader.split(";").reduce((acc, cookie) => {
    const [key, value] = cookie.trim().split("=");
    acc[key] = value;
    return acc;
  }, {} as Record<string, string>);

  return cookies["csrf_token"] || null;
}

/**
 * Set CSRF token in cookie header
 */
export function setCSRFCookie(token: string): string {
  return `csrf_token=${token}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=${CSRF_TOKEN_EXPIRY}`;
}
