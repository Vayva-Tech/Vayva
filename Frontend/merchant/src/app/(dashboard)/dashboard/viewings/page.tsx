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
      const data = await apiJson<ViewingsResponse>("/properties/viewings");
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
    <div className="max-w-5xl space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Tour Requests
          </h1>
          <p className="text-gray-500">
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
          <div className="w-2 h-2 rounded-full bg-amber-500" />
          <h2 className="text-lg font-semibold text-gray-900">
            New Requests ({pendingRequests.length})
          </h2>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="animate-spin text-gray-500" />
          </div>
        ) : pendingRequests.length === 0 ? (
          <div className="text-sm text-gray-500 italic pl-4">
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

      <div className="h-px bg-white" />

      {/* Upcoming Tours Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500" />
          <h2 className="text-lg font-semibold text-gray-900">
            Upcoming Tours ({upcomingRequests.length})
          </h2>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="animate-spin text-gray-500" />
          </div>
        ) : upcomingRequests.length === 0 ? (
          <div className="bg-white border border-gray-100 rounded-xl p-8 text-center">
            <Home className="mx-auto text-gray-500 mb-2" size={32} />
            <p className="text-gray-500 font-medium">
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
