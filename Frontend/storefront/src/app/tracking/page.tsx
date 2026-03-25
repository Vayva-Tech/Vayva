"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@vayva/ui";
import { StoreShell } from "@/components/StoreShell";
import { useStore } from "@/context/StoreContext";
import { TrackingService } from "@/services/tracking.service";
import { TrackingInfo } from "@/types/tracking";
import { MapPin, Package, Truck, CheckCircle, Clock, AlertCircle, ExternalLink } from "lucide-react";
import dynamic from "next/dynamic";

const LiveMap = dynamic(
  async () =>
    (await import("@/components/tracking/LiveMap")).LiveMap,
  { ssr: false },
);

interface TrackingPageProps {
  params: Promise<{ code: string }>;
}

export default function TrackingPage({ params }: TrackingPageProps): React.JSX.Element {
  const { store } = useStore();
  const [_trackingCode, setTrackingCode] = useState("");
  const [trackingInfo, setTrackingInfo] = useState<TrackingInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchInput, setSearchInput] = useState("");

  // Resolve params on mount
  useEffect(() => {
    params.then((resolvedParams) => {
      const code = resolvedParams?.code || "";
      setTrackingCode(code);
      setSearchInput(code);
    });
  }, [params]);

  const fetchTracking = async (code: string) => {
    if (!code.trim()) {
      setError("Please enter a tracking code");
      return;
    }

    setLoading(true);
    setError("");
    setTrackingInfo(null);

    try {
      const result = await TrackingService.getTrackingInfo(code.trim());
      if (result) {
        setTrackingInfo(result);
      } else {
        setError("Tracking code not found. Please check and try again.");
      }
    } catch {
      setError("An error occurred while fetching tracking information.");
    }
    setLoading(false);
  };

  // Auto-fetch if code is provided in URL
  useEffect(() => {
    params.then((resolvedParams) => {
      if (resolvedParams?.code) {
        const code = resolvedParams.code;
        queueMicrotask(() => { void fetchTracking(code); });
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchTracking(searchInput);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "CREATED":
        return <Package className="w-6 h-6" />;
      case "REQUESTED":
      case "ACCEPTED":
      case "ASSIGNED":
        return <Clock className="w-6 h-6" />;
      case "PICKED_UP":
      case "IN_TRANSIT":
        return <Truck className="w-6 h-6" />;
      case "DELIVERED":
        return <CheckCircle className="w-6 h-6" />;
      case "FAILED":
      case "CANCELED":
        return <AlertCircle className="w-6 h-6" />;
      default:
        return <Package className="w-6 h-6" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "DELIVERED":
        return "bg-green-100 text-green-800 border-green-200";
      case "IN_TRANSIT":
      case "PICKED_UP":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "FAILED":
      case "CANCELED":
        return "bg-red-100 text-red-800 border-red-200";
      case "ACCEPTED":
      case "ASSIGNED":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  if (!store) return <></>;

  return (
    <StoreShell>
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold mb-3">Track Your Delivery</h1>
          <p className="text-gray-600">
            Enter your tracking code to see the current status of your delivery
          </p>
        </div>

        {/* Search Form */}
        <form
          onSubmit={handleSearch}
          className="bg-background/40 backdrop-blur-sm p-6 rounded-xl mb-8 shadow-sm border border-gray-100"
        >
          <div className="flex gap-3">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Enter tracking code (e.g., KWIK-12345)"
              className="flex-1 p-4 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-black/10 text-lg"
              required
            />
            <Button
              type="submit"
              disabled={loading}
              className="bg-black text-white px-8 py-4 rounded-lg font-bold hover:bg-gray-900 transition-colors disabled:opacity-50"
            >
              {loading ? "Searching..." : "Track"}
            </Button>
          </div>
          {error && (
            <p className="text-red-500 text-sm mt-3 text-center">{error}</p>
          )}
        </form>

        {/* Tracking Results */}
        {trackingInfo && (
          <div className="space-y-6">
            {/* Status Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Tracking Code</p>
                    <p className="text-2xl font-bold">{trackingInfo.code}</p>
                  </div>
                  <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border ${getStatusColor(trackingInfo.status)}`}>
                    {getStatusIcon(trackingInfo.status)}
                    <span className="font-semibold">{trackingInfo.statusLabel}</span>
                  </div>
                </div>

                <p className="text-gray-600">{trackingInfo.statusDescription}</p>

                {/* Payment / COD */}
                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="p-3 rounded-lg bg-gray-50 border border-gray-100">
                    <div className="text-xs text-gray-500">Product</div>
                    <div className="font-semibold text-gray-900">
                      {trackingInfo.order.paymentStatus === "SUCCESS"
                        ? "Paid"
                        : trackingInfo.payment?.cod
                          ? "Pay on delivery"
                          : trackingInfo.order.paymentStatus || "Pending"}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Subtotal: ₦{trackingInfo.order.subtotal.toLocaleString()}
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-gray-50 border border-gray-100">
                    <div className="text-xs text-gray-500">Delivery</div>
                    <div className="font-semibold text-gray-900">
                      {trackingInfo.payment?.cod?.includesDelivery
                        ? "COD (included)"
                        : trackingInfo.order.shippingTotal > 0
                          ? "Prepaid/Configured"
                          : "Free/Pickup"}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Delivery fee: ₦{trackingInfo.order.shippingTotal.toLocaleString()}
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-gray-50 border border-gray-100">
                    <div className="text-xs text-gray-500">Collect on delivery</div>
                    <div className="font-semibold text-gray-900">
                      {trackingInfo.payment?.cod
                        ? `₦${(trackingInfo.payment.cod.amount ?? trackingInfo.order.total).toLocaleString()}`
                        : "₦0"}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {trackingInfo.payment?.cod
                        ? trackingInfo.payment.cod.includesDelivery
                          ? "Includes delivery"
                          : "Product only"
                        : "No cash collection"}
                    </div>
                  </div>
                </div>

                {/* External Tracking Link */}
                {trackingInfo.externalTrackingUrl && (
                  <a
                    href={trackingInfo.externalTrackingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 mt-4 text-blue-600 hover:text-blue-800 font-medium"
                  >
                    View on {trackingInfo.provider} Map
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>

              {/* Progress Bar */}
              <div className="bg-gray-50 px-6 py-4 border-t border-gray-100">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">
                    Last updated: {new Date(trackingInfo.lastUpdated).toLocaleString()}
                  </span>
                  {trackingInfo.estimatedDelivery && (
                    <span className="text-gray-700">
                      Estimated delivery: {new Date(trackingInfo.estimatedDelivery).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Live Map */}
            {trackingInfo.live && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <h3 className="font-bold">Live tracking</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Last sync:{" "}
                      {trackingInfo.live.lastSyncAt
                        ? new Date(trackingInfo.live.lastSyncAt).toLocaleString()
                        : new Date(trackingInfo.lastUpdated).toLocaleString()}
                    </p>
                  </div>
                  {trackingInfo.live.rider?.name && (
                    <div className="text-sm text-gray-700">
                      Rider: <span className="font-semibold">{trackingInfo.live.rider.name}</span>
                    </div>
                  )}
                </div>

                <LiveMap
                  rider={trackingInfo.live.rider?.location || null}
                  pickup={trackingInfo.live.pickup?.location || null}
                  delivery={trackingInfo.live.delivery?.location || null}
                />
              </div>
            )}

            {/* Delivery Details */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Recipient Info */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="font-bold mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Delivery Address
                </h3>
                <div className="space-y-2 text-sm">
                  <p className="font-medium">{trackingInfo.recipient.name}</p>
                  <p className="text-gray-600">{trackingInfo.recipient.phone}</p>
                  <p className="text-gray-600">
                    {trackingInfo.recipient.address.line1}
                    {trackingInfo.recipient.address.city && `, ${trackingInfo.recipient.address.city}`}
                    {trackingInfo.recipient.address.state && `, ${trackingInfo.recipient.address.state}`}
                  </p>
                </div>
              </div>

              {/* Order Info */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="font-bold mb-4 flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Order Details
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Order Reference</span>
                    <span className="font-medium">{trackingInfo.order.refCode}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Store</span>
                    <span className="font-medium">{trackingInfo.store.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Order Date</span>
                    <span className="font-medium">
                      {new Date(trackingInfo.order.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-gray-100">
                    <span className="font-medium">Total</span>
                    <span className="font-bold">
                      ₦{trackingInfo.order.total.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Timeline */}
            {trackingInfo.timeline.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="font-bold mb-6">Delivery Timeline</h3>
                <div className="space-y-4">
                  {trackingInfo.timeline.map((event, index) => (
                    <div
                      key={index}
                      className="flex gap-4 pb-4 border-b border-gray-100 last:border-0 last:pb-0"
                    >
                      <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                        index === 0 ? "bg-black text-white" : "bg-gray-100 text-gray-600"
                      }`}>
                        {index === 0 ? (
                          <CheckCircle className="w-5 h-5" />
                        ) : (
                          <Clock className="w-5 h-5" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{event.status}</p>
                        {event.note && (
                          <p className="text-sm text-gray-600 mt-1">{event.note}</p>
                        )}
                        {event.location && (
                          <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {event.location}
                          </p>
                        )}
                        <p className="text-xs text-gray-400 mt-2">
                          {new Date(event.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Help Section */}
            <div className="bg-gray-50 rounded-xl p-6 text-center">
              <p className="text-gray-600 mb-3">
                Need help with your delivery?
              </p>
              <a
                href={`/contact?store=${trackingInfo.store.slug}`}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Contact {trackingInfo.store.name} Support
              </a>
            </div>
          </div>
        )}
      </div>
    </StoreShell>
  );
}
