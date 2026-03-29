"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { FileText, Plus, PencilSimple as Edit, Trash, CheckCircle, XCircle, Spinner as Loader2 } from "@phosphor-icons/react/ssr";
import { logger } from "@vayva/shared";
import { PageHeader } from "@/components/wix-style/PageHeader";
import { Button, Input, Badge } from "@vayva/ui";
import { Label } from "@/components/ui/label";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { apiJson } from "@/lib/api-client-shared";

interface Application {
  id: string;
  candidateName: string;
  candidateEmail: string;
  position: string;
  status: "new" | "reviewing" | "interview" | "offered" | "rejected" | "hired";
  resumeUrl?: string;
  coverLetter?: string;
  appliedAt: string;
  updatedAt: string;
  notes?: string;
  source: string;
  rating?: number;
}

export default function ApplicationsPage() {
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState<Application[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; name: string } | null>(null);
  const [editingApplication, setEditingApplication] = useState<Application | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const [formData, setFormData] = useState({
    candidateName: "",
    candidateEmail: "",
    position: "",
    status: "new" as "new" | "reviewing" | "interview" | "offered" | "rejected" | "hired",
    coverLetter: "",
    notes: "",
    source: "direct",
    rating: "",
  });

  useEffect(() => { void fetchApplications(); }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const data = await apiJson<Application[]>("/hr/applications");
      setApplications(data || []);
    } catch (error) {
      logger.error("[FETCH_APPLICATIONS_ERROR]", { error: error instanceof Error ? error.message : String(error), app: "merchant" });
      toast.error("Could not load applications");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.candidateName || !formData.position) {
      return toast.error("Candidate name and position are required");
    }
    setIsSubmitting(true);
    try {
      const payload = { ...formData, rating: formData.rating ? Number(formData.rating) : undefined };
      if (editingApplication) {
        await apiJson(`/api/hr/applications/${editingApplication.id}`, { method: "PUT", body: JSON.stringify(payload) });
        toast.success("Application updated");
      } else {
        await apiJson("/hr/applications", { method: "POST", body: JSON.stringify(payload) });
        toast.success("Application created");
      }
      setIsOpen(false);
      setEditingApplication(null);
      resetForm();
      void fetchApplications();
    } catch (error) {
      toast.error("Failed to save application");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await apiJson(`/api/hr/applications/${id}`, { method: "DELETE" });
      toast.success("Application deleted");
      setDeleteConfirm(null);
      void fetchApplications();
    } catch (error) {
      toast.error("Failed to delete application");
    }
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      await apiJson(`/api/hr/applications/${id}/status`, { method: "POST", body: JSON.stringify({ status }) });
      toast.success("Status updated");
      void fetchApplications();
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const openEdit = (application: Application) => {
    setEditingApplication(application);
    setFormData({
      candidateName: application.candidateName,
      candidateEmail: application.candidateEmail || "",
      position: application.position,
      status: application.status,
      coverLetter: application.coverLetter || "",
      notes: application.notes || "",
      source: application.source || "direct",
      rating: application.rating ? String(application.rating) : "",
    });
    setIsOpen(true);
  };

  const resetForm = () => {
    setFormData({ candidateName: "", candidateEmail: "", position: "", status: "new", coverLetter: "", notes: "", source: "direct", rating: "" });
  };

  const filteredApplications = applications.filter((app) => {
    const matchesSearch = app.candidateName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          app.position.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || app.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "new": return <Badge className="bg-blue-600">New</Badge>;
      case "reviewing": return <Badge className="bg-yellow-600">Reviewing</Badge>;
      case "interview": return <Badge className="bg-purple-600">Interview</Badge>;
      case "offered": return <Badge className="bg-orange-600">Offered</Badge>;
      case "hired": return <Badge className="bg-green-600">Hired</Badge>;
      case "rejected": return <Badge variant="outline">Rejected</Badge>;
      default: return <Badge variant="default">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Job Applications" description="Track and manage candidate applications" primaryAction={{
        label: "New Application",
        icon: "Plus",
        onClick: () => { setEditingApplication(null); resetForm(); setIsOpen(true); }
      }} />

      <div className="flex gap-4 flex-wrap">
        <div className="flex-1 min-w-[200px]"><Input placeholder="Search candidates or positions..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} /></div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-4 py-2 rounded-lg border bg-white">
          <option value="all">All Status</option>
          <option value="new">New</option>
          <option value="reviewing">Reviewing</option>
          <option value="interview">Interview</option>
          <option value="offered">Offered</option>
          <option value="hired">Hired</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      <div className="bg-white  rounded-xl border overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-green-600" /></div>
        ) : filteredApplications.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <FileText className="h-12 w-12 text-gray-500 mb-4" />
            <h3 className="font-semibold">No applications yet</h3>
            <p className="text-sm text-gray-500 mt-1">Track your first job application.</p>
            <Button onClick={() => setIsOpen(true)} className="mt-4"><Plus className="mr-2 h-4 w-4" /> New Application</Button>
          </div>
        ) : (
          <div className="divide-y">
            {filteredApplications.map((app) => (
              <div key={app.id} className="p-4 flex items-start gap-4 hover:bg-gray-100">
                <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center"><FileText className="h-5 w-5 text-green-600" /></div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold truncate">{app.candidateName}</h3>
                    {getStatusBadge(app.status)}
                    <Badge variant="outline">{app.source}</Badge>
                  </div>
                  <p className="text-sm text-gray-500">{app.position}</p>
                  {app.candidateEmail && <p className="text-xs text-gray-500 mt-1">{app.candidateEmail}</p>}
                  {app.notes && <p className="text-sm text-gray-500 mt-1 italic">&quot;{app.notes.slice(0, 100)}&quot;</p>}
                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                    <span>Applied {new Date(app.appliedAt).toLocaleDateString()}</span>
                    {app.rating && <><span>•</span><span>Rating: {app.rating}/5</span></>}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {app.status !== "hired" && app.status !== "rejected" && (
                    <Button size="sm" variant="ghost" onClick={() => handleUpdateStatus(app.id, app.status === "offered" ? "hired" : "interview")}>
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    </Button>
                  )}
                  {app.status !== "rejected" && (
                    <Button size="sm" variant="ghost" onClick={() => handleUpdateStatus(app.id, "rejected")}>
                      <XCircle className="h-4 w-4 text-red-600" />
                    </Button>
                  )}
                  <Button size="sm" variant="ghost" onClick={() => openEdit(app)}><Edit className="h-4 w-4" /></Button>
                  <Button size="sm" variant="ghost" className="text-red-500" onClick={() => setDeleteConfirm({ id: app.id, name: app.candidateName })}><Trash className="h-4 w-4" /></Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingApplication ? "Edit Application" : "New Application"}</DialogTitle>
            <DialogDescription>{editingApplication ? "Update application details" : "Create a new job application"}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Candidate Name *</Label><Input value={formData.candidateName} onChange={(e) => setFormData({ ...formData, candidateName: e.target.value })} placeholder="Full name" /></div>
              <div className="space-y-2"><Label>Email</Label><Input value={formData.candidateEmail} onChange={(e) => setFormData({ ...formData, candidateEmail: e.target.value })} placeholder="email@example.com" /></div>
            </div>
            <div className="space-y-2"><Label>Position *</Label><Input value={formData.position} onChange={(e) => setFormData({ ...formData, position: e.target.value })} placeholder="Job position" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Status</Label><select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value as any })} className="w-full px-3 py-2 rounded-lg border bg-white"><option value="new">New</option><option value="reviewing">Reviewing</option><option value="interview">Interview</option><option value="offered">Offered</option><option value="hired">Hired</option><option value="rejected">Rejected</option></select></div>
              <div className="space-y-2"><Label>Source</Label><select value={formData.source} onChange={(e) => setFormData({ ...formData, source: e.target.value })} className="w-full px-3 py-2 rounded-lg border bg-white"><option value="direct">Direct</option><option value="referral">Referral</option><option value="linkedin">LinkedIn</option><option value="indeed">Indeed</option><option value="other">Other</option></select></div>
            </div>
            <div className="space-y-2"><Label>Cover Letter</Label><textarea value={formData.coverLetter} onChange={(e) => setFormData({ ...formData, coverLetter: e.target.value })} placeholder="Cover letter..." className="w-full px-3 py-2 rounded-lg border bg-white" rows={3} /></div>
            <div className="space-y-2"><Label>Internal Notes</Label><textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} placeholder="Notes about the candidate..." className="w-full px-3 py-2 rounded-lg border bg-white" rows={2} /></div>
            <div className="space-y-2"><Label>Rating (1-5)</Label><Input type="number" min="1" max="5" value={formData.rating} onChange={(e) => setFormData({ ...formData, rating: e.target.value })} placeholder="Rating" /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button><Button onClick={handleSave} disabled={isSubmitting}>{isSubmitting ? "Saving..." : editingApplication ? "Update" : "Create"}</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog isOpen={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Delete Application" message={`Delete application for "${deleteConfirm?.name}"?`} confirmText="Delete" onConfirm={() => deleteConfirm && handleDelete(deleteConfirm.id)} />
    </div>
  );
}

