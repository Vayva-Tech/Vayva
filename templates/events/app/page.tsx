"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Clock, Users, Ticket, ArrowRight, Star, Music, Mic2, PartyPopper } from "lucide-react";

const events = [
  { id: 1, title: "Tech Conference 2024", date: "Mar 15-17", location: "Lagos", price: 25000, image: "bg-gradient-to-br from-blue-500 to-purple-600", category: "Conference" },
  { id: 2, title: "Afrobeat Music Festival", date: "Mar 22", location: "Abuja", price: 15000, image: "bg-gradient-to-br from-amber-500 to-orange-600", category: "Music" },
  { id: 3, title: "Business Summit", date: "Apr 5", location: "Lagos", price: 50000, image: "bg-gradient-to-br from-emerald-500 to-teal-600", category: "Business" },
];

const categories = [
  { name: "Conferences", icon: <Mic2 className="h-6 w-6" />, count: "120+" },
  { name: "Concerts", icon: <Music className="h-6 w-6" />, count: "80+" },
  { name: "Festivals", icon: <PartyPopper className="h-6 w-6" />, count: "45+" },
  { name: "Workshops", icon: <Users className="h-6 w-6" />, count: "200+" },
];

export default function EventsHome() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-purple-700">
            EVENTHUB
          </Link>
          <nav className="hidden md:flex items-center gap-8">
            <Link href="/events" className="text-gray-700 hover:text-purple-700">Events</Link>
            <Link href="/categories" className="text-gray-700 hover:text-purple-700">Categories</Link>
            <Link href="/venues" className="text-gray-700 hover:text-purple-700">Venues</Link>
          </nav>
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm">Sign In</Button>
            <Button size="sm" className="bg-purple-700 hover:bg-purple-800">Create Event</Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 py-20 md:py-28">
        <div className="container mx-auto px-4 text-center text-white">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Discover Amazing Events
          </h1>
          <p className="text-xl text-purple-100 mb-8 max-w-2xl mx-auto">
            Find and book tickets for concerts, conferences, festivals, and more happening near you
          </p>
          <div className="max-w-3xl mx-auto bg-white rounded-xl p-4 flex flex-col md:flex-row gap-4">
            <div className="flex-1 flex items-center gap-3 px-4 py-3 bg-gray-100 rounded-lg">
              <PartyPopper className="h-5 w-5 text-gray-500" />
              <input placeholder="Search events..." className="bg-transparent flex-1 outline-none text-gray-900" />
            </div>
            <div className="flex items-center gap-3 px-4 py-3 bg-gray-100 rounded-lg">
              <MapPin className="h-5 w-5 text-gray-500" />
              <select className="bg-transparent outline-none text-gray-900">
                <option>All Cities</option>
                <option>Lagos</option>
                <option>Abuja</option>
                <option>Port Harcourt</option>
              </select>
            </div>
            <Button size="lg" className="bg-purple-700 hover:bg-purple-800 px-8">
              Search
            </Button>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-12 bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {categories.map((cat) => (
              <div key={cat.name} className="flex items-center gap-4 p-4 rounded-xl hover:bg-gray-50 cursor-pointer transition">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center text-purple-700">
                  {cat.icon}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{cat.name}</p>
                  <p className="text-sm text-gray-500">{cat.count} events</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Events */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold">Featured Events</h2>
            <Link href="/events" className="text-purple-700 font-medium hover:underline flex items-center gap-1">
              View All <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {events.map((event) => (
              <div key={event.id} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <div className={`h-48 ${event.image}`} />
                <div className="p-6">
                  <span className="text-xs font-medium text-purple-700 bg-purple-100 px-3 py-1 rounded-full">
                    {event.category}
                  </span>
                  <h3 className="text-xl font-semibold mt-3 mb-2">{event.title}</h3>
                  <div className="space-y-2 text-sm text-gray-600 mb-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {event.date}
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      {event.location}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-2xl font-bold text-purple-700">₦{(event.price / 100).toFixed(0)}</p>
                    <Button size="sm" className="bg-purple-700 hover:bg-purple-800">
                      Get Tickets
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-purple-900 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Hosting an Event?</h2>
          <p className="text-purple-100 mb-6 max-w-xl mx-auto">
            Sell tickets, manage registrations, and promote your event to thousands of attendees
          </p>
          <Button size="lg" className="bg-white text-purple-900 hover:bg-gray-100">
            Start Selling Tickets
          </Button>
        </div>
      </section>
    </div>
  );
}
