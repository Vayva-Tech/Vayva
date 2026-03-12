"use client";

import { logger } from "@vayva/shared";
import React, { useEffect, useState } from "react";
import { Button, Icon } from "@vayva/ui";
import { Sparkle as Sparkles, X } from "@phosphor-icons/react/ssr";
import { apiJson } from "@/lib/api-client-shared";
import Link from "next/link";

interface TopRun {
  id: string;
  title: string;
  category: string;
  summary: string;
}

interface AddonResponse {
  addOns: Array<{
    id: string;
    purchase?: {
      status: string;
    };
  }>;
}

interface AutopilotFeedResponse {
  pendingCount: number;
  runs: TopRun[];
}

export function AutopilotBanner() {
  const [topRun, setTopRun] = useState<TopRun | null>(null);
  const [pendingCount, setPendingCount] = useState(0);
  const [dismissed, setDismissed] = useState(false);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        // Check if autopilot add-on is active
        const addonsData = await apiJson<AddonResponse>("/api/merchant/addons");
        const autopilot = (addonsData?.addOns || []).find(
          (a) => a.id === "vayva.autopilot",
        );
        if (autopilot?.purchase?.status !== "ACTIVE") return;
        setIsActive(true);

        // Fetch pending runs
        const feedData = await apiJson<AutopilotFeedResponse>(
          "/api/merchant/autopilot/feed?status=PROPOSED&limit=1",
        );
        setPendingCount(feedData?.pendingCount || 0);
        if (feedData?.runs && feedData.runs.length > 0) {
          setTopRun(feedData.runs[0]);
        }
      } catch (err: unknown) {
        const _errMsg = err instanceof Error ? err.message : String(err);
        logger.error("[AutopilotBanner] Failed to load feed", {
          error: _errMsg,
          app: "merchant",
        });
      }
    };
    void fetch();
  }, []);

  if (!isActive || dismissed || !topRun || pendingCount === 0) return null;

  // Truncate summary to first sentence
  const shortSummary =
    topRun.summary.split("\n")[0]?.slice(0, 120) +
    (topRun.summary.length > 120 ? "..." : "");

  return (
    <div className="relative rounded-2xl border border-primary/20 bg-primary/[0.03] backdrop-blur-sm p-4 flex items-center gap-4 overflow-hidden group">
      <div className="p-2 rounded-xl bg-primary/10 text-primary shrink-0">
        <Sparkles size={18} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-primary uppercase tracking-wider">
            Autopilot
          </span>
          {pendingCount > 1 && (
            <span className="text-[10px] font-bold text-text-tertiary">
              +{pendingCount - 1} more
            </span>
          )}
        </div>
        <p className="text-sm text-text-primary font-medium truncate mt-0.5">
          {topRun.title}
          <span className="text-text-tertiary font-normal">
            {" "}
            — {shortSummary}
          </span>
        </p>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <Link href="/dashboard/autopilot">
          <Button size="sm" className="h-8 text-xs font-bold rounded-xl gap-1">
            <Icon name="ArrowRight" size={14} />
            Review
          </Button>
        </Link>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setDismissed(true)}
          className="h-7 w-7 rounded-lg text-text-tertiary hover:text-text-secondary hover:bg-white/40"
          aria-label="Dismiss banner"
        >
          <X size={14} />
        </Button>
      </div>

      <div className="absolute -bottom-4 -right-4 opacity-[0.03] pointer-events-none">
        <Sparkles size={60} />
      </div>
    </div>
  );
}
