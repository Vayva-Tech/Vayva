import { prisma } from '@vayva/db';
import { logger } from '@vayva/shared';
import * as crypto from 'crypto';

/**
 * Flag Service - Feature flag management and evaluation
 * 
 * Provides:
 * - Feature flag evaluation with merchant targeting
 * - Blocklist/allowlist support
 * - Rollout percentage calculation
 * - Kill switch functionality
 */

export interface FlagEvaluationResult {
  enabled: boolean;
  reason: string;
  flagKey: string;
  merchantId?: string;
}

export interface FlagConfig {
  key: string;
  enabled: boolean;
  merchantBlocklist?: string[];
  merchantAllowlist?: string[];
  rolloutPercent?: number;
  description?: string;
}

export class FlagService {
  /**
   * Evaluate a feature flag for a merchant
   */
  async evaluateFlag(
    key: string,
    merchantId?: string
  ): Promise<FlagEvaluationResult> {
    try {
      // Get flag configuration from database
      const flag = await prisma.featureFlag.findUnique({
        where: { key },
      });

      if (!flag) {
        logger.warn('[FlagService] Flag not found', { key });
        return {
          enabled: false,
          reason: 'FLAG_NOT_FOUND',
          flagKey: key,
          merchantId,
        };
      }

      // Check if flag is globally disabled
      if (!flag.enabled) {
        return {
          enabled: false,
          reason: 'FLAG_GLOBALLY_DISABLED',
          flagKey: key,
          merchantId,
        };
      }

      // Parse configurations
      const blocklist = this.parseStringArray(flag.merchantBlocklist);
      const allowlist = this.parseStringArray(flag.merchantAllowlist);
      const rolloutPercent = flag.rolloutPercent ?? 100;

      // Check blocklist first (highest priority)
      if (merchantId && blocklist.includes(merchantId)) {
        return {
          enabled: false,
          reason: 'MERCHANT_BLOCKLISTED',
          flagKey: key,
          merchantId,
        };
      }

      // Check allowlist (second priority)
      if (merchantId && allowlist.length > 0) {
        if (allowlist.includes(merchantId)) {
          return {
            enabled: true,
            reason: 'MERCHANT_ALLOWLISTED',
            flagKey: key,
            merchantId,
          };
        } else {
          return {
            enabled: false,
            reason: 'MERCHANT_NOT_IN_ALLOWLIST',
            flagKey: key,
            merchantId,
          };
        }
      }

      // Check rollout percentage
      if (rolloutPercent < 100) {
        const isInRollout = this.checkRolloutPercentage(key, merchantId, rolloutPercent);
        
        if (!isInRollout) {
          return {
            enabled: false,
            reason: 'ROLLOUT_PERCENTAGE_EXCLUDED',
            flagKey: key,
            merchantId,
          };
        }
      }

      // Flag is enabled by default if we reach here
      return {
        enabled: true,
        reason: 'FLAG_ENABLED',
        flagKey: key,
        merchantId,
      };
    } catch (error) {
      logger.error('[FlagService] Failed to evaluate flag', {
        key,
        merchantId,
        error: error instanceof Error ? error.message : String(error),
      });
      
      return {
        enabled: false,
        reason: 'EVALUATION_ERROR',
        flagKey: key,
        merchantId,
      };
    }
  }

  /**
   * Get all flags for a merchant
   */
  async getAllFlags(merchantId?: string): Promise<
    Array<{
      key: string;
      enabled: boolean;
      reason: string;
    }>
  > {
    try {
      const flags = await prisma.featureFlag.findMany({
        where: { enabled: true },
        orderBy: { key: 'asc' },
      });

      const results = await Promise.all(
        flags.map(async (flag) => {
          const evaluation = await this.evaluateFlag(flag.key, merchantId);
          return {
            key: flag.key,
            enabled: evaluation.enabled,
            reason: evaluation.reason,
          };
        })
      );

      return results;
    } catch (error) {
      logger.error('[FlagService] Failed to get all flags', {
        merchantId,
        error: error instanceof Error ? error.message : String(error),
      });
      return [];
    }
  }

