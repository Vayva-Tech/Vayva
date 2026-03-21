"use client";

import { logger } from "@vayva/shared";
import { useEffect, useState } from "react";
import { Button } from "@vayva/ui";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Spinner as Loader2,
  Globe,
  Pencil,
  Check,
  FileText,
  Layout,
  Globe as DomainIcon,
} from "@phosphor-icons/react/ssr";
import { Layers } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ExtensionsGallery } from "@/components/control-center/ExtensionsGallery";
import { buildPreviewStorefrontUrl } from "@/lib/storefront/urls";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { apiJson } from "@/lib/api-client-shared";
import {
  DashboardCard,
  DashboardCardHeader,
  DashboardPageHeader,
  DashboardGrid,
} from "@/components/ui/DashboardCard";

interface DeploymentVersion {
  id: string;
  version: string;
  publishedAt: string | Date;
  author: string;
  status: "active" | "archived" | "draft";
  description?: string;
  template?: { name: string };
  publishedBy?: string;
}

interface HistoryResponse {
  data: DeploymentVersion[];
}

interface DraftResponse {
  draft?: { 
    activeTemplateId?: string;
    templateName?: string;
    hasUnpublishedChanges?: boolean;
  };
}

interface Extension {
  id: string;
  name: string;
  isEnabled: boolean;
}

interface ExtensionsResponse {
  extensions: Extension[];
}

