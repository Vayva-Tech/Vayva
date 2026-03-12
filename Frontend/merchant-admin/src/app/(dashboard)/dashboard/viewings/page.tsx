"use client";

import { ViewingRequestCard } from "@/components/properties/ViewingRequestCard";
import { logger } from "@vayva/shared";
import { Button } from "@vayva/ui";
import {
  House as Home,
  Spinner as Loader2,
  ArrowCounterClockwise as RefreshCcw,
} from "@phosphor-icons/react/ssr";
import { toast } from "sonner";
import { useEffect, useState } from "react";

import { apiJson } from "@/lib/api-client-shared";

interface ViewingRequest {
  id: string;
  status: string;
  service: { title: string };
  startsAt: string;
  metadata: {
    customerName: string;
    customerEmail: string;
    customerPhone?: string;
    type?: string;
  };
  customer?: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  };
}

interface ViewingsResponse {
  viewings: ViewingRequest[];
}

export default function ViewingsPage() {
  const [requests, setRequests] = useState<ViewingRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchViewings = async () => {
    setIsLoading(true);
    try {
      const data = await apiJson<ViewingsResponse>("/api/properties/viewings");
      if (data?.viewings) {
        setRequests(data.viewings);
      }
    } catch (error: unknown) {
      const _errMsg = error instanceof Error ? error.message : String(error);
      logger.error("[FETCH_VIEWINGS_ERROR]", {
        error: _errMsg,
        app: "merchant",
      });
      toast.error(_errMsg || "Failed to load viewing requests");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchViewings();
  }, []);

  const pendingRequests = requests.filter(
    (r) => (r as any).status?.toUpperCase() === "PENDING",
  );
  const upcomingRequests = requests.filter((r) => (r as any).status === "CONFIRMED");

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">
            Tour Requests
          </h1>
          <p className="text-text-tertiary">
            Manage incoming property viewing requests.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchViewings}
          disabled={isLoading}
        >
          <RefreshCcw size={16} className={isLoading ? "animate-spin" : ""} />
        </Button>
      </div>

      {/* Pending Requests Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-warning" />
          <h2 className="text-lg font-semibold text-text-primary">
            New Requests ({pendingRequests.length})
          </h2>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="animate-spin text-text-tertiary" />
          </div>
        ) : pendingRequests.length === 0 ? (
          <div className="text-sm text-text-tertiary italic pl-4">
            No new requests pending approval.
          </div>
        ) : (
          <div className="grid gap-4">
            {pendingRequests.map((req) => (
              <ViewingRequestCard
                key={req.id}
                request={req}
                onUpdate={fetchViewings}
              />
            ))}
          </div>
        )}
      </div>

      <div className="h-px bg-background/30" />

      {/* Upcoming Tours Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-primary" />
          <h2 className="text-lg font-semibold text-text-primary">
            Upcoming Tours ({upcomingRequests.length})
          </h2>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="animate-spin text-text-tertiary" />
          </div>
        ) : upcomingRequests.length === 0 ? (
          <div className="bg-background/30 border border-border/40 rounded-xl p-8 text-center">
            <Home className="mx-auto text-text-tertiary mb-2" size={32} />
            <p className="text-text-tertiary font-medium">
              No upcoming tours scheduled.
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {upcomingRequests.map((req) => (
              <ViewingRequestCard
                key={req.id}
                request={req}
                onUpdate={fetchViewings}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
