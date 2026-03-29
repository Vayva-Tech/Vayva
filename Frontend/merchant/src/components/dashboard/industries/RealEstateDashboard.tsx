/**
 * Real Estate Dashboard - Bookings & Events Archetype
 * 
 * For: Real Estate Agencies, Property Management, Brokerages
 * 
 * Features:
 * - Property listings management
 * - Virtual tour integration
 * - Showing scheduler
 * - Offer tracking
 * - Commission calculator (PRO+)
 */

'use client';

import { UnifiedDashboard } from '../dashboard-v2/UnifiedDashboard';
import { FeatureGate } from '../features/FeatureGate';
import { MetricsModule, MetricCard } from './modules/MetricsModule';
import { ChartsModule, DonutChart } from './modules/ChartsModule';
import { useModuleVisibility } from '@/hooks/useModuleVisibility';
import { Home, TrendingUp, Users, Calendar, DollarSign, MapPin } from 'lucide-react';

export function RealEstateDashboard() {
  const { isVisible: showCommissions, isHiddenByPlan: commissionsLocked } = useModuleVisibility(
    'commissions',
    { industry: 'real-estate', planTier: 'PRO', enabledFeatures: [] }
  );

  // Sample data
  const propertyTypes = [
    { label: 'Residential', value: 45, color: '#3b82f6' },
    { label: 'Commercial', value: 25, color: '#10b981' },
    { label: 'Land', value: 15, color: '#f59e0b' },
    { label: 'Industrial', value: 10, color: '#ef4444' },
    { label: 'Luxury', value: 5, color: '#8b5cf6' },
  ];

  const monthlyListings = [
    { month: 'Jan', listings: 45, sales: 12 },
    { month: 'Feb', listings: 52, sales: 15 },
    { month: 'Mar', listings: 58, sales: 18 },
    { month: 'Apr', listings: 61, sales: 20 },
    { month: 'May', listings: 67, sales: 24 },
    { month: 'Jun', listings: 73, sales: 28 },
  ];

  return (
    <UnifiedDashboard industry="real-estate" planTier="PRO" designCategory="bookings">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MetricCard
          label="Active Listings"
          value="73"
          change={18}
          trend="up"
          icon={<Home size={16} className="text-emerald-600" />}
        />
        
        <MetricCard
          label="Total Sales (MTD)"
          value="₦428M"
          change={22}
          trend="up"
          icon={<DollarSign size={16} className="text-blue-600" />}
        />
        
        <MetricCard
          label="Avg Sale Price"
          value="₦15.3M"
          change={8}
          trend="up"
          icon={<TrendingUp size={16} className="text-purple-600" />}
        />
        
        <MetricCard
          label="Days on Market"
          value="42"
          change={-12}
          trend="down"
          icon={<Calendar size={16} className="text-orange-600" />}
        />
      </div>

      {/* Featured Properties */}
      <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <MapPin size={20} className="text-blue-600" />
            Featured Listings
          </h3>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium">
            Add New Listing
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Property</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Type</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Price</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Location</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Agent</th>
              </tr>
            </thead>
            <tbody>
              {[
                { property: '4BR Duplex', type: 'Residential', price: '₦85M', location: 'Lekki Phase 1', status: 'active', agent: 'Chioma O.' },
                { property: 'Office Space (200sqm)', type: 'Commercial', price: '₦120M', location: 'Victoria Island', status: 'pending', agent: 'Emeka A.' },
                { property: '5BR Detached House', type: 'Residential', price: '₦150M', location: 'Ikoyi', status: 'active', agent: 'Bola K.' },
                { property: 'Warehouse (500sqm)', type: 'Industrial', price: '₦95M', location: 'Ikeja GRA', status: 'sold', agent: 'Tunde M.' },
              ].map((listing, idx) => (
                <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 text-sm font-medium text-gray-900">{listing.property}</td>
                  <td className="py-3 px-4 text-sm text-gray-700">{listing.type}</td>
                  <td className="py-3 px-4 text-sm font-semibold text-gray-900">{listing.price}</td>
                  <td className="py-3 px-4 text-sm text-gray-700">{listing.location}</td>
                  <td className="py-3 px-4">
                    <StatusBadge status={listing.status} />
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-700">{listing.agent}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Monthly Performance */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp size={20} className="text-emerald-600" />
            Listings vs Sales Trend
          </h3>
          <div className="h-64">
            <div className="flex items-end justify-between h-full gap-2">
              {monthlyListings.map(month => (
                <div key={month.month} className="flex-1 flex flex-col gap-1">
                  <div
                    className="w-full bg-gradient-to-t from-blue-500 to-blue-400 rounded-t opacity-60"
                    style={{ height: `${(month.listings / 80) * 100}%` }}
                  />
                  <div
                    className="w-full bg-gradient-to-t from-emerald-500 to-emerald-400 rounded-t"
                    style={{ height: `${(month.sales / 30) * 100}%` }}
                  />
                  <span className="text-xs text-gray-600 text-center">{month.month}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="flex items-center justify-center gap-4 mt-2 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-blue-500 rounded opacity-60" />
              <span className="text-gray-600">Listings</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-emerald-500 rounded" />
              <span className="text-gray-600">Sales</span>
            </div>
          </div>
        </div>

        {/* Property Type Distribution */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Portfolio by Type</h3>
          <DonutChart data={propertyTypes} size={200} />
          <div className="mt-4 space-y-2">
            {propertyTypes.map(type => (
              <div key={type.label} className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: type.color }}
                  />
                  <span className="text-gray-700">{type.label}</span>
                </div>
                <span className="font-medium text-gray-900">{type.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Commission Tracking */}
      <FeatureGate minPlan="PRO_PLUS">
        {showCommissions && (
          <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <DollarSign size={20} className="text-green-600" />
                Agent Commission Tracker
              </h3>
              <span className="text-xs font-medium text-purple-700 bg-purple-100 px-2 py-1 rounded-full">
                PRO+ Feature
              </span>
            </div>
            
            <div className="space-y-3">
              <CommissionRow
                agent="Chioma O."
                sales={8}
                volume="₦124M"
                commission="₦6.2M"
                pending="₦2.1M"
              />
              <CommissionRow
                agent="Emeka A."
                sales={6}
                volume="₦98M"
                commission="₦4.9M"
                pending="₦1.5M"
              />
              <CommissionRow
                agent="Bola K."
                sales={5}
                volume="₦87M"
                commission="₦4.35M"
                pending="₦900K"
              />
            </div>
          </div>
        )}
        {commissionsLocked && (
          <div className="mb-6 p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border-2 border-dashed border-emerald-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              💰 Unlock Commission Tracking
            </h3>
            <p className="text-gray-600 mb-4">
              Get automated commission calculations, split tracking, and payout management with PRO+ plan
            </p>
            <a
              href="/dashboard/billing"
              className="inline-flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
            >
              Upgrade to PRO+ →
            </a>
          </div>
        )}
      </FeatureGate>

      {/* Upcoming Showings */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Calendar size={20} className="text-purple-600" />
            Scheduled Showings This Week
          </h3>
          <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm font-medium">
            Schedule Showing
          </button>
        </div>
        
        <div className="space-y-3">
          <ShowingRow
            property="4BR Duplex - Lekki"
            client="Mr. Adeleke"
            date="Today, 2:00 PM"
            agent="Chioma O."
            type="Physical"
          />
          <ShowingRow
            property="Office Space - VI"
            client="TechStart Ltd"
            date="Tomorrow, 10:00 AM"
            agent="Emeka A."
            type="Virtual"
          />
          <ShowingRow
            property="5BR House - Ikoyi"
            client="Dr. Adebayo"
            date="Mar 30, 11:00 AM"
            agent="Bola K."
            type="Physical"
          />
          <ShowingRow
            property="Warehouse - Ikeja"
            client="Logistics Co."
            date="Mar 31, 3:00 PM"
            agent="Tunde M."
            type="Physical"
          />
        </div>
      </div>
    </UnifiedDashboard>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// Sub-components
// ──────────────────────────────────────────────────────────────────────────

interface StatusBadgeProps {
  status: 'active' | 'pending' | 'sold' | 'expired';
}

function StatusBadge({ status }: StatusBadgeProps) {
  const colors = {
    active: 'bg-green-100 text-green-800',
    pending: 'bg-yellow-100 text-yellow-800',
    sold: 'bg-blue-100 text-blue-800',
    expired: 'bg-red-100 text-red-800',
  };

  return (
    <span className={`text-xs font-medium px-2 py-1 rounded-full ${colors[status]}`}>
      {status.toUpperCase()}
    </span>
  );
}

interface CommissionRowProps {
  agent: string;
  sales: number;
  volume: string;
  commission: string;
  pending: string;
}

function CommissionRow({ agent, sales, volume, commission, pending }: CommissionRowProps) {
  return (
    <div className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center text-white font-bold">
          {agent.charAt(0)}
        </div>
        <div>
          <p className="font-medium text-gray-900">{agent}</p>
          <p className="text-xs text-gray-600">{sales} sales this month</p>
        </div>
      </div>
      <div className="text-right">
        <p className="font-bold text-green-700">{commission}</p>
        <p className="text-xs text-gray-600">Pending: {pending}</p>
        <p className="text-xs text-gray-500">Volume: {volume}</p>
      </div>
    </div>
  );
}

interface ShowingRowProps {
  property: string;
  client: string;
  date: string;
  agent: string;
  type: 'Physical' | 'Virtual';
}

function ShowingRow({ property, client, date, agent, type }: ShowingRowProps) {
  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
      <div className="flex-1">
        <p className="font-medium text-gray-900">{property}</p>
        <div className="flex items-center gap-3 mt-1 text-sm text-gray-600">
          <span>{client}</span>
          <span>•</span>
          <span>{date}</span>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span className={`text-xs font-medium px-2 py-1 rounded-full ${
          type === 'Virtual' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
        }`}>
          {type}
        </span>
        <span className="text-xs text-gray-600">{agent}</span>
      </div>
    </div>
  );
}
