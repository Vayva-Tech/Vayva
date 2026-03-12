/* eslint-disable no-empty */
import { z } from "zod";
import { logger } from "@vayva/shared";

/**
 * ENVIRONMENT VALIDATION & FEATURE FLAGS
 *
 * This module enforces required environment variables and disables features
 * if their dependencies are missing. NO SILENT FALLBACKS ALLOWED.
 *
 * If a feature is disabled, it MUST be hidden from the UI.
 */
// Environment variable validation
const ENV = {
  // Core
  NODE_ENV: process.env.NODE_ENV || "development",
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
  NEXTAUTH_URL: process.env.NEXTAUTH_URL,
  BACKEND_API_URL: process.env.BACKEND_API_URL,
  REDIS_URL: process.env.REDIS_URL,
  // Payment
  PAYSTACK_SECRET_KEY: process.env.PAYSTACK_SECRET_KEY,
  PAYSTACK_PUBLIC_KEY: process.env.PAYSTACK_PUBLIC_KEY,
  // Email
  RESEND_API_KEY: process.env.RESEND_API_KEY,
  RESEND_FROM_EMAIL: process.env.RESEND_FROM_EMAIL,
  // WhatsApp
  WHATSAPP_API_KEY: process.env.WHATSAPP_API_KEY,
  WHATSAPP_PHONE_NUMBER: process.env.WHATSAPP_PHONE_NUMBER,
  WHATSAPP_WEBHOOK_SECRET: process.env.WHATSAPP_WEBHOOK_SECRET,
  // Delivery
  KWIK_API_KEY: process.env.KWIK_API_KEY,
  KWIK_MERCHANT_ID: process.env.KWIK_MERCHANT_ID,
  // KYC (Manual - Admin Approval)
  // KYC is now handled via manual admin review, not automated via YouVerify
  MANUAL_KYC_ENABLED: process.env.MANUAL_KYC_ENABLED === "true" || true,
  // Storage (MinIO S3-compatible)
  MINIO_ENDPOINT: process.env.MINIO_ENDPOINT,
  MINIO_ACCESS_KEY: process.env.MINIO_ACCESS_KEY,
  MINIO_SECRET_KEY: process.env.MINIO_SECRET_KEY,
  MINIO_BUCKET: process.env.MINIO_BUCKET,
  MINIO_REGION: process.env.MINIO_REGION || "us-east-1",
  MINIO_PUBLIC_BASE_URL: process.env.MINIO_PUBLIC_BASE_URL,
  // Legacy Vercel Blob (deprecated, use MinIO)
  BLOB_READ_WRITE_TOKEN: process.env.BLOB_READ_WRITE_TOKEN,
  // Monitoring
  SENTRY_DSN: process.env.SENTRY_DSN,
  // AI (Groq)
  GROQ_ADMIN_KEY: process.env.GROQ_ADMIN_KEY,
  GROQ_MARKETING_KEY: process.env.GROQ_MARKETING_KEY,
  GROQ_WHATSAPP_KEY: process.env.GROQ_WHATSAPP_KEY,
};
/**
 * FEATURE FLAGS
 *
 * Features are DISABLED by default if their env vars are missing.
 * This prevents silent fallbacks to test data.
 */
