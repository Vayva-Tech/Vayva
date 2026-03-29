"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { apiJson } from "@/lib/api-client-shared";
import { logger } from "@vayva/shared";
import {
  ArrowClockwise,
  CheckCircle,
  Sparkle,
  XCircle,
} from "@phosphor-icons/react";

type AutopilotStatus =
  | "PROPOSED"
  | "APPROVED"
  | "DISMISSED"
  | "COMPLETED"
  | "FAILED";

interface AutopilotRunRow {
  id: string;
  ruleSlug: string;
  category: string;
  status: AutopilotStatus;
  title: string;
  summary: string;
  reasoning: string | null;
  createdAt: string;
  approvedAt: string | null;
  dismissedAt: string | null;
}

interface FeedResponse {
  runs: AutopilotRunRow[];
  total: number;
  pendingCount: number;
  usage?: {
    runsThisMonth?: number;
    runsLimit?: number;
    messagesPerRun?: number;
  };
}

interface AddonRow {
  id: string;
  purchase?: { status?: string };
}

interface AddonsResponse {
  addOns?: AddonRow[];
}

export default function AutopilotPage() {
  const [addonActive, setAddonActive] = useState<boolean | null>(null);
  const [runs, setRuns] = useState<AutopilotRunRow[]>([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [runUsage, setRunUsage] = useState<FeedResponse["usage"] | null>(null);
  const [loading, setLoading] = useState(true);
  const [evaluating, setEvaluating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionId, setActionId] = useState<string | null>(null);

  const loadFeed = useCallback(async () => {
    setError(null);
    try {
      const addonsData = await apiJson<AddonsResponse>("/merchant/addons");
      const autopilot = (addonsData?.addOns || []).find(
        (a) => a.id === "vayva.autopilot",
      );
      const active =
        autopilot?.purchase?.status?.toUpperCase() === "ACTIVE";
      setAddonActive(active);

      if (!active) {
        setRuns([]);
        setPendingCount(0);
        return;
      }

      const feed = await apiJson<FeedResponse>(
        "/merchant/autopilot/feed?limit=50",
      );
      setRuns(feed.runs || []);
      setPendingCount(feed.pendingCount ?? 0);
      setRunUsage(feed.usage ?? null);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Failed to load Autopilot";
      setError(msg);
      logger.error("[AutopilotPage] load failed", {
        error: msg,
        app: "merchant",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadFeed();
  }, [loadFeed]);

  const runEvaluate = async () => {
    setEvaluating(true);
    setError(null);
    try {
      await apiJson("/merchant/autopilot/evaluate", { method: "POST" });
      await loadFeed();
    } catch (e: unknown) {
      const msg =
        e instanceof Error ? e.message : "Analysis run failed";
      setError(msg);
    } finally {
      setEvaluating(false);
    }
  };

  const runAction = async (runId: string, action: "approve" | "dismiss") => {
    setActionId(runId);
    setError(null);
    try {
      await apiJson("/merchant/autopilot/action", {
        method: "POST",
        body: JSON.stringify({ runId, action }),
      });
      await loadFeed();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Action failed";
      setError(msg);
    } finally {
      setActionId(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 pb-10">
        <div className="h-8 w-48 bg-gray-100 rounded-lg animate-pulse" />
        <div className="h-32 bg-gray-50 rounded-2xl animate-pulse" />
      </div>
    );
  }

  if (addonActive === false) {
    return (
      <div className="space-y-4 pb-10 max-w-xl">
        <h1 className="text-2xl font-bold text-gray-900">Autopilot</h1>
        <p className="text-sm text-gray-600">
          Autopilot is an add-on for eligible plans. Subscribe from Billing to
          get AI recommendations based on your store data.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-bold text-gray-900">Autopilot</h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-500 text-white">
              PRO
            </span>
          </div>
          <p className="text-sm text-gray-500">
            AI suggestions from your live data. Approve or dismiss each
            recommendation.
            {pendingCount > 0 && (
              <span className="ml-1 font-semibold text-gray-700">
                {pendingCount} pending
              </span>
            )}
          </p>
          {runUsage?.runsLimit != null && (
            <p className="text-xs text-gray-400 mt-1">
              This month:{" "}
              <span className="font-semibold text-gray-500">
                {runUsage.runsThisMonth ?? 0}/{runUsage.runsLimit}
              </span>{" "}
              runs ·{" "}
              <span className="font-semibold text-gray-500">
                {runUsage.messagesPerRun ?? 0}
              </span>{" "}
              AI messages per run
            </p>
          )}
        </div>
        <Button
          type="button"
          onClick={() => void runEvaluate()}
          disabled={evaluating}
          className="rounded-xl gap-2 shrink-0"
        >
          <ArrowClockwise
            className={`w-4 h-4 ${evaluating ? "animate-spin" : ""}`}
          />
          {evaluating ? "Running…" : "Run analysis"}
        </Button>
      </div>

      {error && (
        <div
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
          role="alert"
        >
          {error}
        </div>
      )}

      <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
          <Sparkle className="w-5 h-5 text-green-600" weight="fill" />
          <h2 className="text-sm font-semibold text-gray-900">
            Recommendations
          </h2>
        </div>

        {runs.length === 0 ? (
          <div className="px-5 py-12 text-center text-sm text-gray-500">
            No Autopilot runs yet. Click &quot;Run analysis&quot; to generate
            suggestions.
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {runs.map((run) => (
              <li key={run.id} className="px-5 py-4 space-y-3">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                      {run.category} · {run.status}
                    </p>
                    <h3 className="text-base font-semibold text-gray-900 mt-0.5">
                      {run.title}
                    </h3>
                  </div>
                  {run.status === "PROPOSED" && (
                    <div className="flex gap-2 shrink-0">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="rounded-lg h-8 text-xs gap-1"
                        disabled={actionId === run.id}
                        onClick={() => void runAction(run.id, "dismiss")}
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        Dismiss
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        className="rounded-lg h-8 text-xs gap-1 bg-green-600 hover:bg-green-700"
                        disabled={actionId === run.id}
                        onClick={() => void runAction(run.id, "approve")}
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        Approve
                      </Button>
                    </div>
                  )}
                </div>
                <div className="text-sm text-gray-700 whitespace-pre-wrap">
                  {run.summary}
                </div>
                {run.reasoning && (
                  <p className="text-xs text-gray-400">{run.reasoning}</p>
                )}
                <p className="text-[11px] text-gray-400">
                  {new Date(run.createdAt).toLocaleString()}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
