/**
 * GuestTimeline Widget
 * 
 * Horizontal timeline showing guest stays, check-ins, and check-outs.
 * Provides visual overview of property occupancy and guest flow.
 */

import { useState, useMemo } from 'react';
import { BaseWidget } from '@vayva/industry-core';
import type { WidgetDefinition } from '@vayva/industry-core';

export interface GuestStay {
  id: string;
  guestName: string;
  roomNumber?: string;
  propertyId?: string;
  propertyName?: string;
  checkIn: Date;
  checkOut: Date;
  status: 'checked_in' | 'checked_out' | 'upcoming' | 'overdue';
  guests?: number;
  bookingType?: 'direct' | 'ota' | 'walk_in';
  totalAmount?: number;
  notes?: string;
}

export interface GuestTimelineWidgetProps {
  widget: WidgetDefinition;
  widgetData?: any;
  isLoading?: boolean;
  error?: Error;
  onRefresh?: () => void;
  stays: GuestStay[];
  viewMode?: 'day' | 'week' | 'month';
  selectedDate?: Date;
  showRoomNumbers?: boolean;
  showGuestDetails?: boolean;
  onStayClick?: (stay: GuestStay) => void;
  onCheckIn?: (stayId: string) => Promise<void>;
  onCheckOut?: (stayId: string) => Promise<void>;
}

interface TimelineRowProps {
  stay: GuestStay;
  startDate: Date;
  endDate: Date;
  onClick?: () => void;
  showDetails: boolean;
}

