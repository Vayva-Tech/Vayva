// @ts-nocheck
"use client";

import { logger } from "@vayva/shared";
import React, { useEffect, useState, useCallback } from "react";
import { Button } from "@vayva/ui";
import { toast } from "sonner";
import { apiJson } from "@/lib/api-client-shared";
import { getRuleBySlug } from "@/config/autopilot-rules";
import Link from "next/link";
import { Robot, Play, CheckCircle, XCircle, List, Activity, Zap } from "@phosphor-icons/react";
import { useAuth } from "@/context/AuthContext";

interface AutopilotRunItem {
  id: string;
  ruleSlug: string;
  category: string;
  status: string;
  title: string;
  summary: string;
  reasoning: string;
  createdAt: string;
  approvedAt: string | null;
  dismissedAt: string | null;
}

type TabKey = "proposed" | "approved" | "dismissed" | "all";

const CATEGORY_COLORS: Record<string, string> = {
  inventory: "bg-green-500/20 text-green-600",
  pricing: "bg-violet/20 text-violet",
  marketing: "bg-amber-50 text-amber-600",
  engagement: "bg-amber-50 text-amber-600",
  operations: "bg-amber-50 text-amber-600",
  content: "bg-green-50 text-green-600",
  financial: "bg-green-50 text-green-600",
};

interface AutopilotFeedResponse {
  runs: AutopilotRunItem[];
  pendingCount: number;
  total: number;
}

interface AddOnsResponse {
  addOns: Array<{
    id: string;
    purchase?: {
      status: string;
    };
  }>;
}

interface EvaluateResponse {
  runsCreated: number;
}

