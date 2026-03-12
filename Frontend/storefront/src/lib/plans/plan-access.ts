import { TemplatePlanTier } from "@/lib/templates-registry";

// Define the absolute hierarchy: Free < Pro < Business < Enterprise
const HIERARCHY: Record<TemplatePlanTier, number> = {
  [TemplatePlanTier.FREE]: 0,
  [TemplatePlanTier.GROWTH]: 1,
  [TemplatePlanTier.PRO]: 2,
};

/**
 * Checks if the user's plan tier is sufficient to access the template's required tier.
 * Returns true if userTier >= templateTier.
 */
export function canAccessTemplate(
  userTier: TemplatePlanTier,
  templateTier: TemplatePlanTier,
): boolean {
  const userLevel = HIERARCHY[userTier] ?? 0;
  const templateLevel = HIERARCHY[templateTier] ?? 0;
  return userLevel >= templateLevel;
}

/**
 * Returns a user-friendly locked reason string if access is denied.
 * Returns null if allowed.
 */
export function getLockedReason(
  userTier: TemplatePlanTier,
  templateTier: TemplatePlanTier,
): string | null {
  if (canAccessTemplate(userTier, templateTier)) {
    return null;
  }
  return `This template requires the ${templateTier} plan. You are currently on the ${userTier} plan.`;
}

/**
 * Helper to check if a specific template ID is allowed for a given tier.
 * (Optional if you want to pass full objects, but tier comparison is usually enough)
 */
export function isTemplateAllowed(
  userTier: TemplatePlanTier,
  requiredTier: TemplatePlanTier,
): boolean {
  return canAccessTemplate(userTier, requiredTier);
}
