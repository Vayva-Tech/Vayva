"use client";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { DownloadSimple, Plus, PencilSimple as Edit, Trash, Image as ImageIcon, FilePdf, FileZip, File, HardDrives } from "@phosphor-icons/react";
import { logger } from "@vayva/shared";
import { Button, Input } from "@vayva/ui";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { apiJson } from "@/lib/api-client-shared";

interface DigitalAsset {
  id: string;
  name: string;
  description: string;
  fileType: "image" | "pdf" | "video" | "audio" | "document" | "archive";
  url: string;
  size: number;
  downloads: number;
  price?: number;
  isPublic: boolean;
  tags: string[];
  category: string;
  createdAt: string;
  updatedAt: string;
}

function getFileIcon(type: string) {
  switch (type) {
    case "image": return ImageIcon;
    case "pdf": return FilePdf;
    case "archive": return FileZip;
    default: return File;
  }
}

export default function DigitalAssetsPage() {
  const [loading, setLoading] = useState(true);
  const [assets, setAssets] = useState<DigitalAsset[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; name: string } | null>(null);
  const [editingAsset, setEditingAsset] = useState<DigitalAsset | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    fileType: "document" as DigitalAsset["fileType"],
    url: "",
    size: "",
    price: "",
    isPublic: true,
    category: "general",
    tags: "",
  });

  useEffect(() => { void fetchAssets(); }, []);

  const fetchAssets = async () => {
    try {
      setLoading(true);
      const data = await apiJson<DigitalAsset[]>("/digital-assets");
      setAssets(data || []);
    } catch (error) {
      logger.error("[FETCH_ASSETS_ERROR]", { error: error instanceof Error ? error.message : String(error), app: "merchant" });
      toast.error("Could not load digital assets");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.name || !formData.url) {
      return toast.error("Name and URL are required");
    }
    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        size: formData.size ? Number(formData.size) : 0,
        price: formData.price ? Number(formData.price) : undefined,
        tags: formData.tags.split(",").map(t => t.trim()).filter(Boolean),
      };
      if (editingAsset) {
        await apiJson(`/api/digital-assets/${editingAsset.id}`, { method: "PUT", body: JSON.stringify(payload) });
        toast.success("Asset updated");
      } else {
        await apiJson("/digital-assets", { method: "POST", body: JSON.stringify(payload) });
        toast.success("Asset created");
      }
      setIsOpen(false);
      setEditingAsset(null);
      resetForm();
      void fetchAssets();
    } catch (error) {
      toast.error("Failed to save asset");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await apiJson(`/api/digital-assets/${id}`, { method: "DELETE" });
      toast.success("Asset deleted");
      setDeleteConfirm(null);
      void fetchAssets();
    } catch (error) {
      toast.error("Failed to delete asset");
    }
  };

  const openEdit = (asset: DigitalAsset) => {
    setEditingAsset(asset);
    setFormData({
      name: asset.name,
      description: asset.description || "",
      fileType: asset.fileType,
      url: asset.url,
      size: String(asset.size || 0),
      price: asset.price ? String(asset.price) : "",
      isPublic: asset.isPublic,
      category: asset.category || "general",
      tags: asset.tags?.join(", ") || "",
    });
    setIsOpen(true);
  };

  const resetForm = () => {
    setFormData({ name: "", description: "", fileType: "document", url: "", size: "", price: "", isPublic: true, category: "general", tags: "" });
  };

  const filteredAssets = assets.filter((asset) => {
    const matchesSearch = asset.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === "all" || asset.fileType === typeFilter;
    return matchesSearch && matchesType;
  });

  const formatSize = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  // Calculate metrics
  const totalAssets = assets.length;
  const images = assets.filter(a => a.fileType === "image").length;
  const pdfs = assets.filter(a => a.fileType === "pdf").length;
  const archives = assets.filter(a => a.fileType === "archive").length;
  const publicAssets = assets.filter(a => a.isPublic).length;
  const totalSize = assets.reduce((sum, a) => sum + a.size, 0);
  const totalDownloads = assets.reduce((sum, a) => sum + a.downloads, 0);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Digital Assets</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your digital files and media library</p>
        </div>
        <Button onClick={() => { setEditingAsset(null); resetForm(); setIsOpen(true); }} className="bg-green-600 hover:bg-green-700 text-white">
          <Plus size={18} className="mr-2" />
          New Asset
        </Button>
      </div>

      {/* Summary Widgets */}
      {assets.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <SummaryWidget
            icon={<HardDrives size={18} />}
            label="Total Assets"
            value={String(totalAssets)}
            trend={`${publicAssets} public`}
            positive
          />
          <SummaryWidget
            icon={<ImageIcon size={18} />}
            label="Images"
            value={String(images)}
            trend="image files"
            positive
          />
          <SummaryWidget
            icon={<FilePdf size={18} />}
            label="PDFs"
            value={String(pdfs)}
            trend="documents"
            positive
          />
          <SummaryWidget
            icon={<FileZip size={18} />}
            label="Archives"
            value={String(archives)}
            trend="compressed"
            positive
          />
          <SummaryWidget
            icon={<DownloadSimple size={18} />}
            label="Downloads"
            value={String(totalDownloads)}
            trend="total downloads"
            positive={totalDownloads > 0}
          />
          <SummaryWidget
            icon={<File size={18} />}
            label="Storage"
            value={(totalSize / 1024 / 1024).toFixed(1) + ' MB'}
            trend="used"
            positive
          />
        </div>
      )}

      {/* Filters */}
      {assets.length > 0 && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Input
              placeholder="Search assets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-64 bg-white border-gray-200"
            />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="all">All Types</option>
              <option value="image">Images</option>
              <option value="pdf">PDFs</option>
              <option value="video">Videos</option>
              <option value="audio">Audio</option>
              <option value="document">Documents</option>
              <option value="archive">Archives</option>
            </select>
          </div>
        </div>
      )}

      {/* Assets Grid */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-12 flex justify-center">
            <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredAssets.length === 0 ? (
          <div className="p-16 text-center flex flex-col items-center">
            <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
              <File size={32} className="text-gray-400" />
            </div>
            <h3 className="text-base font-semibold text-gray-900 mb-1">No assets found</h3>
            <p className="text-sm text-gray-500 max-w-sm">
              Upload your first digital asset to build your media library.
            </p>
            <Button onClick={() => { resetForm(); setIsOpen(true); }} className="mt-4 bg-green-600 hover:bg-green-700 text-white">
              <Plus size={18} className="mr-2" />
              Upload Asset
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50" scope="col">
                <tr>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider" scope="col">Asset</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider" scope="col">Type</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider" scope="col">Category</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider" scope="col">Size</th>
                  <th className="text-right py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider" scope="col">Downloads</th>
                  <th className="text-right py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider" scope="col">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredAssets.map((asset) => {
                  const IconComponent = getFileIcon(asset.fileType);
                  return (
                    <tr key={asset.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
                            <IconComponent size={20} className="text-gray-600" />
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900">{asset.name}</div>
                            <div className="text-xs text-gray-500">{asset.description}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-50 text-gray-700 capitalize">
                          {asset.fileType}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-700">
                        {asset.category}
                      </td>
                      <td className="px-6 py-4 text-gray-700">
                        {(asset.size / 1024 / 1024).toFixed(2)} MB
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="text-sm font-semibold text-gray-900">{asset.downloads}</div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <a
                            href={asset.url}
                            download
                            className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Download"
                          >
                            <DownloadSimple size={16} />
                          </a>
                          <Button
                            onClick={() => openEdit(asset)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit size={16} />
                          </Button>
                          <Button
                            onClick={() => setDeleteConfirm({ id: asset.id, name: asset.name })}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash size={16} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Dialog for adding/editing assets */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingAsset ? "Edit Asset" : "New Asset"}</DialogTitle>
            <DialogDescription>{editingAsset ? "Update asset details" : "Add a new digital asset"}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2"><Label>Name *</Label><Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Asset name" /></div>
            <div className="space-y-2"><Label>Description</Label><textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Description..." className="w-full px-3 py-2 rounded-lg border bg-white" rows={2} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>File Type</Label><select value={formData.fileType} onChange={(e) => setFormData({ ...formData, fileType: e.target.value as any })} className="w-full px-3 py-2 rounded-lg border bg-white"><option value="image">Image</option><option value="pdf">PDF</option><option value="video">Video</option><option value="audio">Audio</option><option value="document">Document</option><option value="archive">Archive</option></select></div>
              <div className="space-y-2"><Label>Category</Label><Input value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} placeholder="Category" /></div>
            </div>
            <div className="space-y-2"><Label>URL *</Label><Input value={formData.url} onChange={(e) => setFormData({ ...formData, url: e.target.value })} placeholder="https://..." /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Size (bytes)</Label><Input type="number" value={formData.size} onChange={(e) => setFormData({ ...formData, size: e.target.value })} placeholder="0" /></div>
              <div className="space-y-2"><Label>Price (₦, optional)</Label><Input type="number" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} placeholder="Free" /></div>
            </div>
            <div className="space-y-2"><Label>Tags (comma-separated)</Label><Input value={formData.tags} onChange={(e) => setFormData({ ...formData, tags: e.target.value })} placeholder="tag1, tag2, tag3" /></div>
            <div className="flex items-center gap-2">
              <input type="checkbox" checked={formData.isPublic} onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })} id="isPublic" />
              <Label htmlFor="isPublic">Publicly accessible</Label>
            </div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button><Button onClick={handleSave} disabled={isSubmitting}>{isSubmitting ? "Saving..." : editingAsset ? "Update" : "Create"}</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm dialog for deleting assets */}
      <ConfirmDialog isOpen={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Delete Asset" message={`Delete asset "${deleteConfirm?.name}"?`} confirmText="Delete" onConfirm={() => deleteConfirm && handleDelete(deleteConfirm.id)} />
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
