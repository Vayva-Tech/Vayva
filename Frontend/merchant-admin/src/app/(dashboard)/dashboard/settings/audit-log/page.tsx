"use client";

import React, { useState, useEffect } from "react";
import { logger } from "@vayva/shared";
import { format } from "date-fns";
import {
  MagnifyingGlass as Search,
  Info,
  Spinner as Loader2,
  X,
} from "@phosphor-icons/react/ssr";
import { Button, Input } from "@vayva/ui";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";

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

import { apiJson } from "@/lib/api-client-shared";

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

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <Breadcrumbs />
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-text-primary">
            Audit Log
          </h1>
          <p className="text-sm text-text-tertiary mt-1">
            Track system events and user actions.
          </p>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" />
          <Input
            type="text"
            placeholder="Search action or user..."
            value={searchTerm}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setSearchTerm(e.target?.value)
            }
            className="pl-9 pr-4 py-2 border border-border rounded-lg text-sm bg-background/50 focus:bg-white/80 focus:ring-2 focus:ring-indigo-500 outline-none w-64"
          />
        </div>
      </div>

      <div className="bg-background/80 backdrop-blur-xl border border-border/50 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-background/30 border-b border-border/40">
              <tr>
                <th className="px-6 py-3 font-medium text-text-tertiary">
                  Time
                </th>
                <th className="px-6 py-3 font-medium text-text-tertiary">
                  Actor
                </th>
                <th className="px-6 py-3 font-medium text-text-tertiary">
                  Action
                </th>
                <th className="px-6 py-3 font-medium text-text-tertiary">
                  Entity
                </th>
                <th className="px-6 py-3 font-medium text-text-tertiary text-right">
                  Details
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading && logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center">
                    <Loader2 className="w-6 h-6 text-indigo-600 animate-spin mx-auto" />
                  </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="py-12 text-center text-text-tertiary"
                  >
                    No audit logs found.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr
                    key={log.id}
                    className="hover:bg-background/30 transition-colors"
                  >
                    <td className="px-6 py-3 text-text-tertiary whitespace-nowrap">
                      {format(new Date(log.createdAt), "MMM d, HH:mm:ss")}
                    </td>
                    <td className="px-6 py-3 font-medium text-text-primary">
                      {log.actorLabel}
                    </td>
                    <td className="px-6 py-3">
                      <span className="inline-flex items-center px-2 py-1 rounded-md bg-background/30 text-xs font-medium text-text-secondary font-mono">
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-text-secondary">
                      {log.entityType && (
                        <span className="text-xs uppercase tracking-wider text-text-tertiary mr-2">
                          {log.entityType}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-3 text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setSelectedLog(log)}
                        className="text-text-tertiary hover:text-indigo-600 transition-colors h-8 w-8"
                      >
                        <Info className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {nextCursor && (
          <div className="p-4 border-t border-border/40 text-center">
            <Button
              variant="ghost"
              onClick={() => fetchLogs(false)}
              disabled={loading}
              className="text-sm text-indigo-600 hover:text-indigo-800 font-medium hover:bg-indigo-50"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading
                </>
              ) : (
                "Load More"
              )}
            </Button>
          </div>
        )}
      </div>

      {/* Detail Drawer */}
      {selectedLog && (
        <div
          className="fixed inset-0 z-50 flex justify-end bg-black/20 backdrop-blur-sm"
          onClick={() => setSelectedLog(null)}
        >
          <div
            className="w-full max-w-md bg-background/70 backdrop-blur-xl h-full shadow-2xl p-6 overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-text-primary">
                Log Details
              </h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSelectedLog(null)}
                className="text-text-tertiary hover:text-text-primary h-8 w-8"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="space-y-6">
              <div>
                <label className="text-xs font-medium text-text-tertiary uppercase tracking-wider">
                  Correlation ID
                </label>
                <p className="mt-1 font-mono text-xs text-text-secondary bg-background/30 p-2 rounded select-all">
                  {selectedLog.correlationId}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-text-tertiary uppercase tracking-wider">
                    Type
                  </label>
                  <p className="mt-1 text-sm font-medium text-text-primary">
                    {selectedLog.action}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-medium text-text-tertiary uppercase tracking-wider">
                    Actor
                  </label>
                  <p className="mt-1 text-sm font-medium text-text-primary">
                    {selectedLog.actorLabel}
                  </p>
                </div>
              </div>

              {selectedLog.beforeState && (
                <div>
                  <label className="text-xs font-medium text-text-tertiary uppercase tracking-wider mb-2 block">
                    Before State
                  </label>
                  <pre className="bg-text-primary text-background-light p-3 rounded-lg text-xs overflow-x-auto font-mono">
                    {JSON.stringify(selectedLog.beforeState, null, 2)}
                  </pre>
                </div>
              )}

              {selectedLog.afterState && (
                <div>
                  <label className="text-xs font-medium text-text-tertiary uppercase tracking-wider mb-2 block">
                    After State
                  </label>
                  <pre className="bg-text-primary text-background-light p-3 rounded-lg text-xs overflow-x-auto font-mono">
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
