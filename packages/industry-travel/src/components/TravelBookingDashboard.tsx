/**
 * Travel Booking Dashboard Component
 */

import React, { useMemo, useCallback } from 'react';
import { TravelBooking, Itinerary } from '../services/travel-booking.service';
import { DashboardErrorBoundary } from '@/components/error-boundary/error-boundary-utils';

export interface TravelBookingDashboardProps {
  bookings: TravelBooking[];
  itineraries: Itinerary[];
  onCreateBooking?: (booking: Partial<TravelBooking>) => void;
  onUpdateStatus?: (bookingId: string, status: TravelBooking['status']) => void;
}

export const TravelBookingDashboard: React.FC<TravelBookingDashboardProps> = ({
  bookings,
  itineraries,
  onCreateBooking: _onCreateBooking,
  onUpdateStatus: _onUpdateStatus,
}) => {
  const confirmedBookings = useMemo(
    () => bookings.filter(b => b.status === 'confirmed'),
    [bookings]
  );

  const pendingBookings = useMemo(
    () => bookings.filter(b => b.status === 'pending'),
    [bookings]
  );

  const revenue = useMemo(
    () => confirmedBookings.reduce((sum, b) => sum + b.totalAmount, 0),
    [confirmedBookings]
  );

  const handleCreateBooking = useCallback(
    (booking: Partial<TravelBooking>) => {
      _onCreateBooking?.(booking);
    },
    [_onCreateBooking]
  );

  const handleUpdateStatus = useCallback(
    (bookingId: string, status: TravelBooking['status']) => {
      _onUpdateStatus?.(bookingId, status);
    },
    [_onUpdateStatus]
  );

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <DashboardErrorBoundary serviceName="TravelHeader">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">✈️ Travel Bookings</h2>
          <p className="text-gray-600">Manage travel reservations and itineraries</p>
        </div>
      </DashboardErrorBoundary>

      {/* Quick Stats */}
      <DashboardErrorBoundary serviceName="TravelStats">
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-sm text-gray-600">Total Bookings</div>
            <div className="text-2xl font-bold text-blue-600">{bookings.length}</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="text-sm text-gray-600">Confirmed</div>
            <div className="text-2xl font-bold text-green-600">{confirmedBookings.length}</div>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <div className="text-sm text-gray-600">Pending</div>
            <div className="text-2xl font-bold text-yellow-600">{pendingBookings.length}</div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="text-sm text-gray-600">Revenue</div>
            <div className="text-xl font-bold text-purple-600">
              ${revenue.toLocaleString()}
            </div>
          </div>
        </div>
      </DashboardErrorBoundary>

      <div className="grid grid-cols-2 gap-6">
        {/* Recent Bookings */}
        <DashboardErrorBoundary serviceName="TravelBookingsList">
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-700 mb-3">Recent Bookings</h3>
            {bookings.slice(0, 5).map(booking => (
              <div key={booking.id} className="border border-gray-200 rounded-lg p-3 hover:border-blue-300 transition-colors bg-gray-50">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`inline-block w-2 h-2 rounded-full ${
                        booking.status === 'confirmed' ? 'bg-green-500' :
                        booking.status === 'pending' ? 'bg-yellow-500' :
                        'bg-gray-500'
                      }`} />
                      <span className="font-medium text-gray-900">{booking.provider}</span>
                    </div>
                    <div className="text-xs text-gray-500 capitalize">
                      {booking.type} • {new Date(booking.startDate).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-gray-900">${booking.totalAmount.toLocaleString()}</div>
                    <div className={`text-xs px-2 py-1 rounded ${
                      booking.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                      booking.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {booking.status}
                    </div>
                  </div>
                </div>
                
                {booking.type === 'flight' && booking.details.flightNumber && (
                  <div className="mt-2 text-xs text-gray-600">
                    ✈️ {booking.details.flightNumber}: {booking.details.from} → {booking.details.to}
                  </div>
                )}
                
                {booking.type === 'hotel' && booking.details.location && (
                  <div className="mt-2 text-xs text-gray-600">
                    🏨 {booking.details.location} • {booking.details.nights} nights
                  </div>
                )}
              </div>
            ))}
          </div>
        </DashboardErrorBoundary>

        {/* Itineraries */}
        <DashboardErrorBoundary serviceName="TravelItineraries">
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-700 mb-3">Trip Itineraries</h3>
            {itineraries.length === 0 ? (
              <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
                No itineraries created
              </div>
            ) : (
              itineraries.map(itinerary => (
                <div key={itinerary.id} className="border border-gray-200 rounded-lg p-3 hover:border-purple-300 transition-colors bg-gray-50">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="font-medium text-gray-900">{itinerary.title}</div>
                      <div className="text-xs text-gray-500">📍 {itinerary.destination}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-gray-500">
                        {new Date(itinerary.startDate).toLocaleDateString()} - {new Date(itinerary.endDate).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-gray-600">{itinerary.bookings.length} bookings</div>
                    </div>
                  </div>
                  
                  <div className="mt-2 flex flex-wrap gap-1">
                    {itinerary.bookings.slice(0, 3).map((booking, idx) => (
                      <span key={idx} className="inline-block bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded capitalize">
                        {booking.type}
                      </span>
                    ))}
                    {itinerary.bookings.length > 3 && (
                      <span className="text-xs text-gray-500">+{itinerary.bookings.length - 3} more</span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </DashboardErrorBoundary>
      </div>
    </div>
  );
};
