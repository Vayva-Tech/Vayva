// @ts-nocheck
'use client';
/**
 * Event Guest List & Seating Dashboard Component
 * Comprehensive guest management and seating interface
 */

'use client';

import React, { useState, useEffect } from 'react';
import { EventGuestListFeature } from '../features/event-guest-list.feature';
import { EventSeatingFeature } from '../features/event-seating.feature';
import type { Guest } from '../services/event-guest-list.service';
import type { Table } from '../services/event-seating.service';

interface EventGuestDashboardProps {
  eventId: string;
  guestFeature: EventGuestListFeature;
  seatingFeature: EventSeatingFeature;
}

export const EventGuestDashboard: React.FC<EventGuestDashboardProps> = ({
  eventId,
  guestFeature,
  seatingFeature,
}) => {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [tables, setTables] = useState<Table[]>([]);
  const [guestStats, setGuestStats] = useState<any>(null);
  const [seatingStats, setSeatingStats] = useState<any>(null);
  const [tableAvailability, setTableAvailability] = useState<Record<string, { capacity: number; assigned: number; available: number; percentFull: number }>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadGuestData();
  }, [eventId]);

  const loadGuestData = async () => {
    try {
      setLoading(true);
      const [guestData, tableData, guestStatsData, seatingStatsData] = await Promise.all([
        guestFeature.getGuests(eventId),
        seatingFeature.getTables(eventId),
        guestFeature.getStats(),
        seatingFeature.getStats(),
      ]);
      setGuests(guestData);
      setTables(tableData);
      setGuestStats(guestStatsData);
      setSeatingStats(seatingStatsData);
      // Pre-fetch table availability
      const availabilityEntries = await Promise.all(
        tableData.map(async (t: Table) => {
          const avail = await seatingFeature.getTableAvailability(t.id);
          return [t.id, avail] as const;
        })
      );
      setTableAvailability(Object.fromEntries(availabilityEntries));
    } catch (error) {
      console.error('Failed to load guest data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRSVPStatusColor = (status: Guest['rsvpStatus']) => {
    switch (status) {
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'declined': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'waitlist': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return <div className="p-6 text-center">Loading guests...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Overview Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-lg shadow">
          <div className="text-2xl font-bold">{guestStats?.totalInvited || 0}</div>
          <div className="text-sm text-gray-600">Total Invited</div>
        </div>
        <div className="p-4 bg-white rounded-lg shadow">
          <div className="text-2xl font-bold text-green-600">{guestStats?.confirmed || 0}</div>
          <div className="text-sm text-gray-600">Confirmed</div>
        </div>
        <div className="p-4 bg-white rounded-lg shadow">
          <div className="text-2xl font-bold text-blue-600">{guestStats?.totalHeadcount || 0}</div>
          <div className="text-sm text-gray-600">Total Headcount</div>
        </div>
        <div className="p-4 bg-white rounded-lg shadow">
          <div className="text-2xl font-bold text-purple-600">{guestStats?.responseRate?.toFixed(0) || 0}%</div>
          <div className="text-sm text-gray-600">Response Rate</div>
        </div>
      </div>

      {/* RSVP Summary */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-xl font-bold mb-4">RSVP Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-green-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-green-900">{guestStats?.confirmed || 0}</div>
                <div className="text-sm text-green-700">Accepted</div>
              </div>
              <div className="text-4xl">✓</div>
            </div>
          </div>
          
          <div className="p-4 bg-yellow-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-yellow-900">{guestStats?.pending || 0}</div>
                <div className="text-sm text-yellow-700">Pending</div>
              </div>
              <div className="text-4xl">⏳</div>
            </div>
            {guestStats?.remindersNeeded > 0 && (
              <div className="text-xs text-yellow-700 mt-2">
                {guestStats.remindersNeeded} reminders needed
              </div>
            )}
          </div>
          
          <div className="p-4 bg-red-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-red-900">{guestStats?.declined || 0}</div>
                <div className="text-sm text-red-700">Declined</div>
              </div>
              <div className="text-4xl">✗</div>
            </div>
          </div>
        </div>
      </div>

      {/* Dietary Restrictions Alert */}
      <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded">
        <h4 className="font-bold text-orange-800">🍽️ Meal Preferences Summary</h4>
        <p className="text-sm text-orange-700 mt-1">
          Track dietary restrictions and meal choices for catering
        </p>
      </div>

      {/* Guest List */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-xl font-bold mb-4">Guest List</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b">
              <tr>
                <th className="text-left py-2 px-3 text-sm font-semibold">Name</th>
                <th className="text-left py-2 px-3 text-sm font-semibold">Status</th>
                <th className="text-left py-2 px-3 text-sm font-semibold">Plus One</th>
                <th className="text-left py-2 px-3 text-sm font-semibold">Meal</th>
                <th className="text-left py-2 px-3 text-sm font-semibold">Table</th>
              </tr>
            </thead>
            <tbody>
              {guests.map((guest) => (
                <tr key={guest.id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-3">
                    <div className="font-medium">{guest.firstName} {guest.lastName}</div>
                    {guest.email && <div className="text-xs text-gray-500">{guest.email}</div>}
                  </td>
                  <td className="py-3 px-3">
                    <span className={`px-2 py-1 text-xs rounded capitalize ${getRSVPStatusColor(guest.rsvpStatus)}`}>
                      {guest.rsvpStatus}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-sm">
                    {guest.plusOne ? (
                      <div className="text-sm">+1: {guest.plusOneName || 'TBD'}</div>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  <td className="py-3 px-3 text-sm capitalize">{guest.mealPreference || '—'}</td>
                  <td className="py-3 px-3 text-sm">
                    {guest.tableAssignment ? (
                      <span className="font-medium">{guest.tableAssignment}</span>
                    ) : (
                      <span className="text-gray-400">Unassigned</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Seating Chart */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-xl font-bold mb-4">Seating Arrangement</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {tables.map((table) => {
            const availability = tableAvailability[table.id] ?? { capacity: 0, assigned: 0, available: 0, percentFull: 0 };
            return (
              <div key={table.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold">{table.name}</h4>
                  <span className="text-xs px-2 py-1 bg-gray-100 rounded capitalize">{table.type}</span>
                </div>
                <div className="mb-2">
                  <div className="flex justify-between text-sm mb-1">
                    <span>{availability.assigned} / {availability.capacity} seated</span>
                    <span className={availability.available === 0 ? 'text-red-600' : 'text-green-600'}>
                      {availability.available} available
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${availability.percentFull >= 100 ? 'bg-green-500' : availability.percentFull >= 75 ? 'bg-yellow-500' : 'bg-blue-500'}`}
                      style={{ width: `${availability.percentFull}%` }}
                    />
                  </div>
                </div>
                {table.location && (
                  <div className="text-xs text-gray-500">Location: {table.location}</div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
