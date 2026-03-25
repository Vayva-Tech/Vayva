"use client";

import React from "react";
import { Card } from "@vayva/ui";
import { Clock, Star } from "@phosphor-icons/react";
import type { TimeTrackingMetrics } from "@/types/legal";

interface TimeTrackingProps {
  data?: TimeTrackingMetrics;
}

export function TimeTracking({ data }: TimeTrackingProps) {
  if (!data) return null;

  return (
    <Card className="p-6 border-l-4 border-green-600 shadow-lg  bg-white/90">
      <div className="flex items-center gap-2 mb-4">
        <Clock size={24} className="text-green-600" />
        <h2 className="text-xl font-bold text-gray-900">Time Tracking</h2>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <div className="text-xs text-gray-500">Billed Hours</div>
          <div className="text-2xl font-bold text-gray-900">{data.billedHours.toFixed(1)}h</div>
        </div>
        <div>
          <div className="text-xs text-gray-500">WIP Hours</div>
          <div className="text-2xl font-bold text-orange-600">{data.wipHours.toFixed(1)}h</div>
        </div>
        <div>
          <div className="text-xs text-gray-500">Realization Rate</div>
          <div className="text-2xl font-bold text-green-600">{data.realizationRate.toFixed(1)}%</div>
        </div>
        <div>
          <div className="text-xs text-gray-500">Collection Rate</div>
          <div className="text-2xl font-bold text-blue-600">{data.collectionRate.toFixed(1)}%</div>
        </div>
      </div>

      {data.topProducer.attorneyName && (
        <div className="pt-4 border-t border-gray-200">
          <div className="flex items-center gap-2">
            <Star size={16} className="text-amber-500" />
            <span className="text-sm text-gray-500">Top Producer:</span>
            <span className="text-sm font-semibold text-gray-900">{data.topProducer.attorneyName}</span>
            <span className="text-sm text-gray-500">({data.topProducer.hours}h this week)</span>
          </div>
        </div>
      )}

      {data.unsubmittedTimesheets > 0 && (
        <div className="mt-3 p-2 bg-orange-50 border border-amber-200 rounded text-xs text-amber-800">
          ⚠️ {data.unsubmittedTimesheets} unsubmitted timesheets - Deadline: Friday EOD
        </div>
      )}
    </Card>
  );
}
