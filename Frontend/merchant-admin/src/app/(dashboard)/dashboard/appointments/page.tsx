"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import {
  CalendarCheck,
  Plus,
  Clock,
  Spinner as Loader2,
  PencilSimple as Edit,
  Trash,
  CheckCircle,
  XCircle,
  CalendarBlank,
  User,
  MagnifyingGlass,
} from "@phosphor-icons/react/ssr";
import { logger, formatCurrency } from "@vayva/shared";
import { PageHeader } from "@/components/wix-style/PageHeader";
import { Button, Input, Badge } from "@vayva/ui";
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
import { format, parseISO, isAfter, isBefore, addDays, startOfDay, endOfDay } from "date-fns";

interface Appointment {
  id: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  serviceId: string;
  serviceName: string;
  servicePrice: number;
  staffId?: string;
  staffName?: string;
  startTime: string;
  endTime: string;
  status: "scheduled" | "confirmed" | "completed" | "cancelled" | "no_show";
  notes?: string;
  source: "online" | "walk_in" | "phone" | "admin";
  createdAt: string;
}

interface ServiceOption {
  id: string;
  name: string;
  price: number;
  duration: number;
}

interface CustomerOption {
  id: string;
  name: string;
  email: string;
}

export default function AppointmentsPage() {
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [services, setServices] = useState<ServiceOption[]>([]);
  const [customers, setCustomers] = useState<CustomerOption[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; name: string } | null>(null);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("all"); // all, today, tomorrow, week

  const [formData, setFormData] = useState<{
    customerId: string;
    serviceId: string;
    startTime: string;
    endTime: string;
    notes: string;
    status: Appointment["status"];
  }>({
    customerId: "",
    serviceId: "",
    startTime: "",
    endTime: "",
    notes: "",
    status: "scheduled",
  });

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [apptsData, servicesData, customersData] = await Promise.all([
        apiJson<Appointment[]>("/api/appointments"),
        apiJson<ServiceOption[]>("/api/services?active=true"),
        apiJson<CustomerOption[]>("/api/customers?limit=100"),
      ]);
      setAppointments(apptsData || []);
      setServices(servicesData || []);
      setCustomers(customersData || []);
    } catch (error: unknown) {
      const _errMsg = error instanceof Error ? error.message : String(error);
      logger.error("[FETCH_APPOINTMENTS_ERROR]", {
        error: _errMsg,
        app: "merchant",
      });
      toast.error(_errMsg || "Could not load appointments");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  const handleSave = async () => {
    if (!formData.customerId || !formData.serviceId || !formData.startTime) {
      return toast.error("Please fill all required fields");
    }

    setIsSubmitting(true);
    try {
      const service = services.find((s) => s.id === formData.serviceId);
      const start = new Date(formData.startTime);
      const end = new Date(start.getTime() + (service?.duration || 60) * 60000);

      const payload = {
        ...formData,
        endTime: end.toISOString(),
      };

      if (editingAppointment) {
        await apiJson(`/api/appointments/${editingAppointment.id}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
        toast.success("Appointment updated");
      } else {
        await apiJson("/api/appointments", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        toast.success("Appointment scheduled");
      }

      setIsOpen(false);
      setEditingAppointment(null);
      resetForm();
      void fetchData();
    } catch (error: unknown) {
      const _errMsg = error instanceof Error ? error.message : String(error);
      logger.error("[SAVE_APPOINTMENT_ERROR]", { error: _errMsg, app: "merchant" });
      toast.error(_errMsg || "Failed to save appointment");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await apiJson(`/api/appointments/${id}`, { method: "DELETE" });
      toast.success("Appointment cancelled");
      setDeleteConfirm(null);
      void fetchData();
    } catch (error: unknown) {
      const _errMsg = error instanceof Error ? error.message : String(error);
      logger.error("[DELETE_APPOINTMENT_ERROR]", { error: _errMsg, app: "merchant" });
      toast.error(_errMsg || "Failed to cancel appointment");
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await apiJson(`/api/appointments/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: newStatus }),
      });
      toast.success("Status updated");
      void fetchData();
    } catch (error: unknown) {
      const _errMsg = error instanceof Error ? error.message : String(error);
      logger.error("[STATUS_APPOINTMENT_ERROR]", { error: _errMsg, app: "merchant" });
      toast.error(_errMsg || "Failed to update status");
    }
  };

  const openEdit = (appointment: Appointment) => {
    setEditingAppointment(appointment);
    setFormData({
      customerId: appointment.customerId,
      serviceId: appointment.serviceId,
      startTime: appointment.startTime.slice(0, 16), // Format for datetime-local
      endTime: appointment.endTime.slice(0, 16),
      notes: appointment.notes || "",
      status: appointment.status,
    });
    setIsOpen(true);
  };

  const resetForm = () => {
    setFormData({
      customerId: "",
      serviceId: "",
      startTime: "",
      endTime: "",
      notes: "",
      status: "scheduled",
    });
  };

  const filteredAppointments = appointments.filter((a) => {
    const matchesSearch =
      a.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.serviceName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || a.status === statusFilter;

    let matchesDate = true;
    const now = new Date();
    const apptDate = parseISO(a.startTime);
    if (dateFilter === "today") {
      matchesDate = apptDate >= startOfDay(now) && apptDate <= endOfDay(now);
    } else if (dateFilter === "tomorrow") {
      const tomorrow = addDays(now, 1);
      matchesDate = apptDate >= startOfDay(tomorrow) && apptDate <= endOfDay(tomorrow);
    } else if (dateFilter === "week") {
      matchesDate = apptDate >= startOfDay(now) && apptDate <= addDays(now, 7);
    }

    return matchesSearch && matchesStatus && matchesDate;
  });

  const sortedAppointments = [...filteredAppointments].sort(
    (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
  );

  const totalAppointments = appointments.length;
  const todayAppointments = appointments.filter((a) => {
    const apptDate = parseISO(a.startTime);
    return apptDate >= startOfDay(new Date()) && apptDate <= endOfDay(new Date());
  }).length;
  const confirmedAppointments = appointments.filter((a) => a.status === "confirmed").length;
  const completedAppointments = appointments.filter((a) => a.status === "completed").length;

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "success" | "warning" | "error" | "info"; label: string }> = {
      scheduled: { variant: "default", label: "Scheduled" },
      confirmed: { variant: "success", label: "Confirmed" },
      completed: { variant: "info", label: "Completed" },
      cancelled: { variant: "error", label: "Cancelled" },
      no_show: { variant: "error", label: "No Show" },
    };
    const config = variants[status] || variants.scheduled;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Appointments"
        description="Manage client appointments and scheduling"
        primaryAction={{
          label: "Book Appointment",
          icon: "Plus",
          onClick: () => {
            setEditingAppointment(null);
            resetForm();
            setIsOpen(true);
          }
        }}
      />

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-background/70 backdrop-blur-xl p-4 rounded-xl border">
          <p className="text-sm text-muted-foreground">Total Appointments</p>
          <p className="text-2xl font-bold">{totalAppointments}</p>
        </div>
        <div className="bg-background/70 backdrop-blur-xl p-4 rounded-xl border">
          <p className="text-sm text-muted-foreground">Today</p>
          <p className="text-2xl font-bold text-primary">{todayAppointments}</p>
        </div>
        <div className="bg-background/70 backdrop-blur-xl p-4 rounded-xl border">
          <p className="text-sm text-muted-foreground">Confirmed</p>
          <p className="text-2xl font-bold text-green-600">{confirmedAppointments}</p>
        </div>
        <div className="bg-background/70 backdrop-blur-xl p-4 rounded-xl border">
          <p className="text-sm text-muted-foreground">Completed</p>
          <p className="text-2xl font-bold">{completedAppointments}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4 flex-wrap">
        <div className="flex-1 min-w-[200px] relative">
          <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by customer or service..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border bg-background"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 rounded-lg border bg-background"
        >
          <option value="all">All Status</option>
          <option value="scheduled">Scheduled</option>
          <option value="confirmed">Confirmed</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <select
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="px-4 py-2 rounded-lg border bg-background"
        >
          <option value="all">All Dates</option>
          <option value="today">Today</option>
          <option value="tomorrow">Tomorrow</option>
          <option value="week">This Week</option>
        </select>
      </div>

      {/* Appointments List */}
      <div className="bg-background/70 backdrop-blur-xl rounded-xl border overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center p-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : sortedAppointments.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <CalendarBlank className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="font-semibold">No appointments yet</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Schedule your first appointment to get started.
            </p>
            <Button onClick={() => setIsOpen(true)} className="mt-4">
              <Plus className="mr-2 h-4 w-4" />
              Book Appointment
            </Button>
          </div>
        ) : (
          <div className="divide-y">
            {sortedAppointments.map((appt) => (
              <div key={appt.id} className="p-4 hover:bg-background/50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <CalendarCheck className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{appt.serviceName}</h3>
                        {getStatusBadge(appt.status)}
                        {appt.source === "online" && (
                          <Badge variant="default" className="text-xs">Online</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <User className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm">{appt.customerName}</span>
                      </div>
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <CalendarBlank className="h-3 w-3" />
                          {format(parseISO(appt.startTime), "MMM d, yyyy")}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {format(parseISO(appt.startTime), "h:mm a")} -{" "}
                          {format(parseISO(appt.endTime), "h:mm a")}
                        </span>
                        {appt.servicePrice > 0 && (
                          <span className="font-medium text-primary">
                            {formatCurrency(appt.servicePrice)}
                          </span>
                        )}
                      </div>
                      {appt.notes && (
                        <p className="text-sm text-muted-foreground mt-2 italic">
                          "{appt.notes}"
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {appt.status === "scheduled" && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-green-600"
                        onClick={() => handleStatusChange(appt.id, "confirmed")}
                      >
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                    )}
                    {appt.status === "confirmed" && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-blue-600"
                        onClick={() => handleStatusChange(appt.id, "completed")}
                      >
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                    )}
                    <Button size="sm" variant="ghost" onClick={() => openEdit(appt)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-destructive"
                      onClick={() => setDeleteConfirm({ id: appt.id, name: appt.serviceName })}
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
            <DialogTitle>{editingAppointment ? "Edit Appointment" : "Book Appointment"}</DialogTitle>
            <DialogDescription>
              {editingAppointment ? "Update appointment details" : "Schedule a new appointment"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="customer">Customer *</Label>
              <select
                id="customer"
                value={formData.customerId}
                onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border bg-background"
              >
                <option value="">Select customer</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.email})
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="service">Service *</Label>
              <select
                id="service"
                value={formData.serviceId}
                onChange={(e) => setFormData({ ...formData, serviceId: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border bg-background"
              >
                <option value="">Select service</option>
                {services.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} - {formatCurrency(s.price)} ({s.duration} min)
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="startTime">Date & Time *</Label>
              <Input
                id="startTime"
                type="datetime-local"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full px-3 py-2 rounded-lg border bg-background"
              >
                <option value="scheduled">Scheduled</option>
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Any special requests or notes..."
                className="w-full px-3 py-2 rounded-lg border bg-background min-h-[80px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : editingAppointment ? "Update" : "Book Appointment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <ConfirmDialog
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={() => deleteConfirm && handleDelete(deleteConfirm.id)}
        title="Cancel Appointment"
        message={`Are you sure you want to cancel the appointment for "${deleteConfirm?.name}"?`}
        confirmText="Cancel Appointment"
        cancelText="Keep Appointment"
        variant="warning"
      />
    </div>
  );
}
