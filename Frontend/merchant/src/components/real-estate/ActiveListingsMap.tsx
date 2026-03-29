"use client";
import { Button } from "@vayva/ui";

import React, { useState, useEffect } from "react";

interface Property {
  id: string;
  title: string;
  address: string;
  city: string;
  price: number;
  status: string;
  lat?: number | null;
  lng?: number | null;
  bedrooms?: number | null;
  bathrooms?: number | null;
  area?: number | null;
  images: string[];
}

export const ActiveListingsMap: React.FC = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      const response = await fetch('/realestate/properties?status=available&limit=50');
      const data = await response.json();
      
      if (data.success) {
        setProperties(data.data.properties || []);
      }
    } catch (error) {
      console.error('Failed to fetch properties:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-500';
      case 'pending': return 'bg-yellow-500';
      case 'sold': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="glass-panel p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold">Active Listings Map</h3>
        <div className="flex gap-2">
          <Button
            onClick={() => setViewMode('map')}
            className={`px-3 py-1 text-sm rounded ${viewMode === 'map' ? 'btn-gradient' : 'glass-card'}`}
          >
            Map
          </Button>
          <Button
            onClick={() => setViewMode('list')}
            className={`px-3 py-1 text-sm rounded ${viewMode === 'list' ? 'btn-gradient' : 'glass-card'}`}
          >
            List
          </Button>
        </div>
      </div>

      <div className="map-container relative">
        {loading ? (
          <div className="skeleton h-full w-full" />
        ) : viewMode === 'map' ? (
          <div className="h-full w-full bg-[var(--re-bg-gray-100)] rounded-lg flex items-center justify-center relative overflow-hidden">
            {/* Placeholder for actual map implementation */}
            <div className="absolute inset-0 opacity-10">
              <svg width="100%" height="100%">
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5"/>
                </pattern>
                <rect width="100%" height="100%" fill="url(#grid)" />
              </svg>
            </div>
            
            {/* Property Markers */}
            <div className="relative z-10 w-full h-full p-8">
              {properties.slice(0, 10).map((property, index) => (
                <div
                  key={property.id}
                  className="absolute cursor-pointer transform hover:scale-110 transition-transform"
                  style={{
                    left: `${20 + (index % 3) * 25}%`,
                    top: `${20 + Math.floor(index / 3) * 20}%`
                  }}
                >
                  <div className="relative group">
                    <div className={`w-4 h-4 ${getStatusColor(property.status)} rounded-full border-2 border-white shadow-lg`}></div>
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block glass-panel p-3 min-w-[200px] z-20">
                      <h4 className="font-semibold text-sm">{property.title}</h4>
                      <p className="text-xs text-[var(--re-text-secondary)] mt-1">{property.address}</p>
                      <p className="text-sm font-bold text-[var(--re-accent-primary)] mt-2">
                        {formatPrice(property.price)}
                      </p>
                      <div className="flex gap-2 text-xs text-[var(--re-text-tertiary)] mt-2">
                        <span>{property.bedrooms || 0} bed</span>
                        <span>•</span>
                        <span>{property.bathrooms || 0} bath</span>
                        <span>•</span>
                        <span>{property.area || 0} sqft</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Legend */}
            <div className="absolute bottom-4 left-4 glass-panel p-3 z-20">
              <h4 className="text-xs font-semibold mb-2">Legend</h4>
              <div className="space-y-1 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span>Active ({properties.filter(p => p.status === 'available').length})</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span>Pending ({properties.filter(p => p.status === 'pending').length})</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span>Sold ({properties.filter(p => p.status === 'sold').length})</span>
                </div>
              </div>
            </div>

            {/* Stats Overlay */}
            <div className="absolute top-4 right-4 glass-panel p-3 z-20">
              <div className="text-xs space-y-1">
                <div>
                  <span className="text-[var(--re-text-tertiary)]">Avg. List Price:</span>
                  <span className="ml-2 font-semibold">
                    {formatPrice(properties.reduce((sum, p) => sum + p.price, 0) / (properties.length || 1))}
                  </span>
                </div>
                <div>
                  <span className="text-[var(--re-text-tertiary)]">Avg. DOM:</span>
                  <span className="ml-2 font-semibold">34</span>
                </div>
                <div>
                  <span className="text-[var(--re-text-tertiary)]">Price/SqFt:</span>
                  <span className="ml-2 font-semibold">$285</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full overflow-y-auto re-scrollbar space-y-3">
            {properties.map((property) => (
              <div key={property.id} className="glass-card p-4 flex gap-4">
                <div className="w-20 h-20 rounded-lg bg-[var(--re-bg-tertiary)] flex items-center justify-center">
                  {property.images?.[0] ? (
                    <img src={property.images[0]} alt={property.title} className="w-full h-full object-cover rounded-lg" />
                  ) : (
                    <span className="text-2xl">🏠</span>
                  )}
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold">{property.title}</h4>
                  <p className="text-sm text-[var(--re-text-secondary)]">{property.address}, {property.city}</p>
                  <div className="flex items-center gap-4 mt-2 text-sm text-[var(--re-text-tertiary)]">
                    <span>{property.bedrooms || 0} bed</span>
                    <span>{property.bathrooms || 0} bath</span>
                    <span>{property.area || 0} sqft</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-[var(--re-accent-primary)]">
                    {formatPrice(property.price)}
                  </div>
                  <span className={`status-badge ${property.status}`}>
                    {property.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-between items-center mt-4">
        <Button className="glass-card px-4 py-2 text-sm hover:text-white transition-colors">
          View Full Map
        </Button>
        <Button className="btn-gradient text-sm">
          Add Listing
        </Button>
      </div>
    </div>
  );
};

