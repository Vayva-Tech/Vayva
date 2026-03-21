"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button, Select, Textarea } from "@vayva/ui";
import { MapPin, Phone, Clock, Warning, CheckCircle, Car, ArrowLeft, ChatText as MessageSquare, User } from "@phosphor-icons/react/ssr";
import { DashboardPageShell } from "@/components/layout/DashboardPageShell";
import { apiJson } from "@/lib/api-client-shared";
import { StatusBadge } from "@/components/shared";
import { logger } from "@vayva/shared";
import { toast } from "sonner";
import { formatDistanceToNow, format } from "date-fns";

interface RescueIncident {
  id: string;
  status: "REPORTED" | "DISPATCHED" | "IN_PROGRESS" | "RESOLVED" | "CANCELLED";
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  type: string;
  location: {
    address: string;
    lat?: number;
    lng?: number;
  };
  reporterName: string;
  reporterPhone: string;
  description: string;
  assignedResponder?: {
    name: string;
    phone: string;
    vehicle?: string;
  };
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  notes: Array<{
    id: string;
    text: string;
    createdAt: string;
    createdBy: string;
  }>;
}


export default function IncidentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const incidentId = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [incident, setIncident] = useState<RescueIncident | null>(null);
  const [newNote, setNewNote] = useState("");
  const [addingNote, setAddingNote] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    const fetchIncident = async () => {
      if (!incidentId) return;

      try {
        setLoading(true);
        const data = await apiJson<RescueIncident>(`/api/rescue/incidents/${incidentId}`);
        setIncident(data);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        logger.error("[FETCH_INCIDENT_DETAIL]", { error: msg, incidentId });
        toast.error("Failed to load incident details");
      } finally {
        setLoading(false);
      }
    };

    void fetchIncident();
  }, [incidentId]);

  const handleAddNote = async () => {
    if (!newNote.trim() || !incidentId) return;

    setAddingNote(true);
    try {
      await apiJson(`/api/rescue/incidents/${incidentId}/notes`, {
        method: "POST",
        body: JSON.stringify({ text: newNote }),
      });
      toast.success("Note added");
      setNewNote("");

      // Refresh incident data
      const data = await apiJson<RescueIncident>(`/api/rescue/incidents/${incidentId}`);
      setIncident(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      logger.error("[ADD_INCIDENT_NOTE_ERROR]", { error: msg, incidentId });
      toast.error("Failed to add note");
    } finally {
      setAddingNote(false);
    }
  };

  const handleStatusUpdate = async (newStatus: string) => {
    if (!incidentId) return;

    setUpdatingStatus(true);
    try {
      await apiJson(`/api/rescue/incidents/${incidentId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: newStatus }),
      });
      toast.success(`Status updated to ${newStatus}`);

      // Refresh incident data
      const data = await apiJson<RescueIncident>(`/api/rescue/incidents/${incidentId}`);
      setIncident(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      logger.error("[UPDATE_INCIDENT_STATUS_ERROR]", {
        error: msg,
        incidentId,
        nextStatus: newStatus,
      });
      toast.error("Failed to update status");
    } finally {
      setUpdatingStatus(false);
    }
  };

  if (loading) {
    return (
      <DashboardPageShell title="Incident Detail" description="Loading...">
        <div className="flex h-96 items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-text-green-600" />
        </div>
      </DashboardPageShell>
    );
  }

  if (!incident) {
    return (
      <DashboardPageShell title="Incident Not Found" description="The requested incident could not be found">
        <div className="text-center py-12">
          <Warning className="h-12 w-12 text-gray-500 mx-auto mb-4" />
          <Button onClick={() => router.push("/dashboard/rescue/incidents")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Incidents
          </Button>
        </div>
      </DashboardPageShell>
    );
  }

  const isActive = !["RESOLVED", "CANCELLED"].includes((incident as any).status);

  return (
    <DashboardPageShell
      title={`Incident: ${incident.type}`}
      description={`Reported ${formatDistanceToNow(new Date(incident.createdAt))} ago`}
      actions={
        <Button variant="outline" onClick={() => router.push("/dashboard/rescue/incidents")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to List
        </Button>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Status Card */}
          <div className="bg-white  p-6 rounded-xl border border-gray-100">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <StatusBadge status={incident.status} />
                <StatusBadge status={incident.priority} />
              </div>
              {isActive && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-700">Update Status:</span>
                  <Select
                    value={incident.status}
                    onChange={(e) => handleStatusUpdate(e.target?.value)}
                    disabled={updatingStatus}
                    className="p-2 border border-gray-200 rounded-lg text-sm bg-white"
                  >
                    <option value="REPORTED">Reported</option>
                    <option value="DISPATCHED">Dispatched</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="RESOLVED">Resolved</option>
                    <option value="CANCELLED">Cancelled</option>
                  </Select>
                </div>
              )}
            </div>
          </div>

          {/* Location & Reporter */}
          <div className="bg-white  p-6 rounded-xl border border-gray-100 space-y-4">
            <h3 className="font-semibold text-gray-900">Location & Contact</h3>

            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-gray-700 mt-0.5" />
              <div>
                <p className="text-gray-900">{incident?.location?.address}</p>
                {incident?.location?.lat && incident.location?.lng && (
                  <p className="text-xs text-gray-500 mt-1">
                    Lat: {incident?.location?.lat.toFixed(6)}, Lng: {incident?.location?.lng.toFixed(6)}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="flex items-center gap-3">
                <User className="h-5 w-5 text-gray-700" />
                <div>
                  <p className="text-sm text-gray-700">Reporter</p>
                  <p className="text-gray-900 font-medium">{incident.reporterName}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-gray-700" />
                <div>
                  <p className="text-sm text-gray-700">Phone</p>
                  <a href={`tel:${incident.reporterPhone}`} className="text-blue-600 hover:underline">
                    {incident.reporterPhone}
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="bg-white  p-6 rounded-xl border border-gray-100">
            <h3 className="font-semibold text-gray-900 mb-3">Description</h3>
            <p className="text-gray-700 whitespace-pre-wrap">{incident.description}</p>
          </div>

          {/* Notes / Activity Log */}
          <div className="bg-white  p-6 rounded-xl border border-gray-100">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2 mb-4">
              <MessageSquare className="h-5 w-5" />
              Activity Log & Notes
            </h3>

            {incident.notes?.length > 0 ? (
              <div className="space-y-3 mb-4">
                {incident?.notes?.map((note) => (
                  <div key={note.id} className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                    <p className="text-gray-700">{note.text}</p>
                    <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                      <span>{note.createdBy}</span>
                      <span>•</span>
                      <span>{format(new Date(note.createdAt), "MMM d, h:mm a")}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm italic mb-4">No notes yet</p>
            )}

            {isActive && (
              <div className="flex gap-2">
                <Textarea
                  value={newNote}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNewNote(e.target?.value)}
                  placeholder="Add a note..."
                  rows={2}
                  className="flex-1"
                />
                <Button onClick={handleAddNote} disabled={!newNote.trim() || addingNote}>
                  {addingNote ? "Adding..." : "Add"}
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Responder Info */}
          <div className="bg-white  p-6 rounded-xl border border-gray-100">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2 mb-4">
              <Car className="h-5 w-5" />
              Assigned Responder
            </h3>
            {incident.assignedResponder ? (
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-700">Name</p>
                  <p className="text-gray-900 font-medium">{incident?.assignedResponder?.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-700">Phone</p>
                  <a href={`tel:${incident?.assignedResponder?.phone}`} className="text-blue-600 hover:underline">
                    {incident?.assignedResponder?.phone}
                  </a>
                </div>
                {incident?.assignedResponder?.vehicle && (
                  <div>
                    <p className="text-sm text-gray-700">Vehicle</p>
                    <p className="text-gray-900">{incident?.assignedResponder?.vehicle}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-gray-500 text-sm">No responder assigned yet</p>
                {isActive && (
                  <Button variant="outline" size="sm" className="mt-3 w-full">
                    Assign Responder
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Timeline */}
          <div className="bg-white  p-6 rounded-xl border border-gray-100">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2 mb-4">
              <Clock className="h-5 w-5" />
              Timeline
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-700">Reported</span>
                <span className="text-gray-900">{format(new Date(incident.createdAt), "MMM d, h:mm a")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700">Last Updated</span>
                <span className="text-gray-900">{format(new Date(incident.updatedAt), "MMM d, h:mm a")}</span>
              </div>
              {incident.resolvedAt && (
                <div className="flex justify-between">
                  <span className="text-gray-700">Resolved</span>
                  <span className="text-green-600">{format(new Date(incident.resolvedAt), "MMM d, h:mm a")}</span>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          {isActive && (
            <div className="bg-white  p-6 rounded-xl border border-gray-100">
              <h3 className="font-semibold text-gray-900 mb-3">Quick Actions</h3>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  <Phone className="h-4 w-4 mr-2" />
                  Call Reporter
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start text-green-600 hover:bg-green-50"
                  onClick={() => handleStatusUpdate("RESOLVED")}
                  disabled={updatingStatus}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Mark Resolved
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardPageShell>
  );
}
