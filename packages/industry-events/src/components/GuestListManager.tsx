/**
 * Guest List Manager Component
 */

import React from 'react';

interface Guest {
  id: string;
  name: string;
  email: string;
  rsvpStatus: 'pending' | 'attending' | 'not-attending' | 'maybe';
  category: string;
  plusOne?: boolean;
}

interface GuestListManagerProps {
  guests?: Guest[];
  onAddGuest?: (guest: any) => void;
  onUpdateRSVP?: (guestId: string, status: any) => void;
}

export const GuestListManager: React.FC<GuestListManagerProps> = ({
  guests,
  onAddGuest,
  onUpdateRSVP,
}) => {
  const displayGuests = guests || [
    { id: '1', name: 'John Doe', email: 'john@example.com', rsvpStatus: 'attending', category: 'Family', plusOne: true },
    { id: '2', name: 'Jane Smith', email: 'jane@example.com', rsvpStatus: 'pending', category: 'Friends' },
    { id: '3', name: 'Bob Johnson', email: 'bob@example.com', rsvpStatus: 'attending', category: 'Colleagues', plusOne: false },
    { id: '4', name: 'Alice Brown', email: 'alice@example.com', rsvpStatus: 'not-attending', category: 'Family' },
  ];

  const stats = {
    total: displayGuests.length,
    attending: displayGuests.filter(g => g.rsvpStatus === 'attending').length,
    pending: displayGuests.filter(g => g.rsvpStatus === 'pending').length,
    declined: displayGuests.filter(g => g.rsvpStatus === 'not-attending').length,
    withPlusOnes: displayGuests.filter(g => g.plusOne).length,
  };

  const getRSVPColor = (status: string) => {
    switch (status) {
      case 'attending': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'not-attending': return 'bg-red-100 text-red-800';
      case 'maybe': return 'bg-blue-100 text-blue-800';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold">Guest List Manager</h3>
        {onAddGuest && (
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            + Add Guest
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-5 gap-3 mb-6">
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <p className="text-2xl font-bold">{stats.total}</p>
          <p className="text-xs text-gray-600">Total</p>
        </div>
        <div className="text-center p-3 bg-green-50 rounded-lg">
          <p className="text-2xl font-bold text-green-600">{stats.attending}</p>
          <p className="text-xs text-gray-600">Attending</p>
        </div>
        <div className="text-center p-3 bg-yellow-50 rounded-lg">
          <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
          <p className="text-xs text-gray-600">Pending</p>
        </div>
        <div className="text-center p-3 bg-red-50 rounded-lg">
          <p className="text-2xl font-bold text-red-600">{stats.declined}</p>
          <p className="text-xs text-gray-600">Declined</p>
        </div>
        <div className="text-center p-3 bg-purple-50 rounded-lg">
          <p className="text-2xl font-bold text-purple-600">{stats.withPlusOnes}</p>
          <p className="text-xs text-gray-600">+1s</p>
        </div>
      </div>

      {/* Guest Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">RSVP</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">+1</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {displayGuests.map(guest => (
              <tr key={guest.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 whitespace-nowrap font-medium">{guest.name}</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{guest.email}</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm">{guest.category}</td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs rounded-full ${getRSVPColor(guest.rsvpStatus)}`}>
                    {guest.rsvpStatus}
                  </span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  {guest.plusOne ? '✓' : '—'}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <select
                    value={guest.rsvpStatus}
                    onChange={(e) => onUpdateRSVP?.(guest.id, e.target.value)}
                    className="text-sm border border-gray-300 rounded px-2 py-1"
                  >
                    <option value="pending">Pending</option>
                    <option value="attending">Attending</option>
                    <option value="not-attending">Not Attending</option>
                    <option value="maybe">Maybe</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
