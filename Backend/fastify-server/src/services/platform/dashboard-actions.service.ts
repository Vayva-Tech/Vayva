import type { IndustryDashboardDefinition } from '../../config/industry-dashboard-definitions';

interface SuggestedAction {
  id: string;
  title: string;
  reason: string;
  severity: 'critical' | 'warning' | 'info';
  href: string;
  icon: string;
}

interface BusinessStateForActions {
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

/**
 * Dashboard Actions Service
 * Generates prioritized suggested actions based on business state and industry rules
 */
export class DashboardActionsService {
  constructor() {}

  /**
   * Compute suggested actions for a merchant based on their industry dashboard definition
   * and current business state
   * 
   * @param definition - Industry-specific dashboard definition with action rules
   * @param state - Current business state flags (low stock, backlog, etc.)
   * @returns Prioritized list of suggested actions sorted by severity
   */
  computeSuggestedActions(
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

    // Sort by severity (critical → warning → info)
    actions.sort(
      (a, b) =>
        (SEVERITY_ORDER[a.severity] ?? 9) - (SEVERITY_ORDER[b.severity] ?? 9),
    );

    return actions;
  }
}
