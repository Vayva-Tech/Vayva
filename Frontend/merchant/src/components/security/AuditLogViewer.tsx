"use client";

import { useState, useEffect } from "react";
import { logger } from "@/lib/logger";
import { Button, Input, Select } from "@vayva/ui";
import { toast } from "sonner";
import { DownloadSimple, Funnel, MagnifyingGlass, FileCsv } from "@phosphor-icons/react/ssr";
import { apiJson } from "@/lib/api-client-shared";
import Papa from "papaparse";

interface AuditLogEntry {
  id: string;
  timestamp: string;
  userId: string;
  userEmail: string;
  action: string;
  category: string;
  details: Record<string, unknown>;
  ip: string;
  userAgent: string;
}

interface AuditLogFilters {
  startDate?: string;
  endDate?: string;
  category?: string;
  action?: string;
  search?: string;
}

const CATEGORIES = [
  { value: "", label: "All Categories" },
  { value: "auth", label: "Authentication" },
  { value: "product", label: "Products" },
  { value: "order", label: "Orders" },
  { value: "customer", label: "Customers" },
  { value: "finance", label: "Finance" },
  { value: "settings", label: "Settings" },
  { value: "mfa", label: "MFA/Security" },
  { value: "kyc", label: "KYC" },
  { value: "team", label: "Team Management" },
];

export function AuditLogViewer() {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<AuditLogFilters>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    fetchLogs();
  }, [filters]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (filters.startDate) queryParams.set("startDate", filters.startDate);
      if (filters.endDate) queryParams.set("endDate", filters.endDate);
      if (filters.category) queryParams.set("category", filters.category);
      if (filters.action) queryParams.set("action", filters.action);
      queryParams.set("limit", "100");

      const data = await apiJson<{ logs: AuditLogEntry[] }>(
        `/api/audit-logs?${queryParams.toString()}`,
        { method: "GET" }
      );

      setLogs(data.logs || []);
    } catch (error) {
      logger.error("[AuditLogViewer] Failed to fetch:", { error });
      // Mock data for development
      setLogs([
        {
          id: "1",
          timestamp: new Date().toISOString(),
          userId: "user1",
          userEmail: "admin@example.com",
          action: "MFA_ENABLED",
          category: "mfa",
          details: { method: "totp" },
          ip: "102.89.47.23",
          userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
        },
        {
          id: "2",
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          userId: "user1",
          userEmail: "admin@example.com",
          action: "PRODUCT_CREATED",
          category: "product",
          details: { productId: "prod_123", name: "Test Product" },
          ip: "102.89.47.23",
          userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      // Export all filtered logs to CSV
      const filteredLogs = logs.filter((log) => {
        if (!searchQuery) return true;
        const search = searchQuery.toLowerCase();
        return (
          log.action.toLowerCase().includes(search) ||
          log.userEmail.toLowerCase().includes(search) ||
          log.category.toLowerCase().includes(search)
        );
      });

      const csv = Papa.unparse(
        filteredLogs.map((log) => ({
          Timestamp: new Date(log.timestamp).toLocaleString(),
          User: log.userEmail,
          Action: log.action,
          Category: log.category,
          Details: JSON.stringify(log.details),
          IP: log.ip,
        }))
      );

      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `audit-log-export-${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success(`Exported ${filteredLogs.length} log entries`);
    } catch (error) {
      toast.error("Export failed");
    } finally {
      setExporting(false);
    }
  };

  const filteredLogs = logs.filter((log) => {
    if (!searchQuery) return true;
    const search = searchQuery.toLowerCase();
    return (
      log.action.toLowerCase().includes(search) ||
      log.userEmail.toLowerCase().includes(search) ||
      log.category.toLowerCase().includes(search)
    );
  });

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      auth: "bg-blue-100 text-blue-800",
      mfa: "bg-green-100 text-green-800",
      product: "bg-purple-100 text-purple-800",
      order: "bg-orange-100 text-orange-800",
      customer: "bg-pink-100 text-pink-800",
      finance: "bg-green-100 text-green-800",
      settings: "bg-gray-100 text-gray-800",
      kyc: "bg-yellow-100 text-yellow-800",
      team: "bg-green-100 text-green-800",
    };
    return colors[category] || "bg-gray-100 text-gray-800";
  };

  const formatAction = (action: string) => {
    return action
      .split("_")
      .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
      .join(" ");
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-end">
        <div className="flex-1 min-w-[200px]">
          <label className="text-sm font-medium mb-1 block">Search</label>
          <div className="relative">
            <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <Input
              placeholder="Search actions, users, categories..."
              value={searchQuery}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium mb-1 block">Category</label>
          <Select
            value={filters.category || ""}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
              setFilters((f) => ({ ...f, category: e.target.value }))
            }
          >
            {CATEGORIES.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium mb-1 block">From</label>
          <Input
            type="date"
            value={filters.startDate || ""}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setFilters((f) => ({ ...f, startDate: e.target.value }))
            }
          />
        </div>

        <div>
          <label className="text-sm font-medium mb-1 block">To</label>
          <Input
            type="date"
            value={filters.endDate || ""}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setFilters((f) => ({ ...f, endDate: e.target.value }))
            }
          />
        </div>

        <Button
          variant="outline"
          onClick={() => {
            setFilters({});
            setSearchQuery("");
          }}
        >
          <Funnel className="w-4 h-4 mr-2" />
          Clear
        </Button>

        <Button
          onClick={handleExport}
          disabled={exporting || filteredLogs.length === 0}
          isLoading={exporting}
        >
          <FileCsv className="w-4 h-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Results count */}
      <p className="text-sm text-gray-500">
        Showing {filteredLogs.length} of {logs.length} entries
      </p>

      {/* Audit Log Table */}
      <div className="border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-3 text-left">Timestamp</th>
              <th className="px-4 py-3 text-left">User</th>
              <th className="px-4 py-3 text-left">Action</th>
              <th className="px-4 py-3 text-left">Category</th>
              <th className="px-4 py-3 text-left">IP Address</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filteredLogs.map((log) => (
              <tr key={log.id} className="hover:bg-gray-100">
                <td className="px-4 py-3 text-gray-500">
                  {new Date(log.timestamp).toLocaleString()}
                </td>
                <td className="px-4 py-3">{log.userEmail}</td>
                <td className="px-4 py-3 font-medium">
                  {formatAction(log.action)}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(
                      log.category
                    )}`}
                  >
                    {log.category}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-500 font-mono text-xs">
                  {log.ip}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredLogs.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <p>No audit log entries found</p>
          <p className="text-sm mt-1">Try adjusting your filters</p>
        </div>
      )}
    </div>
  );
}
