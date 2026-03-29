"use client";

import { useState, useEffect } from "react";
import { logger } from "@/lib/logger";
import { apiJson } from "@/lib/api-client-shared";
import { toast } from "sonner";
import { Warning, Shield, Check, X, DeviceMobile, Desktop, Globe } from "@phosphor-icons/react/ssr";
import { Button } from "@vayva/ui";

// Simple date formatter
function formatDistanceToNow(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

interface LoginAttempt {
  id: string;
  timestamp: string;
  ip: string;
  device: string;
  location?: string;
  success: boolean;
  isNewDevice: boolean;
  userAgent: string;
}

interface SuspiciousActivity {
  id: string;
  type: "new_device" | "failed_attempts" | "unusual_location" | "brute_force";
  severity: "low" | "medium" | "high";
  timestamp: string;
  details: {
    ip: string;
    device: string;
    attempts?: number;
    location?: string;
  };
  resolved: boolean;
}

export function SecurityMonitor() {
  const [loginHistory, setLoginHistory] = useState<LoginAttempt[]>([]);
  const [suspiciousActivities, setSuspiciousActivities] = useState<SuspiciousActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [showVerifyDevice, setShowVerifyDevice] = useState(false);
  const [pendingDevice, setPendingDevice] = useState<LoginAttempt | null>(null);

  useEffect(() => {
    fetchSecurityData();
  }, []);

  const fetchSecurityData = async () => {
    try {
      const [historyData, alertsData] = await Promise.all([
        apiJson<{ attempts: LoginAttempt[] }>("/security/login-history", { method: "GET" }),
        apiJson<{ alerts: SuspiciousActivity[] }>("/security/suspicious-activity", { method: "GET" }),
      ]);

      setLoginHistory(historyData.attempts || []);
      setSuspiciousActivities(alertsData.alerts || []);

      // Check for unverified new devices
      const unverifiedNew = historyData.attempts?.find(
        (a: any) => a.isNewDevice && !a.success
      );
      if (unverifiedNew) {
        setPendingDevice(unverifiedNew);
        setShowVerifyDevice(true);
      }
    } catch (error: unknown) {
      logger.error("[SecurityMonitor] Failed to fetch security data:", { error });
    } finally {
      setLoading(false);
    }
  };

  const verifyDevice = async (trusted: boolean) => {
    if (!pendingDevice) return;

    try {
      await apiJson("/security/verify-device", {
        method: "POST",
        body: JSON.stringify({
          attemptId: pendingDevice.id,
          trusted,
        }),
      });

      if (trusted) {
        toast.success("Device verified successfully");
      } else {
        toast.info("Device rejected. Session terminated.");
        // Force logout if rejecting
        window.location.href = "/auth/logout";
      }

      setShowVerifyDevice(false);
      setPendingDevice(null);
      fetchSecurityData();
    } catch (error: unknown) {
      toast.error("Failed to verify device");
    }
  };

  const resolveAlert = async (alertId: string) => {
    try {
      await apiJson("/security/resolve-alert", {
        method: "POST",
        body: JSON.stringify({ alertId }),
      });

      setSuspiciousActivities((prev) =>
        prev.map((a) => (a.id === alertId ? { ...a, resolved: true } : a))
      );

      toast.success("Alert resolved");
    } catch (error: unknown) {
      toast.error("Failed to resolve alert");
    }
  };

  const getDeviceIcon = (userAgent: string) => {
    if (userAgent.includes("Mobile")) return DeviceMobile;
    return Desktop;
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "text-red-500 bg-red-500";
      case "medium":
        return "text-orange-600 bg-orange-100";
      default:
        return "text-yellow-600 bg-yellow-100";
    }
  };

  if (loading) {
    return (
      <div className="p-4">
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-gray-100 rounded w-1/3" />
          <div className="h-20 bg-gray-100 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Device Verification Modal */}
      {showVerifyDevice && pendingDevice && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center">
                <Warning className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <h3 className="font-semibold">New Device Detected</h3>
                <p className="text-sm text-gray-500">
                  We noticed a login from an unrecognized device
                </p>
              </div>
            </div>

            <div className="space-y-3 mb-6 p-4 bg-gray-100 rounded-lg">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-gray-500" />
                <span className="text-sm">IP: {pendingDevice.ip}</span>
              </div>
              <div className="flex items-center gap-2">
                <DeviceMobile className="w-4 h-4 text-gray-500" />
                <span className="text-sm">Device: {pendingDevice.device}</span>
              </div>
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-gray-500" />
                <span className="text-sm">
                  Location: {pendingDevice.location || "Unknown"}
                </span>
              </div>
            </div>

            <p className="text-sm text-gray-500 mb-4">
              Was this you? If not, your account may be compromised.
            </p>

            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => verifyDevice(false)}
              >
                <X className="w-4 h-4 mr-2" />
                No, reject
              </Button>
              <Button className="flex-1" onClick={() => verifyDevice(true)}>
                <Check className="w-4 h-4 mr-2" />
                Yes, trust
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Suspicious Activity Alerts */}
      {suspiciousActivities.filter((a) => !a.resolved).length > 0 && (
        <div className="space-y-3">
          <h3 className="font-semibold flex items-center gap-2">
            <Warning className="w-5 h-5 text-red-500" />
            Security Alerts
          </h3>
          <div className="space-y-2">
            {suspiciousActivities
              .filter((a) => !a.resolved)
              .map((alert) => (
                <div
                  key={alert.id}
                  className={`p-4 rounded-lg border ${getSeverityColor(alert.severity)}`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium capitalize">
                        {alert.type.replace("_", " ")}
                      </p>
                      <p className="text-sm mt-1">
                        {alert.details.ip} • {alert.details.device}
                        {alert.details.attempts && (
                          <span> • {alert.details.attempts} failed attempts</span>
                        )}
                      </p>
                      <p className="text-xs mt-1 opacity-75">
                        {formatDistanceToNow(new Date(alert.timestamp))}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => resolveAlert(alert.id)}
                    >
                      Dismiss
                    </Button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Login History */}
      <div className="space-y-3">
        <h3 className="font-semibold flex items-center gap-2">
          <Shield className="w-5 h-5" />
          Recent Login Activity
        </h3>
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-3 text-left">Device</th>
                <th className="px-4 py-3 text-left">Location</th>
                <th className="px-4 py-3 text-left">Time</th>
                <th className="px-4 py-3 text-left">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {loginHistory.slice(0, 10).map((attempt) => {
                const DeviceIcon = getDeviceIcon(attempt.userAgent);
                return (
                  <tr key={attempt.id} className="hover:bg-gray-100">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <DeviceIcon className="w-4 h-4 text-gray-500" />
                        <span className="truncate max-w-[150px]">
                          {attempt.device}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {attempt.location || "Unknown"}
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {formatDistanceToNow(new Date(attempt.timestamp))}
                    </td>
                    <td className="px-4 py-3">
                      {attempt.success ? (
                        <span className="text-green-600 text-xs font-medium">
                          Success
                        </span>
                      ) : (
                        <span className="text-red-500 text-xs font-medium">
                          Failed
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
