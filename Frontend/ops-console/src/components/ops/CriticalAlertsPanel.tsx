"use client";

import React, { useEffect, useState, useCallback } from "react";
import { AlertTriangle, X, Bell, Info, CheckCircle, AlertCircle } from "lucide-react";
import { cn, Button } from "@vayva/ui";
interface Alert {
  id: string;
  type: "critical" | "warning" | "info" | "success";
  title: string;
  message: string;
  timestamp: string;
  source: string;
  acknowledged?: boolean;
}

interface CriticalAlertsPanelProps {
  className?: string;
  isOpen?: boolean;
  onClose?: () => void;
  onUnreadCountChange?: (count: number) => void;
}

export function CriticalAlertsPanel({
  className,
  isOpen: controlledIsOpen,
  onClose,
  onUnreadCountChange,
}: CriticalAlertsPanelProps): React.JSX.Element {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [internalShowPanel, setInternalShowPanel] = useState(false);

  // Use controlled or uncontrolled state
  const showPanel = controlledIsOpen ?? internalShowPanel;
  const setShowPanel = (value: boolean) => {
    if (controlledIsOpen === undefined) {
      setInternalShowPanel(value);
    } else if (!value && onClose) {
      onClose();
    }
  };

  // Calculate unread count
  const unreadCount = alerts.filter((a) => !a.acknowledged).length;

  // Notify parent of unread count changes
  useEffect(() => {
    onUnreadCountChange?.(unreadCount);
  }, [unreadCount, onUnreadCountChange]);

  const addAlert = useCallback((alert: Alert) => {
    setAlerts((prev) => {
      // Prevent duplicates
      if (prev.some((a) => a.id === alert.id)) return prev;
      return [alert, ...prev].slice(0, 50); // Keep last 50 alerts
    });
  }, []);

  const removeAlert = useCallback((id: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  }, []);

  const acknowledgeAlert = useCallback(async (id: string) => {
    try {
      await fetch(`/api/ops/alerts/${id}/acknowledge`, { method: "POST" });
      setAlerts((prev) =>
        prev.map((a) => (a.id === id ? { ...a, acknowledged: true } : a))
      );
    } catch (error) {
      console.error("Failed to acknowledge alert:", error);
    }
  }, []);

  useEffect(() => {
    const eventSource = new EventSource("/api/ops/alerts/stream");

    eventSource.onopen = () => {
      setIsConnected(true);
      console.warn("[SSE] Connected to alerts stream");
    };

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "alert") {
          addAlert(data.alert);
        } else if (data.type === "ping") {
          // Keep-alive, no action needed
        }
      } catch (error) {
        console.error("[SSE] Failed to parse message:", error);
      }
    };

    eventSource.onerror = (error) => {
      console.error("[SSE] Connection error:", error);
      setIsConnected(false);
      // Auto-reconnect will happen automatically
    };

    return () => {
      eventSource.close();
    };
  }, [addAlert]);

  const criticalCount = alerts.filter(
    (a) => a.type === "critical" && !a.acknowledged
  ).length;

  const getIcon = (type: Alert["type"]) => {
    switch (type) {
      case "critical":
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case "warning":
        return <AlertCircle className="w-5 h-5 text-amber-500" />;
      case "success":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      default:
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const getStyles = (type: Alert["type"]) => {
    switch (type) {
      case "critical":
        return "bg-red-50 border-red-200";
      case "warning":
        return "bg-amber-50 border-amber-200";
      case "success":
        return "bg-green-50 border-green-200";
      default:
        return "bg-blue-50 border-blue-200";
    }
  };

  if (!showPanel) {
    // Don't render the floating button - notifications are accessed from top bar only
    return <></>;
  }

  return (
    <div
      className={cn(
        "fixed top-20 right-4 w-96 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden z-50",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-indigo-600" />
          <h3 className="font-semibold text-gray-900">
            Critical Alerts
          </h3>
          {criticalCount > 0 && (
            <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-bold rounded-full">
              {criticalCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "w-2 h-2 rounded-full",
              isConnected ? "bg-green-500" : "bg-red-500"
            )}
            title={isConnected ? "Connected" : "Disconnected"}
          />
          <Button
            onClick={() => setShowPanel(false)}
            className="p-1 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <X className="w-4 h-4 text-gray-500" />
          </Button>
        </div>
      </div>

      {/* Alerts List */}
      <div className="max-h-80 overflow-y-auto">
        {alerts.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <Bell className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>No alerts at this time</p>
            <p className="text-sm text-gray-400 mt-1">
              Critical system alerts will appear here
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className={cn(
                  "p-4 flex gap-3 transition-all",
                  getStyles(alert.type),
                  alert.acknowledged && "opacity-60"
                )}
              >
                <div className="flex-shrink-0 mt-0.5">{getIcon(alert.type)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-semibold text-sm text-gray-900">
                      {alert.title}
                    </h4>
                    <Button
                      onClick={() => removeAlert(alert.id)}
                      className="flex-shrink-0 p-1 hover:bg-black/5 rounded transition-colors"
                    >
                      <X className="w-3 h-3 text-gray-400" />
                    </Button>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    {alert.message}
                  </p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-gray-400">
                      {new Date(alert.timestamp).toLocaleTimeString()}
                    </span>
                    {!alert.acknowledged && alert.type === "critical" && (
                      <Button
                        onClick={() => acknowledgeAlert(alert.id)}
                        className="text-xs font-medium text-red-600 hover:text-red-700 underline"
                      >
                        Acknowledge
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-gray-200 bg-gray-50">
        <Button
          onClick={() => setAlerts([])}
          className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
        >
          Clear all alerts
        </Button>
      </div>
    </div>
  );
}
