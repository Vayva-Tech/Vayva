"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Folder, Plus, PencilSimple as Edit, Trash, CheckCircle, Spinner as Loader2 } from "@phosphor-icons/react/ssr";
import { logger } from "@vayva/shared";
import { PageHeader } from "@/components/wix-style/PageHeader";
import { Button, Input, Badge } from "@vayva/ui";
import { Label } from "@/components/ui/label";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { apiJson } from "@/lib/api-client-shared";

interface Project {
  id: string;
  name: string;
  description: string;
  status: "planning" | "active" | "on_hold" | "completed" | "cancelled";
  priority: "low" | "medium" | "high" | "urgent";
  client?: string;
  budget?: number;
  startDate?: string;
  dueDate?: string;
  progress: number;
  team: string[];
  tasksCompleted: number;
  totalTasks: number;
  createdAt: string;
}

export default function ProjectsPage() {
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; name: string } | null>(null);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const [formData, setFormData] = useState({ name: "", description: "", status: "planning" as "planning" | "active" | "on_hold" | "completed" | "cancelled", priority: "medium" as "low" | "medium" | "high" | "urgent", client: "", budget: "", startDate: "", dueDate: "" });

  useEffect(() => { void fetchProjects(); }, []);

  const fetchProjects = async () => { try { setLoading(true); const data = await apiJson<Project[]>("/api/projects"); setProjects(data || []); } catch (error) { logger.error("[FETCH_PROJECTS_ERROR]", { error: error instanceof Error ? error.message : String(error), app: "merchant" }); toast.error("Could not load projects"); } finally { setLoading(false); } };

  const handleSave = async () => {
    if (!formData.name) return toast.error("Name is required");
    setIsSubmitting(true);
    try { const payload = { ...formData, budget: formData.budget ? Number(formData.budget) : null }; if (editingProject) { await apiJson(`/api/projects/${editingProject.id}`, { method: "PUT", body: JSON.stringify(payload) }); toast.success("Project updated"); } else { await apiJson("/api/projects", { method: "POST", body: JSON.stringify(payload) }); toast.success("Project created"); } setIsOpen(false); setEditingProject(null); resetForm(); void fetchProjects(); } catch { toast.error("Failed to save"); } finally { setIsSubmitting(false); }
  };

  const handleDelete = async (id: string) => { try { await apiJson(`/api/projects/${id}`, { method: "DELETE" }); toast.success("Deleted"); setDeleteConfirm(null); void fetchProjects(); } catch { toast.error("Failed to delete"); } };
  const handleComplete = async (id: string) => { try { await apiJson(`/api/projects/${id}/complete`, { method: "POST" }); toast.success("Marked complete"); void fetchProjects(); } catch { toast.error("Failed"); } };

  const openEdit = (p: Project) => { setEditingProject(p); setFormData({ name: p.name, description: p.description || "", status: p.status, priority: p.priority, client: p.client || "", budget: p.budget ? String(p.budget) : "", startDate: p.startDate ? p.startDate.split("T")[0] : "", dueDate: p.dueDate ? p.dueDate.split("T")[0] : "" }); setIsOpen(true); };
  const resetForm = () => setFormData({ name: "", description: "", status: "planning", priority: "medium", client: "", budget: "", startDate: "", dueDate: "" });

  const filteredProjects = projects.filter((p) => { const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()); const matchesStatus = statusFilter === "all" || p.status === statusFilter; return matchesSearch && matchesStatus; });

  const getStatusBadge = (status: string) => { switch (status) { case "active": return <Badge className="bg-green-600">Active</Badge>; case "planning": return <Badge variant="default">Planning</Badge>; case "on_hold": return <Badge className="bg-orange-600">On Hold</Badge>; case "completed": return <Badge className="bg-blue-600">Completed</Badge>; case "cancelled": return <Badge variant="outline">Cancelled</Badge>; default: return <Badge variant="default">{status}</Badge>; } };
  const getPriorityBadge = (priority: string) => { switch (priority) { case "urgent": return <Badge className="bg-red-600">Urgent</Badge>; case "high": return <Badge className="bg-orange-600">High</Badge>; case "medium": return <Badge className="bg-yellow-600">Medium</Badge>; case "low": return <Badge className="bg-blue-600">Low</Badge>; default: return <Badge variant="default">{priority}</Badge>; } };

  return (
    <div className="space-y-6">
      <PageHeader title="Projects" description="Manage client projects and work" primaryAction={{ label: "New Project", icon: "Plus", onClick: () => { setEditingProject(null); resetForm(); setIsOpen(true); } }} />
      <div className="flex gap-4 flex-wrap">
        <div className="flex-1 min-w-[200px]"><Input placeholder="Search projects..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} /></div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-4 py-2 rounded-lg border bg-background"><option value="all">All Status</option><option value="active">Active</option><option value="planning">Planning</option><option value="on_hold">On Hold</option><option value="completed">Completed</option><option value="cancelled">Cancelled</option></select>
      </div>
      <div className="bg-background/70 backdrop-blur-xl rounded-xl border overflow-hidden">
        {loading ? (<div className="flex items-center justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>) : filteredProjects.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center"><Folder className="h-12 w-12 text-muted-foreground mb-4" /><h3 className="font-semibold">No projects yet</h3><p className="text-sm text-muted-foreground mt-1">Create your first project.</p><Button onClick={() => setIsOpen(true)} className="mt-4"><Plus className="mr-2 h-4 w-4" /> New</Button></div>
        ) : (<div className="divide-y">{filteredProjects.map((p) => (<div key={p.id} className="p-4 flex items-start gap-4 hover:bg-muted/50"><div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center"><Folder className="h-5 w-5 text-primary" /></div><div className="flex-1 min-w-0"><div className="flex items-center gap-2 mb-1"><h3 className="font-semibold truncate">{p.name}</h3>{getStatusBadge(p.status)}{getPriorityBadge(p.priority)}</div><p className="text-sm text-muted-foreground">{p.description}</p><div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">{p.client && <span>{p.client}</span>}{p.budget && <><span>•</span><span>₦{p.budget.toLocaleString()}</span></>}<span>•</span><span>{p.progress}% complete</span><span>•</span><span>{p.tasksCompleted}/{p.totalTasks} tasks</span><span>•</span><span>{p.dueDate ? new Date(p.dueDate).toLocaleDateString() : "No due date"}</span></div><div className="mt-2 h-1 bg-muted rounded-full overflow-hidden"><div className="h-full bg-primary" style={{ width: `${p.progress}%` }} /></div></div><div className="flex items-center gap-1">{p.status !== "completed" && (<Button size="sm" variant="ghost" onClick={() => handleComplete(p.id)}><CheckCircle className="h-4 w-4 text-green-600" /></Button>)}<Button size="sm" variant="ghost" onClick={() => openEdit(p)}><Edit className="h-4 w-4" /></Button><Button size="sm" variant="ghost" className="text-destructive" onClick={() => setDeleteConfirm({ id: p.id, name: p.name })}><Trash className="h-4 w-4" /></Button></div></div>))}</div>)}
      </div>
      <Dialog open={isOpen} onOpenChange={setIsOpen}><DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto"><DialogHeader><DialogTitle>{editingProject ? "Edit" : "New"} Project</DialogTitle></DialogHeader><div className="space-y-4 py-4"><div className="space-y-2"><Label>Name *</Label><Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Project name" /></div><div className="space-y-2"><Label>Description</Label><textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full px-3 py-2 rounded-lg border bg-background" rows={2} /></div><div className="grid grid-cols-2 gap-4"><div className="space-y-2"><Label>Status</Label><select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value as any })} className="w-full px-3 py-2 rounded-lg border bg-background"><option value="planning">Planning</option><option value="active">Active</option><option value="on_hold">On Hold</option><option value="completed">Completed</option><option value="cancelled">Cancelled</option></select></div><div className="space-y-2"><Label>Priority</Label><select value={formData.priority} onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })} className="w-full px-3 py-2 rounded-lg border bg-background"><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="urgent">Urgent</option></select></div></div><div className="grid grid-cols-2 gap-4"><div className="space-y-2"><Label>Client</Label><Input value={formData.client} onChange={(e) => setFormData({ ...formData, client: e.target.value })} placeholder="Client name" /></div><div className="space-y-2"><Label>Budget (₦)</Label><Input type="number" value={formData.budget} onChange={(e) => setFormData({ ...formData, budget: e.target.value })} placeholder="0" /></div></div><div className="grid grid-cols-2 gap-4"><div className="space-y-2"><Label>Start Date</Label><Input type="date" value={formData.startDate} onChange={(e) => setFormData({ ...formData, startDate: e.target.value })} /></div><div className="space-y-2"><Label>Due Date</Label><Input type="date" value={formData.dueDate} onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })} /></div></div></div><DialogFooter><Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button><Button onClick={handleSave} disabled={isSubmitting}>{isSubmitting ? "Saving..." : editingProject ? "Update" : "Create"}</Button></DialogFooter></DialogContent></Dialog>
      <ConfirmDialog isOpen={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Delete Project" message={`Delete "${deleteConfirm?.name}"?`} confirmText="Delete" onConfirm={() => deleteConfirm && handleDelete(deleteConfirm.id)} />
    </div>
  );
}
