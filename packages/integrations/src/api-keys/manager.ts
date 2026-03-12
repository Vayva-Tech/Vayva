/**
 * API Key Management Service
 * Enhanced API key management with rotation, rate limiting, and IP restrictions
 */

import { randomBytes, createHash } from 'crypto';
import { prisma } from '@vayva/db';
import { logger } from '@vayva/shared';
import type {
  ApiKey,
  ApiKeyScope,
  ApiKeyStatus,
  ApiKeyValidation,
  CreateApiKeyInput,
  ApiKeyRotationResult,
  RateLimitCheck,
  RateLimitInfo,
} from '../types';

const KEY_PREFIX = 'vayva_live_';
const KEY_LENGTH_BYTES = 32;

// Rate limiting storage (in production, use Redis)
const rateLimitStore = new Map<string, { count: number; resetAt: Date }>();

function generateApiKey(): { key: string; hash: string; prefix: string } {
  const keyBody = randomBytes(KEY_LENGTH_BYTES).toString('hex');
  const key = `${KEY_PREFIX}${keyBody}`;
  const hash = createHash('sha256').update(key).digest('hex');
  const prefix = key.slice(0, 16);
  return { key, hash, prefix };
}

function hashApiKey(rawKey: string): string {
  return createHash('sha256').update(rawKey).digest('hex');
}

export class ApiKeyManager {
  /**
   * Create a new API key
   */
  async createApiKey(input: CreateApiKeyInput): Promise<{ apiKey: Omit<ApiKey, 'keyHash'>; key: string }> {
    const { key, hash, prefix } = generateApiKey();

    try {
      const apiKey = await prisma.apiKey.create({
        data: {
          storeId: input.storeId,
          name: input.name,
          keyHash: hash,
          scopes: input.scopes,
          status: 'ACTIVE',
          expiresAt: input.expiresAt || null,
          ipAllowlist: input.ipAllowlist || [],
          lastUsedAt: null,
          lastIp: null,
        },
      });

      logger.info('[ApiKeyManager] Created new API key', {
        keyId: apiKey.id,
        storeId: input.storeId,
        name: input.name,
        scopes: input.scopes,
      });

      // Return sanitized key (without hash) and the full key (only shown once)
      const { keyHash: _, ...sanitizedKey } = apiKey as ApiKey;
      return {
        apiKey: sanitizedKey,
        key,
      };
    } catch (error) {
      logger.error('[ApiKeyManager] Failed to create API key', { error, input });
      throw new Error('Failed to create API key');
    }
  }

  /**
   * Validate an API key
   */
  async validateApiKey(rawKey: string, ip?: string): Promise<ApiKeyValidation> {
    const keyHash = hashApiKey(rawKey);

    const apiKey = await prisma.apiKey.findUnique({
      where: { keyHash },
    }) as ApiKey | null;

    if (!apiKey) {
      return { valid: false, reason: 'invalid_key' };
    }

    // Check status
    if (apiKey.status === 'REVOKED') {
      return { valid: false, reason: 'revoked' };
    }

    // Check expiration
    if (apiKey.expiresAt && new Date() > apiKey.expiresAt) {
      // Key has expired - revoke it
      await prisma.apiKey.update({
        where: { id: apiKey.id },
        data: { status: 'REVOKED', revokedAt: new Date() },
      });
      return { valid: false, reason: 'expired' };
    }

    // Check IP allowlist
    if (ip && apiKey.ipAllowlist && apiKey.ipAllowlist.length > 0) {
      if (!apiKey.ipAllowlist.includes(ip)) {
        logger.warn('[ApiKeyManager] IP not in allowlist', {
          keyId: apiKey.id,
          attemptedIp: ip,
        });
        return { valid: false, reason: 'ip_not_allowed' };
      }
    }

    // Update last used
    await prisma.apiKey.update({
      where: { id: apiKey.id },
      data: {
        lastUsedAt: new Date(),
        lastIp: ip || null,
      },
    });

    const { keyHash: _, ...sanitizedKey } = apiKey;
    return { valid: true, apiKey: sanitizedKey };
  }

  /**
   * Check rate limits for an API key
   */
  async checkRateLimit(keyId: string, limits: { perMinute?: number; perHour?: number }): Promise<RateLimitCheck> {
    const now = new Date();
    const minuteKey = `${keyId}:minute:${now.getMinutes()}`;
    const hourKey = `${keyId}:hour:${now.getHours()}`;

    // Check per-minute limit
    if (limits.perMinute) {
      const minuteData = rateLimitStore.get(minuteKey);
      if (minuteData) {
        if (minuteData.count >= limits.perMinute) {
          return {
            allowed: false,
            info: {
              limit: limits.perMinute,
              remaining: 0,
              resetAt: minuteData.resetAt,
              window: 'minute',
            },
            retryAfter: Math.ceil((minuteData.resetAt.getTime() - now.getTime()) / 1000),
          };
        }
        minuteData.count++;
      } else {
        const resetAt = new Date(now);
        resetAt.setMinutes(resetAt.getMinutes() + 1);
        resetAt.setSeconds(0);
        resetAt.setMilliseconds(0);
        rateLimitStore.set(minuteKey, { count: 1, resetAt });
      }
    }

    // Check per-hour limit
    if (limits.perHour) {
      const hourData = rateLimitStore.get(hourKey);
      if (hourData) {
        if (hourData.count >= limits.perHour) {
          return {
            allowed: false,
            info: {
              limit: limits.perHour,
              remaining: 0,
              resetAt: hourData.resetAt,
              window: 'hour',
            },
            retryAfter: Math.ceil((hourData.resetAt.getTime() - now.getTime()) / 1000),
          };
        }
        hourData.count++;
      } else {
        const resetAt = new Date(now);
        resetAt.setHours(resetAt.getHours() + 1);
        resetAt.setMinutes(0);
        resetAt.setSeconds(0);
        resetAt.setMilliseconds(0);
        rateLimitStore.set(hourKey, { count: 1, resetAt });
      }
    }

    const minuteData = rateLimitStore.get(minuteKey);
    const hourData = rateLimitStore.get(hourKey);

    return {
      allowed: true,
      info: {
        limit: limits.perMinute || limits.perHour || 1000,
        remaining: Math.min(
          limits.perMinute ? (limits.perMinute - (minuteData?.count || 0)) : Infinity,
          limits.perHour ? (limits.perHour - (hourData?.count || 0)) : Infinity
        ),
        resetAt: minuteData?.resetAt || hourData?.resetAt || new Date(now.getTime() + 60000),
        window: limits.perMinute ? 'minute' : 'hour',
      },
    };
  }

