"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Bed, Plus, PencilSimple as Edit, Trash, CalendarCheck, Spinner as Loader2 } from "@phosphor-icons/react/ssr";
import { logger } from "@vayva/shared";
import { PageHeader } from "@/components/wix-style/PageHeader";
import { Button, Input, Badge } from "@vayva/ui";
import { Label } from "@/components/ui/label";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { apiJson } from "@/lib/api-client-shared";

interface StayPackage {
  id: string;
  name: string;
  description: string;
  type: "hotel" | "resort" | "vacation_rental" | "bnb" | "campground";
  location: string;
  pricePerNight: number;
  maxGuests: number;
  bedrooms: number;
  bathrooms: number;
  amenities: string[];
  images: string[];
  isAvailable: boolean;
  bookings: number;
  rating: number;
  reviews: number;
  createdAt: string;
}

export default function StaysPage() {
  const [loading, setLoading] = useState(true);
  const [packages, setPackages] = useState<StayPackage[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; name: string } | null>(null);
  const [editingPackage, setEditingPackage] = useState<StayPackage | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  const [formData, setFormData] = useState({ name: "", description: "", type: "hotel" as "hotel" | "resort" | "vacation_rental" | "bnb" | "campground", location: "", pricePerNight: "", maxGuests: "", bedrooms: "", bathrooms: "", amenities: "", images: "", isAvailable: true });

  useEffect(() => { void fetchPackages(); }, []);

  const fetchPackages = async () => { try { setLoading(true); const data = await apiJson<StayPackage[]>("/stays"); setPackages(data || []); } catch (error) { logger.error("[FETCH_STAYS_ERROR]", { error: error instanceof Error ? error.message : String(error), app: "merchant" }); toast.error("Could not load stays"); } finally { setLoading(false); } };

  const handleSave = async () => {
    if (!formData.name || !formData.location) return toast.error("Name and location required");
    setIsSubmitting(true);
    try {
      const payload = { ...formData, pricePerNight: Number(formData.pricePerNight) || 0, maxGuests: Number(formData.maxGuests) || 1, bedrooms: Number(formData.bedrooms) || 0, bathrooms: Number(formData.bathrooms) || 0, amenities: formData.amenities.split(",").map(a => a.trim()).filter(Boolean), images: formData.images.split(",").map(i => i.trim()).filter(Boolean) };
      if (editingPackage) { await apiJson(`/api/stays/${editingPackage.id}`, { method: "PUT", body: JSON.stringify(payload) }); toast.success("Stay updated"); }
      else { await apiJson("/stays", { method: "POST", body: JSON.stringify(payload) }); toast.success("Stay created"); }
      setIsOpen(false); setEditingPackage(null); resetForm(); void fetchPackages();
    } catch { toast.error("Failed to save"); } finally { setIsSubmitting(false); }
  };

  const handleDelete = async (id: string) => { try { await apiJson(`/api/stays/${id}`, { method: "DELETE" }); toast.success("Deleted"); setDeleteConfirm(null); void fetchPackages(); } catch { toast.error("Failed to delete"); } };
  const handleToggleAvailability = async (id: string, isAvailable: boolean) => { try { await apiJson(`/api/stays/${id}/toggle`, { method: "POST", body: JSON.stringify({ isAvailable: !isAvailable }) }); toast.success(isAvailable ? "Marked unavailable" : "Marked available"); void fetchPackages(); } catch { toast.error("Failed to toggle"); } };

  const openEdit = (p: StayPackage) => { setEditingPackage(p); setFormData({ name: p.name, description: p.description || "", type: p.type, location: p.location, pricePerNight: String(p.pricePerNight), maxGuests: String(p.maxGuests), bedrooms: String(p.bedrooms), bathrooms: String(p.bathrooms), amenities: p.amenities?.join(", ") || "", images: p.images?.join(", ") || "", isAvailable: p.isAvailable }); setIsOpen(true); };
  const resetForm = () => setFormData({ name: "", description: "", type: "hotel", location: "", pricePerNight: "", maxGuests: "", bedrooms: "", bathrooms: "", amenities: "", images: "", isAvailable: true });

  const filteredPackages = packages.filter((p) => { const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.location.toLowerCase().includes(searchQuery.toLowerCase()); const matchesType = typeFilter === "all" || p.type === typeFilter; return matchesSearch && matchesType; });

  const getTypeBadge = (type: string) => { switch (type) { case "hotel": return <Badge className="bg-blue-600">Hotel</Badge>; case "resort": return <Badge className="bg-teal-600">Resort</Badge>; case "vacation_rental": return <Badge className="bg-purple-600">Rental</Badge>; case "bnb": return <Badge className="bg-pink-600">B&B</Badge>; case "campground": return <Badge className="bg-green-600">Camp</Badge>; default: return <Badge variant="default">{type}</Badge>; } };

  return (
    <div className="space-y-6">
      <PageHeader title="Stays & Packages" description="Manage accommodations and bookings" primaryAction={{ label: "New Stay", icon: "Plus", onClick: () => { setEditingPackage(null); resetForm(); setIsOpen(true); } }} />
      <div className="flex gap-4 flex-wrap">
        <div className="flex-1 min-w-[200px]"><Input placeholder="Search stays..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} /></div>
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="px-4 py-2 rounded-lg border bg-white"><option value="all">All Types</option><option value="hotel">Hotel</option><option value="resort">Resort</option><option value="vacation_rental">Vacation Rental</option><option value="bnb">B&B</option><option value="campground">Campground</option></select>
      </div>
      <div className="bg-white  rounded-xl border overflow-hidden">
        {loading ? (<div className="flex items-center justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-green-600" /></div>) : filteredPackages.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center"><Bed className="h-12 w-12 text-gray-500 mb-4" /><h3 className="font-semibold">No stays yet</h3><p className="text-sm text-gray-500 mt-1">Create your first accommodation.</p><Button onClick={() => setIsOpen(true)} className="mt-4"><Plus className="mr-2 h-4 w-4" /> New</Button></div>
        ) : (<div className="divide-y">{filteredPackages.map((p) => (<div key={p.id} className="p-4 flex items-start gap-4 hover:bg-gray-100"><div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center"><Bed className="h-5 w-5 text-green-600" /></div><div className="flex-1 min-w-0"><div className="flex items-center gap-2 mb-1"><h3 className="font-semibold truncate">{p.name}</h3>{getTypeBadge(p.type)}{!p.isAvailable && <Badge variant="outline">Unavailable</Badge>}</div><p className="text-sm text-gray-500">{p.location}</p><div className="flex items-center gap-4 mt-2 text-xs text-gray-500"><span className="font-medium">₦{p.pricePerNight.toLocaleString()}/night</span><span>•</span><span>{p.maxGuests} guests</span><span>•</span><span>{p.bedrooms}BR/{p.bathrooms}BA</span><span>•</span><span>{p.bookings} bookings</span><span>•</span><span>{p.rating}★ ({p.reviews})</span></div></div><div className="flex items-center gap-1"><Button size="sm" variant="ghost" onClick={() => handleToggleAvailability(p.id, p.isAvailable)}>{p.isAvailable ? <CalendarCheck className="h-4 w-4 text-orange-600" /> : <CalendarCheck className="h-4 w-4 text-green-600" />}</Button><Button size="sm" variant="ghost" onClick={() => openEdit(p)}><Edit className="h-4 w-4" /></Button><Button size="sm" variant="ghost" className="text-red-500" onClick={() => setDeleteConfirm({ id: p.id, name: p.name })}><Trash className="h-4 w-4" /></Button></div></div>))}</div>)}
      </div>
      <Dialog open={isOpen} onOpenChange={setIsOpen}><DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto"><DialogHeader><DialogTitle>{editingPackage ? "Edit" : "New"} Stay</DialogTitle></DialogHeader><div className="space-y-4 py-4"><div className="space-y-2"><Label>Name *</Label><Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="e.g., Oceanview Suite" /></div><div className="space-y-2"><Label>Description</Label><textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full px-3 py-2 rounded-lg border bg-white" rows={2} /></div><div className="grid grid-cols-2 gap-4"><div className="space-y-2"><Label>Type</Label><select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value as any })} className="w-full px-3 py-2 rounded-lg border bg-white"><option value="hotel">Hotel</option><option value="resort">Resort</option><option value="vacation_rental">Vacation Rental</option><option value="bnb">B&B</option><option value="campground">Campground</option></select></div><div className="space-y-2"><Label>Location *</Label><Input value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} placeholder="City, Country" /></div></div><div className="grid grid-cols-3 gap-4"><div className="space-y-2"><Label>Price/Night (₦)</Label><Input type="number" value={formData.pricePerNight} onChange={(e) => setFormData({ ...formData, pricePerNight: e.target.value })} placeholder="0" /></div><div className="space-y-2"><Label>Max Guests</Label><Input type="number" value={formData.maxGuests} onChange={(e) => setFormData({ ...formData, maxGuests: e.target.value })} placeholder="1" /></div><div className="space-y-2"><Label>Bedrooms</Label><Input type="number" value={formData.bedrooms} onChange={(e) => setFormData({ ...formData, bedrooms: e.target.value })} placeholder="1" /></div></div><div className="grid grid-cols-2 gap-4"><div className="space-y-2"><Label>Bathrooms</Label><Input type="number" value={formData.bathrooms} onChange={(e) => setFormData({ ...formData, bathrooms: e.target.value })} placeholder="1" /></div><div className="space-y-2"><label className="flex items-center gap-2 mt-6"><input type="checkbox" checked={formData.isAvailable} onChange={(e) => setFormData({ ...formData, isAvailable: e.target.checked })} /> Available</label></div></div><div className="space-y-2"><Label>Amenities (comma-separated)</Label><Input value={formData.amenities} onChange={(e) => setFormData({ ...formData, amenities: e.target.value })} placeholder="WiFi, Pool, Kitchen, AC" /></div><div className="space-y-2"><Label>Images (comma-separated URLs)</Label><Input value={formData.images} onChange={(e) => setFormData({ ...formData, images: e.target.value })} placeholder="https://..." /></div></div><DialogFooter><Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button><Button onClick={handleSave} disabled={isSubmitting}>{isSubmitting ? "Saving..." : editingPackage ? "Update" : "Create"}</Button></DialogFooter></DialogContent></Dialog>
      <ConfirmDialog isOpen={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Delete Stay" message={`Delete "${deleteConfirm?.name}"?`} confirmText="Delete" onConfirm={() => deleteConfirm && handleDelete(deleteConfirm.id)} />
    </div>
  );
}
