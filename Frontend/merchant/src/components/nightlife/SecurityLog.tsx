// @ts-nocheck
"use client";

import React, { useState, useEffect } from "react";
import { Card, Button } from "@vayva/ui";
import { toast } from "sonner";
import { Shield, AlertTriangle, CheckCircle } from "@phosphor-icons/react";
import type { SecurityIncident } from "@/types/nightlife";
import { apiJson } from "@/lib/api-client-shared";

export function SecurityLog() {
  const [incidents, setIncidents] = useState<SecurityIncident[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void loadIncidents();
  }, []);

  const loadIncidents = async () => {
    try {
      setLoading(true);
      const venueId = "venue_123";
      const data = await apiJson<{
        activeIncidents: SecurityIncident[];
      }>(`/api/nightlife/security/log?venueId=${venueId}`);
      
      if (data?.activeIncidents) {
        setIncidents(data.activeIncidents.slice(0, 5));
      }
    } catch (error: unknown) {
      console.error("[LOAD_SECURITY_ERROR]", error);
      toast.error("Failed to load security log");
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'text-blue-400';
      case 'medium': return 'text-yellow-400';
      case 'high': return 'text-orange-400';
      case 'critical': return 'text-red-400';
      default: return 'text-gray-500';
    }
  };

  return (
    <Card className="p-6 bg-[#252525] border-[#333333]">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-bold text-lg text-gray-900">Security Log</h3>
          <p className="text-sm text-gray-500">
            Incidents tonight: {incidents.length}
          </p>
        </div>
        <Button variant="outline" size="sm">Report Incident</Button>
      </div>

      <div className="space-y-3">
        {incidents.map((incident) => (
          <div
            key={incident.id}
            className="p-3 bg-[#1A1A1A] rounded-lg border border-[#333333]"
          >
            <div className="flex items-start gap-2 mb-2">
              <AlertTriangle size={16} className={getSeverityColor(incident.severity)} />
              <div className="flex-1">
                <div className="text-sm text-gray-900">{incident.description}</div>
                <div className="text-xs text-gray-500">
                  {incident.location} • {new Date(incident.reportedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className={`px-2 py-1 rounded ${
                incident.status === 'resolved' 
                  ? 'bg-green-500/20 text-green-400' 
                  : 'bg-yellow-500/20 text-yellow-400'
              }`}>
                {incident.status.toUpperCase()}
              </span>
              <span className="text-gray-500">Officer: {incident.officerName}</span>
            </div>
          </div>
        ))}
        
        {incidents.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Shield size={32} className="mx-auto mb-2 opacity-50" />
            <p className="text-sm">No active incidents</p>
          </div>
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-[#333333] text-xs text-gray-500">
        <div className="flex items-center justify-between">
          <span>CCTV: ● All cameras active</span>
          <span>Security staff: 7 on duty</span>
        </div>
      </div>
    </Card>
  );
}
