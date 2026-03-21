// @ts-nocheck
"use client";

import { ConfirmDialog } from "@/components/ConfirmDialog";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { FolderSimple as FolderOpen, Plus, PencilSimple as Pencil, Trash, Package, Eye } from "@phosphor-icons/react";
import { formatDate, logger } from "@vayva/shared";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button, Input } from "@vayva/ui";
import { Textarea } from "@/components/ui/textarea";
import { ProductPicker } from "@/components/bundles/ProductPicker";
import { apiJson } from "@/lib/api-client-shared";

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

  // Calculate metrics
  const totalCollections = collections.length;
  const visibleCollections = collections.filter(c => c.visibility === 'visible').length;
  const hiddenCollections = collections.filter(c => c.visibility === 'hidden').length;
  const totalProducts = collections.reduce((sum, c) => sum + c.count, 0);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Collections</h1>
          <p className="text-sm text-gray-500 mt-1">Organize products into curated groups</p>
        </div>
        <Button onClick={handleOpenCreate} className="bg-green-600 hover:bg-green-700 text-white px-4 h-10 rounded-xl font-semibold">
          <Plus size={18} className="mr-2" />
          New Collection
        </Button>
      </div>

      {/* Summary Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <SummaryWidget
          icon={<FolderOpen size={18} />}
          label="Total Collections"
          value={String(totalCollections)}
          trend={`${totalProducts} products`}
          positive
        />
        <SummaryWidget
          icon={<Eye size={18} />}
          label="Visible"
          value={String(visibleCollections)}
          trend="public"
          positive
        />
        <SummaryWidget
          icon={<Package size={18} />}
          label="Hidden"
          value={String(hiddenCollections)}
          trend="private"
          positive={hiddenCollections === 0}
        />
        <SummaryWidget
          icon={<Package size={18} />}
          label="Total Products"
          value={String(totalProducts)}
          trend="in collections"
          positive
        />
      </div>

      {/* Collections Grid */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-12 flex justify-center">
            <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : collections.length === 0 ? (
          <div className="p-16 text-center flex flex-col items-center">
            <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
              <FolderOpen size={32} className="text-gray-400" />
            </div>
            <h3 className="text-base font-semibold text-gray-900 mb-1">No collections yet</h3>
            <p className="text-sm text-gray-500 max-w-sm">
              Create your first collection to organize products.
            </p>
            <Button onClick={handleOpenCreate} className="mt-4 bg-green-600 hover:bg-green-700 text-white">
              <Plus size={18} className="mr-2" />
              New Collection
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Collection</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Handle</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Products</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Visibility</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Updated</th>
                  <th className="text-right py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {collections.map((col) => (
                  <tr key={col.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-900">{col.name}</div>
                      {col.description && <div className="text-xs text-gray-500 mt-0.5 line-clamp-1">{col.description}</div>}
                    </td>
                    <td className="px-6 py-4">
                      <code className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600">{col.handle}</code>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-700 font-medium">{col.count}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                          col.visibility === 'visible'
                            ? "bg-green-50 text-green-600"
                            : "bg-gray-50 text-gray-600"
                        }`}
                      >
                        {col.visibility}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-700">
                      {formatDate(col.updated)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => void handleOpenEdit(col)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(col.id, col.name)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash size={16} />
                        </button>
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

// Summary Widget Component
function SummaryWidget({
  icon,
  label,
  value,
  trend,
  positive,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  trend: string;
  positive: boolean;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            {label}
          </p>
          <p className="text-2xl font-bold text-gray-900 tracking-tight mt-1">
            {value}
          </p>
          <p className={`text-xs mt-1 ${positive ? 'text-green-600' : 'text-orange-600'}`}>
            {trend}
          </p>
        </div>
        <div className="p-2.5 rounded-xl bg-gray-100 text-gray-600">
          {icon}
        </div>
      </div>
    </div>
  );
}
