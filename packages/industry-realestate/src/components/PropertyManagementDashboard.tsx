/**
 * Property Management Dashboard Component
 */

import React from 'react';
import { Property, Showing } from '../services/property-management.service';

export interface PropertyManagementDashboardProps {
  properties: Property[];
  upcomingShowings: Showing[];
  onCreateProperty?: (property: Partial<Property>) => void;
  onScheduleShowing?: (showing: Partial<Showing>) => void;
}

export const PropertyManagementDashboard: React.FC<PropertyManagementDashboardProps> = ({
  properties,
  upcomingShowings,
  onCreateProperty,
  onScheduleShowing,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">🏠 Property Management</h2>
        <p className="text-gray-600">Manage listings and schedule showings</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="text-sm text-gray-600">Total Listings</div>
          <div className="text-2xl font-bold text-blue-600">{properties.length}</div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="text-sm text-gray-600">Active</div>
          <div className="text-2xl font-bold text-green-600">{properties.filter(p => p.status === 'active').length}</div>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg">
          <div className="text-sm text-gray-600">Pending</div>
          <div className="text-2xl font-bold text-yellow-600">{properties.filter(p => p.status === 'pending').length}</div>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <div className="text-sm text-gray-600">Avg Price</div>
          <div className="text-xl font-bold text-purple-600">
            ${properties.length > 0 ? Math.round(properties.reduce((sum, p) => sum + p.price, 0) / properties.length / 1000) : 0}K
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Active Listings */}
        <div className="space-y-3">
          <h3 className="font-semibold text-gray-700 mb-3">Active Listings</h3>
          {properties.filter(p => p.status === 'active').slice(0, 5).map(property => (
            <div key={property.id} className="border border-gray-200 rounded-lg p-3 hover:border-blue-300 transition-colors bg-gray-50">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <div className="font-medium text-gray-900">${property.price.toLocaleString()}</div>
                  <div className="text-xs text-gray-500">{property.address}</div>
                  <div className="text-xs text-gray-500">{property.city}, {property.state} {property.zipCode}</div>
                </div>
                <div className="text-right">
                  <span className="inline-block bg-green-100 text-green-700 text-xs px-2 py-1 rounded">
                    {property.propertyType}
                  </span>
                </div>
              </div>
              
              <div className="flex gap-3 mt-2 text-xs text-gray-600">
                {property.bedrooms && (
                  <span>🛏️ {property.bedrooms} bd</span>
                )}
                {property.bathrooms && (
                  <span>🚿 {property.bathrooms} ba</span>
                )}
                {property.squareFeet && (
                  <span>📐 {property.squareFeet.toLocaleString()} sqft</span>
                )}
                <span className="text-gray-400">•</span>
                <span>{property.daysOnMarket} days</span>
              </div>

              {property.features && property.features.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {property.features.slice(0, 3).map((feature, idx) => (
                    <span key={idx} className="inline-block bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded">
                      {feature}
                    </span>
                  ))}
                  {property.features.length > 3 && (
                    <span className="text-xs text-gray-500">+{property.features.length - 3} more</span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Upcoming Showings */}
        <div className="space-y-3">
          <h3 className="font-semibold text-gray-700 mb-3">Upcoming Showings</h3>
          {upcomingShowings.length === 0 ? (
            <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
              No showings scheduled
            </div>
          ) : (
            upcomingShowings.map(showing => (
              <div key={showing.id} className="border border-gray-200 rounded-lg p-3 hover:border-green-300 transition-colors bg-gray-50">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="font-medium text-gray-900">{showing.clientName}</div>
                    <div className="text-xs text-gray-500">{showing.clientEmail}</div>
                    <div className="text-xs text-gray-500">{showing.clientPhone}</div>
                  </div>
                  <div className={`text-xs font-medium px-2 py-1 rounded ${
                    showing.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                    showing.status === 'scheduled' ? 'bg-blue-100 text-blue-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {showing.status}
                  </div>
                </div>
                
                <div className="flex justify-between items-center mt-2 text-xs text-gray-600">
                  <span>📅 {new Date(showing.scheduledDate).toLocaleDateString()}</span>
                  <span>⏰ {showing.duration} min</span>
                </div>

                {showing.feedback && (
                  <div className="mt-2 text-xs text-gray-600 italic bg-white p-2 rounded">
                    "{showing.feedback}"
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
