/**
 * Event Vendor Dashboard Component
 * Comprehensive vendor management interface
 */

'use client';

import React, { useState, useEffect } from 'react';
import { EventVendorFeature } from '../features/event-vendor.feature';
import type { Vendor } from '../services/event-vendor.service';

interface EventVendorDashboardProps {
  eventId: string;
  vendorFeature: EventVendorFeature;
}

export const EventVendorDashboard: React.FC<EventVendorDashboardProps> = ({
  eventId,
  vendorFeature,
}) => {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadVendorData();
  }, [eventId]);

  const loadVendorData = async () => {
    try {
      setLoading(true);
      const [vendorData, statsData] = await Promise.all([
        vendorFeature.getVendors(eventId),
        vendorFeature.getStats(),
      ]);
      setVendors(vendorData);
      setStats(statsData);
    } catch (error) {
      console.error('Failed to load vendor data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTypeIcon = (type: Vendor['type']) => {
    const icons = {
      catering: '🍽️',
      photography: '📷',
      music: '🎵',
      florist: '💐',
      decoration: '🎨',
      venue: '🏛️',
      transportation: '🚗',
      other: '📋',
    };
    return icons[type] || '📋';
  };

  if (loading) {
    return <div className="p-6 text-center">Loading vendors...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Budget Overview */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg shadow">
            <div className="text-3xl font-bold text-blue-900">${stats.totalBudget.toLocaleString()}</div>
            <div className="text-sm text-blue-700">Total Budget</div>
            <div className="text-xs text-blue-600 mt-1">{stats.totalVendors} vendors</div>
          </div>
          
          <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg shadow">
            <div className="text-3xl font-bold text-green-900">${stats.totalDeposits.toLocaleString()}</div>
            <div className="text-sm text-green-700">Deposits Paid</div>
            <div className="text-xs text-green-600 mt-1">{stats.signedContracts} contracts signed</div>
          </div>
          
          <div className="p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg shadow">
            <div className="text-3xl font-bold text-orange-900">${stats.totalBalance.toLocaleString()}</div>
            <div className="text-sm text-orange-700">Balance Due</div>
            <div className="text-xs text-orange-600 mt-1">{stats.upcomingPayments} payments soon</div>
          </div>
          
          <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg shadow">
            <div className="text-3xl font-bold text-purple-900">${(stats.totalBudget - stats.totalBalance).toLocaleString()}</div>
            <div className="text-sm text-purple-700">Paid to Date</div>
            <div className="text-xs text-purple-600 mt-1">{Math.round((stats.totalDeposits / stats.totalBudget) * 100)}% of budget</div>
          </div>
        </div>
      )}

      {/* Contract Alerts */}
      {stats?.pendingContracts > 0 && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-bold text-red-800">⚠️ {stats.pendingContracts} Pending Contracts</h4>
              <p className="text-sm text-red-700 mt-1">
                These vendors haven't signed their contracts yet
              </p>
            </div>
            <button className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">
              Review Contracts
            </button>
          </div>
        </div>
      )}

      {/* Vendor List */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-xl font-bold mb-4">Event Vendors</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {vendors.map((vendor) => (
            <div key={vendor.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{getTypeIcon(vendor.type)}</span>
                  <div>
                    <h4 className="font-semibold">{vendor.name}</h4>
                    <div className="text-xs text-gray-500 capitalize">{vendor.type}</div>
                  </div>
                </div>
                {vendor.contractSigned ? (
                  <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">✓ Signed</span>
                ) : (
                  <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded">⚠ Pending</span>
                )}
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Contact:</span>
                  <span className="font-medium">{vendor.contactName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Contract:</span>
                  <span className="font-medium">${vendor.contractValue.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Deposit:</span>
                  <span className="font-medium">${vendor.depositPaid.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Balance:</span>
                  <span className={`font-medium ${vendor.balanceDue > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    ${vendor.balanceDue.toLocaleString()}
                  </span>
                </div>
                
                {vendor.paymentDueDate && vendor.balanceDue > 0 && (
                  <div className={`text-xs pt-2 border-t ${vendor.paymentDueDate < new Date() ? 'text-red-600' : 'text-orange-600'}`}>
                    Due: {vendor.paymentDueDate.toLocaleDateString()}
                  </div>
                )}
              </div>
              
              <div className="mt-3 flex gap-2">
                <button className="flex-1 px-3 py-1.5 text-xs bg-blue-50 text-blue-700 rounded hover:bg-blue-100">
                  Contact
                </button>
                {!vendor.contractSigned && (
                  <button className="flex-1 px-3 py-1.5 text-xs bg-green-50 text-green-700 rounded hover:bg-green-100">
                    Sign Contract
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
