"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  Wrench,
  Plus,
  Clock,
  Spinner as Loader2,
  PencilSimple as Edit,
  Trash,
  CurrencyDollar as DollarSign,
  CheckCircle,
  X,
} from "@phosphor-icons/react/ssr";
import { logger, formatCurrency } from "@vayva/shared";
import { PageHeader } from "@/components/wix-style/PageHeader";
import { Button, Input } from "@vayva/ui";
import { Label } from "@/components/ui/label";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { apiJson } from "@/lib/api-client-shared";

interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number; // in minutes
  bufferTime: number; // in minutes
  category: string;
  isActive: boolean;
  maxParticipants?: number;
  requiresConfirmation: boolean;
}

export default function ServicesPage() {
  const [loading, setLoading] = useState(true);
  const [services, setServices] = useState<Service[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; name: string } | null>(null);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    duration: "60",
    bufferTime: "0",
    category: "",
    maxParticipants: "1",
    requiresConfirmation: false,
    isActive: true,
  });

  useEffect(() => {
    void fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const data = await apiJson<Service[]>("/api/services");
      setServices(data || []);
    } catch (error: unknown) {
      const _errMsg = error instanceof Error ? error.message : String(error);
      logger.error("[FETCH_SERVICES_ERROR]", {
        error: _errMsg,
        app: "merchant",
      });
      toast.error(_errMsg || "Could not load services");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    const priceNum = Number(formData.price);
    const durationNum = Number(formData.duration);
    if (!formData.name || isNaN(priceNum) || isNaN(durationNum)) {
      return toast.error("Please fill all required fields");
    }

    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        price: priceNum,
        duration: durationNum,
        bufferTime: Number(formData.bufferTime),
        maxParticipants: Number(formData.maxParticipants),
      };

      if (editingService) {
        await apiJson(`/api/services/${editingService.id}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
        toast.success("Service updated successfully");
      } else {
        await apiJson("/api/services", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        toast.success("Service added successfully");
      }

      setIsOpen(false);
      setEditingService(null);
      resetForm();
      void fetchServices();
    } catch (error: unknown) {
      const _errMsg = error instanceof Error ? error.message : String(error);
      logger.error("[SAVE_SERVICE_ERROR]", { error: _errMsg, app: "merchant" });
      toast.error(_errMsg || "Failed to save service");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await apiJson(`/api/services/${id}`, { method: "DELETE" });
      toast.success("Service deleted successfully");
      setDeleteConfirm(null);
      void fetchServices();
    } catch (error: unknown) {
      const _errMsg = error instanceof Error ? error.message : String(error);
      logger.error("[DELETE_SERVICE_ERROR]", { error: _errMsg, app: "merchant" });
      toast.error(_errMsg || "Failed to delete service");
    }
  };

  const openEdit = (service: Service) => {
    setEditingService(service);
    setFormData({
      name: service.name,
      description: service.description || "",
      price: String(service.price),
      duration: String(service.duration),
      bufferTime: String(service.bufferTime || 0),
      category: service.category || "",
      maxParticipants: String(service.maxParticipants || 1),
      requiresConfirmation: service.requiresConfirmation || false,
      isActive: service.isActive,
    });
    setIsOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: "",
      duration: "60",
      bufferTime: "0",
      category: "",
      maxParticipants: "1",
      requiresConfirmation: false,
      isActive: true,
    });
  };

  const filteredServices = services.filter((s) => {
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "all" || s.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const categories = [...new Set(services.map((s) => s.category).filter(Boolean))];
  const totalServices = services.length;
  const activeServices = services.filter((s) => s.isActive).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Services"
        description="Manage your service offerings and availability"
        primaryAction={{
          label: "Add Service",
          icon: "Plus",
          onClick: () => {
            setEditingService(null);
            resetForm();
            setIsOpen(true);
          }
        }}
      />

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-background/70 backdrop-blur-xl p-4 rounded-xl border">
          <p className="text-sm text-muted-foreground">Total Services</p>
          <p className="text-2xl font-bold">{totalServices}</p>
        </div>
        <div className="bg-background/70 backdrop-blur-xl p-4 rounded-xl border">
          <p className="text-sm text-muted-foreground">Active Services</p>
          <p className="text-2xl font-bold text-green-600">{activeServices}</p>
        </div>
        <div className="bg-background/70 backdrop-blur-xl p-4 rounded-xl border">
          <p className="text-sm text-muted-foreground">Categories</p>
          <p className="text-2xl font-bold">{categories.length}</p>
        </div>
        <div className="bg-background/70 backdrop-blur-xl p-4 rounded-xl border">
          <p className="text-sm text-muted-foreground">Avg Duration</p>
          <p className="text-2xl font-bold">
            {totalServices > 0
              ? Math.round(services.reduce((sum, s) => sum + s.duration, 0) / totalServices)
              : 0}
            min
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="Search services..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border bg-background"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-4 py-2 rounded-lg border bg-background"
        >
          <option value="all">All Categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {/* Services List */}
      <div className="bg-background/70 backdrop-blur-xl rounded-xl border overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center p-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredServices.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <Wrench className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="font-semibold">No services yet</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Add your first service to start taking bookings.
            </p>
            <Button onClick={() => setIsOpen(true)} className="mt-4">
              <Plus className="mr-2 h-4 w-4" />
              Add Service
            </Button>
          </div>
        ) : (
          <div className="divide-y">
            {filteredServices.map((service) => (
              <div key={service.id} className="p-4 hover:bg-background/50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Wrench className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{service.name}</h3>
                        {!service.isActive && (
                          <span className="px-2 py-0.5 rounded-full text-xs bg-gray-500 text-white">
                            Inactive
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{service.description}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <DollarSign className="h-3 w-3" />
                          {formatCurrency(service.price)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {service.duration} min
                        </span>
                        {service.bufferTime > 0 && (
                          <span className="flex items-center gap-1">
                            <X className="h-3 w-3" />
                            {service.bufferTime} min buffer
                          </span>
                        )}
                        {service.category && (
                          <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs">
                            {service.category}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="ghost" onClick={() => openEdit(service)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-destructive"
                      onClick={() => setDeleteConfirm({ id: service.id, name: service.name })}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingService ? "Edit Service" : "Add Service"}</DialogTitle>
            <DialogDescription>
              {editingService ? "Update service details" : "Enter details for a new service"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Service Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Haircut, Consultation, Massage"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description of the service"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Price *</Label>
                <Input
                  id="price"
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="duration">Duration (min) *</Label>
                <Input
                  id="duration"
                  type="number"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  placeholder="60"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bufferTime">Buffer Time (min)</Label>
                <Input
                  id="bufferTime"
                  type="number"
                  value={formData.bufferTime}
                  onChange={(e) => setFormData({ ...formData, bufferTime: e.target.value })}
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="e.g., Hair, Nails, Wellness"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="maxParticipants">Max Participants</Label>
                <Input
                  id="maxParticipants"
                  type="number"
                  value={formData.maxParticipants}
                  onChange={(e) => setFormData({ ...formData, maxParticipants: e.target.value })}
                  placeholder="1"
                />
              </div>
              <div className="space-y-2 flex items-center">
                <Label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.requiresConfirmation}
                    onChange={(e) => setFormData({ ...formData, requiresConfirmation: e.target.checked })}
                    className="rounded"
                  />
                  Requires confirmation
                </Label>
              </div>
            </div>
            <div className="space-y-2 flex items-center">
              <Label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="rounded"
                />
                Active (visible for booking)
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : editingService ? "Update" : "Add Service"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <ConfirmDialog
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={() => deleteConfirm && handleDelete(deleteConfirm.id)}
        title="Delete Service"
        message={`Are you sure you want to delete "${deleteConfirm?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />
    </div>
  );
}
