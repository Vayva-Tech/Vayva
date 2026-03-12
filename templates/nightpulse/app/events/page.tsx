"use client";

import { Music, Calendar, MapPin, Users, Clock, Ticket, Star, Search, Filter, Heart, Share2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const events = [
  {
    id: 1,
    name: "Neon Nights Festival",
    date: "Mar 15, 2024",
    time: "8:00 PM",
    venue: "Skyline Arena",
    location: "Downtown LA",
    price: 89,
    image: "🎆",
    category: "Festival",
    featured: true,
  },
  {
    id: 2,
    name: "Electric Dreams",
    date: "Mar 20, 2024",
    time: "10:00 PM",
    venue: "Pulse Club",
    location: "Miami Beach",
    price: 45,
    image: "🌃",
    category: "Club Night",
    featured: false,
  },
  {
    id: 3,
    name: "Midnight Jazz Lounge",
    date: "Mar 22, 2024",
    time: "9:00 PM",
    venue: "Blue Note",
    location: "New York",
    price: 65,
    image: "🎷",
    category: "Live Music",
    featured: true,
  },
  {
    id: 4,
    name: "Underground Beats",
    date: "Mar 25, 2024",
    time: "11:00 PM",
    venue: "Warehouse 23",
    location: "Brooklyn",
    price: 35,
    image: "🎧",
    category: "DJ Set",
    featured: false,
  },
];

const categories = ["All", "Festival", "Club Night", "Live Music", "DJ Set", "Concert"];

export default function EventsPage() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredEvents = events.filter((event) => {
    const matchesCategory = selectedCategory === "All" || event.category === selectedCategory;
    const matchesSearch = event.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         event.location.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Navigation */}
      <nav className="bg-gray-900 border-b border-gray-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
                <Music className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">NightPulse</span>
            </Link>
            <div className="hidden md:flex items-center gap-8">
              <Link href="/events" className="text-white font-medium">Events</Link>
              <Link href="/venues" className="text-gray-300 hover:text-white">Venues</Link>
              <Link href="/artists" className="text-gray-300 hover:text-white">Artists</Link>
              <Link href="/about" className="text-gray-300 hover:text-white">About</Link>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/tickets" className="text-gray-300 hover:text-white">My Tickets</Link>
              <Link href="/login" className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="bg-gradient-to-br from-purple-900 via-gray-900 to-black py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Upcoming Events</h1>
          <p className="text-xl text-gray-400 mb-8">
            Discover the best nightlife experiences in your city
          </p>
          <div className="flex gap-4 max-w-xl mx-auto">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search events, venues..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
              />
            </div>
            <button className="px-6 py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700">
              Search
            </button>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Categories */}
        <div className="flex flex-wrap gap-2 mb-8">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full text-sm font-medium ${
                selectedCategory === category
                  ? "bg-purple-600 text-white"
                  : "bg-gray-800 text-gray-300 hover:bg-gray-700"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Events Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredEvents.map((event) => (
            <div key={event.id} className="bg-gray-900 rounded-xl overflow-hidden border border-gray-800 hover:border-purple-500/50 transition-all group">
              <div className="h-48 bg-gradient-to-br from-purple-900/50 to-pink-900/50 flex items-center justify-center text-6xl relative">
                {event.image}
                {event.featured && (
                  <span className="absolute top-3 left-3 px-3 py-1 bg-purple-600 text-white text-xs font-bold rounded-full">
                    Featured
                  </span>
                )}
                <button className="absolute top-3 right-3 p-2 bg-black/50 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity">
                  <Heart className="w-5 h-5" />
                </button>
              </div>
              <div className="p-5">
                <div className="flex items-center gap-2 text-purple-400 text-sm mb-2">
                  <Calendar className="w-4 h-4" />
                  {event.date}
                  <Clock className="w-4 h-4 ml-2" />
                  {event.time}
                </div>
                <h3 className="font-semibold text-lg text-white mb-2">{event.name}</h3>
                <div className="flex items-center gap-1 text-gray-400 text-sm mb-4">
                  <MapPin className="w-4 h-4" />
                  {event.venue}, {event.location}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xl font-bold text-white">${event.price}</span>
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
