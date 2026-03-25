'use client';
import { Button } from "@vayva/ui";

/**
 * Inventory Manager Component
 * Manages vehicle inventory with filtering and bulk operations
 */

import React, { useState } from 'react';

interface Vehicle {
  id: string;
  vin: string;
  make: string;
  model: string;
  year: number;
  price: number;
  status: 'available' | 'reserved' | 'sold' | 'in-transit';
  condition: 'new' | 'used' | 'certified';
  mileage: number;
}

interface InventoryManagerProps {
  vehicles?: Vehicle[];
  onVehicleUpdate?: (vehicle: Vehicle) => void;
  onBulkAction?: (action: string, vehicleIds: string[]) => void;
}

export const InventoryManager: React.FC<InventoryManagerProps> = ({
  vehicles = [],
  onVehicleUpdate,
  onBulkAction,
}) => {
  const [selectedVehicles, setSelectedVehicles] = useState<Set<string>>(new Set());
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterCondition, setFilterCondition] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');

  // Mock data if no vehicles provided
  const displayVehicles = vehicles.length > 0 ? vehicles : [
    { id: '1', vin: '1HGBH41JXMN109186', make: 'Honda', model: 'Accord', year: 2024, price: 32000, status: 'available', condition: 'new', mileage: 12 },
    { id: '2', vin: '2HGBH41JXMN109187', make: 'Toyota', model: 'Camry', year: 2023, price: 28500, status: 'available', condition: 'certified', mileage: 15420 },
    { id: '3', vin: '3HGBH41JXMN109188', make: 'Ford', model: 'F-150', year: 2024, price: 45000, status: 'reserved', condition: 'new', mileage: 5 },
  ];

  const filteredVehicles = displayVehicles.filter(vehicle => {
    if (filterStatus !== 'all' && vehicle.status !== filterStatus) return false;
    if (filterCondition !== 'all' && vehicle.condition !== filterCondition) return false;
    if (searchQuery && !`${vehicle.make} ${vehicle.model} ${vehicle.year}`.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const toggleVehicleSelection = (id: string) => {
    const newSelected = new Set(selectedVehicles);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedVehicles(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedVehicles.size === filteredVehicles.length) {
      setSelectedVehicles(new Set());
    } else {
      setSelectedVehicles(new Set(filteredVehicles.map(v => v.id)));
    }
  };

  const handleBulkAction = (action: string) => {
    onBulkAction?.(action, Array.from(selectedVehicles));
    setSelectedVehicles(new Set());
  };

  const updateVehicleStatus = (vehicleId: string, newStatus: 'available' | 'reserved' | 'sold' | 'in-transit') => {
    const vehicle = displayVehicles.find(v => v.id === vehicleId);
    if (vehicle && onVehicleUpdate) {
      // Map UI status to service status and preserve condition type
      const statusMap = {
        'available': 'available' as const,
        'reserved': 'reserved' as const,
        'sold': 'sold' as const,
        'in-transit': 'available' as const,
      };
      const conditionMap = {
        'new': 'new' as const,
        'used': 'used' as const,
        'certified': 'certified' as const,
      };
      onVehicleUpdate({ 
        ...vehicle, 
        status: statusMap[newStatus],
        condition: conditionMap[vehicle.condition as keyof typeof conditionMap] || 'new'
      });
    }
  };

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Header Controls */}
      <div className="p-4 border-b space-y-4">
        <div className="flex flex-col md:flex-row gap-4 justify-between">
          <div className="flex-1 flex gap-2">
            <input
              type="text"
              placeholder="Search inventory..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="available">Available</option>
              <option value="reserved">Reserved</option>
              <option value="sold">Sold</option>
              <option value="in-transit">In Transit</option>
            </select>

            <select
              value={filterCondition}
              onChange={(e) => setFilterCondition(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Conditions</option>
              <option value="new">New</option>
              <option value="used">Used</option>
              <option value="certified">Certified</option>
            </select>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-2 rounded ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100'}`}
            >
              Grid
            </Button>
            <Button
              onClick={() => setViewMode('list')}
              className={`px-3 py-2 rounded ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100'}`}
            >
              List
            </Button>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedVehicles.size > 0 && (
          <div className="flex items-center gap-3 bg-blue-50 p-3 rounded-lg">
            <span className="text-sm font-medium text-blue-800">
              {selectedVehicles.size} selected
            </span>
            <Button
              onClick={() => handleBulkAction('mark-available')}
              className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
            >
              Mark Available
            </Button>
            <Button
              onClick={() => handleBulkAction('mark-reserved')}
              className="px-3 py-1 bg-yellow-600 text-white text-sm rounded hover:bg-yellow-700"
            >
              Mark Reserved
            </Button>
            <Button
              onClick={() => handleBulkAction('export')}
              className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
            >
              Export
            </Button>
          </div>
        )}
      </div>

      {/* Inventory Display */}
      {viewMode === 'list' ? (
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3">
                <input
                  type="checkbox"
                  checked={selectedVehicles.size === filteredVehicles.length}
                  onChange={toggleSelectAll}
                  className="rounded border-gray-300"
                />
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vehicle</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">VIN</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Condition</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredVehicles.map(vehicle => (
              <tr key={vehicle.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selectedVehicles.has(vehicle.id)}
                    onChange={() => toggleVehicleSelection(vehicle.id)}
                    className="rounded border-gray-300"
                  />
                </td>
                <td className="px-4 py-3">
                  <div>
                    <p className="font-medium">{`${vehicle.year} ${vehicle.make} ${vehicle.model}`}</p>
                    <p className="text-sm text-gray-500">{vehicle.mileage.toLocaleString()} mi</p>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-500">{vehicle.vin}</td>
                <td className="px-4 py-3 font-medium">${vehicle.price.toLocaleString()}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    vehicle.status === 'available' ? 'bg-green-100 text-green-800' :
                    vehicle.status === 'reserved' ? 'bg-yellow-100 text-yellow-800' :
                    vehicle.status === 'sold' ? 'bg-red-100 text-red-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {vehicle.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    vehicle.condition === 'new' ? 'bg-blue-100 text-blue-800' :
                    vehicle.condition === 'certified' ? 'bg-purple-100 text-purple-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {vehicle.condition}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <select
                    value={vehicle.status}
                    onChange={(e) => updateVehicleStatus(vehicle.id, e.target.value as Vehicle['status'])}
                    className="text-sm border border-gray-300 rounded px-2 py-1"
                  >
                    <option value="available">Available</option>
                    <option value="reserved">Reserved</option>
                    <option value="sold">Sold</option>
                    <option value="in-transit">In Transit</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
          {filteredVehicles.map(vehicle => (
            <div key={vehicle.id} className="border rounded-lg p-4 hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-semibold text-lg">{`${vehicle.year} ${vehicle.make} ${vehicle.model}`}</h3>
                <input
                  type="checkbox"
                  checked={selectedVehicles.has(vehicle.id)}
                  onChange={() => toggleVehicleSelection(vehicle.id)}
                  className="rounded border-gray-300"
                />
              </div>
              <p className="text-2xl font-bold text-blue-600 mb-2">${vehicle.price.toLocaleString()}</p>
              <div className="space-y-2 text-sm">
                <p className="text-gray-600">VIN: {vehicle.vin}</p>
                <p className="text-gray-600">{vehicle.mileage.toLocaleString()} miles</p>
                <div className="flex gap-2">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    vehicle.status === 'available' ? 'bg-green-100 text-green-800' :
                    vehicle.status === 'reserved' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {vehicle.status}
                  </span>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    vehicle.condition === 'new' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {vehicle.condition}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Summary */}
      <div className="px-4 py-3 bg-gray-50 border-t">
        <p className="text-sm text-gray-600">
          Showing {filteredVehicles.length} of {displayVehicles.length} vehicles
        </p>
      </div>
    </div>
  );
};

