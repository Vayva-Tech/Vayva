"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { ListDashes, Plus, PencilSimple as Edit, Trash, Eye, Spinner as Loader2 } from "@phosphor-icons/react/ssr";
import { logger } from "@vayva/shared";
import { PageHeader } from "@/components/wix-style/PageHeader";
import { Button, Input, Badge } from "@vayva/ui";
import { Label } from "@/components/ui/label";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { apiJson } from "@/lib/api-client-shared";

interface Listing { id: string; title: string; description: string; category: string; price: number; condition: string; status: "draft" | "active" | "sold"; location: string; views: number; inquiries: number; images: string[]; contactEmail: string; allowNegotiation: boolean; createdAt: string; }

export default function ListingsPage() {
  const [loading, setLoading] = useState(true);
  const [listings, setListings] = useState<Listing[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; title: string } | null>(null);
  const [editingListing, setEditingListing] = useState<Listing | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const [formData, setFormData] = useState({ title: "", description: "", category: "", price: "", condition: "new", status: "draft", location: "", images: "", contactEmail: "", allowNegotiation: true });

  useEffect(() => { void fetchListings(); }, []);

  const fetchListings = async () => {
    try { setLoading(true); const data = await apiJson<Listing[]>("/api/marketplace/listings"); setListings(data || []); } catch (error) { logger.error("[FETCH_LISTINGS_ERROR]", { error: error instanceof Error ? error.message : String(error), app: "merchant" }); toast.error("Could not load listings"); } finally { setLoading(false); }
  };

  const handleSave = async () => {
    if (!formData.title || !formData.category || !formData.contactEmail) return toast.error("Title, category, and contact email required");
    setIsSubmitting(true);
    try {
      const payload = { ...formData, price: formData.price ? Number(formData.price) : 0, images: formData.images.split(",").map(i => i.trim()).filter(Boolean) };
      if (editingListing) { await apiJson(`/api/marketplace/listings/${editingListing.id}`, { method: "PUT", body: JSON.stringify(payload) }); toast.success("Listing updated"); }
      else { await apiJson("/api/marketplace/listings", { method: "POST", body: JSON.stringify(payload) }); toast.success("Listing created"); }
      setIsOpen(false); setEditingListing(null); resetForm(); void fetchListings();
    } catch { toast.error("Failed to save"); } finally { setIsSubmitting(false); }
  };

  const handleDelete = async (id: string) => { try { await apiJson(`/api/marketplace/listings/${id}`, { method: "DELETE" }); toast.success("Deleted"); setDeleteConfirm(null); void fetchListings(); } catch { toast.error("Failed to delete"); } };
  const handlePublish = async (id: string) => { try { await apiJson(`/api/marketplace/listings/${id}/publish`, { method: "POST" }); toast.success("Published"); void fetchListings(); } catch { toast.error("Failed to publish"); } };

  const openEdit = (listing: Listing) => { setEditingListing(listing); setFormData({ title: listing.title, description: listing.description || "", category: listing.category, price: String(listing.price), condition: listing.condition, status: listing.status, location: listing.location || "", images: listing.images?.join(", ") || "", contactEmail: listing.contactEmail, allowNegotiation: listing.allowNegotiation }); setIsOpen(true); };
  const resetForm = () => setFormData({ title: "", description: "", category: "", price: "", condition: "new", status: "draft", location: "", images: "", contactEmail: "", allowNegotiation: true });

  const filteredListings = listings.filter((l) => { const matchesSearch = l.title.toLowerCase().includes(searchQuery.toLowerCase()) || l.category.toLowerCase().includes(searchQuery.toLowerCase()); const matchesStatus = statusFilter === "all" || l.status === statusFilter; return matchesSearch && matchesStatus; });

  const getStatusBadge = (status: string) => { switch (status) { case "active": return <Badge className="bg-green-600">Active</Badge>; case "draft": return <Badge variant="default">Draft</Badge>; case "sold": return <Badge className="bg-blue-600">Sold</Badge>; default: return <Badge variant="default">{status}</Badge>; } };

  return (
    <div className="space-y-6">
      <PageHeader title="Marketplace Listings" description="Manage classified ads and listings" primaryAction={{ label: "New Listing", icon: "Plus", onClick: () => { setEditingListing(null); resetForm(); setIsOpen(true); } }} />
      <div className="flex gap-4 flex-wrap">
        <div className="flex-1 min-w-[200px]"><Input placeholder="Search listings..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} /></div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-4 py-2 rounded-lg border bg-white"><option value="all">All</option><option value="active">Active</option><option value="draft">Draft</option><option value="sold">Sold</option></select>
      </div>
      <div className="bg-white  rounded-xl border overflow-hidden">
        {loading ? (<div className="flex items-center justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-green-600" /></div>) : filteredListings.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center"><ListDashes className="h-12 w-12 text-gray-500 mb-4" /><h3 className="font-semibold">No listings yet</h3><p className="text-sm text-gray-500 mt-1">Create your first listing.</p><Button onClick={() => setIsOpen(true)} className="mt-4"><Plus className="mr-2 h-4 w-4" /> New</Button></div>
        ) : (<div className="divide-y">{filteredListings.map((l) => (<div key={l.id} className="p-4 flex items-start gap-4 hover:bg-gray-100"><div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center"><ListDashes className="h-5 w-5 text-green-600" /></div><div className="flex-1 min-w-0"><div className="flex items-center gap-2 mb-1"><h3 className="font-semibold truncate">{l.title}</h3>{getStatusBadge(l.status)}</div><p className="text-sm text-gray-500">{l.category}</p><div className="flex items-center gap-4 mt-2 text-xs text-gray-500"><span className="font-medium">₦{l.price.toLocaleString()}</span><span>•</span><span>{l.location}</span><span>•</span><span className="flex items-center gap-1"><Eye className="h-3 w-3" /> {l.views}</span></div></div><div className="flex items-center gap-1">{l.status === "draft" && (<Button size="sm" variant="ghost" onClick={() => handlePublish(l.id)}><Eye className="h-4 w-4 text-green-600" /></Button>)}<Button size="sm" variant="ghost" onClick={() => openEdit(l)}><Edit className="h-4 w-4" /></Button><Button size="sm" variant="ghost" className="text-red-500" onClick={() => setDeleteConfirm({ id: l.id, title: l.title })}><Trash className="h-4 w-4" /></Button></div></div>))}</div>)}
      </div>
      <Dialog open={isOpen} onOpenChange={setIsOpen}><DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto"><DialogHeader><DialogTitle>{editingListing ? "Edit" : "New"} Listing</DialogTitle></DialogHeader><div className="space-y-4 py-4"><div className="space-y-2"><Label>Title *</Label><Input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="Title" /></div><div className="space-y-2"><Label>Description</Label><textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full px-3 py-2 rounded-lg border bg-white" rows={2} /></div><div className="grid grid-cols-2 gap-4"><div className="space-y-2"><Label>Category *</Label><Input value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} placeholder="Category" /></div><div className="space-y-2"><Label>Price (₦)</Label><Input type="number" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} placeholder="0" /></div></div><div className="grid grid-cols-2 gap-4"><div className="space-y-2"><Label>Condition</Label><select value={formData.condition} onChange={(e) => setFormData({ ...formData, condition: e.target.value })} className="w-full px-3 py-2 rounded-lg border bg-white"><option value="new">New</option><option value="like_new">Like New</option><option value="good">Good</option><option value="fair">Fair</option><option value="poor">Poor</option></select></div><div className="space-y-2"><Label>Status</Label><select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value as any })} className="w-full px-3 py-2 rounded-lg border bg-white"><option value="draft">Draft</option><option value="active">Active</option><option value="sold">Sold</option></select></div></div><div className="space-y-2"><Label>Location</Label><Input value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} placeholder="City, State" /></div><div className="space-y-2"><Label>Contact Email *</Label><Input value={formData.contactEmail} onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })} placeholder="email@example.com" /></div><div className="space-y-2"><Label>Images (comma-separated URLs)</Label><Input value={formData.images} onChange={(e) => setFormData({ ...formData, images: e.target.value })} placeholder="https://..." /></div></div><DialogFooter><Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button><Button onClick={handleSave} disabled={isSubmitting}>{isSubmitting ? "Saving..." : editingListing ? "Update" : "Create"}</Button></DialogFooter></DialogContent></Dialog>
      <ConfirmDialog isOpen={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Delete Listing" message={`Delete "${deleteConfirm?.title}"?`} confirmText="Delete" onConfirm={() => deleteConfirm && handleDelete(deleteConfirm.id)} />
    </div>
  );
}
