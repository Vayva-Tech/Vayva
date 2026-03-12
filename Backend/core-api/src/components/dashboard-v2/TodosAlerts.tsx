"use client";

import { useState, useEffect } from "react";

import { logger } from "@vayva/shared";
import { Button, Card, Icon, IconName } from "@vayva/ui";
import Link from "next/link";

interface TodoItem {
  id: string;
  title: string;
  description: string;
  priority: "high" | "medium" | "low";
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

  useEffect(() => {
    void fetchTodosAndAlerts();
  }, []);

  const fetchTodosAndAlerts = async () => {
    try {
      const res = await apiJson<TodosAlertsResponse>(
        "/api/dashboard/todos-alerts",
      );
      setTodos(res.data?.todos || []);
      setAlerts(res.data?.alerts || []);
    } catch (error: unknown) {
      const _errMsg = error instanceof Error ? error.message : String(error);
      logger.error("[FETCH_TODOS_ALERTS_ERROR]", {
        error: _errMsg,
        app: "merchant",
      });
    } finally {
      setLoading(false);
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
        return "bg-white/40 text-text-secondary";
    }
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case "error":
        return "bg-status-danger/5 border-status-danger/20 text-text-primary";
      case "warning":
        return "bg-status-warning/5 border-status-warning/20 text-text-primary";
      case "success":
        return "bg-status-success/5 border-status-success/20 text-text-primary";
      case "info":
        return "bg-status-info/5 border-status-info/20 text-text-primary";
      default:
        return "bg-white/40 border-border text-text-primary";
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
          <div className="h-6 w-32 bg-white/40 rounded-xl animate-pulse mb-4" />
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-20 bg-white/40 rounded-xl animate-pulse"
              />
            ))}
          </div>
        </Card>
        <Card className="p-6">
          <div className="h-6 w-32 bg-white/40 rounded-xl animate-pulse mb-4" />
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="h-16 bg-white/40 rounded-xl animate-pulse"
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
          <h3 className="text-lg font-semibold text-text-primary">
            Pending Actions
          </h3>
          <Icon name="CheckSquare" className="h-5 w-5 text-text-tertiary" />
        </div>

        {todos.length === 0 ? (
          <div className="text-center py-8">
            <Icon
              name="CheckCircle"
              className="h-12 w-12 text-status-success mx-auto mb-2"
            />
            <p className="text-sm text-text-secondary">
              All caught up! No pending actions.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {todos.map((todo) => (
              <div
                key={todo.id}
                className="p-4 border border-border rounded-xl hover:bg-white/40 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-white/40 rounded-xl shrink-0">
                    <Icon
                      name={todo.icon}
                      className="h-4 w-4 text-text-secondary"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-sm font-semibold text-text-primary">
                        {todo.title}
                      </h4>
                      <span
                        className={`px - 2 py - 0.5 rounded - full text - xs font - medium ${getPriorityColor(todo.priority)} `}
                      >
                        {todo.priority}
                      </span>
                    </div>
                    <p className="text-xs text-text-secondary mb-2">
                      {todo.description}
                    </p>
                    {todo.action && (
                      <Link href={todo.action.href}>
                        <Button
                          variant="ghost"
                          className="h-8 px-2 text-xs rounded-xl"
                        >
                          {todo.action.label}
                          <Icon name="ArrowRight" className="h-3 w-3 ml-1" />
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

      {/* Alerts */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-text-primary">
            Important Alerts
          </h3>
          <Icon name="Bell" className="h-5 w-5 text-text-tertiary" />
        </div>

        {alerts.length === 0 ? (
          <div className="text-center py-8">
            <Icon
              name="BellOff"
              className="h-12 w-12 text-text-tertiary mx-auto mb-2"
            />
            <p className="text-sm text-text-secondary">
              No alerts at this time.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className={`p - 4 border rounded - xl ${getAlertColor(alert.type)} `}
              >
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
