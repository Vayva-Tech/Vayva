// @ts-nocheck
"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { CalendarCheck, Plus, Clock, PencilSimple as Edit, Trash, CheckCircle, XCircle, CalendarBlank, User, MagnifyingGlass } from "@phosphor-icons/react";
import { logger, formatCurrency } from "@vayva/shared";
import { Button, Input } from "@vayva/ui";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
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

  // Calculate metrics
  const totalAppointments = appointments.length;
  const scheduled = appointments.filter(a => a.status === 'scheduled').length;
  const confirmed = appointments.filter(a => a.status === 'confirmed').length;
  const completed = appointments.filter(a => a.status === 'completed').length;
  const cancelled = appointments.filter(a => a.status === 'cancelled').length;
  const today = new Date();
  const upcomingWeek = appointments.filter(a => 
    isAfter(parseISO(a.startTime), today) && 
    isBefore(parseISO(a.startTime), addDays(today, 7))
  ).length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Appointments</h1>
          <p className="text-sm text-gray-500 mt-1">Manage bookings and schedule</p>
        </div>
        <Button onClick={() => { setEditingAppointment(null); setIsOpen(true); }} className="bg-green-600 hover:bg-green-700 text-white px-4 h-10 rounded-xl font-semibold">
          <Plus size={18} className="mr-2" />
          New Appointment
        </Button>
      </div>

      {/* Summary Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <SummaryWidget
          icon={<CalendarCheck size={18} />}
          label="Total Appointments"
          value={String(totalAppointments)}
          trend={`${upcomingWeek} this week`}
          positive
        />
        <SummaryWidget
          icon={<Clock size={18} />}
          label="Scheduled"
          value={String(scheduled)}
          trend="pending"
          positive
        />
        <SummaryWidget
          icon={<CheckCircle size={18} />}
          label="Confirmed"
          value={String(confirmed)}
          trend="locked in"
          positive
        />
        <SummaryWidget
          icon={<CalendarBlank size={18} />}
          label="Completed"
          value={String(completed)}
          trend="done"
          positive
        />
        <SummaryWidget
          icon={<XCircle size={18} />}
          label="Cancelled"
          value={String(cancelled)}
          trend="this month"
          positive={cancelled === 0}
        />
        <SummaryWidget
          icon={<User size={18} />}
          label="Upcoming"
          value={String(upcomingWeek)}
          trend="next 7 days"
          positive
        />
      </div>

      {/* Filters */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Input
            placeholder="Search by customer name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-64 bg-white border-gray-200"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
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
            className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="tomorrow">Tomorrow</option>
            <option value="week">This Week</option>
          </select>
        </div>
      </div>

      {/* Appointments Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-12 flex justify-center">
            <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredAppointments.length === 0 ? (
          <div className="p-16 text-center flex flex-col items-center">
            <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
              <CalendarBlank size={32} className="text-gray-400" />
            </div>
            <h3 className="text-base font-semibold text-gray-900 mb-1">No appointments found</h3>
            <p className="text-sm text-gray-500 max-w-sm">
              Schedule your first appointment to get started.
            </p>
            <Button onClick={() => { setIsOpen(true); }} className="mt-4 bg-green-600 hover:bg-green-700 text-white">
              <Plus size={18} className="mr-2" />
              New Appointment
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Service</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="text-right py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredAppointments.map((appointment) => (
                  <tr key={appointment.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-semibold text-gray-900">{appointment.customerName}</div>
                        <div className="text-xs text-gray-500">{appointment.customerEmail}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-900">{appointment.serviceName}</div>
                      <div className="text-xs text-gray-500">{formatCurrency(appointment.servicePrice)}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-gray-900">{format(parseISO(appointment.startTime), 'MMM dd, yyyy')}</div>
                      <div className="text-xs text-gray-500">{format(parseISO(appointment.startTime), 'hh:mm a')} - {format(parseISO(appointment.endTime), 'hh:mm a')}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                          appointment.status === 'confirmed' || appointment.status === 'completed'
                            ? "bg-green-50 text-green-600"
                            : appointment.status === 'scheduled'
                            ? "bg-blue-50 text-blue-600"
                            : appointment.status === 'cancelled'
                            ? "bg-red-50 text-red-600"
                            : "bg-gray-50 text-gray-600"
                        }`}
                      >
                        {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => { setEditingAppointment(appointment); setIsOpen(true); }}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm({ id: appointment.id, name: appointment.customerName })}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Cancel"
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
                className="w-full px-3 py-2 rounded-lg border bg-white"
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
                className="w-full px-3 py-2 rounded-lg border bg-white"
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
                className="w-full px-3 py-2 rounded-lg border bg-white"
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
                className="w-full px-3 py-2 rounded-lg border bg-white min-h-[80px]"
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
