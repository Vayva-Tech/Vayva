"use client";

import { Hotel, Search, MapPin, Star, Users, Heart, Wifi, Car, Coffee, Waves, ArrowRight, Filter } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const hotels = [
  {
    id: 1,
    name: "Grand Plaza Hotel",
    location: "New York, NY",
    rating: 4.8,
    reviews: 2340,
    price: 299,
    image: "🏨",
    amenities: ["wifi", "parking", "pool", "spa"],
  },
  {
    id: 2,
    name: "Seaside Resort",
    location: "Miami Beach, FL",
    rating: 4.6,
    reviews: 1890,
    price: 189,
    image: "🏖️",
    amenities: ["wifi", "parking", "beach", "pool"],
  },
  {
    id: 3,
    name: "Mountain Lodge",
    location: "Aspen, CO",
    rating: 4.9,
    reviews: 567,
    price: 399,
    image: "🏔️",
    amenities: ["wifi", "parking", "ski", "fireplace"],
  },
  {
    id: 4,
    name: "Urban Boutique",
    location: "San Francisco, CA",
    rating: 4.5,
    reviews: 1234,
    price: 249,
    image: "🌉",
    amenities: ["wifi", "gym", "bar", "rooftop"],
  },
];

export default function HotelsPage() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Hotel className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">Hoperise</span>
            </Link>
            <div className="hidden md:flex items-center gap-8">
              <Link href="/hotels" className="text-blue-600 font-medium">Hotels</Link>
              <Link href="/deals" className="text-gray-600 hover:text-gray-900">Deals</Link>
              <Link href="/about" className="text-gray-600 hover:text-gray-900">About</Link>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/auth/login" className="text-gray-600 hover:text-gray-900">Sign In</Link>
              <Link href="/auth/signup" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Search Header */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 py-12">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-3xl font-bold text-white mb-6">Find Your Perfect Hotel</h1>
          <div className="bg-white rounded-xl p-4 shadow-lg">
            <div className="flex gap-4">
              <div className="relative flex-1">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Where are you going?"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>
              <button className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700">
                Search
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Popular Hotels</h2>
          <button className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50">
            <Filter className="w-4 h-4" />
            Filters
          </button>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {hotels.map((hotel) => (
            <div key={hotel.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all">
              <div className="h-48 bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center text-6xl">
                {hotel.image}
              </div>
              <div className="p-4">
                <div className="flex items-center gap-1 mb-2">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="font-medium">{hotel.rating}</span>
                  <span className="text-gray-500 text-sm">({hotel.reviews})</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">{hotel.name}</h3>
                <p className="text-gray-500 text-sm mb-3">{hotel.location}</p>
                <div className="flex items-center justify-between pt-3 border-t">
                  <div>
                    <span className="text-2xl font-bold text-gray-900">${hotel.price}</span>
                    <span className="text-gray-500 text-sm">/night</span>
                  </div>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    View Deal
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
