"use client";

import { Calendar, MapPin, Clock, Users, Star, Ticket, ChevronRight, Search } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const events = [
  {
    id: 1,
    title: "Summer Music Festival",
    date: "July 15-17, 2024",
    time: "2:00 PM",
    location: "Central Park, NYC",
    attendees: 5000,
    price: 150,
    image: "🎵",
    category: "Music",
    featured: true,
  },
  {
    id: 2,
    title: "Tech Innovation Summit",
    date: "Aug 20, 2024",
    time: "9:00 AM",
    location: "Convention Center, SF",
    attendees: 1200,
    price: 299,
    image: "💡",
    category: "Business",
    featured: false,
  },
  {
    id: 3,
    title: "Food & Wine Expo",
    date: "Sept 10-12, 2024",
    time: "11:00 AM",
    location: "Pier 27, SF",
    attendees: 3000,
    price: 75,
    image: "🍷",
    category: "Food",
    featured: true,
  },
  {
    id: 4,
    title: "Comedy Night Live",
    date: "July 25, 2024",
    time: "8:00 PM",
    location: "Laugh Factory, LA",
    attendees: 300,
    price: 45,
    image: "🎭",
    category: "Entertainment",
    featured: false,
  },
  {
    id: 5,
    title: "Marathon 2024",
    date: "Oct 5, 2024",
    time: "6:00 AM",
    location: "Downtown Chicago",
    attendees: 15000,
    price: 80,
    image: "🏃",
    category: "Sports",
    featured: false,
  },
  {
    id: 6,
    title: "Art Gallery Opening",
    date: "Aug 8, 2024",
    time: "6:00 PM",
    location: "MoMA, NYC",
    attendees: 500,
    price: 35,
    image: "🎨",
    category: "Art",
    featured: false,
  },
];

const categories = ["All", "Music", "Business", "Food", "Entertainment", "Sports", "Art"];

export default function EventsPage() {
  const [selectedCategory, setSelectedCategory] = useState("All");

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
              <Link href="/events" className="text-purple-600 font-medium">Events</Link>
              <Link href="/venues" className="text-gray-600 hover:text-gray-900">Venues</Link>
              <Link href="/tickets" className="text-gray-600 hover:text-gray-900">My Tickets</Link>
            </div>
            <Link href="/create" className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
              Create Event
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="bg-gradient-to-br from-purple-600 to-indigo-700 py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">Discover Amazing Events</h1>
          <p className="text-xl text-purple-100 mb-8">
            Find and book tickets for concerts, conferences, festivals & more
          </p>
          <div className="max-w-2xl mx-auto bg-white rounded-xl p-4 shadow-lg">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search events..."
                  className="w-full pl-10 pr-4 py-3 border rounded-lg"
                />
              </div>
              <button className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                Search
              </button>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Categories */}
        <div className="flex flex-wrap gap-3 mb-8">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full ${
                cat === selectedCategory
                  ? "bg-purple-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Events Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {events.map((event) => (
            <div key={event.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all">
              <div className="h-48 bg-gradient-to-br from-purple-100 to-indigo-100 flex items-center justify-center text-6xl relative">
                {event.image}
                {event.featured && (
                  <span className="absolute top-3 left-3 px-3 py-1 bg-purple-600 text-white text-xs font-bold rounded-full">
                    Featured
                  </span>
                )}
              </div>
              <div className="p-6">
                <span className="text-purple-600 text-sm font-medium">{event.category}</span>
                <h3 className="text-xl font-bold text-gray-900 mt-1 mb-3">{event.title}</h3>
                <div className="space-y-2 text-sm text-gray-600 mb-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {event.date}
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    {event.time}
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    {event.location}
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    {event.attendees.toLocaleString()} attending
                  </div>
                </div>
                <div className="flex items-center justify-between pt-4 border-t">
                  <span className="text-2xl font-bold text-purple-600">${event.price}</span>
                  <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                    Get Tickets
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
