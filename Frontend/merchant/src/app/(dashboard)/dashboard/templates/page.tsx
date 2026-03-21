"use client";

import { motion } from "framer-motion";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { TemplateCard } from "@/components/wix-style/TemplateCard";
import { FilterBar } from "@/components/wix-style/FilterBar";
import { EmptyState } from "@/components/wix-style/EmptyState";
import { SkeletonGrid } from "@/components/wix-style/SkeletonCard";
import { BackButton } from "@/components/ui/BackButton";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { PageHeader } from "@/components/wix-style/PageHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button, Icon } from "@vayva/ui";
import { urls, logger, formatDate, CommerceBlockDef, COMMERCE_BLOCKS } from "@vayva/shared";
import { toast } from "sonner";
import { apiJson } from "@/lib/api-client-shared";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";

interface SystemTemplate {
  key: string;
  name: string;
  category: string;
  description?: string;
  thumbnailPath: string;
}

interface TemplateProject {
  id: string;
  storeId: string;
  name: string;
  source: "WEBSTUDIO" | "NATIVE";
  basedOnSystemTemplateKey: string | null;
  webstudioProjectId: string | null;
  thumbnailUrl: string | null;
  status: "DRAFT" | "PUBLISHED";
  lastPublishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

function CommerceBlocksPanel({ enabledExtensions }: { enabledExtensions: string[] }) {
  // Inline getBlocksForExtensions logic
  const enabledSet = new Set(enabledExtensions);
  const blocks = COMMERCE_BLOCKS.filter((block: CommerceBlockDef & { requiredExtension?: string }) => {
    if (!block.requiredExtension) return true;
    return enabledSet.has(block.requiredExtension);
  });
  const extensionBlocks = blocks.filter(b => (b as CommerceBlockDef & { requiredExtension?: string }).requiredExtension);
  const coreBlocks = blocks.filter(b => !(b as CommerceBlockDef & { requiredExtension?: string }).requiredExtension);

  if (blocks.length === 0) return null;

  return (
    <div className="bg-white/40 border border-gray-100 rounded-2xl p-5 space-y-4">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center">
          <Icon name="Blocks" size={16} className="text-green-600" />
        </div>
        <div>
          <h3 className="text-sm font-bold">Commerce Blocks</h3>
          <p className="text-[10px] text-gray-500">
            {blocks.length} block{blocks.length !== 1 ? 's' : ''} available in WebStudio
          </p>
        </div>
      </div>

      {enabledExtensions.length > 0 && extensionBlocks.length > 0 && (
        <div className="space-y-2">
          <p className="text-[9px] font-black uppercase tracking-widest text-gray-500 px-1">
            From Enabled Features
          </p>
          <div className="flex flex-wrap gap-2">
            {extensionBlocks.slice(0, 6).map((block) => (
              <span
                key={block.key}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-500/5 border border-green-500/10 text-[10px] font-medium"
              >
                <Icon name={(block.icon as any) || "Box"} size={12} className="text-green-600/60" />
                {block.name}
              </span>
            ))}
            {extensionBlocks.length > 6 && (
              <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-gray-50 text-[10px] text-gray-500">
                +{extensionBlocks.length - 6} more
              </span>
            )}
          </div>
        </div>
      )}

      <div className="space-y-2">
        <p className="text-[9px] font-black uppercase tracking-widest text-gray-500 px-1">
          Core Blocks
        </p>
        <div className="flex flex-wrap gap-2">
          {coreBlocks.slice(0, 4).map((block) => (
            <span
              key={block.key}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/50 border border-gray-100 text-[10px] text-gray-700"
            >
              <Icon name={(block.icon as any) || "Box"} size={12} className="text-gray-500" />
              {block.name}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

interface SystemTemplate {
  key: string;
  name: string;
  category: string;
  description?: string;
  thumbnailPath: string;
}

interface TemplateProject {
  id: string;
  storeId: string;
  name: string;
  source: "WEBSTUDIO" | "NATIVE";
  basedOnSystemTemplateKey: string | null;
  webstudioProjectId: string | null;
  thumbnailUrl: string | null;
  status: "DRAFT" | "PUBLISHED";
  lastPublishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function TemplatesPage() {
  const router = useRouter();
  const [systemTemplates, setSystemTemplates] = useState<SystemTemplate[]>([]);
  const [myTemplates, setMyTemplates] = useState<TemplateProject[]>([]);
  const [loadingSystem, setLoadingSystem] = useState(true);
  const [loadingMine, setLoadingMine] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [_applying, setApplying] = useState<string | null>(null);
  const [_creating, setCreating] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; name: string } | null>(null);
  const [sortBy, setSortBy] = useState("newest");
  const [currentTemplateId, setCurrentTemplateId] = useState<string | null>(
    null,
  );
  const [currentSystemTemplateKey, setCurrentSystemTemplateKey] = useState<
    string | null
  >(null);
  const [enabledExtensions, setEnabledExtensions] = useState<string[]>([]);

  const fetchSystem = useCallback(() => {
    setLoadingSystem(true);
    apiJson<{ data: SystemTemplate[]; meta: { count: number } }>(
      "/api/templates/system",
    )
      .then((res: any) => setSystemTemplates(res.data))
      .catch((error: any) => {
        const _errMsg = error instanceof Error ? error.message : String(error);
        logger.error("[FETCH_SYSTEM_TEMPLATES_ERROR]", {
          error: _errMsg,
          app: "merchant",
        });
        toast.error("Failed to load system templates");
      })
      .finally(() => setLoadingSystem(false));
  }, []);

  const fetchMine = useCallback(() => {
    setLoadingMine(true);
    apiJson<{ data: TemplateProject[]; meta: { count: number } }>(
      "/api/templates/mine",
    )
      .then((res: any) => setMyTemplates(res.data))
      .catch((error: any) => {
        const _errMsg = error instanceof Error ? error.message : String(error);
        logger.error("[FETCH_MY_TEMPLATES_ERROR]", {
          error: _errMsg,
          app: "merchant",
        });
        toast.error("Failed to load your templates");
      })
      .finally(() => setLoadingMine(false));
  }, []);

  const fetchEnabledExtensions = useCallback(() => {
    apiJson<{ data: string[] }>("/api/editor-data/extensions")
      .then((res: any) => setEnabledExtensions(res.data || []))
      .catch((error: any) => {
        logger.warn("[FETCH_EXTENSIONS_ERROR]", {
          error: error instanceof Error ? error.message : String(error),
          app: "merchant",
        });
        setEnabledExtensions([]);
      });
  }, []);

  useEffect(() => {
    fetchSystem();
    fetchMine();
    fetchEnabledExtensions();

    // Fetch store overview to get currently applied template
    apiJson<{
      data: { currentTemplate?: { type: string; id?: string; key?: string } };
    }>("/api/sites/overview")
      .then((res: any) => {
        const site = res.data;
        setCurrentTemplateId(
          site.currentTemplate?.type === "custom"
            ? site.currentTemplate?.id || null
            : null,
        );
        setCurrentSystemTemplateKey(
          site.currentTemplate?.type === "system"
            ? site.currentTemplate?.key || null
            : null,
        );
      })
      .catch((error: any) => {
        const _errMsg = error instanceof Error ? error.message : String(error);
        logger.warn("[FETCH_SITE_OVERVIEW_ERROR]", {
          error: _errMsg,
          app: "merchant",
        });
      });
  }, [fetchSystem, fetchMine]);

  const handleApplySystem = async (key: string) => {
    setApplying(key);
    try {
      await apiJson<{ success: boolean }>("/api/templates/apply", {
        method: "POST",
        body: JSON.stringify({ systemTemplateKey: key }),
      });
      toast.success("Template applied! Publish to make it live.");
      router.push("/dashboard/control-center");
    } catch (error: unknown) {
      const _errMsg = error instanceof Error ? error.message : String(error);
      logger.error("[APPLY_SYSTEM_TEMPLATE_ERROR]", {
        error: _errMsg,
        key,
        app: "merchant",
      });
      toast.error("Failed to apply template");
    } finally {
      setApplying(null);
    }
  };

  const handleApplyCustom = async (id: string) => {
    setApplying(id);
    try {
      await apiJson<{ success: boolean }>("/api/templates/apply", {
        method: "POST",
        body: JSON.stringify({ templateProjectId: id }),
      });
      toast.success("Template applied! Publish to make it live.");
      router.push("/dashboard/control-center");
    } catch (error: unknown) {
      const _errMsg = error instanceof Error ? error.message : String(error);
      logger.error("[APPLY_CUSTOM_TEMPLATE_ERROR]", {
        error: _errMsg,
        id,
        app: "merchant",
      });
      toast.error("Failed to apply template");
    } finally {
      setApplying(null);
    }
  };

  const handleCreateFromSystem = async (
    systemKey: string,
    systemName: string,
  ) => {
    setCreating(true);
    try {
      const res = await apiJson<{ data: TemplateProject }>(
        "/api/templates/mine",
        {
          method: "POST",
          body: JSON.stringify({
            name: `${systemName} (Custom)`,
            source: "WEBSTUDIO",
            basedOnSystemTemplateKey: systemKey,
          }),
        },
      );

      const wsRes = await apiJson<{ data: { editorUrl: string } }>(
        "/api/webstudio/projects",
        {
          method: "POST",
          body: JSON.stringify({
            templateProjectId: res.data?.id,
            name: res.data?.name,
          }),
        },
      );

      window.open(wsRes.data?.editorUrl, "_blank");
      fetchMine();
      toast.success("Template created and Webstudio opened!");
    } catch {
      toast.error("Failed to create template");
    } finally {
      setCreating(false);
    }
  };

  const handleEditInWebstudio = async (project: TemplateProject) => {
    if (project.webstudioProjectId) {
      const baseUrl = urls.webstudioBase();
      window.open(`${baseUrl}/builder/${project.webstudioProjectId}`, "_blank");
      return;
    }

    try {
      const res = await apiJson<{ data: { editorUrl: string } }>(
        "/api/webstudio/projects",
        {
          method: "POST",
          body: JSON.stringify({
            templateProjectId: project.id,
            name: project.name,
          }),
        },
      );
      window.open(res.data?.editorUrl, "_blank");
      fetchMine();
    } catch {
      toast.error("Failed to open Webstudio");
    }
  };

  const handleDuplicate = async (id: string) => {
    try {
      await apiJson<{ success: boolean }>(
        `/api/templates/mine/${id}/duplicate`,
        { method: "POST" },
      );
      toast.success("Template duplicated");
      fetchMine();
    } catch (error: unknown) {
      const _errMsg = error instanceof Error ? error.message : String(error);
      logger.error("[DUPLICATE_TEMPLATE_ERROR]", {
        error: _errMsg,
        id,
        app: "merchant",
      });
      toast.error("Failed to duplicate template");
    }
  };

  const handleDeleteClick = (id: string, name: string) => {
    setDeleteConfirm({ id, name });
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;
    const { id } = deleteConfirm;
    try {
      await apiJson<{ success: boolean }>(`/api/templates/mine/${id}`, {
        method: "DELETE",
      });
      toast.success("Template deleted");
      fetchMine();
    } catch (error: unknown) {
      const _errMsg = error instanceof Error ? error.message : String(error);
      logger.error("[DELETE_TEMPLATE_ERROR]", {
        error: _errMsg,
        id,
        app: "merchant",
      });
      toast.error("Failed to delete template");
    } finally {
      setDeleteConfirm(null);
    }
  };

  const categories = [
    "All",
    ...new Set(systemTemplates.map((t) => t.category)),
  ];

  const filteredSystem = systemTemplates
    .filter((t) => {
      const matchesSearch =
        t.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.description?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory =
        categoryFilter === "All" || t.category === categoryFilter;
      return matchesSearch && matchesCategory;
    })
    .sort(() => {
      if (sortBy === "newest") return 1;
      return 0;
    });

  const filteredMine = myTemplates.filter((t) => {
    const matchesSearch = t.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
  });

  return (
    <div className="space-y-10 max-w-6xl mx-auto pb-20">
      <Breadcrumbs />
      <BackButton href="/dashboard/control-center" label="Back to Control Center" className="mb-4" />
      <PageHeader
        title="Templates"
        description="Choose a template for your storefront"
      />
      <Tabs defaultValue="system" className="w-full">
        <div className="flex flex-col gap-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <TabsList className="bg-white border border-gray-100 rounded-[20px] p-1.5 h-auto shrink-0">
              <TabsTrigger
                value="system"
                className="rounded-[14px] data-[state=active]:bg-white  data-[state=active]:shadow-md px-6 py-2.5 text-sm font-bold transition-all"
              >
                Template Library
              </TabsTrigger>
              <TabsTrigger
                value="mine"
                className="rounded-[14px] data-[state=active]:bg-white  data-[state=active]:shadow-md px-6 py-2.5 text-sm font-bold transition-all"
              >
                My Templates
              </TabsTrigger>
            </TabsList>

            <div className="w-full">
              <FilterBar
                onSearch={setSearchQuery}
                categories={categories.filter((c) => c !== "All")}
                onCategoryChange={setCategoryFilter}
                onSortChange={setSortBy}
                counts={[
                  { label: "System", count: systemTemplates.length },
                  { label: "Mine", count: myTemplates.length },
                ]}
              />
            </div>
          </div>

          {/* Commerce Blocks Info Panel */}
          <CommerceBlocksPanel enabledExtensions={enabledExtensions} />

          {/* ── System Templates ── */}
          <TabsContent value="system" className="m-0 outline-none" asChild>
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.2 }}
            >
              {loadingSystem ? (
                <SkeletonGrid count={6} />
              ) : filteredSystem.length === 0 ? (
                <EmptyState
                  icon="Search"
                  title="No templates found"
                  description="We couldn't find any templates matching your filters."
                  actionLabel="Clear Filters"
                  onAction={() => {
                    setSearchQuery("");
                    setCategoryFilter("All");
                  }}
                />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  {filteredSystem.map((template) => (
                    <TemplateCard
                      key={template.key}
                      name={template.name}
                      category={template.category}
                      description={template.description}
                      thumbnailUrl={template.thumbnailPath}
                      isApplied={currentSystemTemplateKey === template.key}
                      onPreview={() => {}}
                      onApply={() => handleApplySystem(template.key)}
                      onEdit={() =>
                        handleCreateFromSystem(template.key, template.name)
                      }
                    />
                  ))}
                </div>
              )}
            </motion.div>
          </TabsContent>

          {/* ── My Templates ── */}
          <TabsContent value="mine" className="m-0 outline-none" asChild>
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
            >
              {loadingMine ? (
                <SkeletonGrid count={3} />
              ) : myTemplates.length === 0 ? (
                <EmptyState
                  icon="Plus"
                  title="You haven't created a template yet"
                  description="Start from a library template and customize it to make it your own."
                  actionLabel="Create a template"
                  onAction={() => {
                    const tabTrigger = document.querySelector(
                      '[value="system"]',
                    ) as HTMLButtonElement;
                    tabTrigger?.click();
                  }}
                >
                  <div className="mt-16 w-full max-w-3xl mx-auto">
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-6 text-center">
                      Suggested Starting Points
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                      {systemTemplates.slice(0, 3).map((t) => (
                        <Button
                          key={t.key}
                          variant="ghost"
                          type="button"
                          onClick={() => handleCreateFromSystem(t.key, t.name)}
                          className="rounded-[24px] border border-gray-100 bg-white p-5 text-left hover:bg-white/80 dark:hover:bg-zinc-900 hover:shadow-xl hover:border-green-500/20 transition-all duration-300 group/item active:scale-[0.98] h-auto block"
                        >
                          <div className="w-12 h-12 rounded-2xl bg-green-500/5 flex items-center justify-center mb-4 group-hover/item:bg-green-500/10 transition-colors">
                            <Icon
                              name="LayoutTemplate"
                              size={20}
                              className="text-green-600/60"
                            />
                          </div>
                          <p className="text-sm font-bold text-gray-900 tracking-tight truncate">
                            {t.name}
                          </p>
                          <p className="text-[10px] font-black uppercase tracking-tight text-gray-500 mt-1">
                            {t.category}
                          </p>
                        </Button>
                      ))}
                    </div>
                  </div>
                </EmptyState>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  {filteredMine.map((project) => {
                    const hasUnpublishedChanges = project.status === "DRAFT" && project.lastPublishedAt !== null;
                    return (
                      <TemplateCard
                        key={project.id}
                        name={project.name}
                        category="Custom"
                        description={`Last updated ${formatDate(project.updatedAt)}`}
                        thumbnailUrl={project.thumbnailUrl || undefined}
                        isMyTemplate
                        isApplied={currentTemplateId === project.id}
                        status={project.status}
                        hasUnpublishedChanges={hasUnpublishedChanges}
                        onPreview={() => window.open(`/preview/${project.id}`, "_blank")}
                        onApply={() => handleApplyCustom(project.id)}
                        onEdit={() => handleEditInWebstudio(project)}
                        onDuplicate={() => handleDuplicate(project.id)}
                        onDelete={() => handleDeleteClick(project.id, project.name)}
                      />
                    );
                  })}
                </div>
              )}
            </motion.div>
          </TabsContent>
        </div>
      </Tabs>
      <ConfirmDialog
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={confirmDelete}
        title="Delete Template"
        message={deleteConfirm ? `Delete "${deleteConfirm.name}"? This cannot be undone.` : ""}
      />
    </div>
  );
}
