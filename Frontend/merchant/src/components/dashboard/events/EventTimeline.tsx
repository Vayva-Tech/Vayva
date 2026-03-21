"use client";

import React from "react";
import { Calendar, MapPin, Users } from "lucide-react";

interface EventTimelineProps {
  data?: {
    eventDate?: string;
    daysUntilEvent?: number;
    schedule?: any[];
    venueCapacity?: number;
    venueLayout?: string;
  };
}

export function EventTimeline({ data }: EventTimelineProps) {
  if (!data) return null;

  const { daysUntilEvent = 0, schedule = [], venueCapacity } = data;

  return (
    <div className="bg-white border-2 border-black rounded-xl p-6 shadow-[4px_4px_0px_#000000]">
      <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight mb-4 flex items-center gap-2">
        <Calendar className="w-5 h-5" />
        Event Timeline
      </h3>

      {/* Countdown */}
      <div className="mb-4 p-4 bg-gradient-to-r from-pink-50 to-red-50 border-2 border-black rounded-lg text-center">
        <p className="text-3xl font-black text-pink-600">{daysUntilEvent}</p>
        <p className="text-xs font-bold text-gray-700 uppercase mt-1">Days Until Event</p>
      </div>

      {/* Schedule */}
      {schedule.length > 0 && (
        <div className="space-y-3 mb-4">
          <h4 className="text-xs font-black text-gray-700 uppercase tracking-wider">Schedule</h4>
          {schedule.slice(0, 3).map((day, idx) => (
            <div key={idx} className="p-3 bg-gray-50 border-2 border-gray-200 rounded-lg">
              <p className="font-bold text-gray-900 text-sm">{day.date || `Day ${idx + 1}`}</p>
              <div className="mt-2 space-y-1">
                {day.events?.slice(0, 3).map((event: any, i: number) => (
                  <p key={i} className="text-xs text-gray-600 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-pink-500 rounded-full" />
                    {event.time} - {event.name}
                  </p>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Venue Info */}
      {venueCapacity && (
        <div className="p-3 bg-blue-50 border-2 border-blue-200 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-4 h-4 text-blue-600" />
            <p className="text-xs font-bold text-blue-900">Venue Capacity</p>
          </div>
          <p className="text-2xl font-black text-blue-900">{venueCapacity.toLocaleString()}</p>
          <p className="text-xs text-blue-700 mt-1">attendees</p>
        </div>
      )}
    </div>
  );
}
