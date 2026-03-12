"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Star, MapPin, Calendar, Users, Wifi, Car, Coffee, Sparkles } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-50 text-white">
        <div className="container mx-auto px-4 py-6 flex items-center justify-between">
          <Link href="/" className="text-2xl font-serif font-bold tracking-wide">
            LUXE STAYS
          </Link>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
            <Link href="/rooms" className="hover:text-amber-300 transition">
              Rooms
            </Link>
            <Link href="/dining" className="hover:text-amber-300 transition">
              Dining
            </Link>
            <Link href="/amenities" className="hover:text-amber-300 transition">
              Amenities
            </Link>
            <Link href="/experiences" className="hover:text-amber-300 transition">
              Experiences
            </Link>
          </nav>
          <Button size="sm" className="bg-amber-600 hover:bg-amber-700 text-white">
            Book Now
          </Button>
        </div>
      </header>

      {/* Hero */}
      <section className="relative h-[80vh] bg-gradient-to-br from-stone-900 via-stone-800 to-amber-900 flex items-center justify-center">
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative container mx-auto px-4 text-center text-white">
          <div className="flex items-center justify-center gap-1 mb-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
            ))}
          </div>
          <p className="text-amber-300 font-medium mb-4 tracking-widest uppercase text-sm">
            Luxury Hotel & Resort
          </p>
          <h1 className="text-4xl md:text-6xl font-serif font-bold mb-6">
            Experience Unparalleled Luxury
          </h1>
          <p className="text-xl text-stone-200 mb-8 max-w-2xl mx-auto">
            Discover the perfect blend of comfort, elegance, and world-class service 
            in the heart of paradise.
          </p>
          <div className="max-w-4xl mx-auto bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="flex items-center gap-3 bg-white rounded-lg px-4 py-3">
                <Calendar className="h-5 w-5 text-stone-500" />
                <div className="text-left">
                  <p className="text-xs text-stone-500">Check-in</p>
                  <p className="text-sm font-medium text-stone-900">Select Date</p>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-white rounded-lg px-4 py-3">
                <Calendar className="h-5 w-5 text-stone-500" />
                <div className="text-left">
                  <p className="text-xs text-stone-500">Check-out</p>
                  <p className="text-sm font-medium text-stone-900">Select Date</p>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-white rounded-lg px-4 py-3">
                <Users className="h-5 w-5 text-stone-500" />
                <div className="text-left">
                  <p className="text-xs text-stone-500">Guests</p>
                  <p className="text-sm font-medium text-stone-900">2 Adults</p>
                </div>
              </div>
              <Button size="lg" className="bg-amber-600 hover:bg-amber-700 h-full">
                Check Availability
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <Feature icon={<Wifi className="h-6 w-6" />} title="Free WiFi" />
            <Feature icon={<Car className="h-6 w-6" />} title="Parking" />
            <Feature icon={<Coffee className="h-6 w-6" />} title="Breakfast" />
            <Feature icon={<Sparkles className="h-6 w-6" />} title="Spa" />
          </div>
        </div>
      </section>

      {/* Featured Rooms */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <p className="text-amber-600 font-medium mb-2">Accommodations</p>
            <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">
              Featured Rooms & Suites
            </h2>
            <p className="text-stone-600 max-w-2xl mx-auto">
              Choose from our selection of elegantly appointed rooms and suites, 
              each designed for your ultimate comfort.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <RoomCard
              name="Deluxe Room"
              description="Comfortable room with city view"
              price={75000}
              guests={2}
            />
            <RoomCard
              name="Executive Suite"
              description="Spacious suite with ocean view"
              price={150000}
              guests={2}
            />
            <RoomCard
              name="Presidential Suite"
              description="Ultimate luxury experience"
              price={350000}
              guests={4}
            />
          </div>
        </div>
      </section>

      {/* Amenities */}
      <section className="py-20 bg-stone-900 text-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-amber-400 font-medium mb-2">Amenities</p>
              <h2 className="text-3xl md:text-4xl font-serif font-bold mb-6">
                World-Class Facilities
              </h2>
              <div className="grid grid-cols-2 gap-4">
                {[
                  "Infinity Pool",
                  "Fine Dining Restaurant",
                  "24/7 Room Service",
                  "Fitness Center",
                  "Business Center",
                  "Concierge Service",
                  "Valet Parking",
                  "Airport Transfer",
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-amber-400 rounded-full" />
                    <span className="text-stone-300">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-stone-800 rounded-2xl p-8">
              <h3 className="text-xl font-semibold mb-4">Special Offers</h3>
              <div className="bg-amber-600 text-white rounded-xl p-6 mb-4">
                <p className="text-sm font-medium mb-1">Weekend Getaway</p>
                <p className="text-3xl font-bold mb-2">20% OFF</p>
                <p className="text-sm opacity-90">Valid for Friday-Sunday stays</p>
              </div>
              <Button className="w-full bg-white text-stone-900 hover:bg-stone-100">
                View All Offers
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function Feature({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="w-12 h-12 bg-stone-100 rounded-full flex items-center justify-center text-amber-600">
        {icon}
      </div>
      <span className="font-medium text-stone-700">{title}</span>
    </div>
  );
}

function RoomCard({ name, description, price, guests }: { name: string; description: string; price: number; guests: number }) {
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden group hover:shadow-lg transition-shadow">
      <div className="aspect-[4/3] bg-stone-200 relative">
        <div className="absolute inset-0 flex items-center justify-center text-stone-400">
          {name}
        </div>
        <div className="absolute top-4 right-4 bg-amber-600 text-white px-3 py-1 rounded-full text-sm font-medium">
          From ₦{(price / 100).toFixed(0)}
        </div>
      </div>
      <div className="p-6">
        <h3 className="text-xl font-semibold mb-2">{name}</h3>
        <p className="text-stone-600 text-sm mb-4">{description}</p>
        <div className="flex items-center gap-4 text-sm text-stone-500 mb-4">
          <span className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            {guests} Guests
          </span>
        </div>
        <Button className="w-full bg-amber-600 hover:bg-amber-700">
          View Details
        </Button>
      </div>
    </div>
  );
}
