/**
 * Guest List Manager Component for Nightlife
 */

import React from 'react';

interface GuestListEntry {
  id: string;
  name: string;
  phone: string;
  vipStatus: boolean;
  checkedIn: boolean;
  tableReservation?: boolean;
}

interface GuestListManagerProps {
  guests?: GuestListEntry[];
  onCheckIn?: (guestId: string) => void;
  onAddGuest?: (guest: any) => void;
}

export const NightlifeGuestList: React.FC<GuestListManagerProps> = ({
  guests,
  onCheckIn,
  onAddGuest,
}) => {
  const displayGuests = guests || [
    { id: '1', name: 'Alex Johnson', phone: '555-0101', vipStatus: true, checkedIn: false, tableReservation: true },
    { id: '2', name: 'Sarah Smith', phone: '555-0102', vipStatus: false, checkedIn: true, tableReservation: false },
    { id: '3', name: 'Mike Brown', phone: '555-0103', vipStatus: true, checkedIn: false, tableReservation: false },
  ];

  const stats = {
    total: displayGuests.length,
    checkedIn: displayGuests.filter(g => g.checkedIn).length,
    pending: displayGuests.filter(g => !g.checkedIn).length,
    vip: displayGuests.filter(g => g.vipStatus).length,
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold">VIP Guest List</h3>
        {onAddGuest && (
          <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
            + Add Guest
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <p className="text-2xl font-bold">{stats.total}</p>
          <p className="text-xs text-gray-600">Total</p>
        </div>
        <div className="text-center p-3 bg-green-50 rounded-lg">
          <p className="text-2xl font-bold text-green-600">{stats.checkedIn}</p>
          <p className="text-xs text-gray-600">Checked In</p>
        </div>
        <div className="text-center p-3 bg-yellow-50 rounded-lg">
          <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
          <p className="text-xs text-gray-600">Pending</p>
        </div>
        <div className="text-center p-3 bg-purple-50 rounded-lg">
          <p className="text-2xl font-bold text-purple-600">{stats.vip}</p>
          <p className="text-xs text-gray-600">VIP</p>
        </div>
      </div>

      {/* Guest List */}
      <div className="space-y-3">
        {displayGuests.map(guest => (
          <div 
            key={guest.id} 
            className={`flex items-center justify-between p-4 rounded-lg border ${
              guest.vipStatus ? 'border-purple-300 bg-purple-50' : 'border-gray-200 bg-white'
            }`}
          >
            <div className="flex items-center gap-4 flex-1">
              <div className={`w-3 h-3 rounded-full ${
                guest.checkedIn ? 'bg-green-500' : 'bg-red-500'
              }`} />
              <div>
                <h4 className="font-semibold flex items-center gap-2">
                  {guest.name}
                  {guest.vipStatus && (
                    <span className="text-xs px-2 py-0.5 bg-purple-600 text-white rounded-full">VIP</span>
                  )}
                </h4>
                <p className="text-sm text-gray-500">{guest.phone}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {guest.tableReservation && (
                <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded">Table Reserved</span>
              )}
              {!guest.checkedIn && onCheckIn && (
                <button
                  onClick={() => onCheckIn(guest.id)}
                  className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                >
                  Check In
                </button>
              )}
              {guest.checkedIn && (
                <span className="text-xs text-green-600 font-medium">Checked In</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
