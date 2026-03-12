"use client";

import { Search, MapPin, Bed, Bath, Square, Heart, SlidersHorizontal, Grid3X3, List } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const properties = [
  { id: 1, title: "Modern Villa with Pool", location: "Beverly Hills, CA", price: "$2,450,000", beds: 5, baths: 4, sqft: 4200, type: "Villa", image: "bg-gradient-to-br from-amber-100 to-orange-100" },
  { id: 2, title: "Luxury Penthouse", location: "Manhattan, NY", price: "$3,200,000", beds: 3, baths: 3, sqft: 2800, type: "Penthouse", image: "bg-gradient-to-br from-blue-100 to-indigo-100" },
  { id: 3, title: "Beachfront Estate", location: "Miami Beach, FL", price: "$4,800,000", beds: 6, baths: 5, sqft: 5500, type: "Estate", image: "bg-gradient-to-br from-cyan-100 to-teal-100" },
  { id: 4, title: "Mountain Retreat", location: "Aspen, CO", price: "$1,850,000", beds: 4, baths: 3, sqft: 3200, type: "House", image: "bg-gradient-to-br from-emerald-100 to-green-100" },
  { id: 5, title: "Downtown Condo", location: "Chicago, IL", price: "$850,000", beds: 2, baths: 2, sqft: 1500, type: "Condo", image: "bg-gradient-to-br from-gray-100 to-slate-100" },
  { id: 6, title: "Suburban Family Home", location: "Austin, TX", price: "$650,000", beds: 4, baths: 3, sqft: 2400, type: "House", image: "bg-gradient-to-br from-rose-100 to-pink-100" },
];

export default function PropertiesPage() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Nav */}
      <nav className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <MapPin className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">LarkHomes</span>
            </Link>
            <div className="hidden md:flex items-center gap-8">
              <Link href="/properties" className="text-primary-600 font-medium">Properties</Link>
              <Link href="/agents" className="text-gray-600 hover:text-gray-900">Agents</Link>
              <Link href="/about" className="text-gray-600 hover:text-gray-900">About</Link>
            </div>
            <Link href="/auth/signup" className="btn-primary">List Property</Link>
          </div>
        </div>
      </nav>

      {/* Filters Bar */}
      <div className="bg-white border-b py-4">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex-1 min-w-[200px] relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input type="text" placeholder="Search by location..." className="w-full pl-10 pr-4 py-2 border rounded-lg" />
            </div>
            <select className="px-4 py-2 border rounded-lg">
              <option>All Types</option>
              <option>House</option>
              <option>Condo</option>
              <option>Villa</option>
            </select>
            <select className="px-4 py-2 border rounded-lg">
              <option>Any Price</option>
              <option>$0 - $500k</option>
              <option>$500k - $1M</option>
              <option>$1M+</option>
            </select>
            <select className="px-4 py-2 border rounded-lg">
              <option>All Beds</option>
              <option>1+</option>
              <option>2+</option>
              <option>3+</option>
              <option>4+</option>
            </select>
            <button className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50">
              <SlidersHorizontal className="w-5 h-5" />
              More Filters
            </button>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">{properties.length} Properties Found</h1>
          <div className="flex items-center gap-2 bg-white border rounded-lg p-1">
            <button onClick={() => setViewMode("grid")} className={`p-2 rounded ${viewMode === "grid" ? "bg-gray-100" : ""}`}>
              <Grid3X3 className="w-5 h-5" />
            </button>
            <button onClick={() => setViewMode("list")} className={`p-2 rounded ${viewMode === "list" ? "bg-gray-100" : ""}`}>
              <List className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className={`grid ${viewMode === "grid" ? "md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"} gap-6`}>
          {properties.map((property) => (
            <div key={property.id} className="bg-white rounded-xl shadow-sm border overflow-hidden group">
              <div className={`${viewMode === "list" ? "h-48" : "h-56"} ${property.image} relative`}>
                <span className="absolute top-4 left-4 px-3 py-1 bg-white/90 rounded-full text-sm font-medium">{property.type}</span>
                <button className="absolute top-4 right-4 w-10 h-10 bg-white/80 rounded-full flex items-center justify-center hover:bg-white">
                  <Heart className="w-5 h-5 text-gray-600" />
                </button>
              </div>
              <div className="p-4">
                <div className="flex items-center gap-1 text-gray-500 text-sm mb-2">
                  <MapPin className="w-4 h-4" />
                  {property.location}
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{property.title}</h3>
                <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                  <span className="flex items-center gap-1"><Bed className="w-4 h-4" /> {property.beds}</span>
                  <span className="flex items-center gap-1"><Bath className="w-4 h-4" /> {property.baths}</span>
                  <span className="flex items-center gap-1"><Square className="w-4 h-4" /> {property.sqft}</span>
                </div>
                <div className="flex items-center justify-between pt-3 border-t">
                  <span className="text-xl font-bold text-primary-600">{property.price}</span>
                  <button className="text-sm text-primary-600 font-medium hover:underline">View Details</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
