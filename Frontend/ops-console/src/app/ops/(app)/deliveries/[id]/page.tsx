"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@vayva/ui";
import { ArrowLeft, Truck, MapPin, Package, NavigationArrow as Navigation, ArrowSquareOut as ExternalLink } from "@phosphor-icons/react/ssr";
import { useToast } from "@/components/ui/use-toast";
import { OpsPageShell } from "@/components/ops/OpsPageShell";

interface DispatchJob {
  id: string;
  carrier: string;
  providerJobId?: string;
  vehicleType?: string;
  status: string;
  createdAt: string | Date;
}

interface Shipment {
  id: string;
  trackingCode: string;
  orderId: string;
  Order?: { orderNumber: string };
  status: string;
  recipientName: string;
  addressLine1: string;
  addressCity: string;
  recipientPhone: string;
  provider?: string;
  externalId?: string;
  trackingUrl?: string;
  storeId: string;
  DispatchJob?: DispatchJob[];
}

export default function DeliveryDetailPage(): React.JSX.Element {
  const { id } = useParams() as { id: string };
  const { toast } = useToast();
  const router = useRouter();
  const [shipment, setShipment] = useState<Shipment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchShipment();
  }, [id]);

  const fetchShipment = async () => {
    try {
      const res = await fetch(`/api/ops/deliveries/${id}`);
      if (res.status === 401) {
        window.location.href = "/ops/login";
        return;
      }
      if (!res.ok) throw new Error("Failed to load shipment");
      const json = await res.json();
      setShipment(json.data);
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : String(err) || "An unknown error occurred",
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <OpsPageShell title="Delivery Detail" description="Loading...">
        <div className="flex h-96 items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600"></div>
        </div>
      </OpsPageShell>
    );
  }

  if (error || !shipment) {
    return (
      <OpsPageShell title="Delivery Detail" description="Error loading shipment">
        <div className="p-8">
          <div className="bg-red-50 text-red-700 p-4 rounded-lg">
            Error: {error || "Shipment not found"}
          </div>
          <Button
            onClick={() => router.back()}
            variant="link"
            className="mt-4 text-indigo-600 hover:underline p-0 h-auto"
          >
            Go Back
          </Button>
        </div>
      </OpsPageShell>
    );
  }

  return (
    <OpsPageShell
      title={`Tracking ${shipment.trackingCode || "N/A"}`}
      description={`For Order #${shipment.Order?.orderNumber}`}
      headerActions={
        <span
          className={`px-3 py-1 rounded-full text-sm font-medium border ${shipment.status === "DELIVERED"
              ? "bg-green-50 text-green-700 border-green-200"
              : shipment.status === "FAILED"
                ? "bg-red-50 text-red-700 border-red-200"
                : "bg-blue-50 text-blue-700 border-blue-200"
          }`}
        >
          {shipment.status}
        </span>
      }
    >

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Destination */}
          <div>
            <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3 flex items-center gap-2">
              <MapPin size={16} /> Destination
            </h3>
            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              <p className="font-medium text-gray-900">
                {shipment.recipientName}
              </p>
              <p className="text-gray-600">{shipment.addressLine1}</p>
              <p className="text-gray-600">{shipment.addressCity}</p>
              <p className="text-gray-500 text-sm mt-2">
                {shipment.recipientPhone}
              </p>
            </div>
          </div>

          {/* Provider Info */}
          <div>
            <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3 flex items-center gap-2">
              <Truck size={16} /> Logistics Provider
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">Carrier</span>
                <span className="font-medium">
                  {shipment.DispatchJob?.[0]?.carrier ||
                    shipment.provider ||
                    "Unknown"}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">Reference ID</span>
                <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                  {shipment.DispatchJob?.[0]?.providerJobId ||
                    shipment.externalId ||
                    "—"}
                </span>
              </div>
              {shipment.trackingUrl && (
                <a
                  href={shipment.trackingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-white/60"
                >
                  <ExternalLink size={16} /> Track on Provider Site
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Dispatch ClockCounterClockwise as History */}
        <div className="border-t border-gray-200 bg-gray-50 px-6 py-4">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Navigation size={18} /> Dispatch ClockCounterClockwise as History
          </h3>
          <div className="space-y-4">
            {shipment.DispatchJob?.map((job) => (
              <div
                key={job.id}
                className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm"
              >
                <div className="flex justify-between mb-2">
                  <span className="font-medium text-gray-800">
                    {job.carrier}
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(job.createdAt).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">
                    Vehicle: {job.vehicleType}
                  </span>
                  <span className="px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-700">
                    {job.status}
                  </span>
                </div>
              </div>
            ))}
            {(!shipment.DispatchJob || shipment.DispatchJob?.length === 0) && (
              <p className="text-sm text-gray-500 italic">
                No dispatch jobs recorded.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <Link
          href={`/ops/merchants/${shipment.storeId}?tab=deliveries`}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          View Merchant Deliveries
        </Link>
        <Button
          onClick={async () => {
            try {
              const res = await fetch(`/api/ops/deliveries/${id}/retry`, {
                method: "POST",
              });
              if (res.ok) {
                // toast would be nice here, but using alert since it's an internal tool if toaster is not available locally
                toast({
                  title: "Success",
                  description: "Dispatch retry initiated successfully.",
                });
                window.location?.reload();
              }
            } catch {
              toast({
                title: "Error",
                description: "Failed to retry dispatch.",
                variant: "destructive",
              });
            }
          }}
          className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
        >
          Retry Delivery
        </Button>
      </div>
    </OpsPageShell>
  );
}