export default function AutopilotPage() {
  const { merchant } = useAuth();
  const isPaidPlan = (() => {
    const v = String((merchant as any)?.plan || "")
      .trim()
      .toLowerCase();

    return (
      v === "starter" ||
      v === "pro" ||
      v === "growth" ||
      v === "business" ||
      v === "enterprise" ||
      v === "professional" ||
      v === "premium"
    );
  })();
  const [runs, setRuns] = useState<AutopilotRunItem[]>([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [evaluating, setEvaluating] = useState(false);
  const [actionId, setActionId] = useState<string | null>(null);
  const [tab, setTab] = useState<TabKey>("proposed");
  const [isActive, setIsActive] = useState<boolean | null>(null);

  const fetchFeed = useCallback(async (statusFilter?: string) => {
    try {
      setLoading(true);
      const params =
        statusFilter && statusFilter !== "all" ? `?status=${statusFilter}` : "";
      const res = await apiJson<AutopilotFeedResponse>(
        `/api/merchant/autopilot/feed${params}`,
      );
      setRuns(res.runs || []);
      setPendingCount(res.pendingCount || 0);
      setTotal(res.total || 0);
    } catch (err: unknown) {
      const _errMsg = err instanceof Error ? err.message : String(err);
      logger.error("[Autopilot] Failed to load feed", {
        error: _errMsg,
        app: "merchant",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  const checkAddon = useCallback(async () => {
    try {
      const res = await apiJson<AddOnsResponse>("/api/merchant/addons");
      const autopilot = (res.addOns || []).find(
        (a: { id: string; purchase?: { status: string } }) => a.id === "vayva.autopilot",
      );
      setIsActive(autopilot?.purchase?.status === "ACTIVE");
    } catch {
      setIsActive(false);
    }
  }, []);

  useEffect(() => {
    void checkAddon();
  }, [checkAddon]);

  useEffect(() => {
    if (isActive) {
      void fetchFeed(tab);
    }
  }, [isActive, tab, fetchFeed]);

  // Calculate metrics
  const proposedCount = runs.filter(r => !r.approvedAt && !r.dismissedAt).length;
  const approvedCount = runs.filter(r => r.approvedAt).length;
  const dismissedCount = runs.filter(r => r.dismissedAt).length;
  const automationRate = total > 0 ? Math.round((approvedCount / total) * 100) : 0;

  const handleEvaluate = async () => {
    setEvaluating(true);
    try {
      const data = await apiJson<EvaluateResponse>(
        "/api/merchant/autopilot/evaluate",
        { method: "POST" }
      );
      toast.success(`Evaluated business. Created ${data.runsCreated || 0} suggestions`);
      void fetchFeed("proposed");
    } catch (err: unknown) {
      const _errMsg = err instanceof Error ? err.message : String(err);
      logger.error("[Autopilot] Failed to evaluate", { error: _errMsg });
      toast.error("Failed to evaluate business");
    } finally {
      setEvaluating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Autopilot</h1>
          <p className="text-sm text-gray-500 mt-1">AI-powered business automation and suggestions</p>
        </div>
        <Button 
          onClick={handleEvaluate} 
          disabled={evaluating}
          className="bg-green-600 hover:bg-green-700 text-white px-4 h-10 rounded-xl font-semibold disabled:opacity-50"
        >
          <Zap size={18} className="mr-2" />
          {evaluating ? 'Evaluating...' : 'Evaluate Now'}
        </Button>
      </div>

      {/* Summary Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <SummaryWidget
          icon={<Activity size={18} />}
          label="Total Runs"
          value={String(total)}
          trend="all time"
          positive
        />
        <SummaryWidget
          icon={<List size={18} />}
          label="Proposed"
          value={String(proposedCount)}
          trend="pending review"
          positive={proposedCount === 0}
        />
        <SummaryWidget
          icon={<CheckCircle size={18} />}
          label="Approved"
          value={String(approvedCount)}
          trend="executed"
          positive
        />
        <SummaryWidget
          icon={<XCircle size={18} />}
          label="Dismissed"
          value={String(dismissedCount)}
          trend="rejected"
          positive
        />
        <SummaryWidget
          icon={<Robot size={18} />}
          label="Automation Rate"
          value={`${automationRate}%`}
          trend="efficiency"
          positive={automationRate >= 80}
        />
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-6 border-b border-gray-200 pb-3">
        <button
          onClick={() => setTab("proposed")}
          className={`text-sm font-medium border-b-2 pb-3 -mb-3.5 transition-colors ${
            tab === "proposed"
              ? "border-green-500 text-green-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Proposed ({proposedCount})
        </button>
        <button
          onClick={() => setTab("approved")}
          className={`text-sm font-medium border-b-2 pb-3 -mb-3.5 transition-colors ${
            tab === "approved"
              ? "border-green-500 text-green-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Approved ({approvedCount})
        </button>
        <button
          onClick={() => setTab("dismissed")}
          className={`text-sm font-medium border-b-2 pb-3 -mb-3.5 transition-colors ${
            tab === "dismissed"
              ? "border-green-500 text-green-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Dismissed ({dismissedCount})
        </button>
      </div>

      {/* Autopilot Feed */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-12 flex justify-center">
            <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : runs.length === 0 ? (
          <div className="p-16 text-center flex flex-col items-center">
            <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
              <Robot size={32} className="text-gray-400" />
            </div>
            <h3 className="text-base font-semibold text-gray-900 mb-1">No autopilot runs</h3>
            <p className="text-sm text-gray-500 max-w-sm">
              Click "Evaluate Now" to generate automation suggestions.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {runs.map((run) => (
              <div key={run.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${
                        CATEGORY_COLORS[run.category] || "bg-gray-50 text-gray-600"
                      }`}>
                        {run.category}
                      </span>
                      <span className="text-xs text-gray-500">{new Date(run.createdAt).toLocaleDateString()}</span>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-1">{run.title}</h3>
                    <p className="text-sm text-gray-500 mb-3">{run.summary}</p>
                    <p className="text-xs text-gray-600 bg-gray-50 p-3 rounded-lg">{run.reasoning}</p>
                  </div>
                  {!run.approvedAt && !run.dismissedAt && (
                    <div className="flex items-center gap-2 ml-4">
                      <Button className="bg-green-600 hover:bg-green-700 text-white px-4 h-9 rounded-xl font-semibold">
                        <CheckCircle size={16} className="mr-1.5" />
                        Approve
                      </Button>
                      <Button variant="outline" className="border-red-200 text-red-600 hover:bg-red-50 px-4 h-9 rounded-xl font-semibold">
                        <XCircle size={16} className="mr-1.5" />
                        Dismiss
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
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
