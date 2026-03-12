"use client";

import React from "react";
import { UserCheck, ScanLine, Printer } from "lucide-react";

interface AttendeeCheckInProps {
  data?: {
    summary?: {
      totalRegistered: number;
      checkedIn: number;
      checkInRate: number;
      onSiteToday: number;
      vipNotArrived: number;
      badgesRemaining: number;
    };
    onSiteAttendees?: any[];
    qrScanner?: {
      status: string;
      devicesConnected: number;
      devicesTotal: number;
    };
  };
}

export function AttendeeCheckIn({ data }: AttendeeCheckInProps) {
  if (!data) return null;

  const { summary, onSiteAttendees = [], qrScanner } = data;

  return (
    <div className="bg-white border-2 border-black rounded-xl p-6 shadow-[4px_4px_0px_#000000]">
      <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight mb-4 flex items-center gap-2">
        <UserCheck className="w-5 h-5" />
        Attendee Check-in
      </h3>

      {/* Summary Stats */}
      {summary && (
        <div className="mb-4 grid grid-cols-2 gap-3">
          <div className="p-3 bg-green-50 border-2 border-green-300 rounded-lg">
            <p className="text-2xl font-black text-green-900">{summary.checkedIn}</p>
            <p className="text-xs font-bold text-green-700">Checked In</p>
          </div>
          <div className="p-3 bg-blue-50 border-2 border-blue-300 rounded-lg">
            <p className="text-2xl font-black text-blue-900">{summary.totalRegistered}</p>
            <p className="text-xs font-bold text-blue-700">Total Registered</p>
          </div>
        </div>
      )}

      {/* Recent Check-ins */}
      {onSiteAttendees.length > 0 && (
        <div className="mb-4">
          <h4 className="text-xs font-black text-gray-700 uppercase tracking-wider mb-2">
            🟢 On-Site Today
          </h4>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {onSiteAttendees.map((attendee) => (
              <div key={attendee.id} className="p-2 bg-gray-50 border border-gray-200 rounded">
                <p className="font-bold text-gray-900 text-sm">{attendee.customerName}</p>
                <p className="text-xs text-gray-600">{attendee.ticketType} • {attendee.formattedTime}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* QR Scanner Status */}
      {qrScanner && (
        <div className="p-3 bg-purple-50 border-2 border-purple-200 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <ScanLine className="w-4 h-4 text-purple-600" />
              <p className="text-xs font-bold text-purple-900">QR Scanner</p>
            </div>
            <span className="text-xs font-black text-green-700">● Active</span>
          </div>
          <p className="text-sm font-bold text-purple-900">
            {qrScanner.devicesConnected}/{qrScanner.devicesTotal} Devices Connected
          </p>
        </div>
      )}
    </div>
  );
}
