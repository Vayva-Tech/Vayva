/**
 * Compatibility Checking System
 *
 * Validates add-on compatibility with templates and user plans.
 */

import { AddOnMetadata, PlanTier } from "./addon-types";
import { ExtensionPoint, getExtensionPoint } from "./extension-points";

export interface CompatibilityCheck {
  isCompatible: boolean;
  reasons: string[];
  requiredPlanUpgrade?: "growth" | "pro";
  missingExtensionPoints?: ExtensionPoint[];
  incompatibleTemplate?: boolean;
}

export class CompatibilityChecker {
  /**
   * Check if add-on is compatible with user's setup
   */
  static checkCompatibility(
    addon: AddOnMetadata,
    userTemplateId: string,
    userPlan: PlanTier,
  ): CompatibilityCheck {
    const reasons: string[] = [];
    let isCompatible = true;

    // Check template compatibility
    if (!addon.compatibleTemplates.includes(userTemplateId)) {
      isCompatible = false;
      reasons.push(`Not compatible with your current template`);
    }

    // Check plan requirement
    const _planHierarchy = { free: 0, growth: 1, pro: 2 };
    const requiredPlanUpgrade = this.getRequiredPlanUpgrade(
      userPlan,
      addon.requiredPlan,
    );

    if (requiredPlanUpgrade) {
      isCompatible = false;
      reasons.push(
        `Requires ${addon.requiredPlan} plan (you're on ${userPlan})`,
      );
    }

    // Check extension point availability (template-specific)
    const extensionPoint = getExtensionPoint(addon.extensionPoint);
    if (!this.hasExtensionPoint(userTemplateId, addon.extensionPoint)) {
      isCompatible = false;
      reasons.push(`Your template doesn't support ${extensionPoint.name}`);
    }

    return {
      isCompatible,
      reasons,
      requiredPlanUpgrade,
      incompatibleTemplate: !addon.compatibleTemplates.includes(userTemplateId),
    };
  }

  /**
   * Get required plan upgrade (if any)
   */
  private static getRequiredPlanUpgrade(
    currentPlan: PlanTier,
    requiredPlan: PlanTier,
  ): "growth" | "pro" | undefined {
    const planHierarchy: Record<PlanTier, number> = { free: 0, starter: 1, pro: 2 };

    if (planHierarchy[currentPlan] < planHierarchy[requiredPlan]) {
      return requiredPlan as "growth" | "pro";
    }

    return undefined;
  }

  /**
   * Check if template has extension point
   * (In production, this would query template metadata)
   */
  private static hasExtensionPoint(
    templateId: string,
    extensionPoint: ExtensionPoint,
  ): boolean {
    // Template-specific extension point availability
    const templateExtensionPoints: Record<string, ExtensionPoint[]> = {
      "simple-retail": [
        ExtensionPoint.ORDERS_PRICING,
        ExtensionPoint.ORDERS_STATUS,
        ExtensionPoint.PAYMENTS_EXPORT,
        ExtensionPoint.REPORTS_ANALYTICS,
      ],
      "solo-services": [
        ExtensionPoint.ORDERS_STATUS,
        ExtensionPoint.PAYMENTS_EXPORT,
        ExtensionPoint.REPORTS_ANALYTICS,
      ],
      "structured-retail": [
        ExtensionPoint.ORDERS_PRICING,
        ExtensionPoint.ORDERS_STATUS,
        ExtensionPoint.PAYMENTS_RECONCILIATION,
        ExtensionPoint.PAYMENTS_EXPORT,
        ExtensionPoint.INVENTORY_FORECASTING,
        ExtensionPoint.DELIVERIES_COORDINATION,
        ExtensionPoint.REPORTS_ANALYTICS,
      ],
      "food-catering": [
        ExtensionPoint.ORDERS_STATUS,
        ExtensionPoint.PAYMENTS_EXPORT,
        ExtensionPoint.INVENTORY_FORECASTING,
        ExtensionPoint.DELIVERIES_COORDINATION,
        ExtensionPoint.REPORTS_ANALYTICS,
      ],
      "online-selling": [
        ExtensionPoint.ORDERS_PRICING,
        ExtensionPoint.ORDERS_STATUS,
        ExtensionPoint.PAYMENTS_RECONCILIATION,
        ExtensionPoint.PAYMENTS_EXPORT,
        ExtensionPoint.INVENTORY_FORECASTING,
        ExtensionPoint.DELIVERIES_COORDINATION,
        ExtensionPoint.DELIVERIES_PROOF,
        ExtensionPoint.REPORTS_ANALYTICS,
      ],
      wholesale: [
        ExtensionPoint.ORDERS_PRICING,
        ExtensionPoint.ORDERS_STATUS,
        ExtensionPoint.PAYMENTS_RECONCILIATION,
        ExtensionPoint.PAYMENTS_EXPORT,
        ExtensionPoint.INVENTORY_FORECASTING,
        ExtensionPoint.INVENTORY_SUPPLIER_SYNC,
        ExtensionPoint.DELIVERIES_COORDINATION,
        ExtensionPoint.REPORTS_ANALYTICS,
        ExtensionPoint.REPORTS_COMPLIANCE,
        ExtensionPoint.TEAM_APPROVALS,
      ],
      "multi-branch": [
        ExtensionPoint.ORDERS_PRICING,
        ExtensionPoint.ORDERS_STATUS,
        ExtensionPoint.PAYMENTS_RECONCILIATION,
        ExtensionPoint.PAYMENTS_EXPORT,
        ExtensionPoint.INVENTORY_FORECASTING,
        ExtensionPoint.INVENTORY_SUPPLIER_SYNC,
        ExtensionPoint.DELIVERIES_COORDINATION,
        ExtensionPoint.REPORTS_ANALYTICS,
        ExtensionPoint.REPORTS_COMPLIANCE,
        ExtensionPoint.TEAM_APPROVALS,
        ExtensionPoint.TEAM_AUDIT,
      ],
      "custom-advanced": Object.values(ExtensionPoint), // All extension points
    };

    const availablePoints = templateExtensionPoints[templateId] || [];
    return availablePoints.includes(extensionPoint);
  }

  /**
   * Get compatibility summary for display
   */
  static getCompatibilitySummary(check: CompatibilityCheck): string {
    if (check.isCompatible) {
      return "Compatible with your setup";
    }

    return check.reasons.join(". ");
  }
}
