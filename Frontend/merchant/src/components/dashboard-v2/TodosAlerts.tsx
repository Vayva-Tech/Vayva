"use client";

import { useEffect, useState, useCallback } from "react";
import { logger } from "@vayva/shared";
import { toast } from "sonner";
import { Button, Card, Icon, IconName } from "@vayva/ui";
import Link from "next/link";

interface TodoItem {
  id: string;
  title: string;
  description: string;
  priority: "high" | "medium" | "low";
  href: string;
  action?: {
    label: string;
    href: string;
  };
  icon: IconName;
}

interface Alert {
  id: string;
  type: "warning" | "info" | "success" | "error";
  title: string;
  message: string;
  action?: {
    label: string;
    href: string;
  };
}

import { apiJson } from "@/lib/api-client-shared";

interface TodosAlertsResponse {
  success: boolean;
  data: {
    todos: TodoItem[];
    alerts: Alert[];
  };
}

export function TodosAlerts() {
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dismissingAlerts, setDismissingAlerts] = useState<Set<string>>(new Set());

  const fetchTodosAndAlerts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiJson<TodosAlertsResponse>(
        "/api/dashboard/todos-alerts",
      );
      setTodos(res.data?.todos || []);
      setAlerts(res.data?.alerts || []);
    } catch (error: unknown) {
      const _errMsg = error instanceof Error ? error.message : String(error);
      setError(_errMsg || "Failed to load todos and alerts");
      logger.error("[FETCH_TODOS_ALERTS_ERROR]", {
        error: _errMsg,
        app: "merchant",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  const handleRetry = () => {
    void fetchTodosAndAlerts();
  };

  useEffect(() => {
    void fetchTodosAndAlerts();
  }, [fetchTodosAndAlerts]);

  const handleDismissAlert = async (alertId: string) => {
    setDismissingAlerts((prev) => new Set(prev).add(alertId));
    try {
      await apiJson(`/api/dashboard/alerts/${alertId}/dismiss`, {
        method: "POST",
      });
      setAlerts((prev) => prev.filter((a) => a.id !== alertId));
      toast.success("Alert dismissed");
    } catch (error: unknown) {
      const _errMsg = error instanceof Error ? error.message : String(error);
      logger.error("[DISMISS_ALERT_ERROR]", {
        error: _errMsg,
        app: "merchant",
      });
      toast.error("Failed to dismiss alert");
    } finally {
      setDismissingAlerts((prev) => {
        const next = new Set(prev);
        next.delete(alertId);
        return next;
      });
    }
  };

  const handleDismissAllAlerts = async () => {
    try {
      await apiJson("/api/dashboard/alerts/dismiss-all", {
        method: "POST",
      });
      setAlerts([]);
      toast.success("All alerts dismissed");
    } catch (error: unknown) {
      const _errMsg = error instanceof Error ? error.message : String(error);
      logger.error("[DISMISS_ALL_ALERTS_ERROR]", {
        error: _errMsg,
        app: "merchant",
      });
      toast.error("Failed to dismiss alerts");
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-status-danger/10 text-status-danger";
      case "medium":
        return "bg-status-warning/10 text-status-warning";
      case "low":
        return "bg-status-info/10 text-status-info";
      default:
        return "bg-white-2/50 text-gray-500";
    }
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case "error":
        return "bg-status-danger/5 border-status-danger/20 text-gray-900";
      case "warning":
        return "bg-status-warning/5 border-status-warning/20 text-gray-900";
      case "success":
        return "bg-status-success/5 border-status-success/20 text-gray-900";
      case "info":
        return "bg-status-info/5 border-status-info/20 text-gray-900";
      default:
        return "bg-white-2/50 border-gray-100 text-gray-900";
    }
  };

  const getAlertIcon = (type: string): IconName => {
    switch (type) {
      case "error":
        return "XCircle";
      case "warning":
        return "AlertTriangle";
      case "success":
        return "CheckCircle";
      case "info":
        return "Info";
      default:
        return "Bell";
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="p-6">
          <div className="h-6 w-32 bg-white-2/50 rounded-xl animate-pulse mb-4" />
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-20 bg-white-2/50 rounded-xl animate-pulse"
              />
            ))}
          </div>
        </Card>
        <Card className="p-6">
          <div className="h-6 w-32 bg-white-2/50 rounded-xl animate-pulse mb-4" />
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="h-16 bg-white-2/50 rounded-xl animate-pulse"
              />
            ))}
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Todos */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Pending Actions
          </h3>
          <div className="flex items-center gap-2">
            <Icon name="CheckSquare" className="h-5 w-5 text-gray-400" />
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRetry}
              disabled={loading}
              className="text-gray-500 hover:text-gray-900"
            >
              <Icon name="RefreshCw" className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </div>

        {error ? (
          <div className="text-center py-8">
            <Icon
              name="AlertTriangle"
              className="h-12 w-12 text-status-danger mx-auto mb-2"
            />
            <p className="text-sm text-gray-500 mb-2">
              Failed to load todos
            </p>
            <Button variant="outline" size="sm" onClick={handleRetry}>
              Retry
            </Button>
          </div>
        ) : todos.length === 0 ? (
          <div className="text-center py-8">
            <Icon
              name="CheckCircle"
              className="h-12 w-12 text-status-success mx-auto mb-2"
            />
            <p className="text-sm text-gray-500">
              All caught up! No pending actions.
            </p>
          </div>
        ) : (
          <div className="space-y-3" role="list" aria-label="Todo items">
            {todos.map((todo) => (
              <Link
                href={todo.href}
                key={todo.id}
                role="listitem"
                className="p-4 border border-gray-100 rounded-xl hover:bg-white-2/50 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-white-2/50 rounded-xl shrink-0">
                    <Icon
                      name={todo.icon}
                      className="h-4 w-4 text-gray-500"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-sm font-semibold text-gray-900">
                        {todo.title}
                      </h4>
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(todo.priority)}`}
                      >
                        {todo.priority}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mb-2">
                      {todo.description}
                    </p>
                    {todo.action && (
                      <span className="inline-flex items-center gap-1 text-xs text-green-500 hover:underline cursor-pointer">
                        {todo.action.label}
                        <Icon name="ArrowRight" className="h-3 w-3" />
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </Card>

      {/* Alerts */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Important Alerts
          </h3>
          <div className="flex items-center gap-2">
            {alerts.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDismissAllAlerts}
                className="h-8 px-2 text-xs rounded-xl"
              >
                Dismiss all
              </Button>
            )}
            <Icon name="Bell" className="h-5 w-5 text-gray-400" />
          </div>
        </div>

        {alerts.length === 0 ? (
          <div className="text-center py-8">
            <Icon
              name="BellOff"
              className="h-12 w-12 text-gray-400 mx-auto mb-2"
            />
            <p className="text-sm text-gray-500">
              No alerts at this time.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-4 border rounded-xl ${getAlertColor(alert.type)} relative group`}
              >
                <Button
                  onClick={() => handleDismissAlert(alert.id)}
                  disabled={dismissingAlerts.has(alert.id)}
                  className="absolute top-2 right-2 p-1 rounded-lg hover:bg-white-2/50 opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label="Dismiss alert"
                >
                  <Icon name="X" className="h-4 w-4" />
                </Button>
                <div className="flex items-start gap-3">
                  <Icon
                    name={getAlertIcon(alert.type)}
                    className="h-5 w-5 shrink-0 mt-0.5"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold mb-1">
                      {alert.title}
                    </h4>
                    <p className="text-xs opacity-90 mb-2">{alert.message}</p>
                    {alert.action && (
                      <Link href={alert.action.href}>
                        <Button
                          variant="outline"
                          className="h-8 px-3 text-xs rounded-xl"
                        >
                          {alert.action.label}
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
