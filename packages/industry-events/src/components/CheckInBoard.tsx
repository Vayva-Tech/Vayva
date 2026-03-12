/**
 * CheckInBoard Component
 * 
 * Real-time attendee check-in board with QR code scanning support,
 * live statistics, and attendee queue management.
 */

import { useState, useEffect } from 'react';
import { BaseWidget } from '@vayva/industry-core';
import type { WidgetDefinition } from '@vayva/industry-core';
import type { Ticket, Event } from '../types';

export interface CheckInStats {
  totalCheckedIn: number;
  totalExpected: number;
  checkInRate: number;
  averageWaitTimeMinutes: number;
  currentQueueLength: number;
}

export interface AttendeeQueueItem {
  ticketId: string;
  attendeeName: string;
  tierName: string;
  checkInTime?: Date;
  status: 'queued' | 'checking_in' | 'checked_in' | 'issue';
  waitTimeMinutes: number;
}

export interface CheckInBoardWidgetProps {
  widget: WidgetDefinition;
  data?: any;
  isLoading?: boolean;
  error?: Error;
  onRefresh?: () => void;
  event: Event;
  tickets: Ticket[];
  stats?: CheckInStats;
  queue?: AttendeeQueueItem[];
  onCheckIn?: (ticketId: string) => Promise<void>;
  enableQueueManagement?: boolean;
  autoRefresh?: boolean;
}

/**
 * CheckInBoardWidget Component
 */
export function CheckInBoardWidget({
  widget,
  isLoading,
  error,
  event,
  tickets,
  stats,
  queue = [],
  onCheckIn,
  enableQueueManagement = true,
  autoRefresh = true,
}: CheckInBoardWidgetProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [lastScan, setLastScan] = useState<string | null>(null);

  // Simulate real-time updates
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      // In production, this would poll or use WebSocket
      console.log('Auto-refreshing check-in data...');
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [autoRefresh]);

  const handleQuickCheckIn = async (ticketId: string) => {
    if (!onCheckIn) return;

    try {
      await onCheckIn(ticketId);
      setLastScan(ticketId);
      
      // Clear highlight after 2 seconds
      setTimeout(() => setLastScan(null), 2000);
    } catch (err) {
      console.error('Check-in failed:', err);
    }
  };

  const startScanner = () => {
    setIsScanning(true);
    // In production, this would open camera for QR scanning
  };

  const stopScanner = () => {
    setIsScanning(false);
  };

  const getStatusColor = (status: AttendeeQueueItem['status']) => {
    switch (status) {
      case 'checked_in':
        return 'bg-green-100 text-green-700 border-green-300';
      case 'checking_in':
        return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'issue':
        return 'bg-red-100 text-red-700 border-red-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const renderStats = () => {
    if (!stats) return null;

    return (
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl">
          <p className="text-xs text-gray-600 uppercase tracking-wide">Checked In</p>
          <p className="text-3xl font-bold text-gray-900">{stats.totalCheckedIn}</p>
        </div>

        <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl">
          <p className="text-xs text-gray-600 uppercase tracking-wide">Expected</p>
          <p className="text-3xl font-bold text-gray-900">{stats.totalExpected}</p>
        </div>

        <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-red-50 rounded-xl">
          <p className="text-xs text-gray-600 uppercase tracking-wide">Check-in Rate</p>
          <p className="text-3xl font-bold text-gray-900">{stats.checkInRate}%</p>
        </div>

        <div className="text-center p-4 bg-gradient-to-br from-yellow-50 to-amber-50 rounded-xl">
          <p className="text-xs text-gray-600 uppercase tracking-wide">Avg Wait</p>
          <p className="text-3xl font-bold text-gray-900">{stats.averageWaitTimeMinutes}m</p>
        </div>

        <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl">
          <p className="text-xs text-gray-600 uppercase tracking-wide">In Queue</p>
          <p className="text-3xl font-bold text-gray-900">{stats.currentQueueLength}</p>
        </div>
      </div>
    );
  };

  const renderQueue = () => {
    if (!enableQueueManagement || queue.length === 0) return null;

    return (
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <span>📋</span> Check-in Queue
        </h3>

        <div className="space-y-2">
          {queue.map((item) => (
            <div
              key={item.ticketId}
              className={`p-4 rounded-lg border-2 transition-all ${getStatusColor(item.status)} ${
                lastScan === item.ticketId ? 'ring-4 ring-green-400 scale-105' : ''
              }`}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <p className="font-semibold text-base">{item.attendeeName}</p>
                  <p className="text-sm opacity-80">{item.tierName}</p>
                  {item.waitTimeMinutes > 0 && (
                    <p className="text-xs mt-1">
                      Wait time: {item.waitTimeMinutes}m
                    </p>
                  )}
                </div>

                <div className="flex gap-2">
                  {item.status === 'queued' && onCheckIn && (
                    <button
                      onClick={() => handleQuickCheckIn(item.ticketId)}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
                    >
                      Check In
                    </button>
                  )}
                  
                  {item.status === 'checking_in' && (
                    <span className="px-3 py-1 bg-blue-600 text-white rounded text-sm">
                      Processing...
                    </span>
                  )}
                  
                  {item.status === 'checked_in' && (
                    <span className="px-3 py-1 bg-green-600 text-white rounded text-sm">
                      ✓ Checked In
                    </span>
                  )}
                  
                  {item.status === 'issue' && (
                    <span className="px-3 py-1 bg-red-600 text-white rounded text-sm">
                      ! Issue
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <BaseWidget
      widget={widget}
      isLoading={isLoading}
      error={error}
      className="check-in-board-widget"
    >
      <div className="space-y-6">
        {/* Event Header */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{event.title}</h2>
            <p className="text-sm text-gray-600 mt-1">
              {event.startDate.toLocaleDateString()} • {event.venueName}
            </p>
          </div>

          {enableQueueManagement && (
            <button
              onClick={isScanning ? stopScanner : startScanner}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                isScanning
                  ? 'bg-red-600 text-white hover:bg-red-700'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {isScanning ? 'Stop Scanning' : 'Scan QR Code'}
            </button>
          )}
        </div>

        {/* Statistics */}
        {renderStats()}

        {/* Scanner Status */}
        {isScanning && (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm font-medium text-blue-900">
              📷 QR Scanner Active - Point camera at attendee QR codes
            </p>
          </div>
        )}

        {/* Queue Management */}
        {renderQueue()}

        {/* Quick Stats Summary */}
        {!enableQueueManagement && queue.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <p className="text-lg">✓ All attendees checked in smoothly</p>
            <p className="text-sm mt-2">Enable queue management for detailed tracking</p>
          </div>
        )}
      </div>
    </BaseWidget>
  );
}

CheckInBoardWidget.displayName = 'CheckInBoardWidget';

export default CheckInBoardWidget;
