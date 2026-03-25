import { Button } from "@vayva/ui";
/**
 * Vendor Coordinator Component
 */

import React from 'react';

interface Vendor {
  id: string;
  name: string;
  category: string;
  status: 'prospect' | 'contacted' | 'confirmed' | 'cancelled';
  rating?: number;
}

export interface VendorCoordinatorProps {
  vendors?: Vendor[];
  onAddVendor?: (vendor: any) => void;
}

export const VendorCoordinator: React.FC<VendorCoordinatorProps> = ({
  vendors,
  onAddVendor,
}) => {
  const displayVendors = vendors || [
    { id: '1', name: 'Elegant Catering', category: 'Catering', status: 'confirmed', rating: 5 },
    { id: '2', name: 'Photo Memories', category: 'Photography', status: 'contacted', rating: 4 },
    { id: '3', name: 'Grand Venue', category: 'Venue', status: 'confirmed', rating: 5 },
    { id: '4', name: 'Floral Dreams', category: 'Florist', status: 'prospect', rating: 0 },
  ];

  const stats = {
    total: displayVendors.length,
    confirmed: displayVendors.filter(v => v.status === 'confirmed').length,
    contacted: displayVendors.filter(v => v.status === 'contacted').length,
    prospect: displayVendors.filter(v => v.status === 'prospect').length,
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'contacted': return 'bg-blue-100 text-blue-800';
      case 'prospect': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
    }
  };

  const renderStars = (rating: number) => {
    return '★'.repeat(rating) + '☆'.repeat(5 - rating);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold">Vendor Management</h3>
        {onAddVendor && (
          <Button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            + Add Vendor
          </Button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="text-center p-4 bg-gray-50 rounded-lg">
          <p className="text-2xl font-bold">{stats.total}</p>
          <p className="text-sm text-gray-600">Total</p>
        </div>
        <div className="text-center p-4 bg-green-50 rounded-lg">
          <p className="text-2xl font-bold text-green-600">{stats.confirmed}</p>
          <p className="text-sm text-gray-600">Confirmed</p>
        </div>
        <div className="text-center p-4 bg-blue-50 rounded-lg">
          <p className="text-2xl font-bold text-blue-600">{stats.contacted}</p>
          <p className="text-sm text-gray-600">Contacted</p>
        </div>
        <div className="text-center p-4 bg-gray-100 rounded-lg">
          <p className="text-2xl font-bold text-gray-600">{stats.prospect}</p>
          <p className="text-sm text-gray-600">Prospects</p>
        </div>
      </div>

      {/* Vendor List */}
      <div className="space-y-3">
        {displayVendors.map(vendor => (
          <div key={vendor.id} className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-shadow">
            <div className="flex-1">
              <h4 className="font-semibold">{vendor.name}</h4>
              <p className="text-sm text-gray-500">{vendor.category}</p>
            </div>
            <div className="flex items-center gap-4">
              {(vendor.rating ?? 0) > 0 && (
                <span className="text-yellow-500">{renderStars(vendor.rating ?? 0)}</span>
              )}
              <span className={`px-3 py-1 text-sm rounded-full ${getStatusColor(vendor.status)}`}>
                {vendor.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
