"use client";

import React, { useState, useEffect } from "react";
import { WarningCircle as AlertCircle, ArrowLeft, CaretRight as ChevronRight, Clock, Database, HardDrives as Server, Pulse as Activity, Play, ArrowCounterClockwise as RotateCcw, Warning as ShieldAlert, Sparkle as Sparkles } from "@phosphor-icons/react/ssr";
import Link from "next/link";
import { Button } from "@vayva/ui";
import { useToast } from "@/components/ui/use-toast";
import { OpsPageShell } from "@/components/ops/OpsPageShell";
import { logger } from "@vayva/shared";

export default function IncidentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}): React.JSX.Element {
  const { toast } = useToast();
  const [incident, setIncident] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const resolvedParams = React.use(params);

  useEffect(() => {
    fetchIncident();
  }, [resolvedParams.id]);

  const fetchIncident = async () => {
    try {
      const res = await fetch(`/api/ops/rescue/incidents/${resolvedParams.id}`);
      setIncident(await res.json());
    } catch (error: unknown) {
      logger.error("[INCIDENT_FETCH_ERROR]", { error });
    } finally {
      setLoading(false);
    }
  };

  const runAction = async (actionType: string) => {
    setActionLoading(actionType);
    try {
      const res = await fetch(
        `/api/ops/rescue/incidents/${resolvedParams.id}/actions`,
        {
          method: "POST",
          body: JSON.stringify({ actionType }),
        },
      );
      if (res.ok) {
        toast({
          title: "Success",
          description: "Action executed successfully!",
        });
        fetchIncident();
      }
    } catch {
      toast({
        title: "Error",
        description: "Action failed.",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  if (loading)
    return (
      <div className="p-8 text-center animate-pulse">Loading incident...</div>
    );
  if (!incident)
    return (
      <div className="p-8 text-center text-red-500">Incident not found.</div>
    );

  const aiAnalysis = incident.diagnostics?.aiAnalysis || {};

  return (
    <OpsPageShell
      title={incident.errorType}
      description={`#${incident?.id?.slice(0, 8)} • ${incident.surface}`}
    >
      <div className="space-y-8">

      <div className="grid lg:grid-cols-[1fr_400px] gap-8">
        <div className="space-y-8">
          {/* Main Info */}
          <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-sm relative overflow-hidden">
            <div
              className={`absolute top-0 left-0 w-2 h-full ${
                incident.severity === "CRITICAL"
                  ? "bg-red-500"
                  : "bg-orange-500"
              }`}
            />

            <div className="flex justify-between items-start mb-6">
              <div className="flex gap-4 items-center">
                <span className="px-3 py-1 rounded-full text-[10px] font-black bg-gray-900 text-white uppercase">
                  {incident.status}
                </span>
                <span className="text-sm font-bold text-gray-400">
                  #{incident?.id?.slice(0, 8)}
                </span>
              </div>
              <div className="text-right">
                <div className="text-xs text-gray-400">First Detected</div>
                <div className="text-sm font-bold text-gray-900">
                  {new Date(incident.createdAt).toLocaleString()}
                </div>
              </div>
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {incident.errorType}
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              {incident.errorMessage}
            </p>

            <div className="flex flex-wrap gap-4 pt-6 border-t border-gray-100">
              <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-xl">
                <Server className="w-4 h-4 text-gray-400" />
                <span className="text-sm font-bold text-gray-700">
                  {incident.surface}
                </span>
              </div>
              {incident.route && (
                <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-xl">
                  <Activity className="w-4 h-4 text-gray-400" />
                  <span className="text-sm font-medium text-gray-700">
                    {incident.route}
                  </span>
                </div>
              )}
              {incident.storeId && (
                <Link
                  href={`/ops/merchants/${incident.storeId}`}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-colors"
                >
                  <Database className="w-4 h-4 text-indigo-400" />
                  <span className="text-sm font-bold text-indigo-700">
                    Store: {incident?.storeId?.slice(0, 8)}
                  </span>
                </Link>
              )}
            </div>
          </div>

          {/* AI Rescue Advisor */}
          <div className="bg-[#0F172A] p-8 rounded-3xl text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 blur-[80px] rounded-full" />
            <div className="flex items-center gap-3 mb-6 relative z-10">
              <Sparkles className="w-6 h-6 text-indigo-400" />
              <h3 className="text-xl font-bold">AI Rescue Advisor</h3>
            </div>

            <div className="grid md:grid-cols-2 gap-8 relative z-10">
              <div className="space-y-4">
                <div className="text-xs font-bold text-indigo-400 uppercase tracking-widest">
                  Classification
                </div>
                <div className="flex items-center gap-2">
                  <span className="bg-white/10 backdrop-blur-xl px-3 py-1 rounded-lg font-bold">
                    {aiAnalysis.classification || "ANALYIZING..."}
                  </span>
                </div>
                <div className="text-xs font-bold text-indigo-400 uppercase tracking-widest mt-6">
                  Recommended Patch
                </div>
                <p className="text-gray-300 text-sm leading-relaxed">
                  {aiAnalysis.remediation ||
                    "Standby for incoming diagnostics summary..."}
                </p>
              </div>
              <div className="p-6 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/10">
                <h4 className="text-sm font-bold mb-4">
                  Safe Actions Available
                </h4>
                <div className="space-y-3">
                  {["RETRY_JOB", "REPROCESS_WEBHOOK", "HEALTH_CHECK"].map(
                    (act) => (
                      <Button
                        key={act}
                        variant="ghost"
                        onClick={() => runAction(act)}
                        disabled={!!actionLoading}
                        className="w-full flex items-center justify-between p-3 rounded-xl bg-white/10 hover:bg-white/20 transition-all text-xs font-bold group h-auto text-white hover:text-white"
                      >
                        <div className="flex items-center gap-3">
                          {act === "RETRY_JOB" && (
                            <RotateCcw className="w-4 h-4" />
                          )}
                          {act === "REPROCESS_WEBHOOK" && (
                            <Play className="w-4 h-4" />
                          )}
                          {act === "HEALTH_CHECK" && (
                            <Activity className="w-4 h-4" />
                          )}
                          {act.replace("_", " ")}
                        </div>
                        <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all" />
                      </Button>
                    ),
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-white p-8 rounded-3xl border border-gray-200">
            <h3 className="text-xl font-bold text-gray-900 mb-8">
              Incident Timeline
            </h3>
            <div className="space-y-8 relative before:absolute before:left-[17px] before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-100">
              {incident.FixActions?.map((fix: any) => (
                <div key={fix.id} className="relative pl-12">
                  <div
                    className={`absolute left-0 w-9 h-9 rounded-full flex items-center justify-center border-4 border-white shadow-sm ${
                      fix.actionStatus === "SUCCESS"
                        ? "bg-green-500"
                        : "bg-red-500"
                    }`}
                  >
                    <RotateCcw className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-sm font-bold text-gray-900">
                        {fix.actionType}
                      </span>
                      <span className="text-xs text-gray-400">
                        {new Date(fix.createdAt).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{fix.summary}</p>
                    <div className="text-[10px] text-gray-400 mt-1 uppercase font-bold tracking-widest">
                      BY {fix.performedBy}
                    </div>
                  </div>
                </div>
              ))}
              <div className="relative pl-12">
                <div className="absolute left-0 w-9 h-9 rounded-full bg-[#0F172A] flex items-center justify-center border-4 border-white shadow-sm">
                  <AlertCircle className="w-4 h-4 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-sm font-bold text-gray-900">
                      Incident Detected
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(incident.createdAt).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Initial error ingestion recorded on {incident.surface}{" "}
                    surface.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm">
            <h4 className="text-sm font-black uppercase text-gray-400 tracking-widest mb-6">
              Diagnostics JSON
            </h4>
            <div className="bg-gray-950 p-4 rounded-xl overflow-x-auto">
              <pre className="text-[10px] text-green-400 font-mono">
                {JSON.stringify(incident.diagnostics, null, 2)}
              </pre>
            </div>
          </div>

          <div className="p-6 bg-red-50 rounded-3xl border border-red-100">
            <h4 className="flex items-center gap-2 text-red-700 font-bold mb-4">
              <ShieldAlert className="w-4 h-4" />
              Destructive Actions
            </h4>
            <p className="text-xs text-red-600 mb-6">
              These actions may cause data loss or service interruption. Use
              with caution.
            </p>
            <Button
              variant="outline"
              className="w-full border-red-200 text-red-600 hover:bg-red-600 hover:text-white transition-all"
            >
              Mark as False Positive
            </Button>
          </div>
        </div>
      </div>
      </div>
    </OpsPageShell>
  );
}
