// @ts-nocheck
"use client";

import { logger } from "@vayva/shared";
import { useEffect, useState } from "react";
import { Button } from "@vayva/ui";
import { Warning as AlertTriangle, X } from "@phosphor-icons/react/ssr";
import { usePathname } from "next/navigation";

interface Incident {
  id: string;
  title: string;
  description: string;
  impact: "CRITICAL" | "MAJOR" | "MINOR" | "MAINTENANCE";
}

import { apiJson } from "@/lib/api-client-shared";

export function IncidentBanner() {
  const [incident, setIncident] = useState<Incident | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    // Check local storage for dismissal
    const dismissedId = localStorage.getItem("vayva_dismissed_incident");

    // Fetch active incidents
    const checkIncidents = async () => {
      try {
        const data = await apiJson<Incident | null>(
          "/api/system/incidents/active",
        );
        if (data && data.id !== dismissedId) {
          setIncident(data);
        }
      } catch (e: any) {
        const _errMsg = e instanceof Error ? e.message : String(e);
        logger.warn("[INCIDENT_BANNER_CHECK_ERROR]", {
          error: _errMsg,
          app: "merchant",
        });
      }
    };

    void checkIncidents();
  }, []);

  // Don't show on auth pages
  if (pathname.includes("/signin") || pathname.includes("/signup")) {
    return null;
  }

  if (!incident || dismissed) return null;

  const getStyle = (impact: string) => {
    switch (impact) {
      case "CRITICAL":
        return "bg-red-600 text-white";
      case "MAJOR":
        return "bg-orange-500 text-white";
      case "MAINTENANCE":
        return "bg-blue-600 text-white";
      default:
        return "bg-yellow-500 text-white";
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem("vayva_dismissed_incident", incident.id);
  };

  return (
    <div
      className={`${getStyle(incident.impact)} px-4 py-2 relative flex items-center justify-center text-sm font-medium z-50`}
    >
      <AlertTriangle className="w-4 h-4 mr-2" />
      <span>
        <strong>{incident.title}:</strong> {incident.description}
      </span>
      <Button
        onClick={handleDismiss}
        className="absolute right-4 p-1 hover:bg-white rounded-full transition-colors"
        aria-label="Dismiss banner"
      >
        <X className="w-4 h-4" />
      </Button>
    </div>
  );
}