export default function ControlCenterPage() {
  const router = useRouter();
  const [history, setHistory] = useState<DeploymentVersion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [applyingId, setApplyingId] = useState<string | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);
  const [storeSlug, setStoreSlug] = useState<string | null>(null);
  const [draft, setDraft] = useState<{
    templateId?: string;
    templateName?: string;
    hasChanges?: boolean;
  } | null>(null);
  const [enabledExtensions, setEnabledExtensions] = useState<string[]>([]);
  const [confirm, setConfirm] = useState<{
    open: boolean;
    action: null | "rollback" | "publish";
    payload?: string;
  }>({ open: false, action: null });
  const [confirmLoading, setConfirmLoading] = useState(false);

  useEffect(() => {
    void loadHistory();
    void loadDraft();
    void loadExtensions();
    void loadStorefrontUrl();
  }, []);

  const loadStorefrontUrl = async () => {
    try {
      const data = await apiJson<{ slug?: string }>("/api/storefront/url");
      setStoreSlug(data?.slug || null);
    } catch (error: unknown) {
      logger.warn("[FETCH_STOREFRONT_URL_ERROR]", {
        error: error instanceof Error ? error.message : String(error),
        app: "merchant",
      });
      setStoreSlug(null);
    }
  };

  const loadExtensions = async () => {
    try {
      const data = await apiJson<ExtensionsResponse>("/api/control-center/extensions");
      const enabled = (data.extensions || [])
        .filter((e) => e.isEnabled)
        .map((e) => e.id);
      setEnabledExtensions(enabled);
    } catch (error: unknown) {
      logger.warn("[LOAD_EXTENSIONS_ERROR]", { 
        error: error instanceof Error ? error.message : String(error), 
        app: "merchant" 
      });
    }
  };

  const loadHistory = async () => {
    try {
      const data = await apiJson<DeploymentVersion[] | HistoryResponse>("/api/storefront/history");
      const list = Array.isArray(data) ? data : data?.data;
      if (Array.isArray(list)) setHistory(list);
    } catch (error: unknown) {
      logger.warn("[LOAD_HISTORY_ERROR]", { 
        error: error instanceof Error ? error.message : String(error), 
        app: "merchant" 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadDraft = async () => {
    try {
      const data = await apiJson<DraftResponse>("/api/storefront/draft");
      const d = data?.draft;
      setDraft({
        templateId: d?.activeTemplateId,
        templateName: d?.templateName,
        hasChanges: d?.hasUnpublishedChanges,
      });
    } catch (error: unknown) {
      logger.warn("[LOAD_DRAFT_ERROR]", { 
        error: error instanceof Error ? error.message : String(error), 
        app: "merchant" 
      });
      setDraft(null);
    }
  };

  const confirmConfig = (() => {
    if (!confirm.action) return null;
    if (confirm.action === "rollback") {
      return {
        title: "Restore this version?",
        message: "This will overwrite your current unpublished storefront version.",
        confirmText: "Restore",
        cancelText: "Cancel",
        variant: "warning" as const,
      };
    }
    if (confirm.action === "publish") {
      return {
        title: "Publish changes live?",
        message: "This will make your latest storefront changes live for customers.",
        confirmText: "Publish",
        cancelText: "Cancel",
        variant: "warning" as const,
      };
    }
    return null;
  })();

  const handleConfirm = async () => {
    if (!confirm.action) return;
    setConfirmLoading(true);
    try {
      if (confirm.action === "rollback" && confirm.payload) {
        await handleRollback(confirm.payload);
      } else if (confirm.action === "publish") {
        await handlePublish();
      }
    } finally {
      setConfirmLoading(false);
      setConfirm({ open: false, action: null });
    }
  };

  const handleRollback = async (versionId: string) => {
    setApplyingId(versionId);
    try {
      await apiJson<{ success: boolean }>("/api/storefront/rollback", {
        method: "POST",
        body: JSON.stringify({ versionId }),
      });
      toast.success("Version restored to your unpublished storefront.");
      void loadDraft();
    } catch (error: unknown) {
      logger.error("[ROLLBACK_ERROR]", {
        error: error instanceof Error ? error.message : String(error),
        versionId,
        app: "merchant",
      });
      toast.error("Failed to rollback");
    } finally {
      setApplyingId(null);
    }
  };

  const requestRollback = (versionId: string) => {
    setConfirm({ open: true, action: "rollback", payload: versionId });
  };

  const handlePublish = async () => {
    setIsPublishing(true);
    try {
      await apiJson<{ success: boolean }>("/api/storefront/publish", { method: "POST" });
      toast.success("Storefront Published Live!");
      void loadHistory();
      void loadDraft();
    } catch (error: unknown) {
      logger.error("[PUBLISH_ERROR]", { 
        error: error instanceof Error ? error.message : String(error), 
        app: "merchant" 
      });
      toast.error("Failed to publish");
    } finally {
      setIsPublishing(false);
    }
  };

  const requestPublish = () => {
    setConfirm({ open: true, action: "publish" });
  };

  const handleOpenWebStudio = () => {
    router.push("/dashboard/editor");
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <DashboardPageHeader title="Control Center" subtitle="Manage your storefront" />
        <div className="h-32 bg-gray-100 rounded-2xl animate-pulse" />
        <div className="grid grid-cols-2 gap-4">
          <div className="h-48 bg-gray-100 rounded-2xl animate-pulse" />
          <div className="h-48 bg-gray-100 rounded-2xl animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {confirmConfig && (
        <ConfirmDialog
          isOpen={confirm.open}
          onClose={() => setConfirm({ open: false, action: null })}
          onConfirm={handleConfirm}
          title={confirmConfig.title}
          message={confirmConfig.message}
          confirmText={confirmConfig.confirmText}
          cancelText={confirmConfig.cancelText}
          variant={confirmConfig.variant}
          loading={confirmLoading}
        />
      )}

      <DashboardPageHeader
        title="Control Center"
        subtitle="Manage your storefront and website"
      />

      {/* Storefront Status Card */}
      <DashboardCard>
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-green-100 text-green-600">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Storefront Status</h3>
              <p className="text-sm text-gray-500">
                Template: <span className="font-medium text-gray-900">{draft?.templateName || "Not selected"}</span>
              </p>
            </div>
          </div>
          {draft?.hasChanges ? (
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700">
              Unpublished Changes
            </span>
          ) : (
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
              Published
            </span>
          )}
        </div>
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" onClick={handleOpenWebStudio} className="rounded-xl gap-2">
            <Pencil className="w-4 h-4" />
            Open WebStudio
          </Button>
          <Button
            variant="outline"
            onClick={() => storeSlug && window.open(buildPreviewStorefrontUrl(storeSlug), "_blank")}
            disabled={!storeSlug}
            className="rounded-xl gap-2"
          >
            <Globe className="w-4 h-4" />
            Preview Store
          </Button>
          <Button variant="outline" onClick={() => router.push("/dashboard/templates")} className="rounded-xl gap-2">
            <Layers className="w-4 h-4" />
            Change Template
          </Button>
          <Button
            onClick={requestPublish}
            disabled={isPublishing || !draft?.hasChanges}
            className="rounded-xl gap-2 ml-auto bg-green-500 hover:bg-green-600 text-white"
          >
            {isPublishing && <Loader2 className="w-4 h-4 animate-spin" />}
            <Check className="w-4 h-4" />
            Publish Live
          </Button>
        </div>
      </DashboardCard>

      <Tabs defaultValue="website" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="website">Website</TabsTrigger>
          <TabsTrigger value="extensions">Extensions</TabsTrigger>
          <TabsTrigger value="history">Version History</TabsTrigger>
        </TabsList>

        <TabsContent value="website">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <DashboardCard>
              <DashboardCardHeader
                title="Templates"
                icon={Layout}
              />
              <p className="text-sm text-gray-500 mb-4">
                Browse system templates or manage your custom designs. All templates work with WebStudio.
              </p>
              <Button onClick={() => router.push("/dashboard/templates")} className="w-full gap-2 rounded-xl bg-green-500 hover:bg-green-600 text-white">
                <Layers className="w-4 h-4" />
                Browse Templates
              </Button>
            </DashboardCard>

            <DashboardCard>
              <DashboardCardHeader
                title="WebStudio"
                icon={Pencil}
              />
              <p className="text-sm text-gray-500 mb-4">
                Drag and drop commerce blocks, customize layouts, and design your pages visually.
              </p>
              <Button onClick={handleOpenWebStudio} className="w-full gap-2 rounded-xl bg-green-500 hover:bg-green-600 text-white">
                <Pencil className="w-4 h-4" />
                Open WebStudio
              </Button>
            </DashboardCard>

            <DashboardCard>
              <DashboardCardHeader
                title="Domain"
                icon={DomainIcon}
              />
              <p className="text-sm text-gray-500 mb-4">
                {storeSlug ? (
                  <>Current domain: <span className="font-medium text-gray-900">{storeSlug}.vayva.ng</span></>
                ) : (
                  "Set up your custom domain or use the default storefront URL."
                )}
              </p>
              <Button 
                variant="outline" 
                onClick={() => router.push("/dashboard/domains")} 
                className="w-full gap-2 rounded-xl"
              >
                <DomainIcon className="w-4 h-4" />
                Manage Domain
              </Button>
            </DashboardCard>

            <DashboardCard>
              <DashboardCardHeader
                title="Blog & Content"
                icon={FileText}
              />
              <p className="text-sm text-gray-500 mb-4">
                {enabledExtensions.includes("vayva.blog") 
                  ? "Create blog posts and content pages. Blog blocks are available in WebStudio."
                  : "Enable the Blog & Content extension to add articles, posts, and content pages to your storefront."
                }
              </p>
              {enabledExtensions.includes("vayva.blog") ? (
                <Button 
                  variant="outline" 
                  onClick={() => router.push("/dashboard/posts")} 
                  className="w-full gap-2 rounded-xl"
                >
                  <FileText className="w-4 h-4" />
                  Manage Content
                </Button>
              ) : (
                <Button 
                  variant="outline" 
                  onClick={() => router.push("/dashboard/extensions")} 
                  className="w-full gap-2 rounded-xl"
                >
                  <Layers className="w-4 h-4" />
                  Enable Blog Extension
                </Button>
              )}
            </DashboardCard>
          </div>
        </TabsContent>

        <TabsContent value="extensions">
          <div className="space-y-6">
            {/* Quick extension summary */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Enabled Features</CardTitle>
                    <CardDescription>
                      {enabledExtensions.length} feature{enabledExtensions.length !== 1 ? 's' : ''} currently active
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    {enabledExtensions.slice(0, 3).map((extId) => (
                      <Badge key={extId} variant="secondary" className="gap-1">
                        <Check className="w-3 h-3" />
                        {extId.split('.').pop()?.replace(/-/g, ' ')}
                      </Badge>
                    ))}
                    {enabledExtensions.length > 3 && (
                      <Badge variant="outline">+{enabledExtensions.length - 3} more</Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500">
                  Enable extensions to unlock specialized commerce blocks in WebStudio. 
                  For example, enabling "Kitchen Management" adds menu and dish blocks for restaurant templates.
                </p>
              </CardContent>
            </Card>

            <div className="bg-white rounded-2xl p-8 border border-gray-100">
              <ExtensionsGallery />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Deployment History</CardTitle>
              <CardDescription>
                Rollback to previous versions of your storefront.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Version</TableHead>
                    <TableHead>Template</TableHead>
                    <TableHead>Published At</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {history.map((ver) => (
                    <TableRow key={ver.id}>
                      <TableCell className="font-mono text-xs">{ver?.id?.slice(0, 8)}</TableCell>
                      <TableCell>{ver.template?.name || "Unknown"}</TableCell>
                      <TableCell>{new Date(ver.publishedAt).toLocaleString()}</TableCell>
                      <TableCell>{ver.publishedBy ? "User" : "System"}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => requestRollback(ver.id)}
                          disabled={!!applyingId}
                        >
                          {applyingId === ver.id ? <Loader2 className="w-3 h-3 animate-spin" /> : "Restore"}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {history.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                        No history found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