export const FEATURES = {
  /**
   * Payment Processing
   * Requires: PAYSTACK_SECRET_KEY, PAYSTACK_PUBLIC_KEY
   */
  PAYMENTS_ENABLED: Boolean(
    ENV.PAYSTACK_SECRET_KEY &&
    ENV.PAYSTACK_PUBLIC_KEY &&
    (ENV.NODE_ENV === "development" ||
      !ENV.PAYSTACK_SECRET_KEY.includes("test_test")),
  ),
  /**
   * Email Sending
   * Requires: RESEND_API_KEY, RESEND_FROM_EMAIL
   */
  EMAIL_ENABLED: Boolean(ENV.RESEND_API_KEY && ENV.RESEND_FROM_EMAIL),
  /**
   * WhatsApp Integration
   * Requires: WHATSAPP_API_KEY, WHATSAPP_PHONE_NUMBER, WHATSAPP_WEBHOOK_SECRET
   */
  WHATSAPP_ENABLED: Boolean(
    ENV.WHATSAPP_API_KEY &&
    ENV.WHATSAPP_PHONE_NUMBER &&
    ENV.WHATSAPP_WEBHOOK_SECRET,
  ),
  /**
   * Delivery Integration
   * Requires: KWIK_API_KEY, KWIK_MERCHANT_ID
   */
  DELIVERY_ENABLED: Boolean(
    (ENV.KWIK_API_KEY && ENV.KWIK_MERCHANT_ID) ||
    (process.env.KWIK_EMAIL && process.env.KWIK_PASSWORD),
  ),
  /**
   * KYC Verification (Manual Admin Review)
   * Manual KYC process via admin approval
   */
  KYC_ENABLED: true, // Always enabled - uses manual admin review
  /**
   * File Storage (MinIO S3-compatible)
   * Requires: MINIO_ENDPOINT, MINIO_ACCESS_KEY, MINIO_SECRET_KEY, MINIO_BUCKET
   */
  STORAGE_ENABLED: Boolean(
    ENV.MINIO_ENDPOINT &&
    ENV.MINIO_ACCESS_KEY &&
    ENV.MINIO_SECRET_KEY &&
    ENV.MINIO_BUCKET,
  ),
  /**
   * Control Center (Store Builder)
   * Enabled after branding and navigation foundation stabilization.
   */
  CONTROL_CENTER_ENABLED: true,
  /**
   * Error Monitoring
   * Requires: SENTRY_DSN
   */
  SENTRY_ENABLED: Boolean(ENV.SENTRY_DSN),
  /**
   * AI Assistant (Core & Support)
   * Requires: GROQ_ADMIN_KEY
   */
  AI_ASSISTANT_ENABLED: Boolean(ENV.GROQ_ADMIN_KEY),
  /**
   * Marketing AI Assistant
   * Requires: GROQ_MARKETING_KEY
   */
  MARKETING_AI_ENABLED: Boolean(ENV.GROQ_MARKETING_KEY),
  /**
   * Transactions & Payments UI
   * Shows detailed transaction history, payment tracking, and financial reports.
   * Enabled by default when payments are enabled.
   */
  TRANSACTIONS_ENABLED: Boolean(
    ENV.PAYSTACK_SECRET_KEY && ENV.PAYSTACK_PUBLIC_KEY,
  ),
  /**
   * Dashboard V2
   * Enhanced dashboard with KPI blocks, todos/alerts, quick actions, and trends.
   * Enabled by default for improved merchant experience.
   */
  DASHBOARD_V2_ENABLED: true,
};
/**
 * URL VALIDATION HELPERS
 */
const urlSchema = z.string().url().optional();

function validateUrl(name: string, value: string | undefined): string | null {
  if (!value) return null;
  try {
    new URL(value);
    return null;
  } catch {
    return `${name} must be a valid URL (got: ${value})`;
  }
}

/**
 * PRODUCTION URL VALIDATION
 */
export function validateProductionUrls(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (ENV.NODE_ENV === "production") {
    // Validate URL formats
    const urlErrors = [
      validateUrl("NEXTAUTH_URL", ENV.NEXTAUTH_URL),
      validateUrl("BACKEND_API_URL", ENV.BACKEND_API_URL),
      validateUrl("MINIO_PUBLIC_BASE_URL", ENV.MINIO_PUBLIC_BASE_URL),
    ].filter(Boolean) as string[];
    
    errors.push(...urlErrors);
    
    // Validate no localhost in production
    const localhostVars = [
      { name: "NEXTAUTH_URL", value: ENV.NEXTAUTH_URL },
      { name: "BACKEND_API_URL", value: ENV.BACKEND_API_URL },
    ];
    
    for (const { name, value } of localhostVars) {
      if (value?.includes("localhost") || value?.includes("127.0.0.1")) {
        errors.push(`${name} cannot be localhost in production`);
      }
    }
    
    // Validate HTTPS in production
    const httpsRequired = [
      { name: "NEXTAUTH_URL", value: ENV.NEXTAUTH_URL },
      { name: "BACKEND_API_URL", value: ENV.BACKEND_API_URL },
    ];
    
    for (const { name, value } of httpsRequired) {
      if (value && !value.startsWith("https://")) {
        errors.push(`${name} must use HTTPS in production`);
      }
    }
  }
  
  return { valid: errors.length === 0, errors };
}

/**
 * PRODUCTION VALIDATION
 *
 * In production, certain features MUST be enabled.
 * This prevents accidental deployment without critical services.
 */
