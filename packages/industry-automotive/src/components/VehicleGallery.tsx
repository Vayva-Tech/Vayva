/**
 * VehicleGallery Widget
 * 
 * Displays a grid of vehicles with images, specs, and status indicators.
 * Supports filtering, sorting, and quick actions.
 */

import { useState } from 'react';
import { BaseWidget } from '@vayva/industry-core';
import type { WidgetDefinition } from '@vayva/industry-core';
import type { Vehicle } from '../types';

export interface VehicleGalleryWidgetProps {
  widget: WidgetDefinition;
  data?: any;
  isLoading?: boolean;
  error?: Error;
  onRefresh?: () => void;
  vehicles: Vehicle[];
  viewMode?: 'grid' | 'list';
  showFilters?: boolean;
  onVehicleClick?: (vehicle: Vehicle) => void;
  onScheduleTestDrive?: (vehicleId: string) => void;
  onViewDetails?: (vehicleId: string) => void;
  itemsPerPage?: number;
}

interface VehicleCardProps {
  vehicle: Vehicle;
  onClick?: () => void;
  onScheduleTestDrive?: () => void;
}

function VehicleCard({ vehicle, onClick, onScheduleTestDrive }: VehicleCardProps) {
  const getStatusColor = (status: Vehicle['status']) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-700 border-green-300';
      case 'reserved':
        return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'sold':
        return 'bg-red-100 text-red-700 border-red-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const formatPrice = (price: number) => {
    return `₦${price.toLocaleString()}`;
  };

  return (
    <div className="group bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-200">
      {/* Vehicle Image */}
      <div className="relative h-48 overflow-hidden bg-gray-100">
        {vehicle.imageUrls && vehicle.imageUrls.length > 0 ? (
          <img
            src={vehicle.imageUrls[0]}
            alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            <span className="text-4xl">🚗</span>
          </div>
        )}
        
        {/* Status Badge */}
        <div className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(vehicle.status)}`}>
          {vehicle.status.replace('_', ' ').toUpperCase()}
        </div>

        {/* Quick Actions Overlay */}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
          {onScheduleTestDrive && vehicle.status === 'available' && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onScheduleTestDrive();
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              Test Drive
            </button>
          )}
          {onClick && (
            <button
              onClick={onClick}
              className="px-4 py-2 bg-white text-gray-900 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors"
            >
              View Details
            </button>
          )}
        </div>
      </div>

      {/* Vehicle Details */}
      <div className="p-4 space-y-3">
        <div>
          <h3 className="font-bold text-lg text-gray-900">
            {vehicle.year} {vehicle.make} {vehicle.model}
          </h3>
          {vehicle.trim && (
            <p className="text-sm text-gray-600 mt-1">{vehicle.trim}</p>
          )}
        </div>

        <div className="flex justify-between items-center">
          <span className="text-2xl font-bold text-blue-600">
            {formatPrice(vehicle.price)}
          </span>
          {vehicle.negotiable && (
            <span className="text-xs text-gray-500 italic">Negotiable</span>
          )}
        </div>

        {/* Specs Grid */}
        <div className="grid grid-cols-3 gap-2 pt-3 border-t border-gray-200">
          <div className="text-center">
            <p className="text-xs text-gray-500">Mileage</p>
            <p className="text-sm font-semibold text-gray-900">
              {vehicle.mileage.toLocaleString()} km
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500">Fuel</p>
            <p className="text-sm font-semibold text-gray-900 capitalize">
              {vehicle.fuelType}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500">Transmission</p>
            <p className="text-sm font-semibold text-gray-900 capitalize">
              {vehicle.transmission}
            </p>
          </div>
        </div>

        {/* Additional Info */}
        <div className="flex justify-between items-center pt-2">
          <span className="text-xs text-gray-600">
            {vehicle.condition.replace('_', ' ').toUpperCase()}
          </span>
          {vehicle.warrantyMonths > 0 && (
            <span className="text-xs font-semibold text-green-600">
              ✓ {vehicle.warrantyMonths}-mo Warranty
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * VehicleGalleryWidget Component
 */
export function VehicleGalleryWidget({
  widget,
  isLoading,
  error,
  vehicles = [],
  viewMode = 'grid',
  showFilters = false,
  onVehicleClick,
  onScheduleTestDrive,
  itemsPerPage,
}: VehicleGalleryWidgetProps) {
  const [filter, setFilter] = useState<'all' | 'available' | 'reserved'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'price_asc' | 'price_desc'>('newest');

  // Filter and sort vehicles
  const filteredVehicles = vehicles
    .filter((vehicle) => {
      if (filter === 'all') return true;
      return vehicle.status === filter;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'price_asc':
          return a.price - b.price;
        case 'price_desc':
          return b.price - a.price;
        case 'newest':
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

  const displayVehicles = itemsPerPage
    ? filteredVehicles.slice(0, itemsPerPage)
    : filteredVehicles;

  const stats = {
    total: vehicles.length,
    available: vehicles.filter((v) => v.status === 'available').length,
    reserved: vehicles.filter((v) => v.status === 'reserved').length,
    sold: vehicles.filter((v) => v.status === 'sold').length,
  };

  return (
    <BaseWidget
      widget={widget}
      isLoading={isLoading}
      error={error}
      className="vehicle-gallery-widget"
    >
      <div className="space-y-6">
        {/* Header Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="text-center p-3 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg">
            <p className="text-xs text-gray-600 uppercase">Total</p>
            <p className="text-xl font-bold text-gray-900">{stats.total}</p>
          </div>
          <div className="text-center p-3 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg">
            <p className="text-xs text-gray-600 uppercase">Available</p>
            <p className="text-xl font-bold text-gray-900">{stats.available}</p>
          </div>
          <div className="text-center p-3 bg-gradient-to-br from-yellow-50 to-amber-50 rounded-lg">
            <p className="text-xs text-gray-600 uppercase">Reserved</p>
            <p className="text-xl font-bold text-gray-900">{stats.reserved}</p>
          </div>
          <div className="text-center p-3 bg-gradient-to-br from-red-50 to-pink-50 rounded-lg">
            <p className="text-xs text-gray-600 uppercase">Sold</p>
            <p className="text-xl font-bold text-gray-900">{stats.sold}</p>
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="flex flex-wrap gap-3">
            <div className="flex gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All ({stats.total})
              </button>
              <button
                onClick={() => setFilter('available')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === 'available'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Available ({stats.available})
              </button>
              <button
                onClick={() => setFilter('reserved')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === 'reserved'
                    ? 'bg-yellow-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Reserved ({stats.reserved})
              </button>
            </div>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="newest">Newest First</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
          </div>
        )}

        {/* Vehicle Grid */}
        {displayVehicles.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p className="text-lg">No vehicles found</p>
            <p className="text-sm mt-1">Try adjusting your filters</p>
          </div>
        ) : (
          <div
            className={`grid gap-6 ${
              viewMode === 'grid'
                ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
                : 'grid-cols-1'
            }`}
          >
            {displayVehicles.map((vehicle) => (
              <VehicleCard
                key={vehicle.id}
                vehicle={vehicle}
                onClick={() => onVehicleClick?.(vehicle)}
                onScheduleTestDrive={() => onScheduleTestDrive?.(vehicle.id)}
              />
            ))}
          </div>
        )}

        {/* Pagination Hint */}
        {itemsPerPage && filteredVehicles.length > itemsPerPage && (
          <div className="text-center pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Showing {displayVehicles.length} of {filteredVehicles.length} vehicles
            </p>
          </div>
        )}
      </div>
    </BaseWidget>
  );
}

VehicleGalleryWidget.displayName = 'VehicleGalleryWidget';

export default VehicleGalleryWidget;
