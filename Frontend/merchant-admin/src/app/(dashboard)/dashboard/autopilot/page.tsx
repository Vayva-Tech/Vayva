"use client";

import { logger } from "@vayva/shared";
import React, { useEffect, useState, useCallback } from "react";
import { Button, Icon, IconName, cn } from "@vayva/ui";
import { toast } from "sonner";
import { apiJson } from "@/lib/api-client-shared";
import { getRuleBySlug } from "@/config/autopilot-rules";
import Link from "next/link";
import { motion } from "framer-motion";
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
  inventory: "bg-primary/20 text-primary",
  pricing: "bg-violet/20 text-violet",
  marketing: "bg-warning/20 text-warning",
  engagement: "bg-warning/20 text-warning",
  operations: "bg-warning/20 text-warning",
  content: "bg-success/20 text-success",
  financial: "bg-success/20 text-success",
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

  const handleEvaluate = async () => {
    setEvaluating(true);
    try {
      const res = await apiJson<EvaluateResponse>(
        "/api/merchant/autopilot/evaluate",
        {
          method: "POST",
        },
      );
      toast.success(
        `Evaluation complete: ${res.runsCreated || 0} new recommendations.`,
      );
      void fetchFeed(tab);
    } catch (e: any) {
      const _errMsg = e instanceof Error ? e.message : String(e);
      toast.error(_errMsg || "Evaluation failed");
    } finally {
      setEvaluating(false);
    }
  };

  const handleAction = async (runId: string, action: "approve" | "dismiss") => {
    setActionId(runId);
    try {
      await apiJson<{ success: boolean }>("/api/merchant/autopilot/action", {
        method: "POST",
        body: JSON.stringify({ runId, action }),
      });
      toast.success(
        action === "approve" ? "Recommendation noted!" : "Dismissed.",
      );
      void fetchFeed(tab);
    } catch (e: any) {
      const _errMsg = e instanceof Error ? e.message : String(e);
      toast.error(_errMsg || "Action failed");
    } finally {
      setActionId(null);
    }
  };

  // Locked state for non-subscribers
  if (isActive === false) {
    return (
      <div className="relative max-w-4xl mx-auto pb-20">
        {isPaidPlan && (
          <div className="fixed inset-0 pointer-events-none -z-10">
            <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-primary/[0.04] rounded-full blur-[120px]" />
          </div>
        )}

        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="p-4 rounded-3xl bg-primary/10 text-primary mb-6">
            <Icon name="Sparkles" size={40} />
          </div>
          <h1 className="text-3xl font-heading font-bold text-text-primary mb-3">
            Vayva Autopilot
          </h1>
          <p className="text-text-secondary max-w-md mb-2">
            AI-powered business recommendations tailored to your industry. Get
            daily insights on inventory, pricing, marketing, and operations.
          </p>
          <p className="text-sm text-text-tertiary mb-8">
            ₦10,000/month · Cancel anytime
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10 max-w-lg w-full">
            {[
              { icon: "PackageSearch", label: "Inventory Alerts" },
              { icon: "TrendingUp", label: "Revenue Insights" },
              { icon: "UserCheck", label: "Customer Engagement" },
            ].map((f) => (
              <div
                key={f.label}
                className="flex flex-col items-center gap-2 p-4 rounded-2xl border border-border/40 bg-background/60"
              >
                <Icon
                  name={f.icon as IconName}
                  size={20}
                  className="text-primary"
                />
                <span className="text-xs font-bold text-text-secondary">
                  {f.label}
                </span>
              </div>
            ))}
          </div>

          <Link href="/dashboard/billing">
            <Button className="rounded-full px-8 h-12 font-bold gap-2 text-base">
              <Icon name="Sparkles" size={18} />
              Subscribe to Autopilot
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (isActive === null) {
    return (
      <div className="flex items-center justify-center py-24">
        <Icon
          name="loader2"
          className="animate-spin w-8 h-8 text-text-tertiary"
        />
      </div>
    );
  }

  const tabs: { key: TabKey; label: string }[] = [
    { key: "proposed", label: `Pending (${pendingCount})` },
    { key: "approved", label: "Approved" },
    { key: "dismissed", label: "Dismissed" },
    { key: "all", label: "All" },
  ];

  return (
    <div className="relative space-y-8 max-w-5xl mx-auto pb-12">
      {/* Green gradient blur background */}
      {isPaidPlan && (
        <div className="fixed inset-0 pointer-events-none -z-10">
          <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-primary/[0.04] rounded-full blur-[120px]" />
          <div className="absolute bottom-40 right-20 w-[300px] h-[300px] bg-primary/[0.03] rounded-full blur-[100px]" />
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm text-primary font-bold">
            <Icon name="Sparkles" size={14} />
            AI Autopilot
          </div>
          <h1 className="text-3xl md:text-4xl font-heading font-bold text-text-primary tracking-tight">
            Recommendations
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            AI-generated business insights for your store, updated daily.
          </p>
        </div>

        <Button
          onClick={handleEvaluate}
          disabled={evaluating}
          className="rounded-full px-6 h-11 font-bold gap-2"
        >
          {evaluating ? (
            <Icon name="loader2" className="w-4 h-4 animate-spin" />
          ) : (
            <Icon name="Sparkles" size={16} />
          )}
          {evaluating ? "Analyzing..." : "Run Analysis"}
        </Button>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <motion.div
          whileHover={{ y: -2 }}
          className="rounded-[20px] border border-border/60 bg-background/70 backdrop-blur-xl shadow-card p-5"
        >
          <div className="text-xs font-semibold text-text-tertiary uppercase tracking-wider mb-2">
            Pending Review
          </div>
          <div className="text-3xl font-bold text-text-primary">
            {pendingCount}
          </div>
        </motion.div>
        <motion.div
          whileHover={{ y: -2 }}
          className="rounded-[20px] border border-border/60 bg-background/70 backdrop-blur-xl shadow-card p-5"
        >
          <div className="text-xs font-semibold text-text-tertiary uppercase tracking-wider mb-2">
            Total Insights
          </div>
          <div className="text-3xl font-bold text-text-primary">{total}</div>
        </motion.div>
        <motion.div
          whileHover={{ y: -2 }}
          className="rounded-[20px] border border-primary/20 bg-primary/[0.03] shadow-card p-5"
        >
          <div className="text-xs font-semibold text-primary uppercase tracking-wider mb-2">
            Status
          </div>
          <div className="text-lg font-bold text-primary flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            Active
          </div>
        </motion.div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 p-1 rounded-2xl bg-background/30 border border-border/40 backdrop-blur-sm w-fit">
        {tabs.map((t) => (
          <Button
            key={t.key}
            variant="ghost"
            onClick={() => setTab(t.key)}
            className={cn(
              "px-4 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap h-auto",
              tab === t.key
                ? "bg-background/70 backdrop-blur-xl text-text-primary shadow-sm border border-border/40"
                : "text-text-tertiary hover:text-text-secondary",
            )}
          >
            {t.label}
          </Button>
        ))}
      </div>

      {/* Feed */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Icon
            name="loader2"
            className="animate-spin w-6 h-6 text-text-tertiary"
          />
        </div>
      ) : runs.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed border-border/40 rounded-3xl">
          <Icon
            name="Sparkles"
            size={32}
            className="text-text-tertiary mx-auto mb-3"
          />
          <p className="text-text-tertiary font-medium">
            {tab === "proposed"
              ? 'No pending recommendations. Click "Run Analysis" to generate insights.'
              : "No recommendations in this category yet."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {runs.map((run) => {
            const rule = getRuleBySlug(run.ruleSlug);
            const isBusy = actionId === run.id;
            const catColor =
              CATEGORY_COLORS[run.category] ||
              "bg-background/30 text-text-secondary";

            return (
              <motion.div
                key={run.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-[24px] border border-border/60 bg-background/70 backdrop-blur-xl shadow-card p-6 group hover:border-primary/20 transition-colors"
              >
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                      <Icon
                        name={(rule?.icon || "Sparkles") as IconName}
                        size={18}
                      />
                    </div>
                    <div>
                      <h3 className="font-bold text-text-primary text-sm">
                        {run.title}
                      </h3>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span
                          className={cn(
                            "text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full",
                            catColor,
                          )}
                        >
                          {run.category}
                        </span>
                        <span className="text-[10px] text-text-tertiary">
                          {new Date(run.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {run.status === "PROPOSED" && (
                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        size="sm"
                        onClick={() => handleAction(run.id, "approve")}
                        disabled={isBusy}
                        className="h-8 text-xs font-bold rounded-xl gap-1"
                      >
                        {isBusy ? (
                          <Icon
                            name="loader2"
                            className="w-3 h-3 animate-spin"
                          />
                        ) : (
                          <Icon name="Check" size={14} />
                        )}
                        Noted
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAction(run.id, "dismiss")}
                        disabled={isBusy}
                        className="h-8 text-xs font-bold rounded-xl"
                      >
                        Dismiss
                      </Button>
                    </div>
                  )}

                  {run.status === "APPROVED" && (
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-success/20 text-success shrink-0">
                      Noted
                    </span>
                  )}

                  {run.status === "DISMISSED" && (
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-background/30 text-text-tertiary shrink-0">
                      Dismissed
                    </span>
                  )}
                </div>

                <div className="text-sm text-text-secondary leading-relaxed whitespace-pre-line pl-[52px]">
                  {run.summary}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
