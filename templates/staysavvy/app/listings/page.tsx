"use client";

import { Home, MapPin, Star, Heart, Users, Wifi, Car, Coffee, Dumbbell, Waves, Check, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const listings = [
  {
    id: 1,
    title: "Modern Downtown Loft",
    location: "New York, NY",
    type: "Entire apartment",
    beds: 2,
    baths: 1,
    guests: 4,
    price: 180,
    rating: 4.9,
    reviews: 127,
    image: "🏢",
    amenities: ["wifi", "kitchen", "gym"],
  },
  {
    id: 2,
    title: "Cozy Beach House",
    location: "Malibu, CA",
    type: "Entire house",
    beds: 3,
    baths: 2,
    guests: 6,
    price: 350,
    rating: 4.8,
    reviews: 89,
    image: "🏖️",
    amenities: ["wifi", "pool", "beach"],
  },
  {
    id: 3,
    title: "Mountain Cabin Retreat",
    location: "Aspen, CO",
    type: "Entire cabin",
    beds: 2,
    baths: 1,
    guests: 4,
    price: 220,
    rating: 5.0,
    reviews: 56,
    image: "🏔️",
    amenities: ["wifi", "fireplace", "hot-tub"],
  },
  {
    id: 4,
    title: "Luxury City Penthouse",
    location: "Miami, FL",
    type: "Entire apartment",
    beds: 3,
    baths: 3,
    guests: 6,
    price: 450,
    rating: 4.7,
    reviews: 203,
    image: "🌆",
    amenities: ["wifi", "pool", "gym", "rooftop"],
  },
];

export default function ListingsPage() {
  const [favorites, setFavorites] = useState<number[]>([]);

  const toggleFavorite = (id: number) => {
    setFavorites(prev => 
      prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
    );
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-rose-500 rounded-lg flex items-center justify-center">
                <Home className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">StaySavvy</span>
            </Link>
            <div className="hidden md:flex items-center gap-8">
              <Link href="/listings" className="text-rose-600 font-medium">Explore</Link>
              <Link href="/wishlists" className="text-gray-600 hover:text-gray-900">Wishlists</Link>
              <Link href="/trips" className="text-gray-600 hover:text-gray-900">Trips</Link>
              <Link href="/host" className="text-gray-600 hover:text-gray-900">Become a Host</Link>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/login" className="text-gray-600 hover:text-gray-900">Sign In</Link>
              <Link href="/signup" className="px-4 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600">
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Search Bar */}
      <div className="bg-white border-b py-4">
        <div className="max-w-5xl mx-auto px-4">
          <div className="bg-white rounded-full border shadow-lg flex items-center p-2">
            <div className="flex-1 px-6 border-r">
              <p className="text-xs font-semibold">Where</p>
              <p className="text-gray-500 text-sm">Search destinations</p>
            </div>
            <div className="flex-1 px-6 border-r">
              <p className="text-xs font-semibold">Check in</p>
              <p className="text-gray-500 text-sm">Add dates</p>
            </div>
            <div className="flex-1 px-6 border-r">
              <p className="text-xs font-semibold">Check out</p>
              <p className="text-gray-500 text-sm">Add dates</p>
            </div>
            <div className="flex-1 px-6">
              <p className="text-xs font-semibold">Who</p>
              <p className="text-gray-500 text-sm">Add guests</p>
            </div>
            <button className="w-12 h-12 bg-rose-500 rounded-full flex items-center justify-center hover:bg-rose-600">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Filters */}
        <div className="flex gap-4 overflow-x-auto pb-4 mb-6">
          {["All", "Trending", "Beachfront", "Cabins", "Amazing views", "Tiny homes", "Luxe"].map((filter) => (
            <button
              key={filter}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
                filter === "All" ? "bg-gray-900 text-white" : "bg-white border text-gray-700 hover:bg-gray-50"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Listings Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {listings.map((listing) => (
            <div key={listing.id} className="group cursor-pointer">
              <div className="relative aspect-square bg-gray-100 rounded-xl mb-3 overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center text-6xl bg-gradient-to-br from-gray-100 to-gray-200 group-hover:scale-105 transition-transform">
                  {listing.image}
                </div>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    toggleFavorite(listing.id);
                  }}
                  className="absolute top-3 right-3 p-2 rounded-full bg-white/80 hover:bg-white"
                >
                  <Heart className={`w-5 h-5 ${favorites.includes(listing.id) ? "fill-rose-500 text-rose-500" : "text-gray-600"}`} />
                </button>
              </div>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">{listing.location}</h3>
                  <p className="text-gray-500 text-sm">{listing.type}</p>
                  <p className="text-gray-500 text-sm">{listing.beds} beds • {listing.baths} baths</p>
                  <div className="flex items-center gap-1 mt-1">
                    <Star className="w-4 h-4 fill-current" />
                    <span className="font-medium">{listing.rating}</span>
                    <span className="text-gray-500">({listing.reviews})</span>
                  </div>
                  <p className="mt-2">
                    <span className="font-semibold">${listing.price}</span>
                    <span className="text-gray-500"> night</span>
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
