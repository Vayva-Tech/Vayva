import { logger } from "@/lib/logger";

export interface IndustryType {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  defaultFeatures: string[];
}

export interface IndustryConfig {
  id: string;
  name: string;
  displayName?: string;
  slug?: string;
  description: string;
  icon?: string;
  features?: readonly string[] | string[] | Record<string, boolean>;
  primaryObject?: string;
  /** Optional display label for industry archetype (API / settings UI). */
  archetype?: string;
  modules?: readonly string[] | string[];
  moduleLabels?: Record<string, string>;
  moduleRoutes?: Record<string, string | { index: string; create?: string }>;
  moduleIcons?: Record<string, string>;
  defaultSettings: Record<string, unknown>;
  dashboardWidgets?: Array<{
    id: string;
    title: string;
    dataSource: string;
    type: string;
    w: number;
  }>;
  templates?: Record<string, string[]>;
  forms?: Record<string, unknown>;
  onboardingSteps?: string[];
  aiTools?: string[];
}

export interface IndustryArchetype {
  id: string;
  industryId: string;
  name: string;
  description: string;
  recommendedTemplates: string[];
  defaultSettings: Record<string, unknown>;
}

export enum AuditEventType {
  USER_LOGIN = "USER_LOGIN",
  USER_LOGOUT = "USER_LOGOUT",
  ORDER_CREATED = "ORDER_CREATED",
  ORDER_UPDATED = "ORDER_UPDATED",
  PRODUCT_CREATED = "PRODUCT_CREATED",
  PRODUCT_UPDATED = "PRODUCT_UPDATED",
  PRODUCT_DELETED = "PRODUCT_DELETED",
  SETTINGS_CHANGED = "SETTINGS_CHANGED",
  PAYMENT_PROCESSED = "PAYMENT_PROCESSED",
  REFUND_ISSUED = "REFUND_ISSUED",
  SECURITY_RATE_LIMIT_BLOCKED = "SECURITY_RATE_LIMIT_BLOCKED",
}

export interface AuditEvent {
  id: string;
  storeId: string;
  userId?: string;
  eventType: AuditEventType;
  targetType: string;
  targetId?: string;
  ipAddress?: string;
  meta?: Record<string, unknown>;
  createdAt: Date;
}

export async function logAuditEvent(
  storeId: string,
  userId: string,
  eventType: AuditEventType,
  data: {
    targetType: string;
    targetId?: string;
    ipAddress?: string;
    meta?: Record<string, unknown>;
  }
): Promise<void> {
  // In a real implementation, this would send to backend
  logger.info("[AUDIT]", { storeId, userId, eventType, ...data });
}
