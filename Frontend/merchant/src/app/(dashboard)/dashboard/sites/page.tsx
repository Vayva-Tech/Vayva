"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { SiteCard } from "@/components/wix-style/SiteCard";
import { SkeletonGrid } from "@/components/wix-style/SkeletonCard";
import { BackButton } from "@/components/ui/BackButton";
import { PageHeader } from "@/components/wix-style/PageHeader";
import { Button, Icon, cn } from "@vayva/ui";
import { toast } from "sonner";
import { apiJson } from "@/lib/api-client-shared";
import { formatDate } from "@vayva/shared";

interface SiteOverview {
  id: string;
  name: string;
  slug: string;
  domain: string;
  logoUrl: string | null;
  plan: string;
  isLive: boolean;
  draftChanged: boolean;
  currentTemplate: {
    type: "system" | "custom";
    name: string;
    key?: string;
    id?: string;
  } | null;
  lastPublished: {
    at: string;
    action: string;
  } | null;
  recentActivity: {
    createdAt: string;
    action: string;
    actorLabel: string;
  }[];
  createdAt: string;
  updatedAt: string;
}

export default function SitesPage() {
  const router = useRouter();
  const [site, setSite] = useState<SiteOverview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiJson<{ data: SiteOverview }>("/sites/overview")
      .then((res: any) => setSite(res.data))
      .catch(() => toast.error("Failed to load site overview"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-10 max-w-6xl pb-20">
        <div className="space-y-4">
          <div className="h-10 w-48 bg-white animate-pulse rounded-xl" />
          <div className="h-4 w-96 bg-white animate-pulse rounded-lg" />
        </div>
        <SkeletonGrid count={1} />
      </div>
    );
  }

  if (!site) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Icon name="AlertCircle" size={48} className="text-gray-500" />
        <p className="text-gray-700 text-sm">
          Could not load site information.
        </p>
        <Button variant="outline" onClick={() => router.refresh()}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-10 max-w-6xl pb-20">
      <BackButton
        href="/dashboard"
        label="Back to Dashboard"
        className="mb-4"
      />
      <PageHeader
        title="Your site"
        description="Manage your website, design, and publishing."
      />

      <div className="grid grid-cols-1 gap-8">
        <SiteCard
          name={site.name}
          domain={site.domain}
          thumbnailUrl={site.logoUrl || undefined}
          templateName={site.currentTemplate?.name}
          status={
            site.draftChanged ? "MODIFIED" : site.isLive ? "PUBLISHED" : "DRAFT"
          }
          lastPublishedAt={
            site.lastPublished ? formatDate(site.lastPublished?.at) : undefined
          }
          onEdit={() => router.push("/dashboard/editor")}
          onPreview={() => window.open(`https://${site.domain}`, "_blank")}
          onPublish={() => router.push("/dashboard/publish")}
          onMoreActions={() => router.push("/dashboard/settings/profile")}
        />
      </div>

      {/* Recent Activity Mini-Panel */}
      <div className="p-8 rounded-[32px] border border-gray-100 bg-gray-50  space-y-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-black uppercase tracking-widest text-gray-500">
            Recent Activity
          </h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/dashboard/publish")}
            className="text-xs font-bold gap-2"
          >
            View full history <Icon name="ArrowRight" size={14} />
          </Button>
        </div>

        <div className="space-y-4">
          {site.recentActivity && site.recentActivity?.length > 0 ? (
            site.recentActivity?.slice(0, 3).map((activity, i) => (
              <div
                key={i}
                className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-gray-100"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={cn(
                      "h-2 w-2 rounded-full",
                      i === 0
                        ? "bg-green-500 shadow-[0_0_8px_hsl(var(--primary)/0.4)]"
                        : "bg-border",
                    )}
                  />
                  <div className="space-y-0.5">
                    <p className="text-xs font-bold text-gray-900">
                      {activity.action}
                    </p>
                    <p className="text-[10px] font-medium text-gray-500">
                      {activity.actorLabel}
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-gray-500 uppercase">
                  {formatDate(activity.createdAt)}
                </span>
              </div>
            ))
          ) : (
            <p className="text-center py-8 text-xs text-gray-500">
              No recent activity.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
