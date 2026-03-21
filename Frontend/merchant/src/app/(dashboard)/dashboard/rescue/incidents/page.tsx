"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Input, Select } from "@vayva/ui";
import { Plus, MapPin, Clock, CheckCircle, Car, MagnifyingGlass as Search, Funnel as Filter } from "@phosphor-icons/react/ssr";
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
}


export default function IncidentsListPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [incidents, setIncidents] = useState<RescueIncident[]>([]);
  const [filter, setFilter] = useState<"all" | "active" | "resolved">("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchIncidents = async () => {
      try {
        setLoading(true);
        const data = await apiJson<RescueIncident[]>("/api/rescue/incidents");
        setIncidents(data);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        logger.error("[FETCH_INCIDENTS_LIST]", { error: msg });
        toast.error("Failed to load incidents");
      } finally {
        setLoading(false);
      }
    };

    void fetchIncidents();
  }, []);

  const filteredIncidents = incidents.filter((incident) => {
    // Status filter
    if (filter === "active" && !["REPORTED", "DISPATCHED", "IN_PROGRESS"].includes((incident as any).status)) {
      return false;
    }
    if (filter === "resolved" && (incident as any).status !== "RESOLVED") {
      return false;
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        incident.type?.toLowerCase().includes(query) ||
        incident.location?.address.toLowerCase().includes(query) ||
        incident.reporterName?.toLowerCase().includes(query) ||
        incident.reporterPhone?.includes(query)
      );
    }

    return true;
  });

  return (
    <DashboardPageShell
      title="Rescue Incidents"
      description="View and manage all rescue incidents"
      actions={
        <Button onClick={() => router.push("/dashboard/rescue/incidents/new")}>
          <Plus className="h-4 w-4 mr-2" />
          Report Incident
        </Button>
      }
    >
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search incidents..."
            value={searchQuery}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target?.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-500" />
          <Select
            value={filter}
            onChange={(e) => setFilter(e.target?.value as typeof filter)}
            className="p-2 border border-gray-200 rounded-lg text-sm bg-white"
          >
            <option value="all">All Incidents</option>
            <option value="active">Active Only</option>
            <option value="resolved">Resolved</option>
          </Select>
        </div>
      </div>

      {/* Incidents Table */}
      <div className="bg-white  rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-text-green-600" />
          </div>
        ) : filteredIncidents.length === 0 ? (
          <div className="p-12 text-center">
            <CheckCircle className="h-12 w-12 text-gray-500 mx-auto mb-4" />
            <h3 className="font-medium text-gray-900">No incidents found</h3>
            <p className="text-sm text-gray-500 mt-1">
              {searchQuery ? "Try adjusting your search" : "No rescue incidents at the moment"}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left p-4 text-sm font-medium text-gray-700">Type</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-700">Location</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-700">Priority</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-700">Status</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-700">Responder</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-700">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {filteredIncidents.map((incident) => (
                  <tr
                    key={incident.id}
                    onClick={() => router.push(`/dashboard/rescue/incidents/${incident.id}`)}
                    className="hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <td className="p-4">
                      <div className="font-medium text-gray-900">{incident.type}</div>
                      <div className="text-xs text-gray-500 mt-1">{incident.reporterName}</div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-start gap-1.5 text-sm text-gray-700">
                        <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                        <span className="line-clamp-2">{incident?.location?.address}</span>
                      </div>
                    </td>
                    <td className="p-4"><StatusBadge status={incident.priority} /></td>
                    <td className="p-4"><StatusBadge status={incident.status} /></td>
                    <td className="p-4">
                      {incident.assignedResponder ? (
                        <div className="text-sm">
                          <div className="text-gray-900">{incident?.assignedResponder?.name}</div>
                          {incident?.assignedResponder?.vehicle && (
                            <div className="text-xs text-gray-500 flex items-center gap-1">
                              <Car className="h-3 w-3" />
                              {incident?.assignedResponder?.vehicle}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500">Unassigned</span>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Clock className="h-3.5 w-3.5" />
                        {formatDistanceToNow(new Date(incident.createdAt))} ago
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Summary */}
      <div className="text-sm text-gray-500">
        Showing {filteredIncidents.length} of {incidents.length} incidents
      </div>
    </DashboardPageShell>
  );
}
