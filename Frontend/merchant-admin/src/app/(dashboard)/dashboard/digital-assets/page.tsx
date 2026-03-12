"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { DownloadSimple, Plus, PencilSimple as Edit, Trash, Spinner as Loader2, Image as ImageIcon, FilePdf, FileZip, File } from "@phosphor-icons/react/ssr";
import { logger } from "@vayva/shared";
import { PageHeader } from "@/components/wix-style/PageHeader";
import { Button, Input, Badge } from "@vayva/ui";
import { Label } from "@/components/ui/label";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
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
      const data = await apiJson<DigitalAsset[]>("/api/digital-assets");
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
        await apiJson("/api/digital-assets", { method: "POST", body: JSON.stringify(payload) });
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

  return (
    <div className="space-y-6">
      <PageHeader title="Digital Assets" description="Manage downloadable files and digital products" primaryAction={{
        label: "New Asset",
        icon: "Plus",
        onClick: () => { setEditingAsset(null); resetForm(); setIsOpen(true); }
      }} />

      <div className="flex gap-4 flex-wrap">
        <div className="flex-1 min-w-[200px]"><Input placeholder="Search assets..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} /></div>
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="px-4 py-2 rounded-lg border bg-background">
          <option value="all">All Types</option>
          <option value="image">Image</option>
          <option value="pdf">PDF</option>
          <option value="video">Video</option>
          <option value="audio">Audio</option>
          <option value="document">Document</option>
          <option value="archive">Archive</option>
        </select>
      </div>

      <div className="bg-background/70 backdrop-blur-xl rounded-xl border overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        ) : filteredAssets.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <DownloadSimple className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="font-semibold">No assets yet</h3>
            <p className="text-sm text-muted-foreground mt-1">Upload your first digital asset.</p>
            <Button onClick={() => setIsOpen(true)} className="mt-4"><Plus className="mr-2 h-4 w-4" /> New Asset</Button>
          </div>
        ) : (
          <div className="divide-y">
            {filteredAssets.map((asset) => {
              const Icon = getFileIcon(asset.fileType);
              return (
                <div key={asset.id} className="p-4 flex items-start gap-4 hover:bg-muted/50">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center"><Icon className="h-5 w-5 text-primary" /></div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold truncate">{asset.name}</h3>
                      <Badge variant="outline">{asset.fileType}</Badge>
                      {!asset.isPublic && <Badge variant="default">Private</Badge>}
                      {asset.price && <Badge className="bg-green-600">₦{asset.price}</Badge>}
                    </div>
                    {asset.description && <p className="text-sm text-muted-foreground line-clamp-1">{asset.description}</p>}
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      <span>{formatSize(asset.size)}</span>
                      <span>•</span>
                      <span>{asset.downloads} downloads</span>
                      <span>•</span>
                      <span>{asset.category}</span>
                      {asset.tags.length > 0 && <><span>•</span><span>{asset.tags.join(", ")}</span></>}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button size="sm" variant="ghost" asChild><a href={asset.url} target="_blank" rel="noopener noreferrer"><DownloadSimple className="h-4 w-4" /></a></Button>
                    <Button size="sm" variant="ghost" onClick={() => openEdit(asset)}><Edit className="h-4 w-4" /></Button>
                    <Button size="sm" variant="ghost" className="text-destructive" onClick={() => setDeleteConfirm({ id: asset.id, name: asset.name })}><Trash className="h-4 w-4" /></Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingAsset ? "Edit Asset" : "New Asset"}</DialogTitle>
            <DialogDescription>{editingAsset ? "Update asset details" : "Add a new digital asset"}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2"><Label>Name *</Label><Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Asset name" /></div>
            <div className="space-y-2"><Label>Description</Label><textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Description..." className="w-full px-3 py-2 rounded-lg border bg-background" rows={2} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>File Type</Label><select value={formData.fileType} onChange={(e) => setFormData({ ...formData, fileType: e.target.value as any })} className="w-full px-3 py-2 rounded-lg border bg-background"><option value="image">Image</option><option value="pdf">PDF</option><option value="video">Video</option><option value="audio">Audio</option><option value="document">Document</option><option value="archive">Archive</option></select></div>
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

      <ConfirmDialog isOpen={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Delete Asset" message={`Delete asset "${deleteConfirm?.name}"?`} confirmText="Delete" onConfirm={() => deleteConfirm && handleDelete(deleteConfirm.id)} />
    </div>
  );
}

