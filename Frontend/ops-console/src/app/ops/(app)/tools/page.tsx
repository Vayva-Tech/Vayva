"use client";

import React, { useState } from "react";
import { HardDrives as Server, Lightning as Zap, Database, Warning as AlertTriangle, ArrowCounterClockwise as RefreshCw, ToggleLeft, ToggleRight, Terminal, Globe, Pulse as Activity, Shield, CheckCircle, XCircle, Download } from "@phosphor-icons/react/ssr";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@vayva/ui";
import { OpsPageShell } from "@/components/ops/OpsPageShell"; // Assuming UI lib exists, or use standard HTML

interface Announcement {
  message: string;
  active: boolean;
}

export default function SystemToolsPage(): React.JSX.Element {
  return (
    <OpsPageShell
      title="System Tools"
      description="Advanced controls for platform operations"
    >
      <div className="grid md:grid-cols-2 gap-6">
        <SystemHealthCard />
        <CacheControlCard />
        <FeatureFlagCard />
        <AnnouncementCard />
        <DatabaseDiagnosticsCard />
        <SecurityDiagnosticsCard />
        <EnvInfoCard />
        <ExportDataCard />
      </div>
    </OpsPageShell>
  );
}

function AnnouncementCard(): React.JSX.Element {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [current, setCurrent] = useState<Announcement | null>(null);

  React.useEffect(() => {
    fetch("/api/ops/config/announcements")
      .then((res) => res.json())
      .then((data) => setCurrent(data.announcement))
      .catch(() => {});
  }, []);

  const publish = async () => {
    setLoading(true);
    try {
      await fetch("/api/ops/config/announcements", {
        method: "POST",
        body: JSON.stringify({ message, active: true }),
      });
      toast.success("Announcement Published");
      setCurrent({ message, active: true });
      setMessage("");
    } catch {
      toast.error("Failed");
    } finally {
      setLoading(false);
    }
  };

  const clear = async () => {
    setLoading(true);
    try {
      await fetch("/api/ops/config/announcements", { method: "DELETE" });
      toast.success("Announcement Cleared");
      setCurrent(null);
    } catch {
      toast.error("Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-pink-100 text-pink-600 rounded-lg">
          <AlertTriangle className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-900">Announcements</h3>
          <p className="text-xs text-gray-500">Global dashboard banners.</p>
        </div>
      </div>

      {current ? (
        <div className="bg-pink-50 border border-pink-100 p-4 rounded-xl mb-4">
          <div className="text-xs font-bold text-pink-600 uppercase mb-1">
            Live Now
          </div>
          <div className="text-sm font-medium text-gray-900">
            {current.message}
          </div>
          <Button
            variant="ghost"
            onClick={clear}
            disabled={loading}
            className="mt-2 text-xs text-red-600 hover:underline h-auto p-0 hover:bg-transparent"
            aria-label="Recall active announcement"
          >
            Recall Announcement
          </Button>
        </div>
      ) : (
        <div className="text-sm text-gray-400 italic mb-4">
          No active announcement.
        </div>
      )}

      <div className="flex gap-2">
        <input
          value={message}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setMessage(e.target?.value)
          }
          placeholder="Enter alert message..."
          className="flex-1 px-3 py-2 border rounded-lg text-sm"
        />
        <Button
          variant="primary"
          onClick={publish}
          disabled={!message || loading}
          className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-bold disabled:opacity-50 h-auto"
          aria-label="Post announcement"
        >
          Post
        </Button>
      </div>
    </div>
  );
}

function CacheControlCard(): React.JSX.Element {
  const [path, setPath] = useState("/");
  const [loading, setLoading] = useState(false);

  const handleClear = async (type: "path" | "tag") => {
    setLoading(true);
    try {
      const res = await fetch("/api/ops/tools/cache", {
        method: "POST",
        body: JSON.stringify({ target: path, type }),
      });
      const json = await res.json();
      if (res.ok) {
        toast.success("Cache Cleared", { description: json.message });
      } else {
        toast.error("Failed", { description: json.error });
      }
    } catch {
      toast.error("Network Error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-orange-100 text-orange-600 rounded-lg">
          <Zap className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-900">Cache Control</h3>
          <p className="text-xs text-gray-500">
            Manually revalidate Next.js ISR cache.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
            Target Path / Tag
          </label>
          <input
            type="text"
            value={path}
            onChange={(e) => setPath(e.target?.value)}
            className="w-full px-3 py-2 border rounded-lg font-mono text-sm"
            placeholder="/"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            onClick={() => handleClear("path")}
            disabled={loading}
            className="flex-1 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg text-sm font-bold flex items-center justify-center gap-2 h-auto shadow-sm"
            aria-label="Revalidate Next.js cache by path"
          >
            {loading ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Globe className="h-4 w-4" />
            )}
            Revalidate Path
          </Button>
          <Button
            variant="ghost"
            onClick={() => handleClear("tag")}
            disabled={loading}
            className="flex-1 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg text-sm font-bold flex items-center justify-center gap-2 h-auto shadow-sm"
            aria-label="Revalidate Next.js cache by tag"
          >
            {loading ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Database className="h-4 w-4" />
            )}
            Revalidate Tag
          </Button>
        </div>
      </div>
    </div>
  );
}

function FeatureFlagCard(): React.JSX.Element {
  const [maintenance, setMaintenance] = useState(false);
  const [betaFeatures, setBetaFeatures] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  // Fetch initial state from API
  React.useEffect(() => {
    fetch("/api/ops/config/feature-flags")
      .then((res) => res.json())
      .then((data) => {
        if (data.flags) {
          setMaintenance(data.flags?.maintenanceMode ?? false);
          setBetaFeatures(data.flags?.betaFeatures ?? false);
        }
      })
      .catch(() => toast.error("Failed to load feature flags"))
      .finally(() => setFetching(false));
  }, []);

  const toggleMaintenance = async () => {
    const newState = !maintenance;
    setLoading(true);
    try {
      const res = await fetch("/api/ops/config/feature-flags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          maintenanceMode: newState,
          betaFeatures,
        }),
      });
      
      if (!res.ok) throw new Error("Failed to update");
      
      setMaintenance(newState);
      toast.success(`Maintenance Mode ${newState ? "ENABLED" : "DISABLED"}`);
    } catch {
      toast.error("Failed to update maintenance mode");
    } finally {
      setLoading(false);
    }
  };

  const toggleBetaFeatures = async () => {
    const newState = !betaFeatures;
    setLoading(true);
    try {
      const res = await fetch("/api/ops/config/feature-flags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          maintenanceMode: maintenance,
          betaFeatures: newState,
        }),
      });
      
      if (!res.ok) throw new Error("Failed to update");
      
      setBetaFeatures(newState);
      toast.success(`Beta Features ${newState ? "ENABLED" : "DISABLED"}`);
    } catch {
      toast.error("Failed to update beta features");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
          <ToggleLeft className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-900">Feature Flags</h3>
          <p className="text-xs text-gray-500">Global system toggles.</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
          <div>
            <div className="text-sm font-bold text-gray-900">
              Maintenance Mode
            </div>
            <div className="text-xs text-gray-500">
              Block all non-admin traffic.
            </div>
          </div>
          <Button
            variant="ghost"
            onClick={toggleMaintenance}
            disabled={fetching || loading}
            className={`text-2xl transition-colors h-auto p-0 hover:bg-transparent ${maintenance ? "text-indigo-600" : "text-gray-300"}`}
            aria-label={
              maintenance
                ? "Disable maintenance mode"
                : "Enable maintenance mode"
            }
          >
            {maintenance ? (
              <ToggleRight className="h-8 w-8" />
            ) : (
              <ToggleLeft className="h-8 w-8" />
            )}
          </Button>
        </div>

        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100 opacity-50">
          <div>
            <div className="text-sm font-bold text-gray-900">Beta Features</div>
            <div className="text-xs text-gray-500">
              Enable v2 Dashboard for all.
            </div>
          </div>
          <Button
            variant="ghost"
            onClick={toggleBetaFeatures}
            disabled={fetching || loading}
            className={`text-2xl transition-colors h-auto p-0 hover:bg-transparent ${betaFeatures ? "text-indigo-600" : "text-gray-300"}`}
            aria-label={
              betaFeatures
                ? "Disable beta features"
                : "Enable beta features"
            }
          >
            {betaFeatures ? (
              <ToggleRight className="h-8 w-8" />
            ) : (
              <ToggleLeft className="h-8 w-8" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

function EnvInfoCard(): React.JSX.Element {
  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
          <Server className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-900">Environment</h3>
          <p className="text-xs text-gray-500">Current system configuration.</p>
        </div>
      </div>

      <dl className="space-y-2 text-sm">
        <div className="flex justify-between py-2 border-b border-gray-100">
          <dt className="text-gray-500">NODE_ENV</dt>
          <dd className="font-mono font-bold text-gray-900">
            {process?.env?.NODE_ENV}
          </dd>
        </div>
        <div className="flex justify-between py-2 border-b border-gray-100">
          <dt className="text-gray-500">Region</dt>
          <dd className="font-mono font-bold text-gray-900">us-east-1</dd>
        </div>
        <div className="flex justify-between py-2 border-b border-gray-100">
          <dt className="text-gray-500">Database</dt>
          <dd className="font-mono font-bold text-green-600">Connected</dd>
        </div>
        <div className="flex justify-between py-2">
          <dt className="text-gray-500">Version</dt>
          <dd className="font-mono font-bold text-gray-900">v1.2?.4</dd>
        </div>
      </dl>
    </div>
  );
}

function SystemHealthCard(): React.JSX.Element {
  const [status, setStatus] = useState<{ status: string; message?: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const checkHealth = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/ops/health/detailed");
      const data = await res.json();
      setStatus({ status: data.status, message: `All services: ${data.summary?.up || 0}/${data.summary?.total || 0} up` });
    } catch {
      setStatus({ status: "ERROR", message: "Failed to check health" });
    } finally {
      setLoading(false);
    }
  };

  const isHealthy = status?.status === "HEALTHY";

  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        <div className={`p-2 rounded-lg ${isHealthy ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-600"}`}>
          <Activity className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-900">System Health</h3>
          <p className="text-xs text-gray-500">Check all service statuses</p>
        </div>
      </div>

      {status && (
        <div className={`mb-4 p-3 rounded-lg ${isHealthy ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
          <div className="font-semibold">{status.status}</div>
          <div className="text-sm">{status.message}</div>
        </div>
      )}

      <div className="flex gap-2">
        <Button
          variant="ghost"
          onClick={checkHealth}
          disabled={loading}
          className="flex-1 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-sm font-bold flex items-center justify-center gap-2 h-auto"
        >
          {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Activity className="h-4 w-4" />}
          Check Now
        </Button>
        <Link href="/ops/health">
          <Button
            variant="ghost"
            className="py-2 px-4 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg text-sm font-bold h-auto"
          >
            Details &rarr;
          </Button>
        </Link>
      </div>
    </div>
  );
}

function DatabaseDiagnosticsCard(): React.JSX.Element {
  const [results, setResults] = useState<{ table: string; count: number }[] | null>(null);
  const [loading, setLoading] = useState(false);

  const runDiagnostics = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/ops/tools/db-diagnostics");
      const data = await res.json();
      setResults(data.tables || []);
    } catch {
      toast.error("Failed to run diagnostics");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
          <Database className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-900">Database Diagnostics</h3>
          <p className="text-xs text-gray-500">Table counts and health checks</p>
        </div>
      </div>

      {results && (
        <div className="mb-4 max-h-40 overflow-y-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="px-3 py-2 text-left">Table</th>
                <th className="px-3 py-2 text-right">Records</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {results.map((r: { table: string; count: number }) => (
                <tr key={r.table}>
                  <td className="px-3 py-2 font-mono text-xs">{r.table}</td>
                  <td className="px-3 py-2 text-right font-bold">{r?.count?.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Button
        variant="ghost"
        onClick={runDiagnostics}
        disabled={loading}
        className="w-full py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg text-sm font-bold flex items-center justify-center gap-2 h-auto"
      >
        {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Database className="h-4 w-4" />}
        Run Diagnostics
      </Button>
    </div>
  );
}

function SecurityDiagnosticsCard(): React.JSX.Element {
  const [results, setResults] = useState<{ check: string; status: "pass" | "fail" | "warn"; message: string }[] | null>(null);
  const [loading, setLoading] = useState(false);

  const runChecks = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/ops/tools/security-check");
      const data = await res.json();
      setResults(data.checks || []);
    } catch {
      toast.error("Failed to run security checks");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-red-100 text-red-600 rounded-lg">
          <Shield className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-900">Security Audit</h3>
          <p className="text-xs text-gray-500">Quick security posture check</p>
        </div>
      </div>

      {results && (
        <div className="mb-4 space-y-2">
          {results.map((r, i) => (
            <div key={i} className={`flex items-center gap-2 p-2 rounded-lg ${r.status === "pass" ? "bg-green-50 text-green-700" : 
              r.status === "warn" ? "bg-amber-50 text-amber-700" : "bg-red-50 text-red-700"
            }`}>
              {r.status === "pass" ? <CheckCircle className="h-4 w-4" /> : 
               r.status === "warn" ? <AlertTriangle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
              <span className="text-sm font-medium">{r.check}</span>
            </div>
          ))}
        </div>
      )}

      <Button
        variant="ghost"
        onClick={runChecks}
        disabled={loading}
        className="w-full py-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg text-sm font-bold flex items-center justify-center gap-2 h-auto"
      >
        {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Shield className="h-4 w-4" />}
        Run Security Check
      </Button>
    </div>
  );
}

function ExportDataCard(): React.JSX.Element {
  const [entity, setEntity] = useState("merchants");
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/ops/export?entity=${entity}`);
      if (!res.ok) throw new Error("Export failed");
      
      const blob = await res.blob();
      const url = window.URL?.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${entity}-export-${new Date().toISOString().split("T")[0]}.csv`;
      document.body?.appendChild(a);
      a.click();
      window.URL?.revokeObjectURL(url);
      document.body?.removeChild(a);
      
      toast.success(`${entity} data exported successfully`);
    } catch {
      toast.error("Export failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
          <Download className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-900">Data Export</h3>
          <p className="text-xs text-gray-500">Export platform data to CSV</p>
        </div>
      </div>

      <div className="space-y-4">
        <select
          value={entity}
          onChange={(e) => setEntity(e.target?.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
        >
          <option value="merchants">Merchants</option>
          <option value="orders">Orders</option>
          <option value="customers">Customers</option>
          <option value="tickets">Support Tickets</option>
          <option value="audit">Audit Logs</option>
        </select>

        <Button
          variant="ghost"
          onClick={handleExport}
          disabled={loading}
          className="w-full py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-sm font-bold flex items-center justify-center gap-2 h-auto"
        >
          {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
          Export CSV
        </Button>
      </div>
    </div>
  );
}
