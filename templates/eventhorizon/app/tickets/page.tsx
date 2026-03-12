"use client";

import { Calendar, Ticket, ArrowRight, Download, CheckCircle, Star, MapPin, Clock } from "lucide-react";
import Link from "next/link";

const tickets = [
  {
    id: 1,
    event: "Summer Music Festival",
    date: "July 15, 2024",
    time: "2:00 PM",
    location: "Central Park, NYC",
    ticketType: "VIP Pass",
    price: 150,
    status: "confirmed",
    image: "🎵",
  },
  {
    id: 2,
    event: "Tech Innovation Summit",
    date: "Aug 20, 2024",
    time: "9:00 AM",
    location: "Convention Center, SF",
    ticketType: "General Admission",
    price: 299,
    status: "confirmed",
    image: "💡",
  },
];

export default function TicketsPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">EventHorizon</span>
            </Link>
            <div className="hidden md:flex items-center gap-8">
              <Link href="/events" className="text-gray-600 hover:text-gray-900">Events</Link>
              <Link href="/venues" className="text-gray-600 hover:text-gray-900">Venues</Link>
              <Link href="/tickets" className="text-purple-600 font-medium">My Tickets</Link>
            </div>
            <Link href="/create" className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
              Create Event
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Tickets</h1>
          <p className="text-gray-600">Manage your event tickets and bookings</p>
        </div>

        {/* Tickets List */}
        {tickets.length > 0 ? (
          <div className="space-y-6">
            {tickets.map((ticket) => (
              <div key={ticket.id} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="w-full md:w-48 h-32 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-lg flex items-center justify-center text-5xl">
                    {ticket.image}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-sm rounded-full mb-2">
                          <CheckCircle className="w-3 h-3" />
                          Confirmed
                        </span>
                        <h3 className="text-xl font-bold text-gray-900">{ticket.event}</h3>
                      </div>
                      <span className="text-2xl font-bold text-purple-600">${ticket.price}</span>
                    </div>
                    <p className="text-purple-600 font-medium mb-3">{ticket.ticketType}</p>
                    <div className="grid grid-cols-2 gap-3 text-sm text-gray-600 mb-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {ticket.date}
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        {ticket.time}
                      </div>
                      <div className="flex items-center gap-2 col-span-2">
                        <MapPin className="w-4 h-4" />
                        {ticket.location}
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <button className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                        <Download className="w-4 h-4" />
                        Download
                      </button>
                      <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                        Transfer
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Ticket className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No tickets yet</h3>
            <p className="text-gray-600 mb-6">Browse events and book your first ticket</p>
            <Link href="/events" className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
              Browse Events
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
