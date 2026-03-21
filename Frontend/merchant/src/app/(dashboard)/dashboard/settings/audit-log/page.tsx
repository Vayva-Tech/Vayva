// @ts-nocheck
"use client";

import React, { useState, useEffect } from "react";
import { logger } from "@vayva/shared";
import { format } from "date-fns";
import { MagnifyingGlass as Search, Info, FileText, User, ClockCounterClockwise, Eye } from "@phosphor-icons/react";
import { Button, Input } from "@vayva/ui";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { apiJson } from "@/lib/api-client-shared";

interface AuditLog {
  id: string;
  createdAt: string;
  actorLabel: string;
  action: string;
  entityType: string;
  entityId: string;
  correlationId: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  beforeState?: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  afterState?: any;
}

interface AuditResponse {
  items: AuditLog[];
  next_cursor: string | null;
}

export default function AuditLogPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [nextCursor, setNextCursor] = useState<string | null>(null);

  // Simple filter (client-side concept for now, can extend to API params)
  const [searchTerm, setSearchTerm] = useState("");

  const fetchLogs = async (reset = false) => {
    setLoading(true);
    try {
      const cursorParam = reset
        ? ""
        : nextCursor
          ? `&limit=50&cursor=${nextCursor}`
          : "&limit=50";
      const data = await apiJson<AuditResponse>(
        `/api/merchant/audit?${cursorParam}`,
      );
      if (data) {
        if (reset) {
          setLogs(data.items || []);
        } else {
          setLogs((prev) => [...prev, ...(data.items || [])]);
        }
        setNextCursor(data.next_cursor || null);
      }
    } catch (error: unknown) {
      const _errMsg = error instanceof Error ? error.message : String(error);
      logger.error("[FETCH_AUDIT_LOGS_ERROR]", {
        error: _errMsg,
        app: "merchant",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs(true);
  }, []);

  // Filter in memory for V1 simplicity if list is small, otherwise pass to API
  const filteredLogs = logs.filter(
    (log) =>
      log.action?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.actorLabel?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.entityType?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // Calculate metrics
  const totalLogs = logs.length;
  const userActions = logs.filter(l => l.actorLabel.includes('User')).length;
  const systemActions = logs.filter(l => l.actorLabel.includes('System')).length;

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Breadcrumbs
            items={[
              { label: "Dashboard", href: "/dashboard" },
              { label: "Settings", href: "/dashboard/settings" },
              { label: "Audit Log" },
            ]}
          />
          <h1 className="text-2xl font-bold text-gray-900 mt-2">Audit Log</h1>
          <p className="text-sm text-gray-500 mt-1">Track all system activities and changes.</p>
        </div>
      </div>

      {/* Summary Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SummaryWidget
          icon={<FileText size={18} />}
          label="Total Logs"
          value={String(totalLogs)}
          trend="all activities"
          positive
        />
        <SummaryWidget
          icon={<User size={18} />}
          label="User Actions"
          value={String(userActions)}
          trend="manual"
          positive
        />
        <SummaryWidget
          icon={<ClockCounterClockwise size={18} />}
          label="System Actions"
          value={String(systemActions)}
          trend="automated"
          positive
        />
      </div>

      {/* Search & Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search by action, user, or entity..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white border-gray-200"
            />
          </div>
          <Button onClick={() => { setSearchTerm(""); }} variant="outline" className="border-gray-200">
            Clear
          </Button>
        </div>
      </div>

      {/* Audit Logs Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-12 flex justify-center">
            <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="p-16 text-center flex flex-col items-center">
            <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
              <Info size={32} className="text-gray-400" />
            </div>
            <h3 className="text-base font-semibold text-gray-900 mb-1">No audit logs found</h3>
            <p className="text-sm text-gray-500 max-w-sm">
              Audit trail entries will appear here as activities occur.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Timestamp</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Entity</th>
                  <th className="text-right py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-gray-700">
                      {format(new Date(log.createdAt), 'MMM dd, yyyy HH:mm')}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{log.actorLabel}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-600 capitalize">
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs text-gray-500">
                        <div className="font-medium capitalize">{log.entityType}</div>
                        <div className="font-mono text-xs">{log.entityId}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => setSelectedLog(log)}
                        className="px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors inline-flex items-center gap-1"
                      >
                        <Eye size={14} />
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail Drawer */}
      {selectedLog && (
        <div
          className="fixed inset-0 z-50 flex justify-end bg-black/20 "
          onClick={() => setSelectedLog(null)}
        >
          <div
            className="w-full max-w-md bg-white  h-full shadow-2xl p-6 overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">
                Log Details
              </h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSelectedLog(null)}
                className="text-gray-500 hover:text-gray-900 h-8 w-8"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="space-y-6">
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Correlation ID
                </label>
                <p className="mt-1 font-mono text-xs text-gray-700 bg-white p-2 rounded select-all">
                  {selectedLog.correlationId}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </label>
                  <p className="mt-1 text-sm font-medium text-gray-900">
                    {selectedLog.action}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actor
                  </label>
                  <p className="mt-1 text-sm font-medium text-gray-900">
                    {selectedLog.actorLabel}
                  </p>
                </div>
              </div>

              {selectedLog.beforeState && (
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2 block">
                    Before State
                  </label>
                  <pre className="bg-gray-900 text-gray-100 p-3 rounded-lg text-xs overflow-x-auto font-mono">
                    {JSON.stringify(selectedLog.beforeState, null, 2)}
                  </pre>
                </div>
              )}

              {selectedLog.afterState && (
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2 block">
                    After State
                  </label>
                  <pre className="bg-gray-900 text-gray-100 p-3 rounded-lg text-xs overflow-x-auto font-mono">
                    {JSON.stringify(selectedLog.afterState, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Summary Widget Component
function SummaryWidget({
  icon,
  label,
  value,
  trend,
  positive,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  trend: string;
  positive: boolean;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            {label}
          </p>
          <p className="text-2xl font-bold text-gray-900 tracking-tight mt-1">
            {value}
          </p>
          <p className={`text-xs mt-1 ${positive ? 'text-green-600' : 'text-orange-600'}`}>
            {trend}
          </p>
        </div>
        <div className="p-2.5 rounded-xl bg-gray-100 text-gray-600">
          {icon}
        </div>
      </div>
    </div>
  );
}
