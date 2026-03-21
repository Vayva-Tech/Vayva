// @ts-nocheck
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { logger } from '@/lib/logger';
import { Event, EventStatus } from '@/types/phase4-industry';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Button } from '@vayva/ui';
import { Calendar, MapPin, Users, Ticket, Plus, Star } from "@phosphor-icons/react";

const statusColors: Record<EventStatus, string> & { sold_out?: string } = {
  draft: 'bg-gray-50 text-gray-600',
  published: 'bg-green-50 text-green-600',
  cancelled: 'bg-red-50 text-red-600',
  completed: 'bg-blue-50 text-blue-600',
  sold_out: 'bg-orange-50 text-orange-600',
};

export default function EventsDashboardPage() {
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<EventStatus | 'all'>('all');

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await fetch('/api/events');
      if (response.ok) {
        const data = await response.json();
        setEvents(data.events || []);
      }
    } catch (error) {
      logger.error('[EventsList] Failed to fetch:', { error });
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate metrics
  const totalEvents = events.length;
  const published = events.filter(e => e.status === 'published').length;
  const draft = events.filter(e => e.status === 'draft').length;
  const soldOut = events.filter(e => e.status === 'sold_out').length;
  const upcoming = events.filter(e => new Date(e.startDate) > new Date()).length;
  const totalTickets = events.reduce((sum, e) => sum + ((e as any).capacity || 0), 0);

  const filteredEvents = events.filter((event) => {
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || event.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Events & Ticketing</h1>
          <p className="text-sm text-gray-500 mt-1">Manage events and ticket sales</p>
        </div>
        <Button onClick={() => router.push('/dashboard/events/new')} className="bg-green-600 hover:bg-green-700 text-white px-4 h-10 rounded-xl font-semibold">
          <Plus size={18} className="mr-2" />
          Create Event
        </Button>
      </div>

      {/* Summary Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <SummaryWidget
          icon={<Calendar size={18} />}
          label="Total Events"
          value={String(totalEvents)}
          trend={`${upcoming} upcoming`}
          positive
        />
        <SummaryWidget
          icon={<Star size={18} />}
          label="Published"
          value={String(published)}
          trend="live now"
          positive
        />
        <SummaryWidget
          icon={<Ticket size={18} />}
          label="Drafts"
          value={String(draft)}
          trend="unpublished"
          positive={draft === 0}
        />
        <SummaryWidget
          icon={<Users size={18} />}
          label="Sold Out"
          value={String(soldOut)}
          trend="full capacity"
          positive
        />
        <SummaryWidget
          icon={<MapPin size={18} />}
          label="Upcoming"
          value={String(upcoming)}
          trend="scheduled"
          positive
        />
        <SummaryWidget
          icon={<Ticket size={18} />}
          label="Total Capacity"
          value={String(totalTickets)}
          trend="tickets"
          positive
        />
      </div>

      {/* Filters */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <input
            placeholder="Search events..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 w-64"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="all">All Status</option>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="sold_out">Sold Out</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Events Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          <div className="col-span-full p-12 flex justify-center">
            <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="col-span-full p-16 text-center flex flex-col items-center">
            <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
              <Calendar size={32} className="text-gray-400" />
            </div>
            <h3 className="text-base font-semibold text-gray-900 mb-1">No events found</h3>
            <p className="text-sm text-gray-500 max-w-sm">
              Create your first event to start selling tickets.
            </p>
            <Button onClick={() => router.push('/dashboard/events/new')} className="mt-4 bg-green-600 hover:bg-green-700 text-white">
              <Plus size={18} className="mr-2" />
              Create Event
            </Button>
          </div>
        ) : (
          filteredEvents.map((event) => (
            <div
              key={event.id}
              onClick={() => router.push(`/dashboard/events/${event.id}`)}
              className="bg-white rounded-2xl border border-gray-100 overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
            >
              {(event as any).coverImage && (
                <div className="h-40 bg-gray-100 relative overflow-hidden">
                  <img
                    src={(event as any).coverImage}
                    alt={event.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-semibold text-gray-900 line-clamp-1">{event.title}</h3>
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${statusColors[event.status]}`}>
                    {event.status}
                  </span>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar size={14} className="text-gray-400" />
                    {formatDate(event.startDate)}
                    {event.endDate && ` - ${formatDate(event.endDate)}`}
                  </div>
                  {(event as any).venue && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPin size={14} className="text-gray-400" />
                      {(event as any).venue}
                    </div>
                  )}
                  {(event as any).capacity && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Users size={14} className="text-gray-400" />
                      Capacity: {((event as any).capacity).toLocaleString()}
                    </div>
                  )}
                  {event.price && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Ticket size={14} className="text-gray-400" />
                      From {formatCurrency(event.price)}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// Summary Widget Component
function SummaryWidget({
  icon,
  label,
  value,
  trend,
  positive,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  trend: string;
  positive: boolean;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            {label}
          </p>
          <p className="text-2xl font-bold text-gray-900 tracking-tight mt-1">
            {value}
          </p>
          <p className={`text-xs mt-1 ${positive ? 'text-green-600' : 'text-orange-600'}`}>
            {trend}
          </p>
        </div>
        <div className="p-2.5 rounded-xl bg-gray-100 text-gray-600">
          {icon}
        </div>
      </div>
    </div>
  );
}
