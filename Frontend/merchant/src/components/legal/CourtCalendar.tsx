// @ts-nocheck
"use client";

import React from "react";
import { Card } from "@vayva/ui";
import { Calendar, MapPin } from "@phosphor-icons/react";
import type { CourtCalendarMetrics } from "@/types/legal";

interface CourtCalendarProps {
  data?: CourtCalendarMetrics;
}

export function CourtCalendar({ data }: CourtCalendarProps) {
  if (!data) return null;

  const todaysAppearances = data.todaysAppearances || [];
  const upcomingHearings = data.upcomingHearings || [];

  return (
    <Card className="p-6 border-l-4 border-blue-700 shadow-lg  bg-white/90">
      <div className="flex items-center gap-2 mb-4">
        <Calendar size={24} className="text-blue-700" />
        <h2 className="text-xl font-bold text-gray-900">Court Calendar</h2>
      </div>

      {/* Today's Schedule */}
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-gray-500 mb-2">Today's Schedule</h3>
        {todaysAppearances.length === 0 ? (
          <p className="text-sm text-gray-500 italic">No court appearances today</p>
        ) : (
          <div className="space-y-2">
            {todaysAppearances.map((appearance) => (
              <div
                key={appearance.id}
                className="p-3 bg-blue-50 rounded-lg border border-blue-200"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-bold text-blue-900">
                    {new Date(appearance.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <span className="text-xs px-2 py-1 bg-blue-200 text-blue-800 rounded">
                    {appearance.type.replace('_', ' ')}
                  </span>
                </div>
                <div className="text-sm text-gray-900 font-medium">{appearance.title}</div>
                <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                  <MapPin size={12} />
                  {appearance.location} {appearance.department && `- ${appearance.department}`}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Upcoming Hearings */}
      <div className="pt-4 border-t border-gray-200">
        <h3 className="text-sm font-semibold text-gray-500 mb-2">Upcoming Hearings</h3>
        {upcomingHearings.slice(0, 3).map((hearing) => (
          <div key={hearing.id} className="py-2 border-b border-gray-100 last:border-0">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-900">{hearing.title}</span>
              <span className="text-xs text-gray-500">
                {new Date(hearing.dateTime).toLocaleDateString()}
              </span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
