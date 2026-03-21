"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { MapPin, Navigation, Phone, Bike, Car, Package, Clock, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface RiderLocation {
  latitude: number;
  longitude: number;
  heading?: number;
  speed?: number;
  lastUpdated?: string;
}

interface RiderInfo {
  name?: string;
  phone?: string;
  photoUrl?: string;
  vehicleType?: string;
}

interface LocationPoint {
  latitude: number;
  longitude: number;
  address?: string;
}

interface LiveDeliveryMapProps {
  rider: RiderInfo & RiderLocation;
  pickup: LocationPoint;
  delivery: LocationPoint;
  eta?: number;
  status: string;
  orderRef?: string;
  className?: string;
  onRefresh?: () => void;
  isLoading?: boolean;
  error?: string | null;
}

// Simple map component using OpenStreetMap tiles
export function LiveDeliveryMap({
  rider,
  pickup,
  delivery,
  eta,
  status,
  orderRef,
  className = "",
  onRefresh,
  isLoading,
  error,
}: LiveDeliveryMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapInstance, setMapInstance] = useState<any>(null);
  const [riderMarker, setRiderMarker] = useState<any>(null);
  const [mapError, setMapError] = useState<string | null>(null);

  // Calculate center point between pickup and delivery
  const centerLat = (pickup.latitude + delivery.latitude) / 2;
  const centerLng = (pickup.longitude + delivery.longitude) / 2;

  // Initialize map
  useEffect(() => {
    if (typeof window === "undefined" || !mapRef.current) return;

    let L: any;
    try {
      // Dynamic import Leaflet
      import("leaflet" as any).then((leaflet) => {
        L = leaflet.default || leaflet;
        
        // Import CSS
        import("leaflet/dist/leaflet.css" as any);

        // Fix default icon paths
        delete (L.Icon.Default.prototype as any)._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
          iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
          shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
        });

        // Create map
        const map = L.map(mapRef.current, {
          zoomControl: false,
          attributionControl: false,
        }).setView([centerLat, centerLng], 14);

        // Add tile layer (OpenStreetMap)
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          maxZoom: 19,
          attribution: "© OpenStreetMap contributors",
        }).addTo(map);

        // Add zoom control to top right
        L.control.zoom({ position: "topright" }).addTo(map);

        // Custom icons
        const pickupIcon = L.divIcon({
          className: "custom-marker",
          html: `<div class="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center shadow-lg border-2 border-white"><svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg></div>`,
          iconSize: [32, 32],
          iconAnchor: [16, 32],
        });

        const deliveryIcon = L.divIcon({
          className: "custom-marker",
          html: `<div class="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center shadow-lg border-2 border-white"><svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg></div>`,
          iconSize: [32, 32],
          iconAnchor: [16, 32],
        });

        const riderIcon = L.divIcon({
          className: "custom-marker",
          html: `<div class="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center shadow-lg border-3 border-white animate-pulse"><svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg></div>`,
          iconSize: [40, 40],
          iconAnchor: [20, 40],
        });

        // Add markers
        const pickupMarker = L.marker([pickup.latitude, pickup.longitude], { icon: pickupIcon })
          .addTo(map)
          .bindPopup("<b>Pickup</b><br>" + (pickup.address || "Store location"));

        const deliveryMarker = L.marker([delivery.latitude, delivery.longitude], { icon: deliveryIcon })
          .addTo(map)
          .bindPopup("<b>Delivery</b><br>" + (delivery.address || "Customer address"));

        // Add rider marker if location available
        let riderMarkerInstance: any;
        if (rider.latitude && rider.longitude) {
          riderMarkerInstance = L.marker([rider.latitude, rider.longitude], { 
            icon: riderIcon,
            zIndexOffset: 1000 
          })
            .addTo(map)
            .bindPopup("<b>Rider</b><br>" + (rider.name || "On the way"));
        }

        // Fit bounds to show all markers
        const bounds = L.latLngBounds([
          [pickup.latitude, pickup.longitude],
          [delivery.latitude, delivery.longitude],
        ]);
        if (rider.latitude && rider.longitude) {
          bounds.extend([rider.latitude, rider.longitude]);
        }
        map.fitBounds(bounds, { padding: [50, 50] });

        setMapInstance(map);
        setRiderMarker(riderMarkerInstance);
      });
    } catch (err) {
      setMapError("Failed to load map");
    }

    return () => {
      if (mapInstance) {
        mapInstance.remove();
      }
    };
  }, [pickup.latitude, pickup.longitude, delivery.latitude, delivery.longitude]);

  // Update rider position
  useEffect(() => {
    if (!mapInstance || !riderMarker || !rider.latitude || !rider.longitude) return;
    
    riderMarker.setLatLng([rider.latitude, rider.longitude]);
  }, [rider.latitude, rider.longitude, mapInstance, riderMarker]);

  const getStatusBadge = () => {
    const statusMap: Record<string, { color: string; label: string }> = {
      PENDING: { color: "bg-yellow-500", label: "Pending" },
      ACCEPTED: { color: "bg-blue-500", label: "Accepted" },
      PICKED_UP: { color: "bg-purple-500", label: "Picked Up" },
      IN_TRANSIT: { color: "bg-orange-500", label: "In Transit" },
      DELIVERED: { color: "bg-green-500", label: "Delivered" },
      FAILED: { color: "bg-red-500", label: "Failed" },
      CANCELED: { color: "bg-gray-500", label: "Canceled" },
    };
    
    const statusInfo = statusMap[status] || { color: "bg-gray-500", label: status };
    
    return (
      <Badge className={`${statusInfo.color} text-white`}>
        {statusInfo.label}
      </Badge>
    );
  };

  const getVehicleIcon = () => {
    if (rider.vehicleType?.toLowerCase().includes("car")) return <Car className="w-4 h-4" />;
    if (rider.vehicleType?.toLowerCase().includes("van")) return <Package className="w-4 h-4" />;
    return <Bike className="w-4 h-4" />;
  };

  if (error || mapError) {
    return (
      <Card className={`p-6 ${className}`}>
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
          <p className="text-gray-600 mb-4">{error || mapError}</p>
          {onRefresh && (
            <Button onClick={onRefresh} variant="outline">
              Try Again
            </Button>
          )}
        </div>
      </Card>
    );
  }

  return (
    <div className={`flex flex-col gap-4 ${className}`}>
      {/* Map Container */}
      <Card className="relative overflow-hidden">
        <div ref={mapRef} className="w-full h-[400px] bg-gray-100" />
        
        {/* Loading overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
            <div className="flex items-center gap-2 text-gray-600">
              <div className="w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin" />
              Updating location...
            </div>
          </div>
        )}

        {/* Refresh button */}
        {onRefresh && (
          <Button
            size="sm"
            variant="secondary"
            className="absolute top-4 left-4 z-[400]"
            onClick={onRefresh}
            disabled={isLoading}
          >
            <Navigation className="w-4 h-4 mr-1" />
            Refresh
          </Button>
        )}
      </Card>

      {/* Rider Info Card */}
      <Card className="p-4">
        <div className="flex items-start gap-4">
          <Avatar className="w-12 h-12">
            <AvatarImage src={rider.photoUrl} />
            <AvatarFallback className="bg-orange-100 text-orange-600">
              {rider.name?.charAt(0) || "R"}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-gray-900">
                {rider.name || "Your Rider"}
              </h3>
              {getStatusBadge()}
            </div>
            
            <div className="flex items-center gap-4 text-sm text-gray-600">
              {rider.vehicleType && (
                <span className="flex items-center gap-1">
                  {getVehicleIcon()}
                  {rider.vehicleType}
                </span>
              )}
              
              {eta && (
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  ETA: {eta} min
                </span>
              )}
            </div>
          </div>

          {rider.phone && (
            <Button size="sm" variant="outline" asChild>
              <a href={`tel:${rider.phone}`}>
                <Phone className="w-4 h-4" />
              </a>
            </Button>
          )}
        </div>

        {/* Route Info */}
        <div className="mt-4 pt-4 border-t grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-gray-500 mb-1">From</p>
            <p className="text-sm font-medium truncate">{pickup.address || "Store"}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">To</p>
            <p className="text-sm font-medium truncate">{delivery.address || "Customer"}</p>
          </div>
        </div>

        {orderRef && (
          <div className="mt-4 pt-4 border-t text-center">
            <p className="text-sm text-gray-500">
              Order: <span className="font-medium text-gray-900">{orderRef}</span>
            </p>
          </div>
        )}
      </Card>
    </div>
  );
}

export default LiveDeliveryMap;
