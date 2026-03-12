"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { SquaresFour, Plus, PencilSimple as Edit, Trash, Power, Spinner as Loader2 } from "@phosphor-icons/react/ssr";
import { logger } from "@vayva/shared";
import { PageHeader } from "@/components/wix-style/PageHeader";
import { Button, Input, Badge } from "@vayva/ui";
import { Label } from "@/components/ui/label";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { apiJson } from "@/lib/api-client-shared";

interface FeatureModule {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: "core" | "commerce" | "content" | "marketing" | "analytics";
  isEnabled: boolean;
  isRequired: boolean;
  version: string;
  dependencies: string[];
  settingsUrl?: string;
  installedAt: string;
}

export default function ModulesPage() {
  const [loading, setLoading] = useState(true);
  const [modules, setModules] = useState<FeatureModule[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; name: string } | null>(null);
  const [editingModule, setEditingModule] = useState<FeatureModule | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    icon: "",
    category: "core" as "core" | "commerce" | "content" | "marketing" | "analytics",
    isEnabled: true,
    isRequired: false,
    version: "1.0.0",
    dependencies: "",
    settingsUrl: "",
  });

  useEffect(() => { void fetchModules(); }, []);

  const fetchModules = async () => { try { setLoading(true); const data = await apiJson<FeatureModule[]>("/api/modules"); setModules(data || []); } catch (error) { logger.error("[FETCH_MODULES_ERROR]", { error: error instanceof Error ? error.message : String(error), app: "merchant" }); toast.error("Could not load modules"); } finally { setLoading(false); } };

  const handleSave = async () => {
    if (!formData.name) return toast.error("Name is required");
    setIsSubmitting(true);
    try {
      const payload = { ...formData, dependencies: formData.dependencies.split(",").map(d => d.trim()).filter(Boolean) };
      if (editingModule) { await apiJson(`/api/modules/${editingModule.id}`, { method: "PUT", body: JSON.stringify(payload) }); toast.success("Module updated"); }
      else { await apiJson("/api/modules", { method: "POST", body: JSON.stringify(payload) }); toast.success("Module created"); }
      setIsOpen(false); setEditingModule(null); resetForm(); void fetchModules();
    } catch { toast.error("Failed to save"); } finally { setIsSubmitting(false); }
  };

  const handleDelete = async (id: string) => { try { await apiJson(`/api/modules/${id}`, { method: "DELETE" }); toast.success("Deleted"); setDeleteConfirm(null); void fetchModules(); } catch { toast.error("Failed to delete"); } };
  const handleToggle = async (id: string, isEnabled: boolean) => { try { await apiJson(`/api/modules/${id}/toggle`, { method: "POST", body: JSON.stringify({ isEnabled: !isEnabled }) }); toast.success(isEnabled ? "Disabled" : "Enabled"); void fetchModules(); } catch { toast.error("Failed to toggle"); } };

  const openEdit = (m: FeatureModule) => { setEditingModule(m); setFormData({ name: m.name, description: m.description || "", icon: m.icon || "", category: m.category, isEnabled: m.isEnabled, isRequired: m.isRequired, version: m.version, dependencies: m.dependencies?.join(", ") || "", settingsUrl: m.settingsUrl || "" }); setIsOpen(true); };
  const resetForm = () => setFormData({ name: "", description: "", icon: "", category: "core", isEnabled: true, isRequired: false, version: "1.0.0", dependencies: "", settingsUrl: "" });

  const filteredModules = modules.filter((m) => { const matchesSearch = m.name.toLowerCase().includes(searchQuery.toLowerCase()); const matchesCategory = categoryFilter === "all" || m.category === categoryFilter; return matchesSearch && matchesCategory; });

  const getCategoryBadge = (category: string) => { switch (category) { case "core": return <Badge className="bg-blue-600">Core</Badge>; case "commerce": return <Badge className="bg-green-600">Commerce</Badge>; case "content": return <Badge className="bg-purple-600">Content</Badge>; case "marketing": return <Badge className="bg-orange-600">Marketing</Badge>; case "analytics": return <Badge className="bg-teal-600">Analytics</Badge>; default: return <Badge variant="default">{category}</Badge>; } };

  return (
    <div className="space-y-6">
      <PageHeader title="Feature Modules" description="Manage platform modules and extensions" primaryAction={{ label: "New Module", icon: "Plus", onClick: () => { setEditingModule(null); resetForm(); setIsOpen(true); } }} />
      <div className="flex gap-4 flex-wrap">
        <div className="flex-1 min-w-[200px]"><Input placeholder="Search modules..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} /></div>
        <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="px-4 py-2 rounded-lg border bg-background"><option value="all">All Categories</option><option value="core">Core</option><option value="commerce">Commerce</option><option value="content">Content</option><option value="marketing">Marketing</option><option value="analytics">Analytics</option></select>
      </div>
      <div className="bg-background/70 backdrop-blur-xl rounded-xl border overflow-hidden">
        {loading ? (<div className="flex items-center justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>) : filteredModules.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center"><SquaresFour className="h-12 w-12 text-muted-foreground mb-4" /><h3 className="font-semibold">No modules yet</h3><p className="text-sm text-muted-foreground mt-1">Create your first feature module.</p><Button onClick={() => setIsOpen(true)} className="mt-4"><Plus className="mr-2 h-4 w-4" /> New</Button></div>
        ) : (<div className="divide-y">{filteredModules.map((m) => (<div key={m.id} className="p-4 flex items-start gap-4 hover:bg-muted/50"><div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center"><SquaresFour className="h-5 w-5 text-primary" /></div><div className="flex-1 min-w-0"><div className="flex items-center gap-2 mb-1"><h3 className="font-semibold truncate">{m.name}</h3>{getCategoryBadge(m.category)}{!m.isEnabled && <Badge variant="outline">Disabled</Badge>}{m.isRequired && <Badge className="bg-red-600">Required</Badge>}</div><p className="text-sm text-muted-foreground">{m.description}</p><div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground"><span>v{m.version}</span><span>•</span><span>{new Date(m.installedAt).toLocaleDateString()}</span>{m.dependencies.length > 0 && <><span>•</span><span>Deps: {m.dependencies.join(", ")}</span></>}</div></div><div className="flex items-center gap-1">{!m.isRequired && (<Button size="sm" variant="ghost" onClick={() => handleToggle(m.id, m.isEnabled)}>{m.isEnabled ? <Power className="h-4 w-4 text-orange-600" /> : <Power className="h-4 w-4 text-green-600" />}</Button>)}<Button size="sm" variant="ghost" onClick={() => openEdit(m)}><Edit className="h-4 w-4" /></Button>{!m.isRequired && <Button size="sm" variant="ghost" className="text-destructive" onClick={() => setDeleteConfirm({ id: m.id, name: m.name })}><Trash className="h-4 w-4" /></Button>}</div></div>))}</div>)}
      </div>
      <Dialog open={isOpen} onOpenChange={setIsOpen}><DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto"><DialogHeader><DialogTitle>{editingModule ? "Edit" : "New"} Module</DialogTitle></DialogHeader><div className="space-y-4 py-4"><div className="space-y-2"><Label>Name *</Label><Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="e.g., Inventory Manager" /></div><div className="space-y-2"><Label>Description</Label><textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full px-3 py-2 rounded-lg border bg-background" rows={2} /></div><div className="grid grid-cols-2 gap-4"><div className="space-y-2"><Label>Category</Label><select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value as any })} className="w-full px-3 py-2 rounded-lg border bg-background"><option value="core">Core</option><option value="commerce">Commerce</option><option value="content">Content</option><option value="marketing">Marketing</option><option value="analytics">Analytics</option></select></div><div className="space-y-2"><Label>Version</Label><Input value={formData.version} onChange={(e) => setFormData({ ...formData, version: e.target.value })} placeholder="1.0.0" /></div></div><div className="space-y-2"><Label>Icon</Label><Input value={formData.icon} onChange={(e) => setFormData({ ...formData, icon: e.target.value })} placeholder="Icon name" /></div><div className="space-y-2"><Label>Dependencies (comma-separated)</Label><Input value={formData.dependencies} onChange={(e) => setFormData({ ...formData, dependencies: e.target.value })} placeholder="module1, module2" /></div><div className="space-y-2"><Label>Settings URL</Label><Input value={formData.settingsUrl} onChange={(e) => setFormData({ ...formData, settingsUrl: e.target.value })} placeholder="/dashboard/settings/..." /></div><div className="flex items-center gap-4"><label className="flex items-center gap-2"><input type="checkbox" checked={formData.isEnabled} onChange={(e) => setFormData({ ...formData, isEnabled: e.target.checked })} /> Enabled</label><label className="flex items-center gap-2"><input type="checkbox" checked={formData.isRequired} onChange={(e) => setFormData({ ...formData, isRequired: e.target.checked })} /> Required</label></div></div><DialogFooter><Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button><Button onClick={handleSave} disabled={isSubmitting}>{isSubmitting ? "Saving..." : editingModule ? "Update" : "Create"}</Button></DialogFooter></DialogContent></Dialog>
      <ConfirmDialog isOpen={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Delete Module" message={`Delete "${deleteConfirm?.name}"?`} confirmText="Delete" onConfirm={() => deleteConfirm && handleDelete(deleteConfirm.id)} />
    </div>
  );
}
