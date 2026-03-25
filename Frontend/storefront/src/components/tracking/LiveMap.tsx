"use client";

import React, { useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import type { LatLng } from "@/types/tracking";
import "leaflet/dist/leaflet.css";

// Fix Leaflet marker icon paths in Next.js bundling.
import L from "leaflet";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

const DefaultIcon = L.icon({
  iconRetinaUrl: (markerIcon2x as unknown as { src: string }).src,
  iconUrl: (markerIcon as unknown as { src: string }).src,
  shadowUrl: (markerShadow as unknown as { src: string }).src,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

function isValidPoint(p?: LatLng | null): p is LatLng {
  return Boolean(p && Number.isFinite(p.lat) && Number.isFinite(p.lng));
}

export function LiveMap({
  rider,
  pickup,
  delivery,
}: {
  rider?: LatLng | null;
  pickup?: LatLng | null;
  delivery?: LatLng | null;
}): React.JSX.Element {
  // react-leaflet's TS types can vary across versions; we keep runtime-safe props while
  // avoiding brittle type coupling.
  const MapContainerAny = MapContainer as unknown as React.ComponentType<any>;
  const TileLayerAny = TileLayer as unknown as React.ComponentType<any>;
  const MarkerAny = Marker as unknown as React.ComponentType<any>;
  const PopupAny = Popup as unknown as React.ComponentType<any>;

  const points = useMemo(
    () => [rider, pickup, delivery].filter(isValidPoint),
    [rider, pickup, delivery],
  );

  const center = points[0] ?? { lat: 6.5244, lng: 3.3792 }; // Lagos fallback

  return (
    <div className="w-full h-[380px] rounded-xl overflow-hidden border border-gray-100">
      <MapContainerAny
        center={center}
        zoom={13}
        scrollWheelZoom={false}
        style={{ width: "100%", height: "100%" }}
      >
        <TileLayerAny
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {isValidPoint(pickup) && (
          <MarkerAny position={pickup}>
            <PopupAny>Pickup</PopupAny>
          </MarkerAny>
        )}
        {isValidPoint(delivery) && (
          <MarkerAny position={delivery}>
            <PopupAny>Drop-off</PopupAny>
          </MarkerAny>
        )}
        {isValidPoint(rider) && (
          <MarkerAny position={rider}>
            <PopupAny>Rider</PopupAny>
          </MarkerAny>
        )}
      </MapContainerAny>
    </div>
  );
}

