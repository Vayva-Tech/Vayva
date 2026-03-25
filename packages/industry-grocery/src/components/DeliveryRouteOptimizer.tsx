'use client';
import { Button } from "@vayva/ui";

/**
 * Delivery Route Optimizer Component
 * Displays delivery routes and optimization controls
 */

import React, { useState } from 'react';

export interface DeliveryStop {
  id: string;
  sequence: number;
  customerName?: string;
  address: string;
  status: 'pending' | 'arrived' | 'delivered' | 'failed';
  estimatedArrival?: Date;
}

export interface DeliveryRoute {
  id: string;
  name: string;
  date: Date;
  stops: DeliveryStop[];
  totalDistance: number;
  estimatedDuration: number;
  status: 'planned' | 'in-progress' | 'completed' | 'cancelled';
}

export interface RouteStats {
  totalRoutes: number;
  completedRoutes: number;
  totalStops: number;
  deliveredStops: number;
  averageStopsPerRoute: number;
}

export interface DeliveryRouteOptimizerProps {
  routes?: DeliveryRoute[];
  stats?: RouteStats;
  onOptimize?: (routeId: string) => void;
  onSelectRoute?: (route: DeliveryRoute) => void;
}

export const DeliveryRouteOptimizer: React.FC<DeliveryRouteOptimizerProps> = ({
  routes = [],
  stats,
  onOptimize,
  onSelectRoute,
}) => {
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);

  const displayRoutes: DeliveryRoute[] = routes.length > 0 ? routes : [
    {
      id: 'route-1',
      name: 'Downtown Express',
      date: new Date(),
      stops: [
        { id: 'stop-1', sequence: 1, customerName: 'John Doe', address: '123 Main St', status: 'delivered', estimatedArrival: new Date() },
        { id: 'stop-2', sequence: 2, customerName: 'Jane Smith', address: '456 Oak Ave', status: 'pending' },
        { id: 'stop-3', sequence: 3, customerName: 'Bob Johnson', address: '789 Pine Rd', status: 'pending' },
      ],
      totalDistance: 15.5,
      estimatedDuration: 120,
      status: 'in-progress',
    },
    {
      id: 'route-2',
      name: 'Suburban Loop',
      date: new Date(),
      stops: [
        { id: 'stop-4', sequence: 1, customerName: 'Alice Brown', address: '321 Elm St', status: 'pending' },
        { id: 'stop-5', sequence: 2, customerName: 'Charlie Wilson', address: '654 Maple Dr', status: 'pending' },
      ],
      totalDistance: 22.3,
      estimatedDuration: 150,
      status: 'planned',
    },
  ];

  const displayStats = stats || {
    totalRoutes: displayRoutes.length,
    completedRoutes: displayRoutes.filter(r => r.status === 'completed').length,
    totalStops: displayRoutes.reduce((sum, r) => sum + r.stops.length, 0),
    deliveredStops: displayRoutes.reduce((sum, r) => sum + r.stops.filter(s => s.status === 'delivered').length, 0),
    averageStopsPerRoute: Math.round(displayRoutes.reduce((sum, r) => sum + r.stops.length, 0) / displayRoutes.length),
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planned': return 'bg-blue-100 text-blue-800';
      case 'in-progress': return 'bg-purple-100 text-purple-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStopStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'text-green-600';
      case 'arrived': return 'text-blue-600';
      case 'pending': return 'text-gray-600';
      case 'failed': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const handleRouteSelect = (route: DeliveryRoute) => {
    setSelectedRouteId(route.id);
    onSelectRoute?.(route);
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  return (
    <div className="bg-white rounded-lg shadow-lg">
      <div className="px-6 py-4 border-b">
        <h3 className="text-xl font-semibold">Delivery Route Optimizer</h3>
        <p className="text-sm text-gray-500">Plan and optimize delivery routes</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-5 gap-4 p-6 bg-gray-50">
        <div className="text-center">
          <p className="text-3xl font-bold text-blue-600">{displayStats.totalRoutes}</p>
          <p className="text-sm text-gray-600 mt-1">Total Routes</p>
        </div>
        <div className="text-center">
          <p className="text-3xl font-bold text-green-600">{displayStats.completedRoutes}</p>
          <p className="text-sm text-gray-600 mt-1">Completed</p>
        </div>
        <div className="text-center">
          <p className="text-3xl font-bold text-purple-600">{displayStats.totalStops}</p>
          <p className="text-sm text-gray-600 mt-1">Total Stops</p>
        </div>
        <div className="text-center">
          <p className="text-3xl font-bold text-green-600">{displayStats.deliveredStops}</p>
          <p className="text-sm text-gray-600 mt-1">Delivered</p>
        </div>
        <div className="text-center">
          <p className="text-3xl font-bold text-orange-600">{displayStats.averageStopsPerRoute}</p>
          <p className="text-sm text-gray-600 mt-1">Avg Stops/Route</p>
        </div>
      </div>

      <div className="p-6">
        <div className="space-y-4">
          {displayRoutes.map(route => (
            <div 
              key={route.id}
              className={`border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${
                selectedRouteId === route.id ? 'ring-2 ring-blue-500 bg-blue-50' : 'bg-white'
              }`}
              onClick={() => handleRouteSelect(route)}
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h4 className="font-semibold text-lg">{route.name}</h4>
                  <p className="text-sm text-gray-500">
                    {route.stops.length} stops • {route.totalDistance.toFixed(1)} km • {formatDuration(route.estimatedDuration)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 text-sm rounded-full ${getStatusColor(route.status)}`}>
                    {route.status}
                  </span>
                  {onOptimize && route.status === 'planned' && (
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        onOptimize(route.id);
                      }}
                      className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                    >
                      ⚡ Optimize
                    </Button>
                  )}
                </div>
              </div>

              {/* Stops Timeline */}
              <div className="space-y-2">
                {route.stops.map((stop, index) => (
                  <div key={stop.id} className="flex items-center gap-3 pl-4 border-l-2 border-gray-200">
                    <div className={`w-3 h-3 rounded-full ${
                      stop.status === 'delivered' ? 'bg-green-500' :
                      stop.status === 'arrived' ? 'bg-blue-500' :
                      'bg-gray-300'
                    }`} />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{stop.customerName || `Stop ${index + 1}`}</p>
                      <p className="text-xs text-gray-500">{stop.address}</p>
                    </div>
                    <span className={`text-xs font-medium ${getStopStatusColor(stop.status)}`}>
                      {stop.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

