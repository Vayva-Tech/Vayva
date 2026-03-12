"use client";

import React, { useState, useEffect } from "react";
import { WarningCircle as AlertCircle, CheckCircle, Clock, ShieldCheck, ClockCounterClockwise as History, Gear as Settings, Lightning as Zap, ArrowRight, ArrowCounterClockwise as RefreshCw, WebhooksLogo, Play, Spinner as Loader2 } from "@phosphor-icons/react/ssr";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@vayva/ui";
import { OpsPageShell } from "@/components/ops/OpsPageShell";
import { logger } from "@vayva/shared";

interface RescueIncident {
  id: string;
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  surface: string;
  createdAt: string;
  errorType: string;
  errorMessage: string;
}

interface RescueFix {
  id: string;
  actionType: string;
  incidentId: string;
  Incident?: { errorType: string };
  actionStatus: "SUCCESS" | "FAILED";
  summary: string;
  performedBy: string;
  createdAt: string;
}

type Tab = "incidents" | "history" | "runbook" | "settings";

export default function RescueConsolePage(): React.JSX.Element {
  const [activeTab, setActiveTab] = useState<Tab>("incidents");
  const [incidents, setIncidents] = useState<RescueIncident[]>([]);
  const [fixes, setFixes] = useState<RescueFix[]>([]);
  const [loading, setLoading] = useState(true);
  const [runningRunbook, setRunningRunbook] = useState<string | null>(null);

  const fetchData = React.useCallback(async () => {
    setLoading(true);
    try {
      if (activeTab === "incidents") {
        const res = await fetch("/api/ops/rescue/incidents");
        setIncidents(await res.json());
      } else if (activeTab === "history") {
        const res = await fetch("/api/ops/rescue/fixes");
        setFixes(await res.json());
      }
    } catch (error: unknown) {
      logger.error("[RESCUE_FETCH_ERROR]", { error });
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const runRunbook = async (id: string, title: string) => {
    if (
      !confirm(
        `Run runbook: ${title}? This will execute automated recovery steps.`,
      )
    )
      return;

    setRunningRunbook(id);
    const promise = fetch("/api/ops/rescue/runbooks", {
      method: "POST",
      body: JSON.stringify({ runbookId: id }),
    }).then(async (res) => {
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      return json;
    });

    toast.promise(promise, {
      loading: "Executing runbook...",
      success: (data) => `Runbook Completed: ${JSON.stringify(data.result)}`,
      error: (err) =>
        `Runbook Failed: ${err instanceof Error ? err.message : String(err)}`,
    });

    try {
      await promise;
    } catch {
      // Toast handles it
    } finally {
      setRunningRunbook(null);
    }
  };

  const getSeverityColor = (sev: string) => {
    switch (sev) {
      case "CRITICAL":
        return "text-red-700 bg-red-100 border-red-200";
      case "HIGH":
        return "text-orange-700 bg-orange-100 border-orange-200";
      case "MEDIUM":
        return "text-amber-700 bg-amber-100 border-amber-200";
      default:
        return "text-blue-700 bg-blue-100 border-blue-200";
    }
  };

  return (
    <OpsPageShell
      title="Vayva Rescue"
      description="AI-powered platform diagnostics and self-healing"
      headerActions={
        <Button
          variant="ghost"
          size="icon"
          onClick={fetchData}
          className="p-2 text-gray-400 hover:text-indigo-600 transition-colors h-10 w-10 flex items-center justify-center"
          aria-label="Refresh rescue diagnostics"
        >
          <RefreshCw className={`w-5 h-5 ${loading ? "animate-spin" : ""}`} />
        </Button>
      }
    >

      {/* Tabs Nav */}
      <div className="flex gap-1 bg-white p-1 rounded-xl border border-gray-200 shadow-sm w-fit">
        {[
          { id: "incidents", label: "Open Incidents", icon: AlertCircle },
          { id: "history", label: "History", icon: History },
          { id: "runbook", label: "Runbooks", icon: Zap },
          { id: "settings", label: "Settings", icon: Settings },
        ].map((tab: any) => (
          <Button
            key={tab.id}
            variant="ghost"
            onClick={() => setActiveTab(tab.id as Tab)}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold transition-all h-auto ${
              activeTab === tab.id
                ? "bg-[#0F172A] text-white shadow-lg hover:bg-[#0F172A] hover:text-white"
                : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
            }`}
            aria-label={`Switch to ${tab.label} tab`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </Button>
        ))}
      </div>

      {/* Content Area */}
      {loading ? (
        <div className="grid grid-cols-1 gap-6">
          {[1, 2, 3].map((i: any) => (
            <div
              key={i}
              className="h-32 bg-gray-100 rounded-2xl animate-pulse"
            />
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          {activeTab === "incidents" && (
            <div className="grid grid-cols-1 gap-6">
              {incidents.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-3xl border border-gray-200 shadow-sm border-dashed">
                  <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-gray-900">
                    All systems operational
                  </h3>
                  <p className="text-gray-500">
                    No open rescue incidents found.
                  </p>
                </div>
              ) : (
                incidents.map((incident: any) => (
                  <Link
                    key={incident.id}
                    href={`/ops/rescue/${incident.id}`}
                    className="block group"
                  >
                    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:border-indigo-600 hover:shadow-xl transition-all relative overflow-hidden">
                      <div className="flex items-start justify-between relative z-10">
                        <div className="flex gap-4">
                          <div
                            className={`p-3 rounded-xl ${getSeverityColor(incident.severity)}`}
                          >
                            <AlertCircle className="w-6 h-6" />
                          </div>
                          <div>
                            <div className="flex items-center gap-3 mb-2">
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded border ${getSeverityColor(incident.severity)}`}
                              >
                                {incident.severity}
                              </span>
                              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                                {incident.surface}
                              </span>
                              <span className="text-xs text-gray-400 flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {new Date(
                                  incident.createdAt,
                                ).toLocaleTimeString()}
                              </span>
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">
                              {incident.errorType}
                            </h3>
                            <p className="text-sm text-gray-600 mt-1 line-clamp-1">
                              {incident.errorMessage}
                            </p>
                          </div>
                        </div>
                        <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-indigo-600 transition-all group-hover:translate-x-1" />
                      </div>
                      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full -mr-16 -mt-16 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </Link>
                ))
              )}
            </div>
          )}

          {activeTab === "history" && (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-gray-50 text-xs font-bold text-gray-600 uppercase tracking-widest transition-all">
                  <tr>
                    <th className="px-6 py-4">Action</th>
                    <th className="px-6 py-4">Incident</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Summary</th>
                    <th className="px-6 py-4">Performed By</th>
                    <th className="px-6 py-4">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {Array.isArray(fixes) &&
                    fixes.map((fix: any) => (
                      <tr
                        key={fix.id}
                        className="hover:bg-white/60 transition-colors"
                      >
                        <td className="px-6 py-4 font-bold text-sm text-[#0F172A]">
                          {fix.actionType}
                        </td>
                        <td className="px-6 py-4 text-xs text-indigo-600 hover:underline">
                          <Link href={`/ops/rescue/${fix.incidentId}`}>
                            {fix.Incident?.errorType ||
                              fix.incidentId?.slice(0, 8)}
                          </Link>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                              fix.actionStatus === "SUCCESS"
                                ? "text-green-700 bg-green-100"
                                : "text-red-700 bg-red-100"
                            }`}
                          >
                            {fix.actionStatus}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-xs text-gray-600">
                          {fix.summary}
                        </td>
                        <td className="px-6 py-4 text-xs font-medium">
                          {fix.performedBy}
                        </td>
                        <td className="px-6 py-4 text-xs text-gray-400">
                          {new Date(fix.createdAt).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === "runbook" && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  id: "webhook-recovery",
                  title: "Webhook Recovery",
                  desc: "Common steps for Paystack/Kwik failures",
                  icon: WebhooksLogo,
                },
                {
                  id: "job-stuck-mitigation",
                  title: "Job Stuck Mitigation",
                  desc: "Dealing with BullMQ congestion",
                  icon: Zap,
                },
                {
                  id: "auth-sync-repair",
                  title: "Auth Sync Repair",
                  desc: "Resolving session inconsistencies",
                  icon: ShieldCheck,
                },
              ].map((rb: any) => (
                <Button
                  variant="ghost"
                  key={rb.id}
                  onClick={() => runRunbook(rb.id, rb.title)}
                  disabled={!!runningRunbook}
                  className={`p-6 bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg transition-all text-left group h-auto block w-full hover:bg-gray-50 ${
                    runningRunbook === rb.id
                      ? "opacity-75 animate-pulse cursor-wait"
                      : ""
                  }`}
                  aria-label={`Run automation: ${rb.title}`}
                >
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center mb-4 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                    {runningRunbook === rb.id ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <rb.icon className="w-5 h-5 text-indigo-600 group-hover:text-white" />
                    )}
                  </div>
                  <h4 className="font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">
                    {rb.title}
                  </h4>
                  <p className="text-sm text-gray-500 mt-2">{rb.desc}</p>
                  <div className="mt-4 flex items-center gap-2 text-xs font-bold text-indigo-600 opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">
                    <Play className="w-3 h-3 fill-current" /> Run Automation
                  </div>
                </Button>
              ))}
            </div>
          )}
        </div>
      )}
    </OpsPageShell>
  );
}
