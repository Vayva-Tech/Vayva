"use client";

import React, { useEffect, useMemo, useState } from "react";
import { reportError } from "@/lib/error";

interface Campaign {
  id: string;
  title: string;
  description: string | null;
  goal: number;
  raised: number;
  currency: string;
  bannerImage: string | null;
  featured: boolean;
}

function clampPct(v: number) {
  if (!Number.isFinite(v)) return 0;
  return Math.max(0, Math.min(100, v));
}

export default function CampaignProgressBlock({ campaignId }: { campaignId?: string }) {
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      try {
        if (campaignId) {
          const url = new URL("/api/storefront/campaigns/one", window.location.origin);
          url.searchParams.set("campaignId", campaignId);
          const res = await fetch(url.toString());
          const json = await res.json().catch(() => ({}));
          if (!res.ok) throw new Error(String((json as any)?.error || "Failed to fetch campaign"));
          setCampaign((json as any)?.data || null);
          return;
        }

        const url = new URL("/api/storefront/campaigns", window.location.origin);
        url.searchParams.set("featured", "true");
        url.searchParams.set("limit", "1");
        const res = await fetch(url.toString());
        const json = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(String((json as any)?.error || "Failed to fetch campaigns"));

        const first = ((json as any)?.data || [])[0] || null;
        setCampaign(first);
      } catch (e: unknown) {
        reportError(e, { scope: "CommerceBlock.CampaignProgress.fetch", app: "storefront" });
        setError(e instanceof Error ? e.message : "Failed to load");
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [campaignId]);

  const pct = useMemo(() => {
    if (!campaign?.goal) return 0;
    return clampPct((campaign.raised / campaign.goal) * 100);
  }, [campaign]);

  if (loading) return <div className="p-6 text-sm text-text-tertiary">Loading campaign...</div>;

  if (error || !campaign) {
    return (
      <div className="p-6 rounded-3xl border border-red-100 bg-red-50/50">
        <p className="text-sm font-bold text-red-600">This section couldn't load.</p>
        <p className="text-[10px] text-red-400 mt-1">{error || "Campaign not found"}</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <div className="rounded-3xl border border-gray-200 bg-transparent overflow-hidden">
        {campaign.bannerImage ? (
          <div className="h-56 w-full bg-gray-100">
            <img src={campaign.bannerImage} alt={campaign.title} className="h-56 w-full object-cover" />
          </div>
        ) : null}

        <div className="p-6">
          <div className="text-xs font-black uppercase tracking-widest text-text-tertiary">Campaign</div>
          <div className="mt-1 text-2xl font-black tracking-tight">{campaign.title}</div>
          {campaign.description ? (
            <div className="mt-3 text-sm text-text-secondary max-w-2xl">{campaign.description}</div>
          ) : null}

          <div className="mt-6">
            <div className="flex items-end justify-between gap-4">
              <div>
                <div className="text-xs text-text-tertiary">Raised</div>
                <div className="text-xl font-black">₦{Math.round(campaign.raised).toLocaleString()}</div>
              </div>
              <div className="text-right">
                <div className="text-xs text-text-tertiary">Goal</div>
                <div className="text-xl font-black">₦{Math.round(campaign.goal).toLocaleString()}</div>
              </div>
            </div>

            <div className="mt-4 h-3 rounded-full bg-gray-100 overflow-hidden">
              <div
                className="h-3 bg-[#16A34A]"
                style={{ width: `${pct}%` }}
              />
            </div>
            <div className="mt-2 text-[10px] text-text-tertiary">{pct.toFixed(0)}% funded</div>
          </div>
        </div>
      </div>
    </div>
  );
}
