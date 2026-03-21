"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@vayva/ui";
import { Plus, MapPin, Phone, Clock, Warning as AlertTriangle, CheckCircle, Car } from "@phosphor-icons/react/ssr";
import { DashboardPageShell } from "@/components/layout/DashboardPageShell";
import { apiJson } from "@/lib/api-client-shared";
import { StatusBadge } from "@/components/shared";
import { logger } from "@vayva/shared";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

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

function getStatusIcon(status: string) {
  switch (status) {
    case "RESOLVED":
      return <CheckCircle className="h-5 w-5 text-green-600" />;
    case "IN_PROGRESS":
      return <Car className="h-5 w-5 text-blue-600" />;
    case "DISPATCHED":
      return <Clock className="h-5 w-5 text-amber-600" />;
    case "CANCELLED":
      return <AlertTriangle className="h-5 w-5 text-red-500" />;
    default:
      return <AlertTriangle className="h-5 w-5 text-amber-600" />;;
  }
}


export default function RescueDashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [incidents, setIncidents] = useState<RescueIncident[]>([]);
  const [stats, setStats] = useState({
    active: 0,
    dispatched: 0,
    resolved: 0,
    urgent: 0,
  });

  useEffect(() => {
    const fetchIncidents = async () => {
      try {
        setLoading(true);
        const data = await apiJson<RescueIncident[]>("/api/rescue/incidents");
        setIncidents(data);

        // Calculate stats
        setStats({
          active: data.filter((i: RescueIncident) => ["REPORTED", "DISPATCHED", "IN_PROGRESS"].includes((i as any).status)).length,
          dispatched: data.filter((i: RescueIncident) => (i as any).status === "DISPATCHED").length,
          resolved: data.filter((i: RescueIncident) => (i as any).status === "RESOLVED").length,
          urgent: data.filter((i: RescueIncident) => i.priority === "URGENT" && (i as any).status !== "RESOLVED").length,
        });
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        logger.error("[FETCH_RESCUE_INCIDENTS]", { error: msg });
        toast.error("Failed to load rescue incidents");
      } finally {
        setLoading(false);
      }
    };

    void fetchIncidents();

    // Poll every 30 seconds for updates
    const interval = setInterval(() => void fetchIncidents(), 30000);
    return () => clearInterval(interval);
  }, []);

  const activeIncidents = incidents.filter((i: RescueIncident) =>
    ["REPORTED", "DISPATCHED", "IN_PROGRESS"].includes((i as any).status),
  );

  return (
    <DashboardPageShell
      title="Rescue Operations"
      description="Emergency response and incident management"
      actions={
        <Button onClick={() => router.push("/dashboard/rescue/incidents/new")}>
          <Plus className="h-4 w-4 mr-2" />
          Report Incident
        </Button>
      }
    >
      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white  p-4 rounded-xl border border-gray-100">
          <p className="text-sm text-gray-500">Active Incidents</p>
          <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
        </div>
        <div className="bg-white  p-4 rounded-xl border border-gray-100">
          <p className="text-sm text-gray-500">Dispatched</p>
          <p className="text-2xl font-bold text-blue-600">{stats.dispatched}</p>
        </div>
        <div className="bg-white  p-4 rounded-xl border border-gray-100">
          <p className="text-sm text-gray-500">Resolved Today</p>
          <p className="text-2xl font-bold text-green-600">{stats.resolved}</p>
        </div>
        <div className="bg-red-500 p-4 rounded-xl border border-red-500/20">
          <p className="text-sm text-red-500">Urgent Priority</p>
          <p className="text-2xl font-bold text-red-500">{stats.urgent}</p>
        </div>
      </div>

      {/* Active Incidents */}
      <div className="bg-white  rounded-xl border border-gray-100 shadow-sm">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">Active Incidents</h2>
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/dashboard/rescue/incidents")}
          >
            View All
          </Button>
        </div>

        {loading ? (
          <div className="p-8 flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-text-green-600" />
          </div>
        ) : activeIncidents.length === 0 ? (
          <div className="p-12 text-center">
            <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <h3 className="font-medium text-gray-900">No active incidents</h3>
            <p className="text-sm text-gray-500 mt-1">
              All incidents have been resolved. Great work!
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border/40">
            {activeIncidents.slice(0, 5).map((incident) => (
              <Button
                type="button"
                variant="ghost"
                key={incident.id}
                onClick={() => router.push(`/dashboard/rescue/incidents/${incident.id}`)}
                className="w-full p-6 text-left hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start gap-4">
                  <div className="mt-1">{getStatusIcon((incident as any).status)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-medium text-gray-900">{incident.type}</h3>
                      <StatusBadge status={incident.status} />
                      <StatusBadge status={incident.priority} />
                    </div>
                    <p className="text-sm text-gray-700 mt-1 line-clamp-2">
                      {incident.description}
                    </p>
                    <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" />
                        {incident?.location?.address.slice(0, 40)}
                        {incident?.location?.address.length > 40 ? "..." : ""}
                      </span>
                      <span className="flex items-center gap-1">
                        <Phone className="h-3.5 w-3.5" />
                        {incident.reporterPhone}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {formatDistanceToNow(new Date(incident.createdAt))} ago
                      </span>
                    </div>
                    {incident.assignedResponder && (
                      <div className="mt-2 text-xs text-gray-700 bg-blue-50 inline-flex items-center gap-1 px-2 py-1 rounded">
                        <Car className="h-3 w-3" />
                        Assigned: {incident?.assignedResponder?.name}
                        {incident?.assignedResponder?.vehicle && ` (${incident?.assignedResponder?.vehicle})`}
                      </div>
                    )}
                  </div>
                </div>
              </Button>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white  p-6 rounded-xl border border-gray-100">
          <h3 className="font-semibold text-gray-900 mb-2">Quick Actions</h3>
          <div className="space-y-2">
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => router.push("/dashboard/rescue/incidents/new")}
            >
              <Plus className="h-4 w-4 mr-2" />
              Report New Incident
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => router.push("/dashboard/rescue/incidents")}
            >
              <MapPin className="h-4 w-4 mr-2" />
              View Incident Map
            </Button>
          </div>
        </div>

        <div className="bg-white  p-6 rounded-xl border border-gray-100">
          <h3 className="font-semibold text-gray-900 mb-2">Response Team</h3>
          <p className="text-sm text-gray-500">
            Emergency Hotline: <strong className="text-gray-900">911</strong>
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Dispatch Center: <strong className="text-gray-900">(555) 123-RESCUE</strong>
          </p>
          <p className="text-xs text-gray-500 mt-3">
            Average response time: <strong className="text-green-600">12 minutes</strong>
          </p>
        </div>
      </div>
    </DashboardPageShell>
  );
}
