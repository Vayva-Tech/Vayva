'use client';

import React from 'react';
import type { KDSStation } from '@vayva/industry-restaurant/types';
import { useRealTimeKDS } from '@/hooks/useRealTimeKDS';
import { Activity, Clock } from 'lucide-react';

interface StationWorkloadProps {
  designCategory?: string;
  industry?: string;
  planTier?: string;
}

/**
 * StationWorkload Component
 * 
 * Visualizes workload distribution across kitchen stations
 */
export function StationWorkload({
  designCategory = 'signature',
  industry = 'food',
  planTier = 'standard'
}: StationWorkloadProps) {
  const { stations, tickets } = useRealTimeKDS();

  const getWorkloadLevel = (queueLength: number, maxCapacity: number = 10) => {
    const percentage = (queueLength / maxCapacity) * 100;
    if (percentage > 80) return { level: 'high', color: 'red' };
    if (percentage > 50) return { level: 'medium', color: 'yellow' };
    return { level: 'low', color: 'green' };
  };

  const getStatusBadge = (queueLength: number) => {
    const workload = getWorkloadLevel(queueLength);
    if (workload.level === 'high') {
      return { text: 'Overwhelmed', color: 'red' };
    }
    if (workload.level === 'medium') {
      return { text: 'Busy', color: 'yellow' };
    }
    return { text: 'Clear', color: 'green' };
  };

  const queueForStation = (station: KDSStation) =>
    tickets.filter((t) => t.station === station.id).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-gray-600" />
          <h3 className="text-lg font-semibold">Station Workload</h3>
        </div>
        <span className="text-sm text-gray-500">{stations.length} stations</span>
      </div>

      <div className="space-y-3">
        {stations.map((station) => {
          const queueLength = queueForStation(station);
          const status = getStatusBadge(queueLength);
          const workload = getWorkloadLevel(queueLength);
          
          return (
            <div
              key={station.id}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h4 className="font-semibold text-gray-900">{station.name}</h4>
                  <p className="text-sm text-gray-500">
                    {station.categories.slice(0, 2).join(', ') || 'General'}
                  </p>
                </div>
                
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium bg-${status.color}-100 text-${status.color}-800`}
                  >
                    {status.text}
                  </span>
                </div>
              </div>

              {/* Workload Bar */}
              <div className="mt-3">
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-gray-600">
                    {queueLength} items in queue
                  </span>
                  <span className="text-gray-500">
                    Target prep: ~12 min
                  </span>
                </div>
                
                <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full bg-gradient-to-r from-${workload.color}-400 to-${workload.color}-600 transition-all duration-500`}
                    style={{ width: `${Math.min((queueLength / 10) * 100, 100)}%` }}
                  />
                </div>
              </div>

              {/* Efficiency Metrics */}
              <div className="mt-3 flex items-center gap-4 text-xs text-gray-500">
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>Avg: 12.0 min</span>
                </div>
                <div className="flex items-center gap-1">
                  <Activity className="h-3 w-3" />
                  <span>Efficiency: 100%</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {stations.length === 0 && (
        <div className="text-center py-12">
          <Activity className="h-12 w-12 mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500 font-medium">No stations configured</p>
          <p className="text-sm text-gray-400 mt-1">
            Set up your kitchen stations to begin tracking
          </p>
        </div>
      )}
    </div>
  );
}
