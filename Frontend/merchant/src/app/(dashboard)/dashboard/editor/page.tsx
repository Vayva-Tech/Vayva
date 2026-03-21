"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { logger, formatDate } from "@vayva/shared";
import { Button, Icon } from "@vayva/ui";
import { PageHeader } from "@/components/wix-style/PageHeader";
import { CommerceBlockInserter } from "@/components/control-center/CommerceBlockInserter";
import { toast } from "sonner";
import { apiJson } from "@/lib/api-client-shared";

interface SiteOverview {
  id: string;
  name: string;
  currentTemplate: {
    type: "system" | "custom";
    name: string;
    key?: string;
    id?: string;
    updatedAt?: string;
  } | null;
  draftChanged: boolean;
}

export default function EditorPage() {
  const router = useRouter();
  const [site, setSite] = useState<SiteOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [opening, setOpening] = useState(false);

  useEffect(() => {
    const fetchOverview = async () => {
      try {
        setLoading(true);
        const res = await apiJson<{ data: SiteOverview }>(
          "/api/sites/overview",
        );
        setSite(res.data);
      } catch (error: unknown) {
        const _errMsg = error instanceof Error ? error.message : String(error);
        logger.error("[FETCH_EDITOR_OVERVIEW_ERROR]", {
          error: _errMsg,
          app: "merchant",
        });
        toast.error("Failed to load editor context");
      } finally {
        setLoading(false);
      }
    };
    void fetchOverview();
  }, []);

  const handleOpenEditor = async () => {
    if (!site?.currentTemplate) return;

    toast.info("Opening editor...");
    setOpening(true);
    try {
      if (site.currentTemplate?.type === "custom" && site.currentTemplate?.id) {
        // Already a custom template project
        const wsRes = await apiJson<{ data: { editorUrl: string } }>(
          "/api/webstudio/projects",
          {
            method: "POST",
            body: JSON.stringify({
              templateProjectId: site.currentTemplate?.id,
            }),
          },
        );
        window.open(wsRes.data?.editorUrl, "_blank");
      } else if (
        site.currentTemplate?.type === "system" &&
        site.currentTemplate?.key
      ) {
        // Need to create a project from system template first
        toast.info("Creating a customizable copy of the template...");
        const res = await apiJson<{ data: { id: string } }>(
          "/api/templates/mine",
          {
            method: "POST",
            body: JSON.stringify({
              name: `${site?.currentTemplate?.name} (Custom)`,
              source: "WEBSTUDIO",
              basedOnSystemTemplateKey: site.currentTemplate?.key,
            }),
          },
        );

        const wsRes = await apiJson<{ data: { editorUrl: string } }>(
          "/api/webstudio/projects",
          {
            method: "POST",
            body: JSON.stringify({ templateProjectId: res.data?.id }),
          },
        );

        // Also apply it to the store so the editor works on this copy
        await apiJson<{ success: boolean }>("/api/templates/apply", {
          method: "POST",
          body: JSON.stringify({ templateProjectId: res.data?.id }),
        });

        window.open(wsRes.data?.editorUrl, "_blank");
        // Reload context
        const nextSite = await apiJson<{ data: SiteOverview }>(
          "/api/sites/overview",
        );
        setSite(nextSite.data);
      }
    } catch (error: unknown) {
      const _errMsg = error instanceof Error ? error.message : String(error);
      logger.error("[OPEN_EDITOR_ERROR]", { error: _errMsg, app: "merchant" });
      toast.error("Failed to open Webstudio editor");
    } finally {
      setOpening(false);
    }
  };

  const handlePreview = () => {
    window.open("/preview", "_blank");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Icon name="Loader2" size={32} className="animate-spin text-green-600" />
      </div>
    );
  }

  return (
    <div className="space-y-10 max-w-6xl mx-auto pb-20">
      <PageHeader
        title="Editor"
        description="Design and customize your storefront experience"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="relative rounded-[40px] border border-gray-100 bg-gray-50  overflow-hidden group shadow-2xl transition-all duration-500 hover:border-green-500/20 h-full">
            {/* Vayva Green Glow */}
            <div className="absolute -top-32 -right-32 w-96 h-96 bg-green-500/10 rounded-full blur-[100px] pointer-events-none group-hover:bg-green-500/15 transition-colors duration-700" />

            <div className="relative p-12 flex flex-col items-center text-center space-y-8">
              <div className="w-24 h-24 rounded-[32px] bg-green-500/10 flex items-center justify-center shadow-2xl shadow-primary/10 transition-transform duration-500 group-hover:scale-110">
                <Icon name="Pencil" size={40} className="text-green-600" />
              </div>

              <div className="space-y-3">
                <h2 className="text-3xl font-black text-gray-900 tracking-tight">
                  {site?.currentTemplate
                    ? "Ready to Customize"
                    : "Choose a Starting Point"}
                </h2>
                {site?.currentTemplate && (
                  <div className="flex flex-col items-center gap-2">
                    <div className="px-3 py-1 rounded-full bg-white border border-gray-100 text-xs font-bold text-gray-700">
                      Editing:{" "}
                      <span className="text-gray-900">
                        {site?.currentTemplate?.name}
                      </span>
                    </div>
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                      Last edited{" "}
                      {site?.currentTemplate?.updatedAt
                        ? formatDate(site.currentTemplate?.updatedAt)
                        : "Just now"}
                    </p>
                  </div>
                )}
                <p className="text-base font-medium text-gray-700 max-w-md leading-relaxed">
                  {site?.currentTemplate
                    ? "Open the Webstudio editor to modify layouts, styles, and content. Your changes will be saved as a draft."
                    : "You haven't selected a template yet. Choose a template from our library to start designing your site."}
                </p>
              </div>

              {site?.currentTemplate ? (
                <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md justify-center">
                  <Button
                    size="lg"
                    onClick={handleOpenEditor}
                    disabled={opening}
                    className="rounded-2xl h-14 px-8 gap-3 bg-text-green-600 text-white hover:bg-zinc-800 shadow-xl active:scale-95 transition-all flex-1"
                  >
                    {opening ? (
                      <Icon name="Loader2" size={20} className="animate-spin" />
                    ) : (
                      <Icon name="ExternalLink" size={20} />
                    )}
                    <span className="text-lg font-bold">Open Editor</span>
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={handlePreview}
                    className="rounded-2xl h-14 px-8 gap-3 border-gray-100 hover:bg-white transition-all flex-1 active:scale-95"
                  >
                    <Icon name="Eye" size={20} />
                    <span className="text-lg font-bold text-gray-900">
                      Preview
                    </span>
                  </Button>
                </div>
              ) : (
                <Button
                  size="lg"
                  onClick={() => router.push("/dashboard/templates")}
                  className="rounded-2xl h-14 px-8 gap-3 bg-green-500 text-white hover:bg-green-600 shadow-xl shadow-primary/20 active:scale-95 transition-all"
                >
                  <Icon name="LayoutTemplate" size={20} />
                  <span className="text-lg font-bold">Choose a template</span>
                </Button>
              )}

              {site?.currentTemplate && (
                <Button
                  variant="link"
                  onClick={() => router.push("/dashboard/templates")}
                  className="text-xs font-bold text-gray-500 hover:text-gray-900 underline underline-offset-4 h-auto p-0"
                >
                  Change template
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="p-8 rounded-[32px] border border-gray-100 bg-gray-50  space-y-6 shadow-sm">
            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-gray-500">
              Editor Tips
            </h3>

            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="h-10 w-10 rounded-xl bg-orange-500/10 flex items-center justify-center shrink-0">
                  <Icon
                    name="AlertCircle"
                    size={20}
                    className="text-amber-500"
                  />
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-bold text-gray-900">
                    Checkout UX
                  </p>
                  <p className="text-[11px] leading-relaxed text-gray-700 font-medium">
                    Don't edit checkout or payment pages in Webstudio. Vayva
                    handles these securely for you.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0">
                  <Icon
                    name="ShoppingBag"
                    size={20}
                    className="text-blue-500"
                  />
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-bold text-gray-900">
                    Product Data
                  </p>
                  <p className="text-[11px] leading-relaxed text-gray-700 font-medium">
                    Use canonical "Shop" pages to display your Vayva products
                    automatically.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="h-10 w-10 rounded-xl bg-green-500/10 flex items-center justify-center shrink-0">
                  <Icon name="Zap" size={20} className="text-green-600" />
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-bold text-gray-900">
                    Instant Save
                  </p>
                  <p className="text-[11px] leading-relaxed text-gray-700 font-medium">
                    Webstudio saves your progress instantly. You can preview
                    changes here anytime.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-8 rounded-[32px] border border-gray-100 bg-green-500/5 space-y-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-green-600/60 text-center">
              Powered by Webstudio
            </p>
            <div className="flex justify-around">
              <div className="flex flex-col items-center gap-1">
                <Icon name="Search" size={16} className="text-gray-500" />
                <span className="text-[9px] font-bold text-gray-500 uppercase tracking-tighter">
                  SEO Ready
                </span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <Icon
                  name="Smartphone"
                  size={16}
                  className="text-gray-500"
                />
                <span className="text-[9px] font-bold text-gray-500 uppercase tracking-tighter">
                  Responsive
                </span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <Icon name="Zap" size={16} className="text-gray-500" />
                <span className="text-[9px] font-bold text-gray-500 uppercase tracking-tighter">
                  Fast Load
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Commerce Blocks Inserter (Batch 53) */}
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-200">
        <div className="space-y-1">
          <h3 className="text-xl font-black text-gray-900 tracking-tight">
            Commerce Blocks
          </h3>
          <p className="text-sm font-medium text-gray-700">
            Embed dynamic Vayva commerce sections into your Webstudio design.
          </p>
        </div>

        <CommerceBlockInserter />
      </div>
    </div>
  );
}
