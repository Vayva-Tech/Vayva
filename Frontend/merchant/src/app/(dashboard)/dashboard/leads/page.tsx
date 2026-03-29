"use client";

import { logger } from "@vayva/shared";
import { useState, useEffect } from "react";
import { Button } from "@vayva/ui";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Plus,
  User,
  Phone,
  EnvelopeSimple as Mail,
  Clock,
  Tag,
} from "@phosphor-icons/react/ssr";
import { format } from "date-fns";
import { toast } from "sonner";

interface Lead {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  notes: string | null;
  status: string;
  source: string;
  tags: string[];
  createdAt: string;
}

import { DashboardPageShell } from "@/components/layout/DashboardPageShell";
import { StatusBadge } from "@/components/shared";
import { apiJson } from "@/lib/api-client-shared";

interface LeadsResponse {
  leads: Lead[];
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    notes: "",
    source: "manual",
  });

  useEffect(() => {
    const controller = new AbortController();
    void fetchLeads(controller);
    return () => controller.abort();
  }, [filter]);

  const fetchLeads = async (controller?: AbortController) => {
    try {
      setLoading(true);
      const params = filter !== "all" ? `?status=${filter}` : "";
      const data = await apiJson<LeadsResponse>(`/api/leads${params}`, {
        signal: controller?.signal,
      });
      if (data) {
        setLeads(data.leads || []);
      }
    } catch (error: unknown) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      const _errMsg = error instanceof Error ? error.message : String(error);
      logger.warn("[FETCH_LEADS_ERROR]", {
        error: _errMsg,
        filter,
        app: "merchant",
      });
      toast.error(_errMsg || "Failed to load leads");
    } finally {
      setLoading(false);
    }
  };

  const updateLeadStatus = async (id: string, status: string) => {
    try {
      await apiJson<{ success: boolean }>(`/api/leads/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      toast.success(`Lead marked as ${status}`);
      void fetchLeads();
    } catch (error: unknown) {
      const _errMsg = error instanceof Error ? error.message : String(error);
      logger.error("[UPDATE_LEAD_STATUS_ERROR]", {
        error: _errMsg,
        leadId: id,
        status,
        app: "merchant",
      });
      toast.error("Failed to update lead status");
    }
  };
  const handleAddLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error("Name is required");
      return;
    }

    setIsSubmitting(true);
    try {
      const newLead = await apiJson<Lead>("/leads", {
        method: "POST",
        body: JSON.stringify({
          ...formData,
          status: "new",
        }),
      });
      
      setLeads([newLead, ...leads]);
      toast.success("Lead added successfully");
      setShowAddModal(false);
      setFormData({ name: "", email: "", phone: "", notes: "", source: "manual" });
    } catch (error: unknown) {
      const _errMsg = error instanceof Error ? error.message : String(error);
      logger.error("[ADD_LEAD_ERROR]", { error: _errMsg, app: "merchant" });
      toast.error("Failed to add lead");
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <DashboardPageShell
      title="Leads"
      description="Track and manage potential customers"
      actions={
        <Button className="bg-green-500 text-white" onClick={() => setShowAddModal(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add Lead
        </Button>
      }
    >

      <div className="flex gap-2 flex-wrap">
        {["all", "new", "contacted", "qualified", "converted", "lost"].map(
          (s) => (
            <Button
              key={s}
              variant={filter === s ? "primary" : "outline"}
              size="sm"
              onClick={() => setFilter(s)}
            >
              {s === "all" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
            </Button>
          ),
        )}
      </div>

      <div className="bg-white  rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center" aria-live="polite" role="status">
            <div className="animate-spin h-8 w-8 border-2 border-gray-200 border-t-text-green-600 rounded-full mx-auto" />
            <span className="sr-only">Loading leads...</span>
          </div>
        ) : leads.length === 0 ? (
          <div className="p-12 text-center">
            <User className="h-12 w-12 text-gray-500 mx-auto mb-4" />
            <h3 className="font-semibold text-gray-900">No leads yet</h3>
            <p className="text-gray-500 text-sm mt-1">
              Add your first lead to start tracking prospects.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border/40">
            {leads.map((lead) => (
              <div
                key={lead.id}
                className="p-4 hover:bg-white transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
                      <User className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900">
                          {lead.name || "Unknown"}
                        </h3>
                        <StatusBadge status={lead.status} />
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                        {lead.email && (
                          <span className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {lead.email}
                          </span>
                        )}
                        {lead.phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {lead.phone}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                        <Clock className="h-3 w-3" />
                        {format(new Date(lead.createdAt), "MMM d, yyyy")}
                        {lead.source && (
                          <span className="flex items-center gap-1 ml-2">
                            <Tag className="h-3 w-3" />
                            {lead.source}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {lead.status === "new" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateLeadStatus(lead.id, "contacted")}
                      >
                        Mark Contacted
                      </Button>
                    )}
                    {lead.status === "contacted" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateLeadStatus(lead.id, "qualified")}
                      >
                        Qualify
                      </Button>
                    )}
                    {lead.status === "qualified" && (
                      <>
                        <Button
                          size="sm"
                          className="bg-green-500 text-white"
                          onClick={() => updateLeadStatus(lead.id, "converted")}
                        >
                          Convert
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => updateLeadStatus(lead.id, "lost")}
                        >
                          Lost
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Lead Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Lead</DialogTitle>
            <DialogDescription>
              Enter the details of your new prospect.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddLead} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="John Doe"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="john@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+234 800 000 0000"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="source">Source</Label>
              <Input
                id="source"
                value={formData.source}
                onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                placeholder="Website, Referral, Social Media, etc."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Input
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Any additional information..."
              />
            </div>
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => setShowAddModal(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-green-500 text-white"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Adding..." : "Add Lead"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </DashboardPageShell>
  );
}
