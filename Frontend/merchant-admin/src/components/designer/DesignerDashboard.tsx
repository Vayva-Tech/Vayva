"use client";

import { logger } from "@vayva/shared";
import React, { useEffect, useState } from "react";
import { Icon, cn, Button } from "@vayva/ui";
import { DesignerTemplate } from "@/types/designer";
import { useRouter } from "next/navigation";
import { apiJson } from "@/lib/api-client-shared";

interface DesignerStats {
  totalEarnings: number;
  totalDownloads: number;
  reviewQueue: number;
  templateCount: number;
}

export const DesignerDashboard = () => {
  const [templates, setTemplates] = useState<DesignerTemplate[]>([]);
  const [stats, setStats] = useState<DesignerStats>({
    totalEarnings: 0,
    totalDownloads: 0,
    reviewQueue: 0,
    templateCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const loadData = async () => {
      try {
        const [templatesData, statsData] = await Promise.all([
          apiJson<DesignerTemplate[]>("/api/designer/templates"),
          apiJson<DesignerStats>("/api/designer/stats").catch(() => null),
        ]);
        const tpls = templatesData || [];
        setTemplates(tpls);

        if (statsData) {
          setStats(statsData);
        } else {
          // Derive stats from templates if no stats endpoint exists
          setStats({
            totalEarnings: tpls.reduce(
              (sum: number, t: any) => sum + (t.revenue || 0),
              0,
            ),
            totalDownloads: tpls.reduce(
              (sum: number, t: any) => sum + (t.downloads || 0),
              0,
            ),
            reviewQueue: tpls.filter(
              (t: any) => (t as any).status === "ai_review" || (t as any).status === "manual_review",
            ).length,
            templateCount: tpls.length,
          });
        }
      } catch (err: unknown) {
        const _errMsg = err instanceof Error ? err.message : String(err);
        logger.error("[LOAD_DESIGNER_TEMPLATES_ERROR]", {
          error: _errMsg,
          app: "merchant",
        });
      } finally {
        setLoading(false);
      }
    };
    void loadData();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "published":
        return "bg-green-100 text-green-700";
      case "draft":
        return "bg-white/40 text-text-secondary";
      case "ai_review":
        return "bg-purple-100 text-purple-700 animate-pulse";
      case "manual_review":
        return "bg-blue-100 text-blue-700";
      case "rejected":
        return "bg-red-100 text-red-700";
      default:
        return "bg-white/40 text-text-tertiary";
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-8">
      <header className="flex justify-between items-center mb-12">
        <div>
          <h1 className="text-3xl font-bold font-heading text-text-primary">
            Designer Portal
          </h1>
          <p className="text-text-tertiary mt-2">
            Manage your template submissions and earnings.
          </p>
        </div>
        <Button
          onClick={() => router.push("/designer/submit")}
          className="bg-black text-white px-6 py-3 rounded-xl font-bold hover:bg-text-primary transition-colors shadow-lg flex items-center gap-2 h-auto"
        >
          <Icon name="Plus" size={20} /> Submit New Template
        </Button>
      </header>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-background p-6 rounded-2xl border border-border shadow-sm">
          <div className="text-text-tertiary text-sm font-bold mb-1">
            Total Earnings
          </div>
          <div className="text-3xl font-bold text-text-primary">
            ₦{stats?.totalEarnings?.toLocaleString()}
          </div>
        </div>
        <div className="bg-background p-6 rounded-2xl border border-border shadow-sm">
          <div className="text-text-tertiary text-sm font-bold mb-1">
            Total Downloads
          </div>
          <div className="text-3xl font-bold text-text-primary">
            {stats.totalDownloads}
          </div>
          <div className="text-text-tertiary text-xs font-bold mt-2">
            Across {stats.templateCount} template
            {stats.templateCount !== 1 ? "s" : ""}
          </div>
        </div>
        <div className="bg-background p-6 rounded-2xl border border-border shadow-sm">
          <div className="text-text-tertiary text-sm font-bold mb-1">
            Review Queue
          </div>
          <div className="text-3xl font-bold text-text-primary">
            {stats.reviewQueue}
          </div>
          {stats.reviewQueue > 0 && (
            <div className="text-purple-600 text-xs font-bold mt-2">
              Under review
            </div>
          )}
        </div>
      </div>

      {/* Template List */}
      <h2 className="text-xl font-bold text-text-primary mb-6">
        Your Templates
      </h2>

      {loading ? (
        <div className="text-center py-20 text-text-tertiary">
          Loading templates...
        </div>
      ) : templates.length === 0 ? (
        <div className="text-center py-20 bg-white/40 rounded-2xl border border-dashed border-border">
          <h3 className="font-bold text-text-primary">No templates yet</h3>
          <p className="text-text-tertiary text-sm mb-4">
            Start by submitting your first masterpiece.
          </p>
          <Button
            variant="outline"
            className="bg-background border border-border text-black px-4 py-2 rounded-lg font-bold text-sm h-auto"
          >
            Read Guidelines
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {templates.map((tpl) => (
            <div
              key={tpl.id}
              className="bg-background border border-border rounded-xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-6">
                <div className="w-24 h-24 bg-white/40 rounded-lg overflow-hidden shrink-0">
                  <img
                    src={
                      tpl.previewImageDesktop ||
                      tpl.previewImages?.cover ||
                      "/images/template-previews/default-desktop.png"
                    }
                    alt={tpl.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-text-primary">
                    {tpl.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-1 mb-2">
                    <span
                      className={cn(
                        "text-[10px] font-bold px-2 py-0.5 rounded-full uppercase",
                        getStatusColor((tpl as any).status),
                      )}
                    >
                      {tpl.status.replace("_", " ")}
                    </span>
                    <span className="text-xs text-text-tertiary">
                      • v{tpl.currentVersion}
                    </span>
                    <span className="text-xs text-text-tertiary">
                      • {tpl.category}
                    </span>
                  </div>

                  {tpl.aiReviewResult?.status === "needs_fix" && (
                    <div className="bg-red-50 text-red-700 text-xs p-3 rounded-lg max-w-md">
                      <strong>AI Feedback:</strong>
                      <ul className="list-disc list-inside mt-1">
                        {tpl?.aiReviewResult?.issues.map(
                          (issue: string, idx: number) => (
                            <li key={idx}>{issue}</li>
                          ),
                        )}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-6 min-w-[200px] justify-end">
                <div className="text-right">
                  <div className="text-sm font-bold text-text-primary">
                    {tpl.downloads} Installs
                  </div>
                  <div className="text-xs text-green-600 font-bold">
                    ₦{tpl?.revenue?.toLocaleString()} Rev
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="p-2 hover:bg-white/40 rounded-lg text-text-tertiary hover:text-black transition-colors h-auto w-auto"
                >
                  <Icon name="EllipsisVertical" size={20} />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

