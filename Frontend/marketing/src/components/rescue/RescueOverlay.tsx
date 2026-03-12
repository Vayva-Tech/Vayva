"use client";

import React, { useEffect, useState } from "react";
import {
  IconLoader2 as Loader2,
  IconRefresh as RefreshCw,
  IconAlertCircle as AlertCircle,
  IconShieldCheck as ShieldCheck,
} from "@tabler/icons-react";
import { Button } from "@vayva/ui";
import { useRouter } from "next/navigation";

interface RescueOverlayProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export function RescueOverlay({
  error,
  reset,
}: RescueOverlayProps): React.JSX.Element {
  const router = useRouter();
  const [incidentId, setIncidentId] = useState<string | null>(null);
  const [status, setStatus] = useState<
    "INIT" | "RUNNING" | "READY_TO_REFRESH" | "NEEDS_ENGINEERING"
  >("INIT");
  const [statusMessage, setStatusMessage] = useState(
    "Checking system status...",
  );

  useEffect(() => {
    // Initiate Rescue
    const reportError = async () => {
      try {
        const res = await fetch("/api/rescue/report", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            route: window.location.pathname,
            errorMessage: error.message,
            stackHash: error.digest || error.stack?.slice(0, 100),
          }),
        });
        const data = await res.json();
        if (data.incidentId) {
          setIncidentId(data.incidentId);
          setStatus("RUNNING");
          setStatusMessage("Analyzing issue...");
        }
      } catch (err: unknown) {
        console.error("Failed to report to rescue service", err);
        setStatus("NEEDS_ENGINEERING");
        setStatusMessage("Please try refreshing directly.");
      }
    };

    reportError();
  }, [error]);

  // Polling
  useEffect(() => {
    if (
      !incidentId ||
      status === "READY_TO_REFRESH" ||
      status === "NEEDS_ENGINEERING"
    )
      return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/rescue/incidents/${incidentId}`);
        const data = await res.json();

        if (data.status === "READY_TO_REFRESH") {
          setStatus("READY_TO_REFRESH");
          setStatusMessage("System ready. Please refresh.");
        } else if (data.status === "NEEDS_ENGINEERING") {
          setStatus("NEEDS_ENGINEERING");
          setStatusMessage("Our team has been notified.");
        }
      } catch (err: unknown) {
        console.error("Poll fail", err);
      }
    }, 2500);

    return () => clearInterval(interval);
  }, [incidentId, status]);

  const handleRefresh = () => {
    router.refresh();
    reset();
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-white text-black flex items-center justify-center p-4 font-sans">
      <div className="text-center max-w-sm w-full">
        <div className="flex justify-center mb-6">
          <div
            className={`p-4 rounded-full ${status === "RUNNING" ? "bg-gray-100 animate-pulse" : "bg-green-50"}`}
          >
            {status === "RUNNING" || status === "INIT" ? (
              <Loader2 className="w-8 h-8 text-black animate-spin" />
            ) : status === "NEEDS_ENGINEERING" ? (
              <AlertCircle className="w-8 h-8 text-gray-400" />
            ) : (
              <ShieldCheck className="w-8 h-8 text-green-600" />
            )}
          </div>
        </div>

        <h2 className="text-xl font-bold mb-2">One moment...</h2>
        <p className="text-gray-500 mb-8 text-sm">{statusMessage}</p>

        <div className="space-y-3">
          {status === "READY_TO_REFRESH" || status === "NEEDS_ENGINEERING" ? (
            <Button
              onClick={handleRefresh}
              className="w-full text-white bg-black hover:bg-gray-800 rounded-xl py-6"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Reload Page
            </Button>
          ) : (
            <div className="h-12 flex items-center justify-center text-xs font-bold text-gray-300 uppercase tracking-widest">
              Running Diagnostics
            </div>
          )}
        </div>

        {incidentId && (
          <div className="mt-8 text-[10px] text-gray-300 font-mono">
            ID: {incidentId.slice(0, 8)}
          </div>
        )}
      </div>
    </div>
  );
}
