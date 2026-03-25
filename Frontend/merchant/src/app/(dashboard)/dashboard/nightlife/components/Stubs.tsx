import { Button } from "@vayva/ui";
/**
 * Nightlife Dashboard Stub Components
 * Placeholder components for nightlife features
 */

import React from 'react';
import type {
  NightlifeTable,
  VIPGuest,
  BottleOrder,
  PromoterSale,
  SecurityIncident,
  DoorEntry,
  DemographicsBreakdown,
  TableReservation,
} from '@vayva/industry-nightlife/types';

interface TableReservationsProps {
  tables: NightlifeTable[];
  reservations: TableReservation[];
}

export function TableReservations({ tables, reservations: _reservations }: TableReservationsProps) {
  void _reservations;
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-500';
      case 'reserved': return 'bg-yellow-500';
      case 'occupied': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="bg-[#252525] rounded-xl p-6 border border-gray-800">
      <h3 className="text-lg font-bold text-white mb-4">📋 Table Reservations</h3>
      
      {/* Floor Plan Visualization */}
      <div className="mb-6">
        <div className="relative bg-[#1A1A1A] rounded-lg p-4 min-h-[300px]">
          <div className="absolute top-0 left-0 text-xs text-gray-500">STAGE</div>
          
          {/* Tables Grid */}
          <div className="grid grid-cols-4 gap-4 mt-8">
            {tables.map((table) => (
              <div
                key={table.id}
                className={`p-3 rounded-lg border-2 ${
                  table.status === 'available'
                    ? 'border-green-500 bg-green-500/10'
                    : table.status === 'reserved'
                    ? 'border-yellow-500 bg-yellow-500/10'
                    : 'border-red-500 bg-red-500/10'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white font-bold">{table.tableNumber}</span>
                  <span className={`w-3 h-3 rounded-full ${getStatusColor(table.status)}`}></span>
                </div>
                <p className="text-xs text-gray-400">Cap: {table.capacity}</p>
                {table.currentRevenue > 0 && (
                  <p className="text-xs text-cyan-400">${table.currentRevenue}</p>
                )}
              </div>
            ))}
          </div>
        </div>
        
        {/* Legend */}
        <div className="mt-4 flex items-center space-x-4 text-sm">
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 bg-green-500 rounded-full"></span>
            <span className="text-gray-400">Available ({tables.filter(t => t.status === 'available').length})</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 bg-yellow-500 rounded-full"></span>
            <span className="text-gray-400">Reserved ({tables.filter(t => t.status === 'reserved').length})</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 bg-red-500 rounded-full"></span>
            <span className="text-gray-400">Occupied ({tables.filter(t => t.status === 'occupied').length})</span>
          </div>
        </div>
      </div>
      
      <Button className="w-full py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors">
        View Full Map
      </Button>
    </div>
  );
}

interface VIPGuestListProps {
  guests: VIPGuest[];
}

export function VIPGuestList({ guests }: VIPGuestListProps) {
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'celebrity': return '🌟';
      case 'high_roller': return '💎';
      case 'special_occasion': return '🎂';
      default: return '🎉';
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'celebrity': return 'CELEBRITY';
      case 'high_roller': return 'HIGH-ROLLER';
      case 'special_occasion': return 'SPECIAL OCCASION';
      default: return 'REGULAR VIP';
    }
  };

  return (
    <div className="bg-[#252525] rounded-xl p-6 border border-gray-800">
      <h3 className="text-lg font-bold text-white mb-4">✨ VIP Guest List</h3>
      
      <div className="space-y-3">
        {guests.map((guest) => (
          <div key={guest.id} className="bg-[#1A1A1A] p-4 rounded-lg border border-gray-800">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center space-x-2">
                <span className="text-xl">{getCategoryIcon(guest.category)}</span>
                <div>
                  <p className="text-white font-bold">{guest.name}</p>
                  <p className="text-xs text-gray-400">{getCategoryLabel(guest.category)}</p>
                </div>
              </div>
              {guest.hasArrived ? (
                <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded">✓ Checked In</span>
              ) : (
                <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded">⏳ Pending</span>
              )}
            </div>
            
            <div className="flex items-center justify-between text-sm text-gray-400">
              <span>{guest.tableName} | {guest.guestCount} guests</span>
              {guest.minimumSpend && (
                <span>Min. spend: ${guest.minimumSpend.toLocaleString()}</span>
              )}
            </div>
            
            <div className="mt-3 flex items-center space-x-2">
              {!guest.hasArrived ? (
                <Button className="flex-1 py-1.5 bg-cyan-600 text-white text-sm rounded hover:bg-cyan-700 transition-colors">
                  Check In
                </Button>
              ) : (
                <Button className="flex-1 py-1.5 bg-gray-700 text-white text-sm rounded hover:bg-gray-600 transition-colors">
                  Escort to Table
                </Button>
              )}
              <Button className="px-3 py-1.5 bg-gray-700 text-white text-sm rounded hover:bg-gray-600 transition-colors">
                Message
              </Button>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-800">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-400">Total on list:</span>
            <span className="text-white font-bold ml-2">{guests.length}</span>
          </div>
          <div>
            <span className="text-gray-400">Checked in:</span>
            <span className="text-green-400 font-bold ml-2">{guests.filter(g => g.hasArrived).length}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

interface BottleServiceProps {
  orders: BottleOrder[];
  inventory: Array<{ name: string; quantity: number; status: 'low' | 'ok' | 'critical' }>;
}

export function BottleService({ orders, inventory }: BottleServiceProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered': return '✅';
      case 'preparing': return '⏳';
      case 'pending': return '⏰';
      default: return '📦';
    }
  };

  return (
    <div className="bg-[#252525] rounded-xl p-6 border border-gray-800">
      <h3 className="text-lg font-bold text-white mb-4">🍾 Bottle Service</h3>
      
      <div className="space-y-3 mb-6">
        {orders.slice(0, 4).map((order) => (
          <div key={order.id} className="bg-[#1A1A1A] p-4 rounded-lg border border-gray-800">
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="text-white font-bold">{order.items[0]?.bottle.name} x{order.items[0]?.quantity}</p>
                <p className="text-sm text-gray-400">{order.tableName}</p>
              </div>
              <span className="text-xl">{getStatusIcon(order.status)}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-cyan-400 font-bold">${order.totalAmount.toLocaleString()}</span>
              <div className="flex items-center space-x-2">
                <Button className="text-xs bg-gray-700 text-white px-2 py-1 rounded hover:bg-gray-600">
                  Add Mixer
                </Button>
                {order.status !== 'delivered' && (
                  <Button className="text-xs bg-cyan-600 text-white px-2 py-1 rounded hover:bg-cyan-700">
                    Complete
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Inventory Alerts */}
      <div className="pt-4 border-t border-gray-800">
        <h4 className="text-sm font-bold text-white mb-3">Inventory Alert</h4>
        <div className="space-y-2">
          {inventory.filter(i => i.status === 'low' || i.status === 'critical').slice(0, 3).map((item) => (
            <div key={item.name} className="flex items-center justify-between text-sm">
              <span className="text-gray-400">⚠️ {item.name}</span>
              <span className={`${item.status === 'critical' ? 'text-red-400' : 'text-yellow-400'} font-bold`}>
                {item.quantity} left
              </span>
            </div>
          ))}
        </div>
        <Button className="w-full mt-3 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm">
          Restock
        </Button>
      </div>
    </div>
  );
}

interface PromoterPerformanceProps {
  promoters: PromoterSale[];
}

export function PromoterPerformance({ promoters }: PromoterPerformanceProps) {
  return (
    <div className="bg-[#252525] rounded-xl p-6 border border-gray-800">
      <h3 className="text-lg font-bold text-white mb-4">👤 Promoter Performance</h3>
      
      <div className="space-y-4">
        {promoters.map((promoter) => (
          <div key={promoter.id} className="bg-[#1A1A1A] p-4 rounded-lg border border-gray-800">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-white font-bold">{promoter.promoterName}</p>
                <p className="text-sm text-gray-400">{promoter.guestCount} guests | ${promoter.barRevenue.toLocaleString()} bar</p>
              </div>
              <div className="text-right">
                <p className="text-cyan-400 font-bold">${promoter.commissionAmount.toLocaleString()}</p>
                <p className="text-xs text-gray-500">Commission</p>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="relative h-2 bg-gray-700 rounded-full overflow-hidden mt-3">
              <div 
                className="absolute h-full bg-gradient-to-r from-cyan-500 to-blue-500"
                style={{ width: `${Math.min((promoter.barRevenue / 10000) * 100, 100)}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>
      
      <Button className="w-full mt-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm">
        View All Promoters
      </Button>
    </div>
  );
}

interface DoorActivityProps {
  activity: { entries: DoorEntry[]; demographics: DemographicsBreakdown };
}

export function DoorActivity({ activity }: DoorActivityProps) {
  const admitted = activity.entries.filter(e => !e.denied).length;
  const denied = activity.entries.filter(e => e.denied).length;

  return (
    <div className="bg-[#252525] rounded-xl p-6 border border-gray-800">
      <h3 className="text-lg font-bold text-white mb-4">🚪 Door Activity</h3>
      
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-green-500/10 p-3 rounded-lg border border-green-500/30">
          <p className="text-sm text-green-400">Admitted</p>
          <p className="text-2xl font-bold text-green-400">{admitted}</p>
        </div>
        <div className="bg-red-500/10 p-3 rounded-lg border border-red-500/30">
          <p className="text-sm text-red-400">Denied</p>
          <p className="text-2xl font-bold text-red-400">{denied}</p>
        </div>
      </div>
      
      {/* Demographics */}
      <div className="space-y-4">
        <div>
          <p className="text-sm text-gray-400 mb-2">Gender Distribution</p>
          <div className="flex items-center space-x-2 text-sm">
            <span className="text-blue-400">M: {(activity.demographics.gender.male * 100).toFixed(0)}%</span>
            <span className="text-gray-600">|</span>
            <span className="text-pink-400">F: {(activity.demographics.gender.female * 100).toFixed(0)}%</span>
            <span className="text-gray-600">|</span>
            <span className="text-purple-400">O: {(activity.demographics.gender.other * 100).toFixed(0)}%</span>
          </div>
        </div>
        
        <div>
          <p className="text-sm text-gray-400 mb-2">Age Groups</p>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">21-25</span>
              <span className="text-white">{(activity.demographics.ageGroups['21-25'] * 100).toFixed(0)}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">26-30</span>
              <span className="text-white">{(activity.demographics.ageGroups['26-30'] * 100).toFixed(0)}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface SecurityLogProps {
  incidents: SecurityIncident[];
}

export function SecurityLog({ incidents }: SecurityLogProps) {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-400 bg-red-500/10';
      case 'high': return 'text-orange-400 bg-orange-500/10';
      case 'medium': return 'text-yellow-400 bg-yellow-500/10';
      default: return 'text-blue-400 bg-blue-500/10';
    }
  };

  return (
    <div className="bg-[#252525] rounded-xl p-6 border border-gray-800">
      <h3 className="text-lg font-bold text-white mb-4">🛡️ Security Log</h3>
      
      <div className="space-y-3">
        {incidents.map((incident) => (
          <div key={incident.id} className="bg-[#1A1A1A] p-4 rounded-lg border border-gray-800">
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="text-white font-bold">{incident.type}</p>
                <p className="text-sm text-gray-400">{incident.location}</p>
              </div>
              <span className={`text-xs px-2 py-1 rounded ${getSeverityColor(incident.severity)}`}>
                {incident.severity.toUpperCase()}
              </span>
            </div>
            
            <p className="text-sm text-gray-400 mb-2">{incident.description}</p>
            
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500">Officer: {incident.officerName}</span>
              <span className={`${incident.status === 'resolved' ? 'text-green-400' : 'text-yellow-400'}`}>
                {incident.status === 'resolved' ? '✓ Resolved' : '⏳ Open'}
              </span>
            </div>
          </div>
        ))}
      </div>
      
      <Button className="w-full mt-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm">
        View Full Log
      </Button>
    </div>
  );
}
