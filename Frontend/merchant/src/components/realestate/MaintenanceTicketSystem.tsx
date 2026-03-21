"use client";

import { useState } from "react";
import { Badge, Button, Input, Label, Select, Textarea } from "@vayva/ui";
import { Plus, Trash, Wrench, Clock, CheckCircle, Warning as AlertTriangle, MapPin, User } from "@phosphor-icons/react/ssr";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

export interface MaintenanceTicket {
  id: string;
  propertyId: string;
  propertyName: string;
  unitNumber?: string;
  title: string;
  description: string;
  priority: "low" | "medium" | "high" | "urgent";
  status: "open" | "in_progress" | "completed" | "cancelled";
  category: "plumbing" | "electrical" | "hvac" | "appliance" | "structural" | "other";
  requestedBy?: string;
  assignedTo?: string;
  estimatedCost?: number;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

interface MaintenanceTicketSystemProps {
  tickets: MaintenanceTicket[];
  onTicketsChange: (tickets: MaintenanceTicket[]) => void;
  properties?: { id: string; name: string; units?: string[] }[];
}

const CATEGORIES = [
  { value: "plumbing", label: "Plumbing", icon: Wrench },
  { value: "electrical", label: "Electrical", icon: AlertTriangle },
  { value: "hvac", label: "HVAC", icon: AlertTriangle },
  { value: "appliance", label: "Appliance", icon: Wrench },
  { value: "structural", label: "Structural", icon: AlertTriangle },
  { value: "other", label: "Other", icon: Wrench },
] as const;

const PRIORITIES = [
  { value: "low", label: "Low", color: "bg-blue-100 text-blue-800" },
  { value: "medium", label: "Medium", color: "bg-yellow-100 text-yellow-800" },
  { value: "high", label: "High", color: "bg-orange-100 text-orange-800" },
  { value: "urgent", label: "Urgent", color: "bg-red-100 text-red-800" },
] as const;

const STATUSES = [
  { value: "open", label: "Open", color: "bg-blue-500" },
  { value: "in_progress", label: "In Progress", color: "bg-yellow-500" },
  { value: "completed", label: "Completed", color: "bg-green-500" },
  { value: "cancelled", label: "Cancelled", color: "bg-gray-400" },
] as const;

export function MaintenanceTicketSystem({
  tickets,
  onTicketsChange,
  properties = [],
}: MaintenanceTicketSystemProps) {
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState<"all" | "open" | "in_progress" | "completed">("all");

  // Form state
  const [formPropertyId, setFormPropertyId] = useState("");
  const [formUnitNumber, setFormUnitNumber] = useState("");
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formPriority, setFormPriority] = useState<MaintenanceTicket["priority"]>("medium");
  const [formCategory, setFormCategory] = useState<MaintenanceTicket["category"]>("other");
  const [formRequestedBy, setFormRequestedBy] = useState("");

  const selectedProperty = properties.find((p) => p.id === formPropertyId);

