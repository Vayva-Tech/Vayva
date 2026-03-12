"use client";

import { useState, useEffect } from 'react';
import Header from "@/components/Header";
import TicketPDFService from "@/lib/ticket-pdf-service";
import { Ticket, Calendar, MapPin, QrCode, Download, Eye, Clock, CheckCircle, Printer } from "lucide-react";

interface TicketPurchase {
  id: string;
  orderId: string;
  ticketNumber: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  status: string;
  qrCode: string;
  checkedInAt: string | null;
  event: {
    title: string;
    venue: string;
    startDate: string;
    endDate: string;
  };
  tier: {
    name: string;
    price: number;
  };
  createdAt: string;
}

export default function MyTicketsPage() {
  const [tickets, setTickets] = useState<TicketPurchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, upcoming, past

  useEffect(() => {
    fetchUserTickets();
  }, []);

  const fetchUserTickets = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/tickets/purchase');
      const data = await response.json();
      
      if (data.purchases) {
        setTickets(data.purchases);
      }
    } catch (error) {
      console.error('Failed to fetch tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTickets = tickets.filter(ticket => {
    if (filter === 'all') return true;
    
    const eventDate = new Date(ticket.event.startDate);
    const today = new Date();
    
    if (filter === 'upcoming') {
      return eventDate >= today;
    } else if (filter === 'past') {
      return eventDate < today;
    }
    
    return true;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatPrice = (price: number) => {
    return `₦${price.toLocaleString()}`;
  };

  const getStatusColor = (status: string, isCheckedIn: boolean) => {
    if (isCheckedIn) return 'bg-green-100 text-green-800';
    if (status === 'confirmed') return 'bg-blue-100 text-blue-800';
    if (status === 'pending') return 'bg-yellow-100 text-yellow-800';
    return 'bg-gray-100 text-gray-800';
  };

  const getStatusText = (status: string, isCheckedIn: boolean) => {
    if (isCheckedIn) return 'Checked In';
    if (status === 'confirmed') return 'Confirmed';
    if (status === 'pending') return 'Pending';
    return status;
  };

  const TicketCard = ({ ticket }: { ticket: TicketPurchase }) => {
    const eventDate = new Date(ticket.event.startDate);
    const today = new Date();
    const isUpcoming = eventDate >= today;
    const isCheckedIn = !!ticket.checkedInAt;

    return (
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
        {/* Header */}
        <div className="p-6 border-b">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-1">{ticket.event.title}</h3>
              <p className="text-gray-600">{ticket.tier.name} Ticket</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(ticket.status, isCheckedIn)}`}>
              {getStatusText(ticket.status, isCheckedIn)}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>{formatDate(ticket.event.startDate)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>{formatTime(ticket.event.startDate)}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              <span className="truncate">{ticket.event.venue}</span>
            </div>
            <div className="flex items-center gap-2">
              <Ticket className="h-4 w-4" />
              <span>{ticket.ticketNumber}</span>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-gray-600">Quantity: {ticket.quantity}</p>
              <p className="text-2xl font-bold text-gray-900">{formatPrice(ticket.totalPrice)}</p>
            </div>
            {isCheckedIn && (
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="h-5 w-5" />
                <span className="font-medium">Attended</span>
              </div>
            )}
          </div>

          {/* QR Code Preview */}
          <div className="bg-gray-50 rounded-xl p-4 mb-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-700">QR Code</span>
              <QrCode className="h-5 w-5 text-gray-400" />
            </div>
            <div className="bg-white border-2 border-dashed border-gray-300 rounded-lg h-32 flex items-center justify-center">
              <div className="text-center">
                <div className="bg-black w-20 h-20 mx-auto mb-2 flex items-center justify-center">
                  <span className="text-white text-xs font-mono">{ticket.qrCode.substring(0, 8)}...</span>
                </div>
                <p className="text-xs text-gray-500">Scan at venue entrance</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors">
              <Eye className="h-4 w-4" />
              View Details
            </button>
            <button 
              onClick={() => {
                // Mock ticket data for PDF generation
                const ticketData = {
                  ticketNumber: ticket.ticketNumber,
                  eventName: ticket.event.title,
                  eventDate: ticket.event.startDate,
                  eventTime: new Date(ticket.event.startDate).toLocaleTimeString(),
                  venue: ticket.event.venue,
                  attendeeName: "Current User",
                  ticketType: ticket.tier.name,
                  qrCode: ticket.qrCode,
                  orderId: ticket.orderId
                };
                TicketPDFService.downloadTicket(ticketData);
              }}
              className="flex items-center justify-center gap-2 py-3 px-4 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
            >
              <Download className="h-4 w-4" />
              Download
            </button>
            <button 
              onClick={() => {
                const ticketData = {
                  ticketNumber: ticket.ticketNumber,
                  eventName: ticket.event.title,
                  eventDate: ticket.event.startDate,
                  eventTime: new Date(ticket.event.startDate).toLocaleTimeString(),
                  venue: ticket.event.venue,
                  attendeeName: "Current User",
                  ticketType: ticket.tier.name,
                  qrCode: ticket.qrCode,
                  orderId: ticket.orderId
                };
                TicketPDFService.printTicket(ticketData);
              }}
              className="flex items-center justify-center gap-2 py-3 px-4 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
            >
              <Printer className="h-4 w-4" />
            </button>
          </div>

          {/* Event Status */}
          {!isCheckedIn && isUpcoming && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Event Status</span>
                <span className="font-medium text-blue-600">Upcoming</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Starts in {Math.ceil((eventDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))} days
              </p>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header breadcrumbs={[
        { label: "My Tickets" }
      ]} />

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Tickets</h1>
          <p className="text-gray-600">Manage your event tickets and reservations</p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-8">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              filter === 'all'
                ? 'bg-purple-600 text-white'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            All Tickets
          </button>
          <button
            onClick={() => setFilter('upcoming')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              filter === 'upcoming'
                ? 'bg-purple-600 text-white'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            Upcoming
          </button>
          <button
            onClick={() => setFilter('past')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              filter === 'past'
                ? 'bg-purple-600 text-white'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            Past Events
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm">
            <p className="text-3xl font-bold text-purple-600">{tickets.length}</p>
            <p className="text-gray-600">Total Tickets</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm">
            <p className="text-3xl font-bold text-blue-600">
              {tickets.filter(t => {
                const eventDate = new Date(t.event.startDate);
                return eventDate >= new Date();
              }).length}
            </p>
            <p className="text-gray-600">Upcoming</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm">
            <p className="text-3xl font-bold text-green-600">
              {tickets.filter(t => t.checkedInAt).length}
            </p>
            <p className="text-gray-600">Attended</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm">
            <p className="text-3xl font-bold text-gray-600">
              {formatPrice(tickets.reduce((sum, t) => sum + t.totalPrice, 0))}
            </p>
            <p className="text-gray-600">Total Spent</p>
          </div>
        </div>

        {/* Tickets List */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl shadow-sm overflow-hidden animate-pulse">
                <div className="p-6 border-b">
                  <div className="h-6 bg-gray-200 rounded mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
                <div className="p-6">
                  <div className="h-32 bg-gray-200 rounded mb-4"></div>
                  <div className="h-10 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredTickets.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
            <Ticket className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              {filter === 'all' ? 'No tickets yet' : `No ${filter} tickets`}
            </h3>
            <p className="text-gray-500 mb-6">
              {filter === 'all' 
                ? 'Start exploring events and purchase your first ticket!' 
                : `You don't have any ${filter} events at the moment.`}
            </p>
            <button className="bg-purple-600 text-white px-6 py-3 rounded-xl hover:bg-purple-700 transition-colors">
              Browse Events
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredTickets.map((ticket) => (
              <TicketCard key={ticket.id} ticket={ticket} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}