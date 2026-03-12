"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { 
  ArrowLeft, 
  RefreshCw, 
  Phone, 
  MapPin, 
  Clock, 
  Package,
  Bike,
  AlertCircle,
  CheckCircle2,
  Share2,
  Copy,
  MessageCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import Link from "next/link";
import { apiJson } from "@/lib/api-client-shared";

interface LiveTrackingData {
  orderId: string;
  orderRef: string;
  trackingCode: string;
  status: string;
  provider: string;
  recipient: {
    name: string;
    phone: string;
    address: {
      line1: string;
      city: string;
      state: string;
    };
  };
  live: {
    rider: {
      name: string;
      phone: string;
      photoUrl?: string;
      vehicleType: string;
      latitude: number;
      longitude: number;
      heading?: number;
      speed?: number;
      lastUpdated?: string;
    } | null;
    pickup: {
      latitude: number;
      longitude: number;
      address: string;
    };
    delivery: {
      latitude: number;
      longitude: number;
      address: string;
    };
    eta?: number;
    status: string;
    fallback?: boolean;
  } | null;
  lastUpdated: string;
}

// Simple embedded map using iframe with Google Maps or OpenStreetMap
function EmbeddedMap({ 
  pickup, 
  delivery, 
  rider 
}: { 
  pickup: { lat: number; lng: number }; 
  delivery: { lat: number; lng: number };
  rider?: { lat: number; lng: number } | null;
}) {
  // Calculate center
  const centerLat = (pickup.lat + delivery.lat) / 2;
  const centerLng = (pickup.lng + delivery.lng) / 2;
  
  // Build OpenStreetMap embed URL with markers
  const markers = [
    `marker=${pickup.lat},${pickup.lng}`,
    `marker=${delivery.lat},${delivery.lng}`,
  ];
  if (rider) {
    markers.push(`marker=${rider.lat},${rider.lng}`);
  }
  
  const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${centerLng - 0.02},${centerLat - 0.02},${centerLng + 0.02},${centerLat + 0.02}&layer=mapnik&${markers.join("&")}`;

  return (
    <div className="relative w-full h-full rounded-lg overflow-hidden">
      <iframe
        src={mapUrl}
        width="100%"
        height="100%"
        frameBorder="0"
        scrolling="no"
        marginHeight={0}
        marginWidth={0}
        style={{ border: 0 }}
        className="grayscale-[20%]"
      />
      
      {/* Rider position overlay */}
      {rider && (
        <div 
          className="absolute w-4 h-4 bg-orange-500 rounded-full border-2 border-white shadow-lg animate-pulse"
          style={{
            left: `${((rider.lng - (centerLng - 0.02)) / 0.04) * 100}%`,
            top: `${((centerLat + 0.02 - rider.lat) / 0.04) * 100}%`,
            transform: "translate(-50%, -50%)",
          }}
        />
      )}
    </div>
  );
}

export default function LiveTrackingPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order");
  
  const [tracking, setTracking] = useState<LiveTrackingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchTracking = useCallback(async () => {
    if (!orderId) {
      setError("No order ID provided");
      setLoading(false);
      return;
    }

    try {
      const response = await apiJson<{ success: boolean; tracking: typeof tracking; error?: string }>(`/api/orders/${orderId}/live-tracking`);
      
      if (response.success && response.tracking) {
        setTracking(response.tracking);
        setError(null);
      } else {
        setError(response.error || "Failed to load tracking data");
      }
    } catch (err) {
      setError("Failed to connect to tracking service");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [orderId]);

  // Initial load
  useEffect(() => {
    fetchTracking();
  }, [fetchTracking]);

  // Auto refresh every 30 seconds
  useEffect(() => {
    if (!autoRefresh || !tracking?.live?.rider) return;
    
    const interval = setInterval(() => {
      setRefreshing(true);
      fetchTracking();
    }, 30000);

    return () => clearInterval(interval);
  }, [autoRefresh, fetchTracking, tracking?.live?.rider]);

  const handleShare = () => {
    if (!tracking?.trackingCode) return;
    
    const url = `${window.location.origin}/tracking?code=${tracking.trackingCode}`;
    
    if (navigator.share) {
      navigator.share({
        title: `Track Order ${tracking.orderRef}`,
        text: `Track your delivery from ${tracking.recipient.name}`,
        url,
      });
    } else {
      navigator.clipboard.writeText(url);
      toast.success("Tracking link copied to clipboard");
    }
  };

  const handleCopyLink = () => {
    if (!tracking?.trackingCode) return;
    const url = `${window.location.origin}/tracking?code=${tracking.trackingCode}`;
    navigator.clipboard.writeText(url);
    toast.success("Link copied to clipboard");
  };

  const getStatusInfo = (status: string) => {
    const statusMap: Record<string, { 
      label: string; 
      color: string; 
      icon: React.ReactNode;
      description: string;
    }> = {
      PENDING: { 
        label: "Order Confirmed", 
        color: "bg-yellow-500",
        icon: <Package className="w-5 h-5" />,
        description: "Your order is being prepared"
      },
      ACCEPTED: { 
        label: "Rider Assigned", 
        color: "bg-blue-500",
        icon: <Bike className="w-5 h-5" />,
        description: "A rider has been assigned to your delivery"
      },
      PICKED_UP: { 
        label: "Picked Up", 
        color: "bg-purple-500",
        icon: <CheckCircle2 className="w-5 h-5" />,
        description: "Your order has been picked up"
      },
      IN_TRANSIT: { 
        label: "On the Way", 
        color: "bg-orange-500",
        icon: <Bike className="w-5 h-5" />,
        description: "Your rider is on the way to you"
      },
      DELIVERED: { 
        label: "Delivered", 
        color: "bg-green-500",
        icon: <CheckCircle2 className="w-5 h-5" />,
        description: "Your order has been delivered"
      },
      FAILED: { 
        label: "Delivery Failed", 
        color: "bg-red-500",
        icon: <AlertCircle className="w-5 h-5" />,
        description: "There was an issue with delivery"
      },
      CANCELED: { 
        label: "Canceled", 
        color: "bg-gray-500",
        icon: <AlertCircle className="w-5 h-5" />,
        description: "This delivery has been canceled"
      },
    };
    
    return statusMap[status] || { 
      label: status, 
      color: "bg-gray-500",
      icon: <Package className="w-5 h-5" />,
      description: "Status unknown"
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading live tracking...</p>
        </div>
      </div>
    );
  }

  if (error || !tracking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-6 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            Tracking Unavailable
          </h2>
          <p className="text-gray-600 mb-4">{error || "Could not load tracking data"}</p>
          <div className="flex gap-2 justify-center">
            <Button onClick={fetchTracking} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry
            </Button>
            <Button asChild>
              <Link href="/orders">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Orders
              </Link>
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const statusInfo = getStatusInfo(tracking.status);
  const hasLiveTracking = tracking.live?.rider?.latitude && tracking.live?.rider?.longitude;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" asChild>
                <Link href="/orders">
                  <ArrowLeft className="w-5 h-5" />
                </Link>
              </Button>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">
                  Live Tracking
                </h1>
                <p className="text-sm text-gray-500">
                  Order {tracking.orderRef}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={autoRefresh ? "text-emerald-600" : ""}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
                {autoRefresh ? "Auto" : "Manual"}
              </Button>
              <Button variant="outline" size="icon" onClick={handleShare}>
                <Share2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Map & Status */}
          <div className="lg:col-span-2 space-y-6">
            {/* Status Card */}
            <Card className="p-6">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 ${statusInfo.color} rounded-full flex items-center justify-center text-white`}>
                  {statusInfo.icon}
                </div>
                <div className="flex-1">
                  <h2 className="text-lg font-semibold text-gray-900">
                    {statusInfo.label}
                  </h2>
                  <p className="text-gray-600">
                    {statusInfo.description}
                  </p>
                </div>
                <Badge className={`${statusInfo.color} text-white`}>
                  {tracking.status}
                </Badge>
              </div>
              
              {tracking.live?.eta && (
                <div className="mt-4 pt-4 border-t">
                  <div className="flex items-center gap-2 text-emerald-600">
                    <Clock className="w-5 h-5" />
                    <span className="font-semibold">
                      Estimated arrival in {tracking.live.eta} minutes
                    </span>
                  </div>
                </div>
              )}
            </Card>

            {/* Map Card */}
            <Card className="overflow-hidden">
              <div className="h-[400px]">
                {hasLiveTracking && tracking.live ? (
                  <EmbeddedMap
                    pickup={{ 
                      lat: tracking.live.pickup?.latitude || 0, 
                      lng: tracking.live.pickup?.longitude || 0 
                    }}
                    delivery={{ 
                      lat: tracking.live.delivery?.latitude || 0, 
                      lng: tracking.live.delivery?.longitude || 0 
                    }}
                    rider={tracking.live.rider ? {
                      lat: tracking.live.rider.latitude,
                      lng: tracking.live.rider.longitude,
                    } : null}
                  />
                ) : (
                  <div className="h-full flex items-center justify-center bg-gray-100">
                    <div className="text-center">
                      <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-600">Live map unavailable</p>
                      <p className="text-sm text-gray-500">
                        Rider location will appear once delivery starts
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {/* Delivery Timeline */}
            <Card className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Delivery Progress</h3>
              <div className="space-y-4">
                {[
                  { status: "PENDING", label: "Order Confirmed", time: "Just now" },
                  { status: "ACCEPTED", label: "Rider Assigned", time: tracking.status !== "PENDING" ? "2 min ago" : null },
                  { status: "PICKED_UP", label: "Picked Up", time: ["PICKED_UP", "IN_TRANSIT", "DELIVERED"].includes(tracking.status) ? "5 min ago" : null },
                  { status: "IN_TRANSIT", label: "On the Way", time: ["IN_TRANSIT", "DELIVERED"].includes(tracking.status) ? "Current" : null },
                  { status: "DELIVERED", label: "Delivered", time: tracking.status === "DELIVERED" ? "Just now" : null },
                ].map((step, index) => {
                  const isActive = step.status === tracking.status;
                  const isCompleted = [
                    "ACCEPTED", "PICKED_UP", "IN_TRANSIT", "DELIVERED"
                  ].indexOf(tracking.status) >= [
                    "ACCEPTED", "PICKED_UP", "IN_TRANSIT", "DELIVERED"
                  ].indexOf(step.status);
                  
                  return (
                    <div key={step.status} className="flex items-start gap-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                        isActive 
                          ? "bg-orange-500 text-white" 
                          : isCompleted 
                            ? "bg-emerald-500 text-white"
                            : "bg-gray-200 text-gray-500"
                      }`}>
                        {isCompleted ? (
                          <CheckCircle2 className="w-5 h-5" />
                        ) : (
                          index + 1
                        )}
                      </div>
                      <div className="flex-1">
                        <p className={`font-medium ${isActive ? "text-gray-900" : "text-gray-600"}`}>
                          {step.label}
                        </p>
                        {step.time && (
                          <p className="text-sm text-gray-500">{step.time}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>

          {/* Right Column - Rider & Details */}
          <div className="space-y-6">
            {/* Rider Card */}
            {tracking.live?.rider && (
              <Card className="p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Your Rider</h3>
                <div className="flex items-center gap-4 mb-4">
                  <Avatar className="w-16 h-16">
                    <AvatarImage src={tracking.live.rider.photoUrl} />
                    <AvatarFallback className="bg-orange-100 text-orange-600 text-xl">
                      {tracking.live.rider.name?.charAt(0) || "R"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-gray-900">
                      {tracking.live.rider.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {tracking.live.rider.vehicleType || "Motorcycle"}
                    </p>
                  </div>
                </div>
                
                {tracking.live.rider.phone && (
                  <Button className="w-full" asChild>
                    <a href={`tel:${tracking.live.rider.phone}`}>
                      <Phone className="w-4 h-4 mr-2" />
                      Call Rider
                    </a>
                  </Button>
                )}
              </Card>
            )}

            {/* Delivery Details */}
            <Card className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Delivery Details</h3>
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">From</p>
                  <p className="text-gray-900">
                    {tracking.live?.pickup?.address || "Store"}
                  </p>
                </div>
                
                <Separator />
                
                <div>
                  <p className="text-sm text-gray-500 mb-1">To</p>
                  <p className="text-gray-900 font-medium">
                    {tracking.recipient.name}
                  </p>
                  <p className="text-gray-600 text-sm">
                    {tracking.recipient.address.line1}, {tracking.recipient.address.city}
                  </p>
                </div>
                
                <Separator />
                
                <div>
                  <p className="text-sm text-gray-500 mb-1">Tracking Code</p>
                  <div className="flex items-center gap-2">
                    <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">
                      {tracking.trackingCode}
                    </code>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6"
                      onClick={handleCopyLink}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>

            {/* Share Card */}
            <Card className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Share Tracking</h3>
              <div className="space-y-2">
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={handleCopyLink}
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Link
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => {
                    const url = `${window.location.origin}/tracking?code=${tracking.trackingCode}`;
                    window.open(`https://wa.me/?text=${encodeURIComponent(`Track my order: ${url}`)}`, "_blank");
                  }}
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Share via WhatsApp
                </Button>
              </div>
            </Card>

            {/* Last Updated */}
            <p className="text-xs text-center text-gray-500">
              Last updated: {new Date(tracking.lastUpdated).toLocaleTimeString()}
              {tracking.live?.fallback && (
                <span className="block mt-1 text-orange-500">
                  Live tracking temporarily unavailable
                </span>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
