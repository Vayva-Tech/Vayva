'use client';
import { Button } from "@vayva/ui";

import React, { useState } from 'react';
import type { Ticket } from '@/types/kitchen';
import { TicketCard } from './TicketCard';
import { StationFilter } from './StationFilter';
import { useRealTimeKDS } from '@/hooks/useRealTimeKDS';
import { ChefHat, AlertTriangle } from 'lucide-react';

function isUrgentTicket(ticket: Ticket): boolean {
  if (ticket.priority === 'rush') return true;
  if (
    ticket.promisedTime &&
    new Date(ticket.promisedTime) < new Date() &&
    ticket.status !== 'ready' &&
    ticket.status !== 'served'
  ) {
    return true;
  }
  return false;
}

interface ActiveTicketsByStationProps {
  designCategory?: string;
  industry?: string;
  planTier?: string;
}

/**
 * ActiveTicketsByStation Component
 * 
 * Displays all active kitchen tickets organized by station
 * with real-time updates and timer tracking
 */
export function ActiveTicketsByStation({ 
  designCategory = 'signature',
  industry = 'food',
  planTier = 'standard'
}: ActiveTicketsByStationProps) {
  const { tickets, stations, isLoading, error } = useRealTimeKDS();
  const [selectedStation, setSelectedStation] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Filter tickets by selected station
  const filteredTickets =
    selectedStation === 'all'
      ? tickets
      : tickets.filter((ticket) => ticket.station === selectedStation);

  const urgentTickets = filteredTickets.filter(isUrgentTicket);
  const normalTickets = filteredTickets.filter((t) => !isUrgentTicket(t));

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Active Tickets</h3>
          <div className="animate-pulse h-8 w-32 bg-gray-200 rounded" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-48 bg-gray-100 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <div className="flex items-center gap-2 text-red-800">
          <AlertTriangle className="h-5 w-5" />
          <p className="font-medium">Failed to load tickets</p>
        </div>
        <p className="text-sm text-red-600 mt-2">{error.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <ChefHat className="h-5 w-5 text-gray-600" />
          <h3 className="text-lg font-semibold">
            Active Tickets ({filteredTickets.length})
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <StationFilter
            stations={stations}
            selectedStation={selectedStation}
            onChange={setSelectedStation}
          />
          
          <Button
            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            className="px-3 py-1.5 text-sm border rounded hover:bg-gray-50 transition-colors"
          >
            {viewMode === 'grid' ? 'List View' : 'Grid View'}
          </Button>
        </div>
      </div>

      {/* Urgent tickets first */}
      {urgentTickets.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-4 w-4" />
            <span className="text-sm font-semibold">Requires Immediate Attention</span>
          </div>
          
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 gap-4' : 'space-y-2'}>
            {urgentTickets.map(ticket => (
              <TicketCard
                key={ticket.id}
                ticket={ticket}
                variant="compact"
                showUrgencyIndicator
              />
            ))}
          </div>
        </div>
      )}

      {/* Normal tickets */}
      {normalTickets.length > 0 && (
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 gap-4' : 'space-y-2'}>
          {normalTickets.map(ticket => (
            <TicketCard
              key={ticket.id}
              ticket={ticket}
              variant={viewMode === 'list' ? 'compact' : 'default'}
            />
          ))}
        </div>
      )}

      {/* Empty state */}
      {filteredTickets.length === 0 && (
        <div className="text-center py-12">
          <ChefHat className="h-12 w-12 mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500 font-medium">No active tickets</p>
          <p className="text-sm text-gray-400 mt-1">
            {selectedStation !== 'all' 
              ? 'Select a different station or wait for new orders' 
              : 'All caught up!'}
          </p>
        </div>
      )}
    </div>
  );
}

