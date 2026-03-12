"use client";

import { ConfirmDialog } from "@/components/ConfirmDialog";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  FolderSimple as FolderOpen,
  Plus,
  Spinner as Loader2,
  PencilSimple as Pencil,
  Trash,
} from "@phosphor-icons/react/ssr";
import { formatDate, logger } from "@vayva/shared";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button, Input } from "@vayva/ui";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ProductPicker } from "@/components/bundles/ProductPicker";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { PageSkeleton } from "@/components/ui/page-skeleton";

interface Collection {
  id: string;
  name: string;
  handle: string;
  count: number;
  visibility: string;
  updated: string;
  description?: string;
  products?: { id: string }[];
}

import { apiJson } from "@/lib/api-client-shared";

interface CollectionsResponse {
  data: Collection[];
}

export default function CollectionsPage() {
  const [loading, setLoading] = useState(true);
  const [collections, setCollections] = useState<Collection[]>([]);

  // Dialog State
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<"CREATE" | "EDIT">("CREATE");
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    handle: "",
    description: "",
    productIds: [] as string[],
  });
  const [submitting, setSubmitting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; name: string } | null>(null);

  useEffect(() => {
    void fetchCollections();
  }, []);

  const fetchCollections = async () => {
    try {
      setLoading(true);
      const data = await apiJson<CollectionsResponse>("/api/collections");
      setCollections(data?.data || []);
    } catch (error: unknown) {
      const _errMsg = error instanceof Error ? error.message : String(error);
      logger.error("[FETCH_COLLECTIONS_ERROR]", {
        error: _errMsg,
        app: "merchant",
      });
      toast.error(_errMsg || "Could not load collections");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setMode("CREATE");
    setFormData({ title: "", handle: "", description: "", productIds: [] });
    setCurrentId(null);
    setIsOpen(true);
  };

  const handleOpenEdit = async (col: Collection) => {
    setMode("EDIT");
    setFormData({
      title: col.name,
      handle: col.handle,
      description: col.description || "",
      productIds: col.products?.map((p) => p.id) || [],
    });
    setCurrentId(col.id);
    setIsOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.handle)
      return toast.error("Title and Handle are required");

    setSubmitting(true);
    try {
      const url =
        mode === "CREATE"
          ? "/api/collections"
          : `/api/collections/${currentId}`;
      const method = mode === "CREATE" ? "POST" : "PUT";

      await apiJson<{ success: boolean }>(url, {
        method,
        body: JSON.stringify(formData),
      });

      toast.success(
        mode === "CREATE" ? "Collection created" : "Collection updated",
      );
      setIsOpen(false);
      void fetchCollections();
    } catch (error: unknown) {
      const _errMsg = error instanceof Error ? error.message : String(error);
      logger.error("[SUBMIT_COLLECTION_ERROR]", {
        error: _errMsg,
        mode,
        collectionId: currentId,
        app: "merchant",
      });
      toast.error("Failed to save collection");
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
      await apiJson<{ success: boolean }>(`/api/collections/${id}`, {
        method: "DELETE",
      });
      toast.success("Collection deleted");
      void fetchCollections();
    } catch (error: unknown) {
      const _errMsg = error instanceof Error ? error.message : String(error);
      logger.error("[DELETE_COLLECTION_ERROR]", {
        error: _errMsg,
        collectionId: id,
        app: "merchant",
      });
      toast.error("Failed to delete collection");
    } finally {
      setDeleteConfirm(null);
    }
  };

  const generateHandle = (title: string) => {
    setFormData((prev) => ({
      ...prev,
      title,
      handle:
        mode === "CREATE"
          ? title
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, "-")
              .replace(/^-|-$/g, "")
          : prev.handle,
    }));
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-20">
      <Breadcrumbs />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">
            Collections
          </h1>
          <p className="text-text-secondary">
            Organize your products into catalog collections.
          </p>
        </div>
        <Button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 rounded-xl"
        >
          <Plus className="h-4 w-4" />
          Create Collection
        </Button>
      </div>

      <div className="bg-background/70 backdrop-blur-xl rounded-xl shadow-sm border border-border/40 overflow-hidden">
        {loading ? (
          <div className="p-6">
            <PageSkeleton variant="table" rows={5} />
          </div>
        ) : collections.length === 0 ? (
          <div className="p-16 text-center flex flex-col items-center">
            <div className="h-12 w-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center mb-4">
              <FolderOpen className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-medium text-text-primary mb-1">
              No collections yet
            </h3>
            <p className="text-text-secondary max-w-sm mb-6">
              Create collections to help customers browse your products by
              category.
            </p>
            <Button
              onClick={handleOpenCreate}
              variant="outline"
              className="inline-flex items-center gap-2 rounded-xl"
            >
              <Plus className="h-4 w-4" />
              Create your first collection
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-background/40 backdrop-blur-sm text-text-secondary font-medium border-b border-border/40">
                <tr>
                  <th className="px-6 py-3">Title</th>
                  <th className="px-6 py-3">Products</th>
                  <th className="px-6 py-3">Visibility</th>
                  <th className="px-6 py-3">Last Updated</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {collections.map((col) => (
                  <tr key={col.id} className="hover:bg-white/60 group">
                    <td className="px-6 py-4 font-medium text-text-primary">
                      {col.name}
                      <span className="block text-xs text-text-tertiary font-normal font-mono mt-0.5">
                        /{col.handle}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-text-secondary">
                      {col.count} products
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                        <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        {col.visibility}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-text-tertiary">
                      {formatDate(col.updated)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          onClick={() => handleOpenEdit(col)}
                          variant="ghost"
                          size="icon"
                          className="p-1.5 text-primary hover:bg-primary/10 rounded-lg transition-colors"
                          title="Edit Collection"
                          aria-label={`Edit ${col.name} collection`}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          onClick={() => handleDeleteClick(col.id, col.name)}
                          variant="ghost"
                          size="icon"
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete Collection"
                          aria-label={`Delete ${col.name} collection`}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {mode === "CREATE" ? "Create Collection" : "Edit Collection"}
            </DialogTitle>
            <DialogDescription>
              Collections help organize your products.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto px-1">
            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  generateHandle(e.target?.value)
                }
                placeholder="e.g. Summer Arrivals"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="handle">Handle (URL)</Label>
              <Input
                id="handle"
                value={formData.handle}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setFormData({ ...formData, handle: e.target?.value })
                }
                placeholder="e.g. summer-arrivals"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="desc">Description</Label>
              <Textarea
                id="desc"
                value={formData.description}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  setFormData({ ...formData, description: e.target?.value })
                }
                placeholder="Optional description for SEO..."
              />
            </div>
            <div className="grid gap-2">
              <Label>Products</Label>
              <ProductPicker
                selectedIds={formData.productIds}
                onSelectionChange={(ids: string[]) =>
                  setFormData({ ...formData, productIds: ids })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={submitting}>
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Save Collection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <ConfirmDialog
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={confirmDelete}
        title="Delete Collection"
        message={deleteConfirm ? `Delete "${deleteConfirm.name}"? This cannot be undone.` : ""}
      />
    </div>
  );
}
