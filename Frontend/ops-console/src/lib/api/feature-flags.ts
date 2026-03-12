/**
 * Feature Flags Service for Ops Console
 * 
 * Provides runtime feature toggles for gradual rollouts and
 * emergency feature disables without redeployment.
 */

import { prisma } from "@vayva/db";
import { logger } from "@vayva/shared";
import { getCache, setCache, deleteCache } from "../api/cache";

// Feature flag types
export type FeatureFlagValue = boolean | number | string | object;

type FeatureFlagRules = {
  global?: FeatureFlagValue;
  user?: Record<string, FeatureFlagValue>;
  merchant?: Record<string, FeatureFlagValue>;
};

export interface FeatureFlag {
  key: string;
  name: string;
  description: string;
  defaultValue: FeatureFlagValue;
  currentValue: FeatureFlagValue;
  type: "boolean" | "percentage" | "string" | "json";
  scope: "global" | "user" | "merchant";
  enabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Predefined feature flags
export const DEFAULT_FLAGS: Record<string, Omit<FeatureFlag, "key" | "createdAt" | "updatedAt">> = {
  NEW_MERCHANT_DASHBOARD: {
    name: "New Merchant Dashboard",
    description: "Enable the redesigned merchant dashboard UI",
    defaultValue: false,
    currentValue: false,
    type: "boolean",
    scope: "global",
    enabled: true,
  },
  BULK_KYC_APPROVAL: {
    name: "Bulk KYC Approval",
    description: "Allow approving multiple KYC records at once",
    defaultValue: true,
    currentValue: true,
    type: "boolean",
    scope: "global",
    enabled: true,
  },
  AI_ASSISTANT: {
    name: "AI Operations Assistant",
    description: "Enable AI-powered ops assistance features",
    defaultValue: false,
    currentValue: false,
    type: "boolean",
    scope: "global",
    enabled: false,
  },
  ADVANCED_ANALYTICS: {
    name: "Advanced Analytics",
    description: "Enable advanced analytics and reporting features",
    defaultValue: false,
    currentValue: false,
    type: "percentage",
    scope: "merchant",
    enabled: false,
  },
  EMERGENCY_MODE: {
    name: "Emergency Mode",
    description: "Restrict operations during system maintenance",
    defaultValue: false,
    currentValue: false,
    type: "boolean",
    scope: "global",
    enabled: true,
  },
  MAINTENANCE_BANNER: {
    name: "Maintenance Banner",
    description: "Show maintenance banner with custom message",
    defaultValue: "",
    currentValue: "",
    type: "string",
    scope: "global",
    enabled: true,
  },
};

const CACHE_PREFIX = "feature-flag";
const CACHE_TTL = 60 * 1000; // 1 minute

/**
 * Get feature flag value
 */
export async function getFlag(key: string, context?: {
  userId?: string;
  merchantId?: string;
}): Promise<FeatureFlagValue> {
  const cacheKey = `${key}:${context?.userId || "global"}:${context?.merchantId || "global"}`;
  
  // Try cache first
  const cached = await getCache<FeatureFlagValue>(cacheKey, CACHE_PREFIX);
  if (cached !== null) {
    return cached;
  }
  
  // Get from database or defaults
  const value = await getFlagValueFromSource(key, context);
  
  // Cache result
  await setCache(cacheKey, value, { ttl: CACHE_TTL, keyPrefix: CACHE_PREFIX });
  
  return value;
}

/**
 * Check if a boolean flag is enabled
 */
export async function isEnabled(key: string, context?: {
  userId?: string;
  merchantId?: string;
}): Promise<boolean> {
  const value = await getFlag(key, context);
  
  if (typeof value === "boolean") {
    return value;
  }
  
  // For percentage-based flags, check if user/merchant is in rollout
  if (typeof value === "number") {
    const id = context?.userId || context?.merchantId || "global";
    return isInRollout(id, value);
  }
  
  return false;
}

/**
 * Get string flag value
 */
export async function getStringFlag(key: string, context?: {
  userId?: string;
  merchantId?: string;
}): Promise<string> {
  const value = await getFlag(key, context);
  return typeof value === "string" ? value : "";
}

/**
 * Get JSON flag value
 */
export async function getJSONFlag<T extends object>(key: string, context?: {
  userId?: string;
  merchantId?: string;
}): Promise<T | null> {
  const value = await getFlag(key, context);
  
  if (typeof value === "object" && value !== null) {
    return value as T;
  }
  
  if (typeof value === "string") {
    try {
      return JSON.parse(value) as T;
    } catch {
      return null;
    }
  }
  
  return null;
}

/**
 * Set feature flag value
 */
export async function setFlag(
  key: string,
  value: FeatureFlagValue,
  scope: FeatureFlag["scope"] = "global",
  targetId?: string
): Promise<void> {
  try {
    const existing = await prisma.featureFlag.findUnique({ where: { key } });
    const rules: FeatureFlagRules =
      (existing?.rules as FeatureFlagRules | null) ?? {};

    if (scope === "global") {
      rules.global = value;
    } else if (scope === "user" && targetId) {
      rules.user = { ...(rules.user ?? {}), [targetId]: value };
    } else if (scope === "merchant" && targetId) {
      rules.merchant = { ...(rules.merchant ?? {}), [targetId]: value };
    }

    const defaultFlag = DEFAULT_FLAGS[key];

    await prisma.featureFlag.upsert({
      where: { key },
      update: {
        rules,
        enabled: true,
        updatedAt: new Date(),
      },
      create: {
        key,
        description: defaultFlag?.description || "Feature flag",
        enabled: true,
        rules,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
    
    // Invalidate cache
    const cacheKey = `${key}:${scope === "user" ? targetId : "global"}:${scope === "merchant" ? targetId : "global"}`;
    await deleteCache(cacheKey, CACHE_PREFIX);
    
    logger.info(`[FEATURE_FLAG] Updated ${key} = ${JSON.stringify(value)}`);
  } catch (error) {
    logger.error(`[FEATURE_FLAG] Failed to update ${key}`, {
      error: error instanceof Error
        ? { message: error.message, stack: error.stack }
        : error,
    });
    throw error;
  }
}

/**
 * Get all feature flags
 */
export async function getAllFlags(context?: {
  userId?: string;
  merchantId?: string;
}): Promise<Record<string, FeatureFlagValue>> {
  const flags: Record<string, FeatureFlagValue> = {};
  
  for (const key of Object.keys(DEFAULT_FLAGS)) {
    flags[key] = await getFlag(key, context);
  }
  
  return flags;
}

/**
 * Internal: Get flag value from database or defaults
 */
async function getFlagValueFromSource(
  key: string,
  context?: { userId?: string; merchantId?: string }
): Promise<FeatureFlagValue> {
  // Check if flag exists in defaults
  const defaultFlag = DEFAULT_FLAGS[key];
  if (!defaultFlag) {
    return false;
  }
  
  // Try to get specific value for context
  const scopes: Array<{ scope: FeatureFlag["scope"]; targetId: string }> = [
    { scope: "global", targetId: "global" },
  ];
  
  if (context?.userId) {
    scopes.push({ scope: "user", targetId: context.userId });
  }
  
  if (context?.merchantId) {
    scopes.push({ scope: "merchant", targetId: context.merchantId });
  }
  
  // Check each scope in priority order
  try {
    const dbFlag = await prisma.featureFlag.findUnique({ where: { key } });
    if (dbFlag && dbFlag.enabled) {
      const rules = (dbFlag.rules as FeatureFlagRules | null) ?? {};
      for (const { scope, targetId } of scopes.reverse()) {
        const scopedValue =
          scope === "global"
            ? rules.global
            : scope === "user"
              ? rules.user?.[targetId]
              : rules.merchant?.[targetId];

        if (scopedValue !== undefined) {
          return parseRuleValue(scopedValue, defaultFlag.type);
        }
      }
    }
  } catch (error) {
    logger.warn(`[FEATURE_FLAG] DB lookup failed for ${key}, using default`, {
      error: error instanceof Error
        ? { message: error.message, stack: error.stack }
        : error,
    });
  }
  
  return defaultFlag.currentValue;
}

/**
 * Parse flag value from database
 */
function parseFlagValue(value: string, type: FeatureFlag["type"]): FeatureFlagValue {
  switch (type) {
    case "boolean":
      return value === "true";
    case "percentage":
      return parseInt(value, 10) || 0;
    case "string":
      return value;
    case "json":
      try {
        return JSON.parse(value);
      } catch {
        return {};
      }
    default:
      return value;
  }
}

function parseRuleValue(value: FeatureFlagValue, type: FeatureFlag["type"]): FeatureFlagValue {
  if (type === "boolean") return Boolean(value);
  if (type === "percentage") return typeof value === "number" ? value : parseInt(String(value), 10) || 0;
  if (type === "string") return typeof value === "string" ? value : String(value ?? "");
  return value;
}

/**
 * Check if ID is within rollout percentage
 */
function isInRollout(id: string, percentage: number): boolean {
  // Simple hash-based rollout
  const hash = hashString(id);
  return (hash % 100) < percentage;
}

/**
 * Simple string hash function
 */
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

/**
 * Initialize default feature flags in database
 */
export async function initializeFlags(): Promise<void> {
  try {
    for (const [key, flag] of Object.entries(DEFAULT_FLAGS)) {
      await prisma.featureFlag.upsert({
        where: { key },
        update: {},
        create: {
          key,
          description: flag.description,
          enabled: flag.enabled,
          rules: { global: flag.defaultValue },
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });
    }
    
    logger.info("[FEATURE_FLAG] Default flags initialized");
  } catch (error) {
    logger.error("[FEATURE_FLAG] Failed to initialize flags", {
      error: error instanceof Error
        ? { message: error.message, stack: error.stack }
        : error,
    });
  }
}
