"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, MapPin, Bed, Bath, Square, Phone } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-emerald-700">
            ESTATELY
          </Link>
          <nav className="hidden md:flex items-center gap-8">
            <Link href="/buy" className="text-sm font-medium hover:text-emerald-700">
              Buy
            </Link>
            <Link href="/rent" className="text-sm font-medium hover:text-emerald-700">
              Rent
            </Link>
            <Link href="/sell" className="text-sm font-medium hover:text-emerald-700">
              Sell
            </Link>
            <Link href="/agents" className="text-sm font-medium hover:text-emerald-700">
              Agents
            </Link>
          </nav>
          <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700">
            <Phone className="h-4 w-4 mr-2" />
            Contact
          </Button>
        </div>
      </header>

      {/* Hero Search */}
      <section className="relative bg-emerald-900 py-20">
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-900/90 to-emerald-800/90" />
        <div className="container mx-auto px-4 relative">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Find Your Perfect Home
            </h1>
            <p className="text-emerald-100 mb-8">
              Discover thousands of properties for sale and rent across Nigeria
            </p>
            <div className="flex gap-2 bg-white p-2 rounded-lg shadow-lg">
              <div className="flex-1 flex items-center px-4 border-r">
                <MapPin className="h-5 w-5 text-gray-400 mr-2" />
                <Input placeholder="Location (e.g., Lagos, Abuja)" className="border-0 focus-visible:ring-0" />
              </div>
              <div className="hidden md:flex items-center px-4 border-r w-48">
                <select className="w-full bg-transparent text-gray-600 outline-none">
                  <option>Property Type</option>
                  <option>House</option>
                  <option>Apartment</option>
                  <option>Land</option>
                </select>
              </div>
              <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 px-8">
                <Search className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-8 bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <p className="text-3xl font-bold text-emerald-600">2,500+</p>
              <p className="text-sm text-gray-600">Properties Listed</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-emerald-600">150+</p>
              <p className="text-sm text-gray-600">Verified Agents</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-emerald-600">500+</p>
              <p className="text-sm text-gray-600">Happy Clients</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-emerald-600">15</p>
              <p className="text-sm text-gray-600">Cities Covered</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Listings */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold mb-2">Featured Properties</h2>
              <p className="text-gray-600">Handpicked premium listings</p>
            </div>
            <Button variant="outline" asChild>
              <Link href="/listings">View All</Link>
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <PropertyCard
              id="1"
              title="Luxury 5-Bedroom Villa"
              location="Lekki, Lagos"
              price={250000000}
              beds={5}
              baths={4}
              sqft={4500}
              type="For Sale"
            />
            <PropertyCard
              id="2"
              title="Modern 3-Bed Apartment"
              location="Wuse, Abuja"
              price={85000000}
              beds={3}
              baths={2}
              sqft={1800}
              type="For Sale"
            />
            <PropertyCard
              id="3"
              title="Waterfront Penthouse"
              location="Ikoyi, Lagos"
              price={450000000}
              beds={4}
              baths={4}
              sqft={3200}
              type="For Rent"
            />
          </div>
        </div>
      </section>
    </div>
  );
}

function PropertyCard({
  id,
  title,
  location,
  price,
  beds,
  baths,
  sqft,
  type,
}: {
  id: string;
  title: string;
  location: string;
  price: number;
  beds: number;
  baths: number;
  sqft: number;
  type: string;
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden group hover:shadow-lg transition-shadow">
      <div className="aspect-[4/3] bg-gradient-to-br from-emerald-100 to-teal-100 relative">
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-6xl font-bold text-emerald-200">{title[0]}</span>
        </div>
        <div className="absolute top-3 left-3">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${type === "For Sale" ? "bg-emerald-600 text-white" : "bg-blue-600 text-white"}`}>
            {type}
          </span>
        </div>
      </div>
      <div className="p-5">
        <h3 className="font-semibold text-lg mb-1">{title}</h3>
        <p className="text-gray-500 text-sm mb-3 flex items-center">
          <MapPin className="h-4 w-4 mr-1" />
          {location}
        </p>
        <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
          <span className="flex items-center gap-1">
            <Bed className="h-4 w-4" /> {beds}
          </span>
          <span className="flex items-center gap-1">
            <Bath className="h-4 w-4" /> {baths}
          </span>
          <span className="flex items-center gap-1">
            <Square className="h-4 w-4" /> {sqft.toLocaleString()} sqft
          </span>
        </div>
        <p className="text-2xl font-bold text-emerald-600">₦{(price / 100).toFixed(0)}</p>
      </div>
    </div>
  );
}