  /**
   * Revoke an API key
   */
  async revokeApiKey(storeId: string, keyId: string, reason?: string): Promise<void> {
    try {
      await prisma.apiKey.updateMany({
        where: { id: keyId, storeId },
        data: {
          status: 'REVOKED',
          revokedAt: new Date(),
        },
      });

      logger.info('[ApiKeyManager] Revoked API key', {
        keyId,
        storeId,
        reason,
      });
    } catch (error) {
      logger.error('[ApiKeyManager] Failed to revoke API key', { error, keyId, storeId });
      throw new Error('Failed to revoke API key');
    }
  }

  /**
   * Rotate an API key (create new, expire old with grace period)
   */
  async rotateApiKey(storeId: string, keyId: string, gracePeriodDays: number = 30): Promise<ApiKeyRotationResult> {
    const oldKey = await prisma.apiKey.findFirst({
      where: { id: keyId, storeId },
    }) as ApiKey | null;

    if (!oldKey) {
      throw new Error('API key not found');
    }

    if (oldKey.status !== 'ACTIVE') {
      throw new Error('Cannot rotate non-active API key');
    }

    // Create new key with same permissions
    const { apiKey: newApiKey, key } = await this.createApiKey({
      storeId,
      name: `${oldKey.name} (Rotated)`,
      scopes: oldKey.scopes as ApiKeyScope[],
      createdByUserId: oldKey.createdBy || 'system',
      ipAllowlist: oldKey.ipAllowlist,
    });

    // Set expiration on old key (grace period)
    const oldKeyExpiry = new Date();
    oldKeyExpiry.setDate(oldKeyExpiry.getDate() + gracePeriodDays);

    await prisma.apiKey.update({
      where: { id: keyId },
      data: {
        expiresAt: oldKeyExpiry,
        name: `${oldKey.name} (Deprecated)`,
      },
    });

    logger.info('[ApiKeyManager] Rotated API key', {
      oldKeyId: keyId,
      newKeyId: newApiKey.id,
      storeId,
      gracePeriodDays,
    });

    return {
      newKey: {
        id: newApiKey.id,
        key,
        prefix: newApiKey.keyPrefix || key.slice(0, 16),
      },
      oldKeyExpiry,
      message: `New key created. Old key will expire on ${oldKeyExpiry.toISOString()}. Please update your integrations.`,
    };
  }

  /**
   * Get API keys for a store
   */
  async getApiKeys(storeId: string, status?: ApiKeyStatus): Promise<Omit<ApiKey, 'keyHash'>[]> {
    const where: Record<string, unknown> = { storeId };
    if (status) {
      where.status = status;
    }

    const keys = await prisma.apiKey.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    }) as ApiKey[];

    return keys.map(({ keyHash, ...sanitized }) => sanitized);
  }

  /**
   * Get a single API key by ID
   */
  async getApiKey(storeId: string, keyId: string): Promise<Omit<ApiKey, 'keyHash'> | null> {
    const key = await prisma.apiKey.findFirst({
      where: { id: keyId, storeId },
    }) as ApiKey | null;

    if (!key) return null;

    const { keyHash, ...sanitized } = key;
    return sanitized;
  }

  /**
   * Update API key (name, scopes, IP allowlist)
   */
  async updateApiKey(
    storeId: string,
    keyId: string,
    updates: Partial<Pick<ApiKey, 'name' | 'scopes' | 'ipAllowlist'>>
  ): Promise<Omit<ApiKey, 'keyHash'>> {
    const key = await prisma.apiKey.update({
      where: { id: keyId },
      data: updates,
    }) as ApiKey;

    logger.info('[ApiKeyManager] Updated API key', {
      keyId,
      storeId,
      updates: Object.keys(updates),
    });

    const { keyHash, ...sanitized } = key;
    return sanitized;
  }

  /**
   * Clean up expired keys (call periodically)
   */
  async cleanupExpiredKeys(): Promise<number> {
    const result = await prisma.apiKey.updateMany({
      where: {
        status: 'ACTIVE',
        expiresAt: { lt: new Date() },
      },
      data: {
        status: 'REVOKED',
        revokedAt: new Date(),
      },
    });

    if (result.count > 0) {
      logger.info('[ApiKeyManager] Cleaned up expired keys', { count: result.count });
    }

    return result.count;
  }
}

// Export singleton instance
export const apiKeyManager = new ApiKeyManager();
