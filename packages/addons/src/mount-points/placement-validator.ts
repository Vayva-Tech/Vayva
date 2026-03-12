/**
 * Placement Validator - Validates add-on compatibility with mount points
 */

import type { MountPointId } from '../../types';
import { MOUNT_POINTS } from '../../types';

export interface PlacementValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export interface PlacementRequest {
  addOnId: string;
  addOnCategory: string;
  targetMountPoint: MountPointId;
  currentMounts: MountPointId[];
  templateId: string;
  templateCapabilities: string[];
}

/**
 * Validate if an add-on can be placed at a specific mount point
 */
export function validatePlacement(
  request: PlacementRequest
): PlacementValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check if mount point exists
  if (!MOUNT_POINTS[request.targetMountPoint]) {
    errors.push(`Mount point "${request.targetMountPoint}" does not exist`);
    return { valid: false, errors, warnings };
  }

  const mountPoint = MOUNT_POINTS[request.targetMountPoint];

  // Check template capabilities
  if (request.templateCapabilities.length > 0) {
    const hasCapability = request.templateCapabilities.some((cap) =>
      request.targetMountPoint.startsWith(cap)
    );
    if (!hasCapability) {
      warnings.push(
        `Template "${request.templateId}" may not fully support "${mountPoint.label}"`
      );
    }
  }

  // Check category compatibility
  const categoryValidation = validateCategoryCompatibility(
    request.addOnCategory,
    request.targetMountPoint
  );
  if (!categoryValidation.valid) {
    errors.push(...categoryValidation.errors);
  }
  warnings.push(...categoryValidation.warnings);

  // Check if already mounted elsewhere (for singleton add-ons)
  if (request.currentMounts.length > 0) {
    warnings.push(
      `Add-on is already mounted at: ${request.currentMounts.join(', ')}`
    );
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validate category compatibility with mount point
 */
function validateCategoryCompatibility(
  category: string,
  mountPoint: MountPointId
): { valid: boolean; errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Category-specific mount point restrictions
  const restrictions: Record<string, string[]> = {
    ecommerce: ['product-card', 'product-detail', 'checkout-summary', 'checkout-header'],
    booking: ['floating-button', 'footer-widgets'],
    marketing: ['hero-section', 'below-fold', 'footer-widgets', 'post-content'],
    content: ['post-content', 'product-detail', 'page-sidebar'],
    operations: ['dashboard-home-widgets', 'dashboard-sidebar'],
    integration: [], // Can mount anywhere
  };

  const preferred = restrictions[category];
  if (preferred && preferred.length > 0) {
    const isPreferred = preferred.some((p) => mountPoint.includes(p));
    if (!isPreferred) {
      warnings.push(
        `"${category}" add-ons typically work best in: ${preferred.join(', ')}`
      );
    }
  }

  return { valid: true, errors, warnings };
}

/**
 * Check if adding an add-on would exceed mount point capacity
 */
export function checkCapacity(
  mountPoint: MountPointId,
  currentCount: number
): { canAdd: boolean; remaining: number } {
  const config = MOUNT_POINTS[mountPoint];
  const max = config.maxComponents || 10;

  return {
    canAdd: currentCount < max,
    remaining: max - currentCount,
  };
}

/**
 * Get recommended mount points for an add-on category
 */
export function getRecommendedMountPoints(
  category: string
): MountPointId[] {
  const recommendations: Record<string, MountPointId[]> = {
    ecommerce: ['product-detail', 'product-card', 'header-right', 'checkout-summary'],
    booking: ['floating-button', 'footer-widgets', 'product-detail'],
    marketing: ['hero-section', 'below-fold', 'footer-widgets', 'floating-button'],
    content: ['post-content', 'product-detail', 'hero-section'],
    operations: ['dashboard-home-widgets', 'dashboard-sidebar'],
    integration: ['footer-widgets', 'floating-button', 'page-sidebar'],
  };

  return recommendations[category] || ['footer-widgets', 'floating-button'];
}

/**
 * Validate entire add-on configuration for a store
 */
export function validateConfiguration(
  mounts: Array<{ addOnId: string; mountPoint: MountPointId }>,
  _templateId: string
): PlacementValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check for duplicates at same mount point
  const mountPointCounts: Record<string, string[]> = {};
  mounts.forEach((mount) => {
    if (!mountPointCounts[mount.mountPoint]) {
      mountPointCounts[mount.mountPoint] = [];
    }
    mountPointCounts[mount.mountPoint].push(mount.addOnId);
  });

  // Check capacity
  Object.entries(mountPointCounts).forEach(([mp, addons]) => {
    const capacity = checkCapacity(mp as MountPointId, addons.length);
    if (!capacity.canAdd) {
      errors.push(
        `Mount point "${mp}" exceeds capacity (${addons.length} add-ons)`
      );
    } else if (capacity.remaining < 2) {
      warnings.push(
        `Mount point "${mp}" is nearly full (${addons.length}/${addons.length + capacity.remaining})`
      );
    }
  });

  // Check for conflicting add-ons
  const addOnIds = mounts.map((m) => m.addOnId);
  const conflicts = findConflicts(addOnIds);
  conflicts.forEach((conflict) => {
    warnings.push(
      `Add-ons "${conflict.a}" and "${conflict.b}" may conflict: ${conflict.reason}`
    );
  });

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Find conflicting add-on pairs
 */
function findConflicts(
  addOnIds: string[]
): Array<{ a: string; b: string; reason: string }> {
  const conflicts: Array<{ a: string; b: string; reason: string }> = [];

  // Known incompatible pairs
  const incompatibilities: Array<[string, string, string]> = [
    ['vayva.live-chat', 'vayva.whatsapp', 'Multiple chat widgets may confuse users'],
    ['vayva.countdown', 'vayva.event-countdown', 'Duplicate countdowns create visual clutter'],
  ];

  incompatibilities.forEach(([a, b, reason]) => {
    const hasA = addOnIds.some((id) => id.includes(a) || a.includes(id));
    const hasB = addOnIds.some((id) => id.includes(b) || b.includes(id));
    if (hasA && hasB) {
      conflicts.push({ a, b, reason });
    }
  });

  return conflicts;
}