  const addTicket = () => {
    if (!formPropertyId || !formTitle.trim()) {
      toast.error("Property and title are required");
      return;
    }

    const property = properties.find((p) => p.id === formPropertyId);
    if (!property) return;

    const newTicket: MaintenanceTicket = {
      id: crypto.randomUUID(),
      propertyId: formPropertyId,
      propertyName: property.name,
      unitNumber: formUnitNumber.trim() || undefined,
      title: formTitle.trim(),
      description: formDescription.trim(),
      priority: formPriority,
      status: "open",
      category: formCategory,
      requestedBy: formRequestedBy.trim() || undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onTicketsChange([newTicket, ...tickets]);

    // Reset form
    setFormPropertyId("");
    setFormUnitNumber("");
    setFormTitle("");
    setFormDescription("");
    setFormPriority("medium");
    setFormCategory("other");
    setFormRequestedBy("");
    setShowForm(false);

    toast.success("Maintenance ticket created");
  };

  const updateTicketStatus = (ticketId: string, status: MaintenanceTicket["status"]) => {
    onTicketsChange(
      tickets.map((t) =>
        t.id === ticketId
          ? {
              ...t,
              status,
              updatedAt: new Date().toISOString(),
              completedAt: status === "completed" ? new Date().toISOString() : t.completedAt,
            }
          : t,
      ),
    );
  };

  const assignTicket = (ticketId: string, assignedTo: string) => {
    onTicketsChange(
      tickets.map((t) =>
        t.id === ticketId
          ? { ...t, assignedTo, updatedAt: new Date().toISOString() }
          : t,
      ),
    );
  };

  const deleteTicket = (ticketId: string) => {
    onTicketsChange(tickets.filter((t) => t.id !== ticketId));
  };

  const filteredTickets = tickets.filter((t) => {
    if (filter === "all") return true;
    return t.status === filter;
  });

  const getStatusBadge = (status: MaintenanceTicket["status"]) => {
    const s = STATUSES.find((s) => s.value === status);
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${s?.color} text-white`}>
        {s?.label}
      </span>
    );
  };

  const getPriorityBadge = (priority: MaintenanceTicket["priority"]) => {
    const p = PRIORITIES.find((p) => p.value === priority);
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${p?.color}`}>
        {p?.label}
      </span>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Wrench className="h-5 w-5 text-gray-500" />
          <h3 className="font-semibold text-gray-900">Maintenance Tickets</h3>
        </div>
        <Button size="sm" onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-1" />
          New Ticket
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        {STATUSES.map((s) => (
          <Button
            type="button"
            variant="ghost"
            key={s.value}
            onClick={() => setFilter(s.value as typeof filter)}
            className={`p-3 rounded-lg border text-left transition-colors ${
              filter === s.value
                ? "border-green-500 bg-green-500/5"
                : "border-gray-100 hover:bg-gray-50"
            }`}
          >
            <div className={`w-2 h-2 rounded-full ${s.color} mb-1`} />
            <div className="text-2xl font-semibold">
              {tickets.filter((t) => t.status === s.value).length}
            </div>
            <div className="text-xs text-gray-400">{s.label}</div>
          </Button>
        ))}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2">
        {["all", "open", "in_progress", "completed"].map((f) => (
          <Button
            type="button"
            variant="ghost"
            key={f}
            onClick={() => setFilter(f as typeof filter)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              filter === f
                ? "bg-green-500 text-white"
                : "bg-gray-50 text-gray-500 hover:bg-white"
            }`}
          >
            {f === "all" ? "All Tickets" : f.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
          </Button>
        ))}
      </div>

      {/* Tickets List */}
      <div className="space-y-2">
        {filteredTickets.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <CheckCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">No tickets found</p>
          </div>
        ) : (
          filteredTickets.map((ticket) => (
            <div
              key={ticket.id}
              className="p-4 bg-gray-50 rounded-lg border border-gray-100 hover:border-green-500/30 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-medium text-gray-900">{ticket.title}</h4>
                    {getPriorityBadge(ticket.priority)}
                    {getStatusBadge(ticket.status)}
                  </div>

                  <div className="flex items-center gap-3 mt-1 text-sm text-gray-400">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" />
                      {ticket.propertyName}
                      {ticket.unitNumber && ` - Unit ${ticket.unitNumber}`}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {formatDistanceToNow(new Date(ticket.createdAt))} ago
                    </span>
                  </div>

                  <p className="text-sm text-gray-500 mt-2">{ticket.description}</p>

                  {/* Actions */}
                  <div className="flex items-center gap-2 mt-3">
                    {ticket.status !== "completed" && ticket.status !== "cancelled" && (
                      <>
                        {ticket.status === "open" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateTicketStatus(ticket.id, "in_progress")}
                          >
                            Start Work
                          </Button>
                        )}
                        {ticket.status === "in_progress" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateTicketStatus(ticket.id, "completed")}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Complete
                          </Button>
                        )}
                      </>
                    )}
                    <Input
                      placeholder="Assign to..."
                      value={ticket.assignedTo || ""}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => assignTicket(ticket.id, e.target.value)}
                      className="w-32 h-7 text-xs"
                    />
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => deleteTicket(ticket.id)}
                      className="h-7 px-2 text-red-500 hover:text-red-600"
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* New Ticket Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg space-y-4 max-h-[90vh] overflow-y-auto">
            <h4 className="font-medium text-lg">New Maintenance Ticket</h4>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Property</Label>
                <Select
                  value={formPropertyId}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFormPropertyId(e.target.value)}
                  className="w-full h-10 mt-1 px-3 border border-gray-100 rounded-lg text-sm bg-white"
                >
                  <option value="">Select property...</option>
                  {properties.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <Label className="text-xs">Unit Number (Optional)</Label>
                <Input
                  value={formUnitNumber}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormUnitNumber(e.target.value)}
                  placeholder="e.g., 4B"
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <Label className="text-xs">Issue Title</Label>
              <Input
                value={formTitle}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormTitle(e.target.value)}
                placeholder="Brief description of the issue"
                className="mt-1"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Category</Label>
                <Select
                  value={formCategory}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFormCategory(e.target.value as MaintenanceTicket["category"])}
                  className="w-full h-10 mt-1 px-3 border border-gray-100 rounded-lg text-sm bg-white"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <Label className="text-xs">Priority</Label>
                <Select
                  value={formPriority}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFormPriority(e.target.value as MaintenanceTicket["priority"])}
                  className="w-full h-10 mt-1 px-3 border border-gray-100 rounded-lg text-sm bg-white"
                >
                  {PRIORITIES.map((p) => (
                    <option key={p.value} value={p.value}>
                      {p.label}
                    </option>
                  ))}
                </Select>
              </div>
            </div>

            <div>
              <Label className="text-xs">Detailed Description</Label>
              <Textarea
                value={formDescription}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormDescription(e.target.value)}
                placeholder="Describe the issue in detail..."
                rows={3}
                className="mt-1 resize-none"
              />
            </div>

            <div>
              <Label className="text-xs">Requested By (Optional)</Label>
              <Input
                value={formRequestedBy}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormRequestedBy(e.target.value)}
                placeholder="Tenant name or contact"
                className="mt-1"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <Button variant="outline" onClick={() => setShowForm(false)} className="flex-1">
                Cancel
              </Button>
              <Button onClick={addTicket} className="flex-1">
                Create Ticket
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
