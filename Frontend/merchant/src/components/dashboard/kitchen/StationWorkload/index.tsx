'use client';

import React from 'react';
import { useRealTimeKDS } from '@/hooks/useRealTimeKDS';
import { Activity, Clock, AlertTriangle } from 'lucide-react';

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
  const { stations } = useRealTimeKDS();

  const getWorkloadLevel = (queueLength: number, maxCapacity: number = 10) => {
    const percentage = (queueLength / maxCapacity) * 100;
    if (percentage > 80) return { level: 'high', color: 'red' };
    if (percentage > 50) return { level: 'medium', color: 'yellow' };
    return { level: 'low', color: 'green' };
  };

  const getStatusBadge = (station: any) => {
    const workload = getWorkloadLevel(station.queueLength || 0);
    
    if (!station.isActive) {
      return { text: 'Offline', color: 'gray' };
    }
    
    if (workload.level === 'high') {
      return { text: 'Overwhelmed', color: 'red' };
    }
    if (workload.level === 'medium') {
      return { text: 'Busy', color: 'yellow' };
    }
    return { text: 'Clear', color: 'green' };
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-gray-600" />
          <h3 className="text-lg font-semibold">Station Workload</h3>
        </div>
        <span className="text-sm text-gray-500">
          {stations.filter(s => s.isActive).length} active stations
        </span>
      </div>

      <div className="space-y-3">
        {stations.map((station) => {
          const status = getStatusBadge(station);
          const workload = getWorkloadLevel(station.queueLength || 0);
          
          return (
            <div
              key={station.id}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h4 className="font-semibold text-gray-900">{station.name}</h4>
                  <p className="text-sm text-gray-500 capitalize">{station.type} Station</p>
                </div>
                
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium bg-${status.color}-100 text-${status.color}-800`}
                  >
                    {status.text}
                  </span>
                  {!station.isActive && (
                    <AlertTriangle className="h-4 w-4 text-gray-400" />
                  )}
                </div>
              </div>

              {/* Workload Bar */}
              <div className="mt-3">
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-gray-600">
                    {station.queueLength || 0} items in queue
                  </span>
                  <span className="text-gray-500">
                    Backlog: ~{station.avgCookTime || 12} min
                  </span>
                </div>
                
                <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full bg-gradient-to-r from-${workload.color}-400 to-${workload.color}-600 transition-all duration-500`}
                    style={{ width: `${Math.min((station.queueLength || 0) / 10 * 100, 100)}%` }}
                  />
                </div>
              </div>

              {/* Efficiency Metrics */}
              <div className="mt-3 flex items-center gap-4 text-xs text-gray-500">
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>Avg: {(station.avgCookTime || 0).toFixed(1)} min</span>
                </div>
                <div className="flex items-center gap-1">
                  <Activity className="h-3 w-3" />
                  <span>Efficiency: {station.efficiency || 100}%</span>
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