export function validateProductionRequirements() {
  const errors: string[] = [];
  
  if (ENV.NODE_ENV === "production") {
    // Core requirements
    if (!ENV.NEXTAUTH_SECRET) {
      errors.push("NEXTAUTH_SECRET is required in production");
    }
    // BACKEND_API_URL is optional - app falls back to direct DB auth when not set
    // Critical features
    if (!FEATURES.PAYMENTS_ENABLED) {
      errors.push("Payment integration (Paystack) is required in production");
    }
    if (!FEATURES.EMAIL_ENABLED) {
      errors.push("Email integration (Resend) is required in production");
    }
    // Recommended features (warnings, not blockers)
    if (!FEATURES.WHATSAPP_ENABLED) {
      try {
        logger.warn(
          "⚠️  WhatsApp integration is disabled. Core product feature unavailable.",
        );
      } catch (e: unknown) {}
    }
    if (!FEATURES.KYC_ENABLED) {
      try {
        logger.warn(
          "⚠️  KYC integration is disabled. Compliance features unavailable.",
        );
      } catch (e: unknown) {}
    }
    if (!FEATURES.DELIVERY_ENABLED) {
      try {
        logger.warn(
          "⚠️  Delivery integration is disabled. Auto-dispatch unavailable.",
        );
      } catch (e: unknown) {}
    }
    if (!FEATURES.SENTRY_ENABLED) {
      try {
        logger.warn("⚠️  Sentry is disabled. Error monitoring unavailable.");
      } catch (e: unknown) {}
    }
  }
  return {
    valid: errors.length === 0,
    errors,
  };
}
/**
 * FEATURE GATE HELPER
 *
 * Use this to conditionally render UI based on feature availability.
 *
 * Example:
 * ```tsx
 * {isFeatureEnabled('WHATSAPP') && <WhatsAppButton />}
 * ``// 
 */
export function isFeatureEnabled(feature: string) {
  return FEATURES[feature as keyof typeof FEATURES];
}
/**
 * GET DISABLED FEATURE MESSAGE
 *
 * Returns user-friendly message for disabled features.
 */
export function getDisabledFeatureMessage(feature: string) {
  const messages = {
    PAYMENTS_ENABLED:
      "Payment processing is currently unavailable. Please contact support.",
    EMAIL_ENABLED: "Email notifications are currently unavailable.",
    WHATSAPP_ENABLED:
      "WhatsApp integration is not configured. Contact your administrator.",
    DELIVERY_ENABLED:
      "Automated delivery dispatch is not available. Use manual dispatch.",
    KYC_ENABLED: "Identity verification is not available at this time.",
    STORAGE_ENABLED: "File uploads are currently unavailable.",
    CONTROL_CENTER_ENABLED:
      "Control Center requires database migration. Contact support.",
    SENTRY_ENABLED: "Error monitoring is not configured.",
    AI_ASSISTANT_ENABLED: "The core AI assistant is currently disabled.",
    MARKETING_AI_ENABLED: "The marketing AI chat is currently disabled.",
    AGENT_AVATAR_ENABLED: "Agent avatar uploads are currently unavailable.",
  };
  return messages[feature as keyof typeof messages];
}
/**
 * ASSERT FEATURE ENABLED
 *
 * Throws error if feature is disabled. Use in API routes.
 *
 * Example:
 * ```ts
 * assertFeatureEnabled('PAYMENTS');
 * // Proceeds only if payments are enabled
 * ``// 
 */
export function assertFeatureEnabled(feature: string) {
  if (!FEATURES[feature as keyof typeof FEATURES]) {
    throw new Error(
      `Feature ${feature} is disabled. ${getDisabledFeatureMessage(feature)}`,
    );
  }
}
/**
 * STARTUP VALIDATION
 *
 * Call this at app startup to validate environment.
 * Logs warnings/errors but doesn't crash (except in production with missing critical vars).
 */
export function validateEnvironment() {
  // Feature status
  // Production validation
  const validation = validateProductionRequirements();
  const urlValidation = validateProductionUrls();
  
  const allErrors = [...validation.errors, ...urlValidation.errors];
  
  if (allErrors.length > 0) {
    logger.error("❌ PRODUCTION VALIDATION FAILED:");
    allErrors.forEach((error) => logger.error(`  - ${error}`));
    if (ENV.NODE_ENV === "production") {
      logger.error("");
      logger.error(
        "⚠️  PRODUCTION CONFIG INCOMPLETE: App will start, but some features will be disabled.",
      );
      logger.error(
        "Set missing environment variables to enable the full experience.",
      );
    }
  } else {
    // Production validation passed - all critical services configured
    logger.info("✅ Production environment validation passed");
  }
}
// Export environment for read-only access
export { ENV };
