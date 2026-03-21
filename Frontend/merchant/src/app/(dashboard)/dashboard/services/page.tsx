// @ts-nocheck
"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Wrench, Plus, Clock, PencilSimple as Edit, Trash, CurrencyDollar as DollarSign, CheckCircle, X, ClockCountdown } from "@phosphor-icons/react";
import { logger, formatCurrency } from "@vayva/shared";
import { Button, Input } from "@vayva/ui";
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

  // Calculate metrics
  const totalServices = services.length;
  const activeServices = services.filter(s => s.isActive).length;
  const inactiveServices = services.filter(s => !s.isActive).length;
  const avgPrice = totalServices > 0 ? (services.reduce((sum, s) => sum + s.price, 0) / totalServices) : 0;
  const totalRevenue = services.reduce((sum, s) => sum + s.price, 0);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Services</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your service offerings and pricing</p>
        </div>
        <Button onClick={() => { setEditingService(null); resetForm(); setIsOpen(true); }} className="bg-green-600 hover:bg-green-700 text-white">
          <Plus size={18} className="mr-2" />
          New Service
        </Button>
      </div>

      {/* Summary Widgets */}
      {services.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <SummaryWidget
            icon={<Wrench size={18} />}
            label="Total Services"
            value={String(totalServices)}
            trend={`${inactiveServices} inactive`}
            positive
          />
          <SummaryWidget
            icon={<CheckCircle size={18} />}
            label="Active"
            value={String(activeServices)}
            trend="available"
            positive
          />
          <SummaryWidget
            icon={<X size={18} />}
            label="Inactive"
            value={String(inactiveServices)}
            trend="hidden"
            positive
          />
          <SummaryWidget
            icon={<DollarSign size={18} />}
            label="Avg Price"
            value={formatCurrency(avgPrice)}
            trend="per service"
            positive
          />
          <SummaryWidget
            icon={<ClockCountdown size={18} />}
            label="Total Value"
            value={formatCurrency(totalRevenue)}
            trend="all services"
            positive
          />
        </div>
      )}

      {/* Filters */}
      {services.length > 0 && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Input
              placeholder="Search services..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-64 bg-white border-gray-200"
            />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="all">All Categories</option>
              {Array.from(new Set(services.map(s => s.category))).map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Services Grid */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-12 flex justify-center">
            <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredServices.length === 0 ? (
          <div className="p-16 text-center flex flex-col items-center">
            <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
              <Wrench size={32} className="text-gray-400" />
            </div>
            <h3 className="text-base font-semibold text-gray-900 mb-1">No services found</h3>
            <p className="text-sm text-gray-500 max-w-sm">
              Create your first service to start accepting bookings.
            </p>
            <Button onClick={() => { resetForm(); setIsOpen(true); }} className="mt-4 bg-green-600 hover:bg-green-700 text-white">
              <Plus size={18} className="mr-2" />
              Create Service
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Service</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="text-right py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredServices.map((service) => (
                  <tr key={service.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-semibold text-gray-900">{service.name}</div>
                        <div className="text-xs text-gray-500">{service.description}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-700">{service.category || 'Uncategorized'}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-gray-700">
                        <Clock size={14} className="text-gray-400" />
                        {service.duration} min
                      </div>
                      {service.bufferTime > 0 && (
                        <div className="text-xs text-gray-500 mt-0.5">+{service.bufferTime} min buffer</div>
                      )}
                    </td>
                    <td className="px-6 py-4 font-semibold text-gray-900">
                      {formatCurrency(service.price)}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                          service.isActive
                            ? "bg-green-50 text-green-600"
                            : "bg-gray-50 text-gray-600"
                        }`}
                      >
                        {service.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEdit(service)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm({ id: service.id, name: service.name })}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
