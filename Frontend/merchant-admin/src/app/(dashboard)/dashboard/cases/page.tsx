"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Briefcase, Plus, PencilSimple as Edit, Trash, CheckCircle, Spinner as Loader2 } from "@phosphor-icons/react/ssr";
import { logger } from "@vayva/shared";
import { PageHeader } from "@/components/wix-style/PageHeader";
import { Button, Input, Badge } from "@vayva/ui";
import { Label } from "@/components/ui/label";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { apiJson } from "@/lib/api-client-shared";

interface SupportCase {
  id: string;
  caseNumber: string;
  title: string;
  description: string;
  status: "open" | "in_progress" | "resolved" | "closed";
  priority: "low" | "medium" | "high" | "urgent";
  customerName: string;
  customerEmail: string;
  assignedTo?: string;
  category: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
}

export default function CasesPage() {
  const [loading, setLoading] = useState(true);
  const [cases, setCases] = useState<SupportCase[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; title: string } | null>(null);
  const [editingCase, setEditingCase] = useState<SupportCase | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    status: "open" as "open" | "in_progress" | "resolved" | "closed",
    priority: "medium" as "low" | "medium" | "high" | "urgent",
    customerName: "",
    customerEmail: "",
    assignedTo: "",
    category: "general",
    tags: "",
  });

  useEffect(() => { void fetchCases(); }, []);

  const fetchCases = async () => {
    try {
      setLoading(true);
      const data = await apiJson<SupportCase[]>("/api/support/cases");
      setCases(data || []);
    } catch (error) {
      logger.error("[FETCH_CASES_ERROR]", { error: error instanceof Error ? error.message : String(error), app: "merchant" });
      toast.error("Could not load cases");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.title || !formData.customerName) {
      return toast.error("Title and customer name are required");
    }
    setIsSubmitting(true);
    try {
      const payload = { ...formData, tags: formData.tags.split(",").map(t => t.trim()).filter(Boolean) };
      if (editingCase) {
        await apiJson(`/api/support/cases/${editingCase.id}`, { method: "PUT", body: JSON.stringify(payload) });
        toast.success("Case updated");
      } else {
        await apiJson("/api/support/cases", { method: "POST", body: JSON.stringify(payload) });
        toast.success("Case created");
      }
      setIsOpen(false);
      setEditingCase(null);
      resetForm();
      void fetchCases();
    } catch (error) {
      toast.error("Failed to save case");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await apiJson(`/api/support/cases/${id}`, { method: "DELETE" });
      toast.success("Case deleted");
      setDeleteConfirm(null);
      void fetchCases();
    } catch (error) {
      toast.error("Failed to delete case");
    }
  };

  const handleResolve = async (id: string) => {
    try {
      await apiJson(`/api/support/cases/${id}/resolve`, { method: "POST" });
      toast.success("Case resolved");
      void fetchCases();
    } catch (error) {
      toast.error("Failed to resolve case");
    }
  };

  const openEdit = (c: SupportCase) => {
    setEditingCase(c);
    setFormData({
      title: c.title,
      description: c.description,
      status: c.status,
      priority: c.priority,
      customerName: c.customerName,
      customerEmail: c.customerEmail || "",
      assignedTo: c.assignedTo || "",
      category: c.category,
      tags: c.tags?.join(", ") || "",
    });
    setIsOpen(true);
  };

  const resetForm = () => {
    setFormData({ title: "", description: "", status: "open", priority: "medium", customerName: "", customerEmail: "", assignedTo: "", category: "general", tags: "" });
  };

  const filteredCases = cases.filter((c) => {
    const matchesSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          c.caseNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          c.customerName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || c.status === statusFilter;
    const matchesPriority = priorityFilter === "all" || c.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "open": return <Badge className="bg-blue-600">Open</Badge>;
      case "in_progress": return <Badge className="bg-yellow-600">In Progress</Badge>;
      case "resolved": return <Badge className="bg-green-600">Resolved</Badge>;
      case "closed": return <Badge variant="outline">Closed</Badge>;
      default: return <Badge variant="default">{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "urgent": return <Badge className="bg-red-600">Urgent</Badge>;
      case "high": return <Badge className="bg-orange-600">High</Badge>;
      case "medium": return <Badge variant="outline">Medium</Badge>;
      case "low": return <Badge variant="outline" className="text-gray-500">Low</Badge>;
      default: return <Badge variant="default">{priority}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Support Cases" description="Manage customer support cases and tickets" primaryAction={{
        label: "New Case",
        icon: "Plus",
        onClick: () => { setEditingCase(null); resetForm(); setIsOpen(true); }
      }} />

      <div className="flex gap-4 flex-wrap">
        <div className="flex-1 min-w-[200px]"><Input placeholder="Search cases..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} /></div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-4 py-2 rounded-lg border bg-background">
          <option value="all">All Status</option>
          <option value="open">Open</option>
          <option value="in_progress">In Progress</option>
          <option value="resolved">Resolved</option>
          <option value="closed">Closed</option>
        </select>
        <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)} className="px-4 py-2 rounded-lg border bg-background">
          <option value="all">All Priorities</option>
          <option value="urgent">Urgent</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </div>

      <div className="bg-background/70 backdrop-blur-xl rounded-xl border overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        ) : filteredCases.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <Briefcase className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="font-semibold">No cases yet</h3>
            <p className="text-sm text-muted-foreground mt-1">Create your first support case.</p>
            <Button onClick={() => setIsOpen(true)} className="mt-4"><Plus className="mr-2 h-4 w-4" /> New Case</Button>
          </div>
        ) : (
          <div className="divide-y">
            {filteredCases.map((c) => (
              <div key={c.id} className="p-4 flex items-start gap-4 hover:bg-muted/50">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center"><Briefcase className="h-5 w-5 text-primary" /></div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono text-muted-foreground">{c.caseNumber}</span>
                    <h3 className="font-semibold truncate">{c.title}</h3>
                    {getStatusBadge(c.status)}
                    {getPriorityBadge(c.priority)}
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-1">{c.description}</p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                    <span>{c.customerName}</span>
                    <span>•</span>
                    <span>{c.category}</span>
                    {c.assignedTo && <><span>•</span><span>Assigned: {c.assignedTo}</span></>}
                    {c.tags.length > 0 && <><span>•</span><span>{c.tags.join(", ")}</span></>}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {(c.status === "open" || c.status === "in_progress") && (
                    <Button size="sm" variant="ghost" onClick={() => handleResolve(c.id)}><CheckCircle className="h-4 w-4 text-green-600" /></Button>
                  )}
                  <Button size="sm" variant="ghost" onClick={() => openEdit(c)}><Edit className="h-4 w-4" /></Button>
                  <Button size="sm" variant="ghost" className="text-destructive" onClick={() => setDeleteConfirm({ id: c.id, title: c.title })}><Trash className="h-4 w-4" /></Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingCase ? "Edit Case" : "New Case"}</DialogTitle>
            <DialogDescription>{editingCase ? "Update case details" : "Create a new support case"}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Title *</Label><Input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="Case title" /></div>
              <div className="space-y-2"><Label>Customer Name *</Label><Input value={formData.customerName} onChange={(e) => setFormData({ ...formData, customerName: e.target.value })} placeholder="Customer name" /></div>
            </div>
            <div className="space-y-2"><Label>Customer Email</Label><Input value={formData.customerEmail} onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })} placeholder="email@example.com" /></div>
            <div className="space-y-2"><Label>Description</Label><textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Case description..." className="w-full px-3 py-2 rounded-lg border bg-background" rows={3} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Status</Label><select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value as any })} className="w-full px-3 py-2 rounded-lg border bg-background"><option value="open">Open</option><option value="in_progress">In Progress</option><option value="resolved">Resolved</option><option value="closed">Closed</option></select></div>
              <div className="space-y-2"><Label>Priority</Label><select value={formData.priority} onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })} className="w-full px-3 py-2 rounded-lg border bg-background"><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="urgent">Urgent</option></select></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Category</Label><select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="w-full px-3 py-2 rounded-lg border bg-background"><option value="general">General</option><option value="billing">Billing</option><option value="technical">Technical</option><option value="feature">Feature Request</option><option value="bug">Bug Report</option></select></div>
              <div className="space-y-2"><Label>Assigned To</Label><Input value={formData.assignedTo} onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })} placeholder="Agent name" /></div>
            </div>
            <div className="space-y-2"><Label>Tags (comma-separated)</Label><Input value={formData.tags} onChange={(e) => setFormData({ ...formData, tags: e.target.value })} placeholder="tag1, tag2, tag3" /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button><Button onClick={handleSave} disabled={isSubmitting}>{isSubmitting ? "Saving..." : editingCase ? "Update" : "Create"}</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog isOpen={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Delete Case" message={`Delete case "${deleteConfirm?.title}"?`} confirmText="Delete" onConfirm={() => deleteConfirm && handleDelete(deleteConfirm.id)} />
    </div>
  );
}

