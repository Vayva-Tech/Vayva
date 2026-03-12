// ============================================================================
// Quick Actions Panel
// ============================================================================
// Displays quick action buttons for common dashboard tasks
// ============================================================================

import { useDashboard } from "./dashboard-container.js";

interface QuickActionsPanelProps {
  className?: string;
  collapsed?: boolean;
  onToggle?: () => void;
}

/**
 * QuickActionsPanel - Displays quick action buttons
 *
 * Shows action buttons for common tasks based on the dashboard configuration.
 * Can be collapsed/expanded.
 *
 * @example
 * ```tsx
 * <QuickActionsPanel collapsed={false} onToggle={handleToggle} />
 * ```
 */
export function QuickActionsPanel({
  className = "",
  collapsed = false,
  onToggle,
}: QuickActionsPanelProps) {
  const { config, actions } = useDashboard();

  if (!config || actions.length === 0) {
    return null;
  }

  return (
    <div
      className={`quick-actions-panel ${collapsed ? "collapsed" : ""} ${className}`}
      role="region"
      aria-label="Quick actions"
    >
      <div className="quick-actions-header">
        <h4>Quick Actions</h4>
        {onToggle && (
          <button
            type="button"
            className="quick-actions-toggle"
            onClick={onToggle}
            aria-label={collapsed ? "Expand actions" : "Collapse actions"}
          >
            {collapsed ? "→" : "←"}
          </button>
        )}
      </div>

      {!collapsed && (
        <div className="quick-actions-list">
          {actions.map((action) => (
            <a
              key={action.id}
              href={action.href}
              className={`quick-action-item quick-action-${action.severity}`}
            >
              <span className="quick-action-icon">{action.icon}</span>
              <div className="quick-action-content">
                <span className="quick-action-title">{action.title}</span>
                <span className="quick-action-reason">{action.reason}</span>
              </div>
            </a>
          ))}

          {config.actions.map((action) => (
            <a
              key={action.id}
              href={action.href}
              className="quick-action-item"
            >
              <span className="quick-action-icon">{action.icon}</span>
              <span className="quick-action-label">{action.label}</span>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

QuickActionsPanel.displayName = "QuickActionsPanel";
