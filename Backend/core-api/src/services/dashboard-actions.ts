import type { IndustryDashboardDefinition } from "@/config/industry-dashboard-definitions";

// ---------------------------------------------------------------------------
// Suggested Actions Engine
//
// Pure function: takes an industry dashboard definition + live business state,
// returns a prioritised list of suggested actions the merchant should take.
//
// Each action is deterministic, deep-linked, and explains *why* it matters.
// ---------------------------------------------------------------------------

export interface SuggestedAction {
  id: string;
  title: string;
  reason: string;
  severity: "critical" | "warning" | "info";
  href: string;
  icon: string;
}

export interface BusinessStateForActions {
  hasLowStock?: boolean;
  hasDeadStock?: boolean;
  hasPendingFulfillment?: boolean;
  hasSoldOutItems?: boolean;
  hasBacklog?: boolean;
  hasPrepTimeSpike?: boolean;
  hasEmptySlots?: boolean;
  hasHighNoShowRisk?: boolean;
  hasUnderperformingServices?: boolean;
  [key: string]: boolean | undefined;
}

const SEVERITY_ORDER: Record<string, number> = {
  critical: 0,
  warning: 1,
  info: 2,
};

export function computeSuggestedActions(
  definition: IndustryDashboardDefinition,
  state: BusinessStateForActions,
): SuggestedAction[] {
  const actions: SuggestedAction[] = [];

  for (const rule of definition.suggestedActionRules) {
    if (state[rule.conditionKey]) {
      actions.push({
        id: rule.id,
        title: rule.title,
        reason: rule.reason,
        severity: rule.severity,
        href: rule.href,
        icon: rule.icon,
      });
    }
  }

  actions.sort(
    (a, b) =>
      (SEVERITY_ORDER[a.severity] ?? 9) - (SEVERITY_ORDER[b.severity] ?? 9),
  );

  return actions;
}
