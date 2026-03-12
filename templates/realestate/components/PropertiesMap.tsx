"use client";

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface Property {
  id: string;
  name: string;
  location: string;
  lat?: number;
  lng?: number;
  price: number;
  bedrooms?: number;
  bathrooms?: number;
}

interface PropertiesMapProps {
  properties: Property[];
  className?: string;
  onPropertyClick?: (propertyId: string) => void;
}

export default function PropertiesMap({ 
  properties, 
  className = "",
  onPropertyClick 
}: PropertiesMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current || properties.length === 0) return;

    // Clean up existing map instance
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
    }

    // Filter properties with valid coordinates
    const validProperties = properties.filter(p => p.lat && p.lng);

    if (validProperties.length === 0) return;

    // Calculate bounds to fit all properties
    const bounds = L.latLngBounds(
      validProperties.map(p => [p.lat!, p.lng!] as [number, number])
    );

    // Create map instance
    const map = L.map(mapRef.current);
    mapInstanceRef.current = map;

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 18,
    }).addTo(map);

    // Add markers for each property
    validProperties.forEach(property => {
      if (!property.lat || !property.lng) return;

      const marker = L.marker([property.lat, property.lng]).addTo(map);
      
      // Create popup content
      const popupContent = `
        <div class="p-2 min-w-64">
          <h3 class="font-semibold text-gray-800">${property.name}</h3>
          <p class="text-sm text-gray-600 mt-1">${property.location}</p>
          <div class="flex items-center gap-2 mt-2 text-sm">
            ${property.bedrooms ? `<span>${property.bedrooms} bed</span>` : ''}
            ${property.bathrooms ? `<span>${property.bathrooms} bath</span>` : ''}
          </div>
          <p class="font-bold text-emerald-600 mt-2">₦${property.price.toLocaleString()}</p>
          ${onPropertyClick ? `<button onclick="window.handlePropertyClick('${property.id}')" class="mt-2 px-3 py-1 bg-emerald-600 text-white rounded text-sm hover:bg-emerald-700">View Details</button>` : ''}
        </div>
      `;
      
      marker.bindPopup(popupContent);
      
      // Add click handler if provided
      if (onPropertyClick) {
        marker.on('click', () => {
          onPropertyClick(property.id);
        });
      }
    });

    // Fit map to show all properties
    map.fitBounds(bounds, { padding: [50, 50] });

    // Make handlePropertyClick available globally for popup buttons
    if (onPropertyClick) {
      (window as any).handlePropertyClick = onPropertyClick;
    }

    // Cleanup function
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
      delete (window as any).handlePropertyClick;
    };
  }, [properties, onPropertyClick]);

  if (properties.filter(p => p.lat && p.lng).length === 0) {
    return (
      <div className={`bg-gray-100 rounded-lg flex items-center justify-center ${className}`}>
        <div className="text-center p-8">
          <div className="text-gray-400 mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
          </div>
          <p className="text-gray-500">No properties with location data</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={mapRef} 
      className={`rounded-lg overflow-hidden ${className}`}
    />
  );
}