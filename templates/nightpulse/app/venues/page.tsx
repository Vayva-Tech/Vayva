"use client";

import { Music, Building2, MapPin, Star, Users, Clock, Calendar, Phone, Globe, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const venues = [
  {
    id: 1,
    name: "Skyline Arena",
    type: "Concert Hall",
    location: "Downtown LA",
    capacity: "5,000",
    rating: 4.8,
    reviews: 234,
    image: "🏟️",
    events: 12,
  },
  {
    id: 2,
    name: "Pulse Club",
    type: "Nightclub",
    location: "Miami Beach",
    capacity: "800",
    rating: 4.6,
    reviews: 189,
    image: "🌃",
    events: 8,
  },
  {
    id: 3,
    name: "Blue Note Lounge",
    type: "Jazz Club",
    location: "New York",
    capacity: "200",
    rating: 4.9,
    reviews: 156,
    image: "🎷",
    events: 5,
  },
  {
    id: 4,
    name: "Warehouse 23",
    type: "Event Space",
    location: "Brooklyn",
    capacity: "1,500",
    rating: 4.5,
    reviews: 98,
    image: "🏭",
    events: 6,
  },
];

const venueTypes = ["All", "Concert Hall", "Nightclub", "Jazz Club", "Event Space", "Bar"];

export default function VenuesPage() {
  const [selectedType, setSelectedType] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredVenues = venues.filter((venue) => {
    const matchesType = selectedType === "All" || venue.type === selectedType;
    const matchesSearch = venue.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         venue.location.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
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
              <Link href="/events" className="text-gray-300 hover:text-white">Events</Link>
              <Link href="/venues" className="text-white font-medium">Venues</Link>
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
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Discover Venues</h1>
          <p className="text-xl text-gray-400 mb-8">
            Find the perfect spot for your next night out
          </p>
          <div className="flex gap-4 max-w-xl mx-auto">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search venues..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
              />
            </div>
            <button className="px-6 py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700">
              Search
            </button>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-8">
          {venueTypes.map((type) => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`px-4 py-2 rounded-full text-sm font-medium ${
                selectedType === type
                  ? "bg-purple-600 text-white"
                  : "bg-gray-800 text-gray-300 hover:bg-gray-700"
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        {/* Venues Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredVenues.map((venue) => (
            <div key={venue.id} className="bg-gray-900 rounded-xl overflow-hidden border border-gray-800 hover:border-purple-500/50 transition-all group">
              <div className="h-48 bg-gradient-to-br from-purple-900/30 to-pink-900/30 flex items-center justify-center text-6xl relative">
                {venue.image}
              </div>
              <div className="p-5">
                <span className="inline-block px-3 py-1 bg-purple-600/20 text-purple-400 text-xs font-medium rounded-full mb-2">
                  {venue.type}
                </span>
                <h3 className="font-semibold text-lg text-white mb-1">{venue.name}</h3>
                <div className="flex items-center gap-1 text-gray-400 text-sm mb-3">
                  <MapPin className="w-4 h-4" />
                  {venue.location}
                </div>
                <div className="flex items-center gap-2 mb-3">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="font-medium">{venue.rating}</span>
                  <span className="text-gray-500 text-sm">({venue.reviews})</span>
                </div>
                <div className="flex items-center justify-between text-sm text-gray-400 mb-4">
                  <span>Capacity: {venue.capacity}</span>
                  <span>{venue.events} upcoming events</span>
                </div>
                <button className="w-full py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                  View Events
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
