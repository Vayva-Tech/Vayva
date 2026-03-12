"use client";

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface PropertyMapProps {
  latitude: number;
  longitude: number;
  address: string;
  propertyTitle: string;
  className?: string;
}

export default function PropertyMap({ 
  latitude, 
  longitude, 
  address, 
  propertyTitle,
  className = ""
}: PropertyMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current || !latitude || !longitude) return;

    // Clean up existing map instance
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
    }

    // Create map instance
    const map = L.map(mapRef.current).setView([latitude, longitude], 15);
    mapInstanceRef.current = map;

    // Add OpenStreetMap tiles (completely free)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    // Add property marker
    const marker = L.marker([latitude, longitude]).addTo(map);
    
    // Add popup with property info
    marker.bindPopup(`
      <div class="p-2">
        <h3 class="font-semibold text-gray-800">${propertyTitle}</h3>
        <p class="text-sm text-gray-600 mt-1">${address}</p>
      </div>
    `);

    // Add circle around property (500m radius)
    L.circle([latitude, longitude], {
      color: '#10b981',
      fillColor: '#10b981',
      fillOpacity: 0.1,
      radius: 500
    }).addTo(map);

    // Cleanup function
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [latitude, longitude, address, propertyTitle]);

  return (
    <div 
      ref={mapRef} 
      className={`w-full h-96 rounded-lg overflow-hidden ${className}`}
    />
  );
}