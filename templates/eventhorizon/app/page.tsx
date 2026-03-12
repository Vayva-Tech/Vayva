"use client";

import { Calendar, MapPin, Users, Ticket, ArrowRight, Star, Clock, Heart } from "lucide-react";
import Link from "next/link";

const categories = [
  { name: "Music", events: 45, icon: "🎵" },
  { name: "Sports", events: 32, icon: "⚽" },
  { name: "Business", events: 28, icon: "💼" },
  { name: "Food", events: 56, icon: "🍽️" },
  { name: "Arts", events: 34, icon: "🎨" },
  { name: "Tech", events: 42, icon: "💻" },
];

const featuredEvents = [
  { id: 1, title: "Summer Music Festival", date: "Aug 15-17", location: "Central Park", price: "$150", image: "bg-gradient-to-br from-purple-100 to-pink-100" },
  { id: 2, title: "Tech Summit 2024", date: "Sep 20", location: "Convention Center", price: "$299", image: "bg-gradient-to-br from-blue-100 to-cyan-100" },
  { id: 3, title: "Food & Wine Expo", date: "Oct 5-6", location: "Downtown Hall", price: "$75", image: "bg-gradient-to-br from-amber-100 to-orange-100" },
  { id: 4, title: "Marathon 2024", date: "Nov 10", location: "City Streets", price: "$50", image: "bg-gradient-to-br from-green-100 to-emerald-100" },
];

const stats = [
  { value: "500+", label: "Events" },
  { value: "50K+", label: "Attendees" },
  { value: "200+", label: "Organizers" },
  { value: "98%", label: "Satisfaction" },
];

export default function EventHorizonHome() {
  return (
    <div className="min-h-screen bg-white">
      <nav className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">EventHorizon</span>
            </Link>
            <div className="hidden md:flex items-center gap-8">
              <Link href="/events" className="text-gray-700 hover:text-primary-600">Events</Link>
              <Link href="/organizers" className="text-gray-700 hover:text-primary-600">Organizers</Link>
              <Link href="/venues" className="text-gray-700 hover:text-primary-600">Venues</Link>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/auth/login" className="text-gray-700 hover:text-gray-900">Sign In</Link>
              <Link href="/create" className="btn-primary">Create Event</Link>
            </div>
          </div>
        </div>
      </nav>

      <section className="section-padding bg-gradient-to-br from-primary-50 to-secondary-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
              Discover Amazing <span className="text-primary-600">Events</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Find and book tickets for the best events in your city
            </p>
            <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <input type="text" placeholder="Search events..." className="flex-1 px-4 py-3 bg-gray-50 rounded-xl border-0" />
                <input type="text" placeholder="Location" className="flex-1 px-4 py-3 bg-gray-50 rounded-xl border-0" />
                <button className="btn-primary">Search</button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 bg-primary-600">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center text-white">
                <div className="text-4xl font-bold mb-2">{stat.value}</div>
                <div className="text-white/80">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-padding">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Browse by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((cat) => (
              <button key={cat.name} className="p-6 bg-gray-50 rounded-2xl hover:bg-primary-50 transition-all text-center">
                <span className="text-4xl mb-2 block">{cat.icon}</span>
                <h3 className="font-medium">{cat.name}</h3>
                <p className="text-sm text-gray-500">{cat.events} events</p>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="section-padding bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold">Featured Events</h2>
            <Link href="/events" className="text-primary-600 font-medium hover:underline flex items-center gap-1">
              View All <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredEvents.map((event) => (
              <div key={event.id} className="bg-white rounded-2xl overflow-hidden shadow-sm group hover:shadow-lg transition-all">
                <div className={`h-48 ${event.image}`} />
                <div className="p-4">
                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                    <Calendar className="w-4 h-4" /> {event.date}
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{event.title}</h3>
                  <div className="flex items-center gap-1 text-sm text-gray-500 mb-3">
                    <MapPin className="w-4 h-4" /> {event.location}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-primary-600">{event.price}</span>
                    <button className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm hover:bg-primary-700">Get Tickets</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-r from-primary-600 to-secondary-600">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Host Your Event?</h2>
          <p className="text-white/80 mb-8">Create and manage events with our powerful platform</p>
          <Link href="/create" className="px-8 py-3 bg-white text-primary-600 font-medium rounded-lg hover:bg-gray-100 transition-colors">
            Start Creating
          </Link>
        </div>
      </section>

      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <span className="text-white font-bold text-xl">EventHorizon</span>
              </div>
              <p className="text-sm">Creating unforgettable experiences.</p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Discover</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/events">All Events</Link></li>
                <li><Link href="/categories">Categories</Link></li>
                <li><Link href="/venues">Venues</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Organize</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/create">Create Event</Link></li>
                <li><Link href="/pricing">Pricing</Link></li>
                <li><Link href="/resources">Resources</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/help">Help Center</Link></li>
                <li><Link href="/contact">Contact</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm">
            © 2024 EventHorizon. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
