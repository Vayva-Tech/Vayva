"use client";

import { Calendar, MapPin, Users, Star, ChevronRight, Phone, Mail, ArrowRight } from "lucide-react";
import Link from "next/link";

const venues = [
  {
    id: 1,
    name: "Grand Ballroom",
    type: "Conference Center",
    capacity: 500,
    location: "Downtown, NYC",
    rating: 4.9,
    reviews: 128,
    image: "🏢",
    amenities: ["AV Equipment", "Catering", "Parking"],
  },
  {
    id: 2,
    name: "Skyline Rooftop",
    type: "Outdoor Venue",
    capacity: 200,
    location: "Midtown, NYC",
    rating: 4.8,
    reviews: 96,
    image: "🌆",
    amenities: ["City Views", "Bar", "Heating"],
  },
  {
    id: 3,
    name: "The Garden Hall",
    type: "Event Space",
    capacity: 300,
    location: "Brooklyn, NYC",
    rating: 4.7,
    reviews: 84,
    image: "🌿",
    amenities: ["Garden Access", "Natural Light", "Kitchen"],
  },
  {
    id: 4,
    name: "The Loft Studio",
    type: "Creative Space",
    capacity: 150,
    location: "SoHo, NYC",
    rating: 4.9,
    reviews: 112,
    image: "🎨",
    amenities: ["Photo Studio", "Props", "Lighting"],
  },
  {
    id: 5,
    name: "Harbor Pavilion",
    type: "Waterfront Venue",
    capacity: 400,
    location: "Waterfront, SF",
    rating: 4.8,
    reviews: 156,
    image: "⚓",
    amenities: ["Waterfront View", "Boat Access", "Catering"],
  },
  {
    id: 6,
    name: "Mountain Lodge",
    type: "Retreat Center",
    capacity: 100,
    location: "Tahoe, CA",
    rating: 4.9,
    reviews: 72,
    image: "🏔️",
    amenities: ["Lodging", "Hiking", "Fireplace"],
  },
];

export default function VenuesPage() {
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
              <Link href="/venues" className="text-purple-600 font-medium">Venues</Link>
              <Link href="/tickets" className="text-gray-600 hover:text-gray-900">My Tickets</Link>
            </div>
            <Link href="/create" className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
              List Your Venue
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="bg-gradient-to-br from-purple-600 to-indigo-700 py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">Find the Perfect Venue</h1>
          <p className="text-xl text-purple-100 mb-8">
            Discover unique spaces for your next event
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Venues Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {venues.map((venue) => (
            <div key={venue.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all">
              <div className="h-48 bg-gradient-to-br from-purple-100 to-indigo-100 flex items-center justify-center text-6xl">
                {venue.image}
              </div>
              <div className="p-6">
                <span className="text-purple-600 text-sm font-medium">{venue.type}</span>
                <h3 className="text-xl font-bold text-gray-900 mt-1 mb-2">{venue.name}</h3>
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                  <MapPin className="w-4 h-4" />
                  {venue.location}
                </div>
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    <span className="font-medium">{venue.rating}</span>
                    <span className="text-gray-500">({venue.reviews})</span>
                  </div>
                  <div className="flex items-center gap-1 text-gray-600">
                    <Users className="w-4 h-4" />
                    {venue.capacity} capacity
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 mb-4">
                  {venue.amenities.map((amenity) => (
                    <span key={amenity} className="px-2 py-1 bg-gray-100 rounded text-xs text-gray-600">
                      {amenity}
                    </span>
                  ))}
                </div>
                <Link href={`/venue/${venue.id}`} className="block w-full py-3 bg-purple-600 text-white text-center rounded-lg hover:bg-purple-700">
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
