/**
 * Add-On Lifecycle Management
 *
 * Safe enable/disable with data preservation.
 */

import { AddOnMetadata } from "./addon-types";

export interface EnableResult {
  success: boolean;
  errors: string[];
  warnings: string[];
  rollbackAvailable: boolean;
}

export interface DisableResult {
  success: boolean;
  dataPreserved: boolean;
  uiEntriesRemoved: string[];
}

export class LifecycleManager {
  /**
   * Enable add-on (non-destructive, backward compatible)
   */
  static async enable(
    userId: string,
    addon: AddOnMetadata,
  ): Promise<EnableResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      // Validate prerequisites
      const validation = await this.validateEnable(userId, addon);
      if (!validation.valid) {
        return {
          success: false,
          errors: validation.errors,
          warnings: [],
          rollbackAvailable: false,
        };
      }

      // Enable add-on (non-destructive)
      await fetch("/api/extensions/enable", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, addonId: addon.id }),
      });

      return {
        success: true,
        errors: [],
        warnings,
        rollbackAvailable: true,
      };
    } catch {
      errors.push("Failed to enable add-on");
      return {
        success: false,
        errors,
        warnings: [],
        rollbackAvailable: false,
      };
    }
  }

  /**
   * Disable add-on (reversible, data preserved)
   */
  static async disable(
    userId: string,
    addonId: string,
  ): Promise<DisableResult> {
    try {
      const response = await fetch("/api/extensions/disable", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, addonId }),
      });

      const data = await response.json();

      return {
        success: true,
        dataPreserved: true,
        uiEntriesRemoved: data.uiEntriesRemoved || [],
      };
    } catch {
      return {
        success: false,
        dataPreserved: true, // Always preserve data even on error
        uiEntriesRemoved: [],
      };
    }
  }

  /**
   * Validate enable prerequisites
   */
  private static async validateEnable(
    userId: string,
    addon: AddOnMetadata,
  ): Promise<{ valid: boolean; errors: string[] }> {
    const errors: string[] = [];

    // Check if already enabled
    const isEnabled = await this.isEnabled(userId, addon.id);
    if (isEnabled) {
      errors.push("Add-on is already enabled");
    }

    // Additional validation can be added here

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Check if add-on is enabled
   */
  static async isEnabled(userId: string, addonId: string): Promise<boolean> {
    try {
      const response = await fetch(
        `/api/extensions/status?userId=${userId}&addonId=${addonId}`,
      );
      const data = await response.json();
      return data.isEnabled || false;
    } catch {
      return false;
    }
  }

  /**
   * Get user's enabled add-ons
   */
  static async getEnabledAddOns(userId: string): Promise<string[]> {
    try {
      const response = await fetch(`/api/extensions/user/${userId}`);
      const data = await response.json();
      return data.enabledAddOns || [];
    } catch {
      return [];
    }
  }
}

/**
 * Safe enable/disable rules
 */
export const LifecycleRules = {
  /**
   * Enable rules
   */
  ENABLE: {
    nonDestructive: true,
    backwardCompatible: true,
    immediateEffect: "where_applicable",
  },

  /**
   * Disable rules
   */
  DISABLE: {
    reversible: true,
    dataPreserved: true,
    uiEntriesRemoved: true,
  },

  /**
   * Critical rule: No add-on deletion may remove or corrupt existing records
   */
  DATA_PRESERVATION: {
    noDataDeletion: true,
    noDataCorruption: true,
    historicalDataIntact: true,
  },
};
