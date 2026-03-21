'use client';

import React from 'react';
import { KitchenStation } from '@/types/kitchen';
import { Filter } from 'lucide-react';

interface StationFilterProps {
  stations: KitchenStation[];
  selectedStation: string;
  onChange: (stationId: string) => void;
}

/**
 * StationFilter Component
 * 
 * Dropdown filter for selecting kitchen station
 */
export function StationFilter({
  stations,
  selectedStation,
  onChange,
}: StationFilterProps) {
  return (
    <div className="relative">
      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
        <Filter className="h-4 w-4" />
      </div>
      
      <select
        value={selectedStation}
        onChange={(e) => onChange(e.target.value)}
        className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
      >
        <option value="all">All Stations</option>
        {stations.map(station => (
          <option key={station.id} value={station.id}>
            {station.name} ({station.tickets?.length || 0})
          </option>
        ))}
      </select>
    </div>
  );
}