function TimelineRow({ stay, startDate, endDate, onClick, showDetails }: TimelineRowProps) {
  const getStatusColor = (status: GuestStay['status']) => {
    switch (status) {
      case 'checked_in':
        return 'bg-gradient-to-r from-green-400 to-emerald-500 border-green-600';
      case 'upcoming':
        return 'bg-gradient-to-r from-blue-400 to-indigo-500 border-blue-600';
      case 'checked_out':
        return 'bg-gray-300 border-gray-500 opacity-60';
      case 'overdue':
        return 'bg-gradient-to-r from-red-400 to-rose-500 border-red-600';
    }
  };

  const getPositionStyle = () => {
    const totalDuration = endDate.getTime() - startDate.getTime();
    const stayStart = new Date(stay.checkIn).getTime();
    const stayEnd = new Date(stay.checkOut).getTime();
    
    const leftPercent = ((stayStart - startDate.getTime()) / totalDuration) * 100;
    const widthPercent = ((stayEnd - stayStart) / totalDuration) * 100;

    return {
      left: `${Math.max(0, leftPercent)}%`,
      width: `${Math.max(2, widthPercent)}%`, // Minimum width for visibility
    };
  };

  const positionStyle = getPositionStyle();

  return (
    <div className="relative h-16 mb-4">
      {/* Guest name label */}
      <div className="absolute left-0 top-0 w-32 text-sm font-medium text-gray-700 truncate pr-4">
        {stay.guestName}
        {showDetails && stay.roomNumber && (
          <div className="text-xs text-gray-500">Room {stay.roomNumber}</div>
        )}
      </div>

      {/* Timeline bar */}
      <div
        onClick={onClick}
        className={`absolute h-10 rounded-lg cursor-pointer shadow-md hover:shadow-xl transition-all ${getStatusColor(stay.status)} border-2 overflow-hidden`}
        style={positionStyle}
      >
        <div className="h-full flex items-center px-2 text-white text-xs font-semibold truncate">
          {stay.status === 'checked_in' && '✓ In House'}
          {stay.status === 'upcoming' && '📅 Upcoming'}
          {stay.status === 'checked_out' && 'Departed'}
          {stay.status === 'overdue' && '! Overstay'}
        </div>

        {/* Hover details */}
        {showDetails && (
          <div className="absolute inset-0 bg-black/80 opacity-0 hover:opacity-100 transition-opacity p-2 text-white text-xs space-y-1">
            <div className="font-bold">{stay.guestName}</div>
            <div>Check-in: {new Date(stay.checkIn).toLocaleDateString()}</div>
            <div>Check-out: {new Date(stay.checkOut).toLocaleDateString()}</div>
            {stay.propertyName && <div>{stay.propertyName}</div>}
            {stay.totalAmount && <div>₦{stay.totalAmount.toLocaleString()}</div>}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * GuestTimelineWidget Component
 */
export function GuestTimelineWidget({
  widget,
  isLoading,
  error,
  stays = [],
  viewMode = 'week',
  selectedDate,
  showRoomNumbers = true,
  showGuestDetails = true,
  onStayClick,
  onCheckIn,
  onCheckOut,
}: GuestTimelineWidgetProps) {
  const [currentViewDate, setCurrentViewDate] = useState(selectedDate || new Date());

  // Calculate date range based on view mode
  const dateRange = useMemo(() => {
    const start = new Date(currentViewDate);
    const end = new Date(currentViewDate);

    switch (viewMode) {
      case 'day':
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
        break;
      case 'week':
        start.setDate(start.getDate() - start.getDay()); // Start of week (Sunday)
        start.setHours(0, 0, 0, 0);
        end.setDate(start.getDate() + 6); // End of week (Saturday)
        end.setHours(23, 59, 59, 999);
        break;
      case 'month':
        start.setDate(1); // First day of month
        start.setHours(0, 0, 0, 0);
        end.setMonth(end.getMonth() + 1);
        end.setDate(0); // Last day of month
        end.setHours(23, 59, 59, 999);
        break;
    }

    return { start, end };
  }, [currentViewDate, viewMode]);

  // Filter stays that overlap with current view
  const visibleStays = useMemo(() => {
    return stays.filter((stay) => {
      const stayEnd = new Date(stay.checkOut);
      const stayStart = new Date(stay.checkIn);
      
      return (
        (stayStart >= dateRange.start && stayStart <= dateRange.end) ||
        (stayEnd >= dateRange.start && stayEnd <= dateRange.end) ||
        (stayStart <= dateRange.start && stayEnd >= dateRange.end)
      );
    });
  }, [stays, dateRange]);

  // Group stays by room or property
  const groupedStays = useMemo(() => {
    const groups: Record<string, GuestStay[]> = {};

    visibleStays.forEach((stay) => {
      const key = stay.roomNumber || stay.propertyId || 'unknown';
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(stay);
    });

    return groups;
  }, [visibleStays]);

  const stats = useMemo(() => {
    const checkedIn = stays.filter((s) => s.status === 'checked_in').length;
    const upcoming = stays.filter((s) => s.status === 'upcoming').length;
    const checkingInToday = stays.filter(
      (s) => new Date(s.checkIn).toDateString() === new Date().toDateString()
    ).length;
    const checkingOutToday = stays.filter(
      (s) => new Date(s.checkOut).toDateString() === new Date().toDateString()
    ).length;

    return { checkedIn, upcoming, checkingInToday, checkingOutToday };
  }, [stays]);

  const navigatePeriod = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentViewDate);

    switch (viewMode) {
      case 'day':
        newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
        break;
      case 'week':
        newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
        break;
      case 'month':
        newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
        break;
    }

    setCurrentViewDate(newDate);
  };

  const getPeriodLabel = () => {
    const options: Intl.DateTimeFormatOptions = {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    };

    if (viewMode === 'month') {
      options.month = 'long';
      options.day = undefined;
    }

    return currentViewDate.toLocaleString('default', options);
  };

  return (
    <BaseWidget
      widget={widget}
      isLoading={isLoading}
      error={error}
      className="guest-timeline-widget"
    >
      <div className="space-y-6">
        {/* Stats Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg">
            <p className="text-xs text-gray-600 uppercase">Checked In</p>
            <p className="text-2xl font-bold text-gray-900">{stats.checkedIn}</p>
          </div>
          
          <div className="text-center p-3 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg">
            <p className="text-xs text-gray-600 uppercase">Upcoming</p>
            <p className="text-2xl font-bold text-gray-900">{stats.upcoming}</p>
          </div>
          
          <div className="text-center p-3 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg">
            <p className="text-xs text-gray-600 uppercase">Arriving Today</p>
            <p className="text-2xl font-bold text-gray-900">{stats.checkingInToday}</p>
          </div>
          
          <div className="text-center p-3 bg-gradient-to-br from-orange-50 to-red-50 rounded-lg">
            <p className="text-xs text-gray-600 uppercase">Departing Today</p>
            <p className="text-2xl font-bold text-gray-900">{stats.checkingOutToday}</p>
          </div>
        </div>

        {/* Navigation Controls */}
        <div className="flex justify-between items-center">
          <button
            onClick={() => navigatePeriod('prev')}
            className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors font-medium"
          >
            ← Previous
          </button>

          <div className="text-center">
            <h3 className="text-lg font-bold text-gray-900">{getPeriodLabel()}</h3>
            <p className="text-sm text-gray-600 capitalize">{viewMode} view</p>
          </div>

          <button
            onClick={() => navigatePeriod('next')}
            className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors font-medium"
          >
            Next →
          </button>
        </div>

        {/* Timeline Header */}
        <div className="flex text-xs font-medium text-gray-500 uppercase tracking-wide pb-2 border-b-2 border-gray-200">
          <div className="w-32 pr-4">Guest / Room</div>
          <div className="flex-1 relative">
            <div className="absolute inset-0 flex justify-between">
              {Array.from({ length: 7 }).map((_, i) => {
                const date = new Date(dateRange.start);
                date.setDate(date.getDate() + i);
                return (
                  <div key={i} className="text-center flex-1">
                    {date.toLocaleDateString('default', { weekday: 'short' })}
                    <div className="font-bold">{date.getDate()}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Timeline Rows */}
        <div className="space-y-2 min-h-[200px]">
          {Object.entries(groupedStays).map(([room, roomStays]) => (
            <div key={room} className="relative">
              {roomStays.map((stay) => (
                <TimelineRow
                  key={stay.id}
                  stay={stay}
                  startDate={dateRange.start}
                  endDate={dateRange.end}
                  onClick={() => onStayClick?.(stay)}
                  showDetails={showGuestDetails}
                />
              ))}
            </div>
          ))}

          {visibleStays.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <p className="text-lg">No stays in this period</p>
              <p className="text-sm mt-1">Try adjusting the date range</p>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        {(onCheckIn || onCheckOut) && (
          <div className="pt-4 border-t border-gray-200">
            <h4 className="font-semibold text-gray-900 mb-3">Quick Actions</h4>
            <div className="flex gap-3">
              {onCheckIn && (
                <button
                  onClick={() => {
                    const todayCheckIns = stays.filter(
                      (s) =>
                        new Date(s.checkIn).toDateString() === new Date().toDateString() &&
                        s.status === 'upcoming'
                    );
                    todayCheckIns.forEach((s) => onCheckIn(s.id));
                  }}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                >
                  Check In All Today ({stats.checkingInToday})
                </button>
              )}
              
              {onCheckOut && (
                <button
                  onClick={() => {
                    const todayCheckOuts = stays.filter(
                      (s) =>
                        new Date(s.checkOut).toDateString() === new Date().toDateString() &&
                        s.status === 'checked_in'
                    );
                    todayCheckOuts.forEach((s) => onCheckOut(s.id));
                  }}
                  className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium"
                >
                  Check Out All Today ({stats.checkingOutToday})
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </BaseWidget>
  );
}

GuestTimelineWidget.displayName = 'GuestTimelineWidget';

export default GuestTimelineWidget;