  /**
   * Create or update a feature flag
   */
  async upsertFlag(config: FlagConfig): Promise<void> {
    try {
      await prisma.featureFlag.upsert({
        where: { key: config.key },
        create: {
          key: config.key,
          enabled: config.enabled,
          merchantBlocklist: config.merchantBlocklist
            ? JSON.stringify(config.merchantBlocklist)
            : null,
          merchantAllowlist: config.merchantAllowlist
            ? JSON.stringify(config.merchantAllowlist)
            : null,
          rolloutPercent: config.rolloutPercent,
          description: config.description,
        },
        update: {
          enabled: config.enabled,
          merchantBlocklist: config.merchantBlocklist
            ? JSON.stringify(config.merchantBlocklist)
            : undefined,
          merchantAllowlist: config.merchantAllowlist
            ? JSON.stringify(config.merchantAllowlist)
            : undefined,
          rolloutPercent: config.rolloutPercent,
          description: config.description,
        },
      });

      logger.info('[FlagService] Flag upserted', {
        key: config.key,
        enabled: config.enabled,
      });
    } catch (error) {
      logger.error('[FlagService] Failed to upsert flag', {
        config,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  /**
   * Delete a feature flag
   */
  async deleteFlag(key: string): Promise<void> {
    try {
      await prisma.featureFlag.delete({
        where: { key },
      });

      logger.info('[FlagService] Flag deleted', { key });
    } catch (error) {
      logger.error('[FlagService] Failed to delete flag', {
        key,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  /**
   * List all flags
   */
  async listFlags(): Promise<
    Array<{
      key: string;
      enabled: boolean;
      description?: string;
      rolloutPercent?: number;
      hasBlocklist: boolean;
      hasAllowlist: boolean;
    }>
  > {
    try {
      const flags = await prisma.featureFlag.findMany({
        orderBy: { key: 'asc' },
      });

      return flags.map((flag) => ({
        key: flag.key,
        enabled: flag.enabled,
        description: flag.description || undefined,
        rolloutPercent: flag.rolloutPercent ?? undefined,
        hasBlocklist: !!flag.merchantBlocklist,
        hasAllowlist: !!flag.merchantAllowlist,
      }));
    } catch (error) {
      logger.error('[FlagService] Failed to list flags', {
        error: error instanceof Error ? error.message : String(error),
      });
      return [];
    }
  }

  /**
   * Enable a flag for a specific merchant (add to allowlist)
   */
  async enableForMerchant(key: string, merchantId: string): Promise<void> {
    try {
      const flag = await prisma.featureFlag.findUnique({
        where: { key },
      });

      if (!flag) {
        throw new Error(`Flag ${key} not found`);
      }

      const allowlist = this.parseStringArray(flag.merchantAllowlist);
      if (!allowlist.includes(merchantId)) {
        allowlist.push(merchantId);
      }

      await prisma.featureFlag.update({
        where: { key },
        data: {
          merchantAllowlist: JSON.stringify(allowlist),
        },
      });

      logger.info('[FlagService] Merchant added to allowlist', {
        key,
        merchantId,
      });
    } catch (error) {
      logger.error('[FlagService] Failed to enable for merchant', {
        key,
        merchantId,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  /**
   * Disable a flag for a specific merchant (add to blocklist)
   */
  async disableForMerchant(key: string, merchantId: string): Promise<void> {
    try {
      const flag = await prisma.featureFlag.findUnique({
        where: { key },
      });

      if (!flag) {
        throw new Error(`Flag ${key} not found`);
      }

      const blocklist = this.parseStringArray(flag.merchantBlocklist);
      if (!blocklist.includes(merchantId)) {
        blocklist.push(merchantId);
      }

      await prisma.featureFlag.update({
        where: { key },
        data: {
          merchantBlocklist: JSON.stringify(blocklist),
        },
      });

      logger.info('[FlagService] Merchant added to blocklist', {
        key,
        merchantId,
      });
    } catch (error) {
      logger.error('[FlagService] Failed to disable for merchant', {
        key,
        merchantId,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  /**
   * Check if merchant is in rollout percentage
   */
  private checkRolloutPercentage(
    key: string,
    merchantId: string | undefined,
    percent: number
  ): boolean {
    // Use consistent hashing based on flag key and merchant ID
    const hashInput = merchantId ? `${key}:${merchantId}` : key;
    const hash = crypto.createHash('sha256').update(hashInput).digest('hex');
    
    // Convert first 8 chars of hash to number (0-99)
    const hashNumber = parseInt(hash.substring(0, 8), 16) % 100;
    
    return hashNumber < percent;
  }

  /**
   * Parse JSON string array safely
   */
  private parseStringArray(jsonString: string | null): string[] {
    if (!jsonString) return [];
    try {
      const parsed = JSON.parse(jsonString);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
}
