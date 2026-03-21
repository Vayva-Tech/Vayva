"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  PaintBrush,
  Plus,
  PencilSimple as Pencil,
  Trash,
  Spinner as Loader2,
  Eye,
  Download,
  Copy,
  Check,
  Palette,
  Layout,
} from "@phosphor-icons/react/ssr";
import { formatDate, logger } from "@vayva/shared";
import { Button, Badge, Input } from "@vayva/ui";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { apiJson } from "@/lib/api-client-shared";
import { StatusBadge } from "@/components/shared";
import { ConfirmDialog } from "@/components/ConfirmDialog";

interface Template {
  id: string;
  name: string;
  description?: string;
  type: "EMAIL" | "LANDING" | "SOCIAL" | "BANNER" | "FLYER";
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  thumbnail?: string;
  createdAt: string;
  updatedAt: string;
}

interface DesignerStats {
  totalTemplates: number;
  publishedCount: number;
  draftCount: number;
}

export default function DesignerPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [stats, setStats] = useState<DesignerStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [mode, setMode] = useState<"CREATE" | "EDIT">("CREATE");
  const [submitting, setSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; name: string } | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    type: "EMAIL",
    status: "DRAFT",
  });

  useEffect(() => {
    void fetchTemplates();
    void fetchStats();
  }, []);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const data = await apiJson<{ templates: Template[] }>("/api/designer");
      setTemplates(data?.templates || []);
    } catch (error: unknown) {
      const _errMsg = error instanceof Error ? error.message : String(error);
      logger.error("[DESIGNER_FETCH_ERROR]", { error: _errMsg });
      toast.error("Failed to load templates");
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const data = await apiJson<DesignerStats>("/api/designer/stats");
      setStats(data);
    } catch (error: unknown) {
      // Stats endpoint might not exist, that's okay
      logger.debug("[DESIGNER_STATS_NOT_AVAILABLE]");
    }
  };

  const handleOpenCreate = () => {
    setMode("CREATE");
    setFormData({
      name: "",
      description: "",
      type: "EMAIL",
      status: "DRAFT",
    });
    setIsOpen(true);
  };

  const handleOpenEdit = (template: Template) => {
    setMode("EDIT");
    setFormData({
      name: template.name,
      description: template.description || "",
      type: template.type,
      status: (template as any).status,
    });
    setIsOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const url = mode === "CREATE" ? "/api/designer" : `/api/designer/${selectedTemplate?.id}`;
      const method = mode === "CREATE" ? "POST" : "PATCH";

      await apiJson(url, {
        method,
        body: JSON.stringify(formData),
      });

      toast.success(mode === "CREATE" ? "Template created" : "Template updated");
      setIsOpen(false);
      void fetchTemplates();
    } catch (error: unknown) {
      const _errMsg = error instanceof Error ? error.message : String(error);
      logger.error("[TEMPLATE_SAVE_ERROR]", { error: _errMsg });
      toast.error("Failed to save template");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteClick = (id: string, name: string) => {
    setDeleteConfirm({ id, name });
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;
    const { id } = deleteConfirm;
    try {
      await apiJson(`/api/designer/${id}`, { method: "DELETE" });
      toast.success("Template deleted");
      void fetchTemplates();
    } catch (error: unknown) {
      const _errMsg = error instanceof Error ? error.message : String(error);
      logger.error("[TEMPLATE_DELETE_ERROR]", { error: _errMsg });
      toast.error("Failed to delete template");
    } finally {
      setDeleteConfirm(null);
    }
  };

  const handleDuplicate = async (template: Template) => {
    try {
      await apiJson("/api/designer", {
        method: "POST",
        body: JSON.stringify({
          name: `${template.name} (Copy)`,
          description: template.description,
          type: template.type,
          status: "DRAFT",
        }),
      });
      toast.success("Template duplicated");
      void fetchTemplates();
    } catch (error: unknown) {
      const _errMsg = error instanceof Error ? error.message : String(error);
      logger.error("[TEMPLATE_DUPLICATE_ERROR]", { error: _errMsg });
      toast.error("Failed to duplicate template");
    }
  };

  const handleCopyId = (id: string) => {navigator?.clipboard?.writeText(id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("Template ID copied");
  };

  const getTypeIcon = (type: string) => {
    const icons: Record<string, typeof PaintBrush> = {
      EMAIL: Layout,
      LANDING: Layout,
      SOCIAL: Palette,
      BANNER: PaintBrush,
      FLYER: PaintBrush,
    };
    const Icon = icons[type] || PaintBrush;
    return <Icon className="h-4 w-4" />;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto p-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-pink-500 to-red-500 rounded-lg">
            <PaintBrush className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Template Designer</h1>
            <p className="text-gray-500">
              Create and manage design templates for your store.
            </p>
          </div>
        </div>
        <Button onClick={handleOpenCreate}>
          <Plus className="mr-2 h-4 w-4" /> New Template
        </Button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-gray-500">Total Templates</p>
              <p className="text-2xl font-bold">{stats.totalTemplates}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-gray-500">Published</p>
              <p className="text-2xl font-bold text-green-600">{stats.publishedCount}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-gray-500">Drafts</p>
              <p className="text-2xl font-bold text-orange-600">{stats.draftCount}</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Templates Grid */}
      {templates.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <PaintBrush className="h-12 w-12 mx-auto text-gray-500 mb-4" />
            <h3 className="text-lg font-medium">No templates yet</h3>
            <p className="text-sm text-gray-500 mt-2">
              Create your first template to get started with the designer.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {templates.map((template) => (
            <Card key={template.id} className="overflow-hidden">
              {/* Thumbnail Placeholder */}
              <div className="aspect-video bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
                <div className="p-4 bg-white rounded-full">
                  {getTypeIcon(template.type)}
                </div>
              </div>
              <CardHeader className="pb-3">
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedTemplate(template);
                      setPreviewOpen(true);
                    }}
                  >
                    <Eye className="h-4 w-4 mr-1" /> Preview
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleOpenEdit(template)}>
                    <Pencil className="h-4 w-4 mr-1" /> Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDuplicate(template)}
                  >
                    <Copy className="h-4 w-4 mr-1" /> Copy
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteClick(template.id, template.name)}
                  >
                    <Trash className="h-4 w-4 mr-1" /> Delete
                  </Button>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{mode === "CREATE" ? "New Template" : "Edit Template"}</DialogTitle>
            <DialogDescription>
              {mode === "CREATE"
                ? "Create a new design template."
                : "Update template settings."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="name">Template Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e: any) => setFormData({ ...formData, name: e.target?.value })}
                  placeholder="e.g., Welcome Email Template"
                  required
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e: any) => setFormData({ ...formData, description: e.target?.value })}
                  placeholder="What is this template for?"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="type">Template Type</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value: string) => setFormData({ ...formData, type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="EMAIL">Email</SelectItem>
                      <SelectItem value="LANDING">Landing Page</SelectItem>
                      <SelectItem value="SOCIAL">Social Media</SelectItem>
                      <SelectItem value="BANNER">Banner</SelectItem>
                      <SelectItem value="FLYER">Flyer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value: string) => setFormData({ ...formData, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DRAFT">Draft</SelectItem>
                      <SelectItem value="PUBLISHED">Published</SelectItem>
                      <SelectItem value="ARCHIVED">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting && <Loader2 className="h-4 w-4 animate-spin mr-1" />}
                {mode === "CREATE" ? "Create Template" : "Update Template"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{selectedTemplate?.name}</DialogTitle>
            <DialogDescription>Template Preview</DialogDescription>
          </DialogHeader>
          <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <PaintBrush className="h-16 w-16 mx-auto text-gray-500 mb-4" />
              <p className="text-gray-500">Preview not available</p>
              <p className="text-sm text-gray-500">
                Template ID: {selectedTemplate?.id}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPreviewOpen(false)}>
              Close
            </Button>
            <Button onClick={() => selectedTemplate && handleCopyId(selectedTemplate.id)}>
              {copied ? <Check className="h-4 w-4 mr-1" /> : <Copy className="h-4 w-4 mr-1" />}
              Copy ID
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
