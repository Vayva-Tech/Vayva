"use client";

import { useEffect, useState } from "react";
import { logger, formatDate } from "@vayva/shared";
import { StatusPill } from "@/components/wix-style/StatusPill";
import {
  DeploymentTable,
  type DeploymentEntry,
} from "@/components/wix-style/DeploymentTable";
import { PageHeader } from "@/components/wix-style/PageHeader";
import { Button, Icon } from "@vayva/ui";
import { toast } from "sonner";
import { apiJson } from "@/lib/api-client-shared";
import { ConfirmDialog } from "@/components/ConfirmDialog";

interface SiteOverview {
  id: string;
  name: string;
  slug: string;
  domain: string;
  isLive: boolean;
  draftChanged: boolean;
  currentTemplate: {
    type: "system" | "custom";
    name: string;
  } | null;
  currentDeploymentId: string | null;
  draftDeploymentId: string | null;
  lastPublishedAt: string | null;
  deployments: DeploymentEntry[];
    recentActivity: any[];
}

export default function PublishPage() {
  const [site, setSite] = useState<SiteOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);
  const [rollbackConfirm, setRollbackConfirm] = useState<{ deployment: DeploymentEntry; message: string } | null>(null);

  const fetchSite = async () => {
    try {
      const res = await apiJson<{ data: SiteOverview }>("/api/sites/overview");
      setSite(res.data);
    } catch {
      toast.error("Failed to load publish status");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSite();
  }, []);

  const handlePublish = async () => {
    toast.info("Publishing... Exporting site data");
    setPublishing(true);
    try {
      // Step 1: Exporting
      await new Promise((resolve) => setTimeout(resolve, 800));
      toast.info("Deploying to global CDN...");

      await apiJson<{ success: boolean }>("/api/merchant/store/publish", {
        method: "POST",
      });

      toast.success("Published successfully", {
        action: {
          label: "View Live Site",
          onClick: () => window.open(`https://${site?.domain}`, "_blank"),
        },
      });
      void fetchSite();
    } catch (error: unknown) {
      const _errMsg = error instanceof Error ? error.message : String(error);
      logger.error("[PUBLISH_ERROR]", { error: _errMsg, app: "merchant" });
      toast.error("Publish failed — view logs");
    } finally {
      setPublishing(false);
    }
  };

  const handlePreview = (deployment?: DeploymentEntry) => {
    if (deployment?.previewUrl) {
      window.open(deployment.previewUrl, "_blank");
    } else {
      window.open("/preview", "_blank");
    }
  };

  const handleRollbackClick = (deployment: DeploymentEntry) => {
    const message = `Rollback to version from ${new Date(deployment.createdAt).toLocaleString()}?`;
    setRollbackConfirm({ deployment, message });
  };

  const confirmRollback = async () => {
    if (!rollbackConfirm) return;
    const { deployment } = rollbackConfirm;
    toast.info("Rolling back...");
    try {
      await apiJson<{ success: boolean }>(`/api/storefront/rollback`, {
        method: "POST",
        body: JSON.stringify({ versionId: deployment.id }),
      });
      toast.success("Rollback successful");
      void fetchSite();
    } catch (error: unknown) {
      const _errMsg = error instanceof Error ? error.message : String(error);
      logger.error("[ROLLBACK_ERROR]", {
        error: _errMsg,
        deploymentId: deployment.id,
        app: "merchant",
      });
      toast.error("Rollback failed");
    } finally {
      setRollbackConfirm(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-10 max-w-6xl mx-auto pb-20">
        <div className="space-y-4">
          <div className="h-10 w-48 bg-background/30 animate-pulse rounded-xl" />
          <div className="h-4 w-96 bg-background/30 animate-pulse rounded-lg" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 h-[400px] bg-background/20 animate-pulse rounded-[40px]" />
          <div className="h-[400px] bg-background/20 animate-pulse rounded-[40px]" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 max-w-6xl mx-auto pb-20">
      <PageHeader
        title="Publish"
        description="Review changes and make your site live"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Status Block */}
          <div className="relative rounded-[40px] border border-border/40 bg-background/50 backdrop-blur-xl overflow-hidden group shadow-2xl transition-all duration-500 hover:border-primary/20">
            <div className="absolute -top-32 -right-32 w-96 h-96 bg-primary/5 rounded-full blur-[100px] pointer-events-none group-hover:bg-primary/10 transition-colors duration-700" />

            <div className="p-10 space-y-8">
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 rounded-[28px] bg-primary/10 flex items-center justify-center shadow-2xl shadow-primary/10 transition-transform duration-500 group-hover:scale-110">
                  <Icon name="Upload" size={32} className="text-primary" />
                </div>
                <div className="space-y-1">
                  <h2 className="text-2xl font-black text-text-primary tracking-tight">
                    {site?.draftChanged
                      ? "Publish Changes"
                      : "Everything is up to date"}
                  </h2>
                  <div className="flex items-center gap-3">
                    <StatusPill status={site?.isLive ? "PUBLISHED" : "DRAFT"} />
                    <p className="text-sm font-medium text-text-secondary">
                      {site?.isLive
                        ? `Live at ${site.domain}`
                        : "Site is currently offline"}
                    </p>
                    {site?.lastPublishedAt && (
                      <span className="text-[10px] font-bold text-text-tertiary uppercase tracking-widest ml-auto">
                        Last published {formatDate(site.lastPublishedAt)}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-6 rounded-[24px] bg-background/20 border border-border/40 space-y-3">
                  <p className="text-[10px] font-black uppercase tracking-widest text-text-tertiary">
                    Site Status
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-text-primary">
                      {site?.isLive ? "Online" : "Offline"}
                    </span>
                    <StatusPill status={site?.isLive ? "LIVE" : "DRAFT"} />
                  </div>
                </div>
                <div className="p-6 rounded-[24px] bg-background/20 border border-border/40 space-y-3">
                  <p className="text-[10px] font-black uppercase tracking-widest text-text-tertiary">
                    Active Template
                  </p>
                  <div className="flex items-center gap-2">
                    <Icon
                      name="LayoutTemplate"
                      size={16}
                      className="text-primary/60"
                    />
                    <span className="text-sm font-bold text-text-primary">
                      {site?.currentTemplate?.name || "None"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-4 flex items-center gap-4">
                <Button
                  size="lg"
                  onClick={handlePublish}
                  disabled={publishing || !site?.draftChanged}
                  className="rounded-2xl h-14 px-8 gap-3 bg-text-primary text-text-inverse hover:bg-zinc-800 shadow-xl active:scale-95 transition-all disabled:opacity-50"
                >
                  {publishing ? (
                    <Icon name="Loader2" size={20} className="animate-spin" />
                  ) : (
                    <Icon name="UploadCloud" size={20} />
                  )}
                  <span className="text-lg font-bold">Publish to Web</span>
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => handlePreview()}
                  className="rounded-2xl h-14 px-8 border-border/60 hover:bg-background/30 hover:border-border transition-all active:scale-95"
                >
                  <Icon name="Eye" size={20} />
                  <span className="text-lg font-bold text-text-primary">
                    Preview
                  </span>
                </Button>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between px-2">
              <h3 className="text-sm font-black uppercase tracking-widest text-text-tertiary">
                Deployment History
              </h3>
              <div className="h-8 w-8 rounded-xl bg-background/30 flex items-center justify-center">
                <Icon name="History" size={16} className="text-text-tertiary" />
              </div>
            </div>

            <DeploymentTable
              deployments={site?.deployments || []}
              currentDeploymentId={site?.currentDeploymentId}
              draftDeploymentId={site?.draftDeploymentId}
              onPreview={handlePreview}
              onPublish={() => handlePublish()}
              onRollback={handleRollbackClick}
              onViewLogs={() => {}}
            />
          </div>
        </div>

        <div className="space-y-6">
          <div className="p-8 rounded-[32px] border border-border/40 bg-primary/5 space-y-4">
            <div className="h-12 w-12 rounded-[18px] bg-primary/10 flex items-center justify-center">
              <Icon name="Zap" size={24} className="text-primary" />
            </div>
            <div className="space-y-2">
              <h4 className="text-sm font-bold text-text-primary tracking-tight">
                Instant Global Deployment
              </h4>
              <p className="text-xs leading-relaxed text-text-secondary font-medium">
                Vayva uses a globally distributed CDN. When you click publish,
                your site is updated across the world in seconds.
              </p>
            </div>
          </div>

          <div className="p-8 rounded-[32px] border border-border/40 bg-background/50 backdrop-blur-xl space-y-4">
            <div className="h-12 w-12 rounded-[18px] bg-blue-500/10 flex items-center justify-center">
              <Icon name="Search" size={24} className="text-blue-500" />
            </div>
            <div className="space-y-2">
              <h4 className="text-sm font-bold text-text-primary tracking-tight">
                SEO Check
              </h4>
              <p className="text-xs leading-relaxed text-text-secondary font-medium">
                Remember to update your SEO meta tags in{" "}
                <span className="font-bold text-blue-500">Settings</span> before
                publishing for better search visibility.
              </p>
            </div>
          </div>
        </div>
      </div>
      <ConfirmDialog
        isOpen={!!rollbackConfirm}
        onClose={() => setRollbackConfirm(null)}
        onConfirm={confirmRollback}
        title="Rollback Deployment"
        message={rollbackConfirm?.message || ""}
      />
    </div>
  );
}
