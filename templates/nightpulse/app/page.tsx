"use client";

import { MapPin, Calendar, Music, Star, Clock, ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";

const venues = [
  { name: "Clubs & Bars", count: 45, icon: "🍸" },
  { name: "Live Music", count: 28, icon: "🎸" },
  { name: "DJ Events", count: 36, icon: "🎧" },
  { name: "Lounges", count: 22, icon: "🛋️" },
];

const featuredEvents = [
  { id: 1, name: "Neon Nights", venue: "Pulse Club", date: "Tonight", time: "10PM - 4AM", price: 25, image: "bg-gradient-to-br from-purple-600 to-pink-600" },
  { id: 2, name: "Electric Dreams", venue: "Sky Lounge", date: "Tomorrow", time: "9PM - 3AM", price: 40, image: "bg-gradient-to-br from-blue-600 to-purple-600" },
  { id: 3, name: "Bass Drop", venue: "The Underground", date: "Sat, Dec 14", time: "11PM - 5AM", price: 30, image: "bg-gradient-to-br from-red-600 to-orange-600" },
  { id: 4, name: "Sunset Sessions", venue: "Rooftop Bar", date: "Sun, Dec 15", time: "6PM - 12AM", price: 20, image: "bg-gradient-to-br from-amber-500 to-pink-500" },
];

const features = [
  { icon: MapPin, title: "Discover Venues", desc: "Find the best spots near you" },
  { icon: Calendar, title: "Book Tickets", desc: "Secure your entry in advance" },
  { icon: Music, title: "Live Events", desc: "Never miss a great show" },
  { icon: Star, title: "VIP Access", desc: "Exclusive perks and tables" },
];

export default function NightPulseHome() {
  return (
    <div className="min-h-screen bg-dark-900 text-white">
      {/* Nav */}
      <nav className="bg-dark-900/90 backdrop-blur-md border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-purple-600 rounded-xl flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold">NightPulse</span>
            </Link>
            <div className="hidden md:flex items-center gap-8">
              <Link href="/events" className="text-gray-300 hover:text-white">Events</Link>
              <Link href="/venues" className="text-gray-300 hover:text-white">Venues</Link>
              <Link href="/vip" className="text-gray-300 hover:text-white">VIP</Link>
              <Link href="/experiences" className="text-gray-300 hover:text-white">Experiences</Link>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/auth/login" className="text-gray-300 hover:text-white">Sign In</Link>
              <Link href="/auth/signup" className="btn-primary">Get Started</Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative min-h-[600px] flex items-center">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-dark-900 to-black" />
        <div className="relative max-w-7xl mx-auto px-4 py-20">
          <div className="text-center max-w-3xl mx-auto">
            <span className="inline-block px-4 py-1 bg-primary-600/20 text-primary-400 rounded-full text-sm font-medium mb-6 border border-primary-600/30">
              🎉 The Night is Yours
            </span>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-primary-200 to-purple-300 bg-clip-text text-transparent">
              Feel the Pulse
            </h1>
            <p className="text-xl text-gray-400 mb-8">
              Discover the hottest nightlife, events, and experiences in your city
            </p>
            <div className="max-w-2xl mx-auto bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input type="text" placeholder="City or venue..." className="w-full pl-12 pr-4 py-3 bg-dark-800 rounded-xl border border-white/10 text-white placeholder-gray-500 focus:ring-2 focus:ring-primary-500" />
                </div>
                <div className="flex-1 relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input type="text" placeholder="Select date" className="w-full pl-12 pr-4 py-3 bg-dark-800 rounded-xl border border-white/10 text-white placeholder-gray-500 focus:ring-2 focus:ring-primary-500" />
                </div>
                <button className="btn-primary">Explore</button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="section-padding">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-bold mb-8">Browse by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {venues.map((venue) => (
              <button key={venue.name} className="p-6 bg-dark-800 rounded-2xl border border-white/10 hover:border-primary-500/50 hover:bg-dark-800/80 transition-all group">
                <span className="text-4xl mb-3 block">{venue.icon}</span>
                <h3 className="font-semibold text-lg">{venue.name}</h3>
                <p className="text-gray-400">{venue.count} venues</p>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Events */}
      <section className="section-padding bg-dark-800">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold">Featured Events</h2>
            <Link href="/events" className="text-primary-400 hover:text-primary-300 flex items-center gap-1">
              View All <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredEvents.map((event) => (
              <div key={event.id} className="bg-dark-900 rounded-2xl overflow-hidden border border-white/10 group hover:border-primary-500/30 transition-all">
                <div className={`h-48 ${event.image} relative`}>
                  <div className="absolute top-4 left-4 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-sm">
                    {event.date}
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="font-semibold text-xl mb-1">{event.name}</h3>
                  <p className="text-primary-400 mb-3">{event.venue}</p>
                  <div className="flex items-center gap-2 text-gray-400 text-sm mb-4">
                    <Clock className="w-4 h-4" />
                    {event.time}
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-2xl font-bold">${event.price}</span>
                      <span className="text-gray-400">/entry</span>
                    </div>
                    <button className="px-4 py-2 bg-primary-600 text-white rounded-full hover:bg-primary-700 transition-colors">
                      Book Now
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="section-padding">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature) => (
              <div key={feature.title} className="text-center p-6">
                <div className="w-16 h-16 bg-primary-600/20 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-primary-600/30">
                  <feature.icon className="w-8 h-8 text-primary-400" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                <p className="text-gray-400">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Experience the Night?</h2>
          <p className="text-white/80 mb-8">Join thousands of nightlife enthusiasts discovering the best events</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/auth/signup" className="px-8 py-3 bg-white text-primary-600 font-medium rounded-full hover:bg-gray-100 transition-colors">
              Get Started
            </Link>
            <Link href="/events" className="px-8 py-3 border-2 border-white text-white font-medium rounded-full hover:bg-white/10 transition-colors">
              Browse Events
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black text-gray-400 py-12 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-purple-600 rounded-xl flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <span className="text-white font-bold text-xl">NightPulse</span>
              </div>
              <p className="text-sm">Your guide to the best nightlife experiences.</p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Discover</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/events">Events</Link></li>
                <li><Link href="/venues">Venues</Link></li>
                <li><Link href="/experiences">Experiences</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">For Business</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/list-venue">List Your Venue</Link></li>
                <li><Link href="/promote">Promote Events</Link></li>
                <li><Link href="/partners">Partners</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/help">Help Center</Link></li>
                <li><Link href="/contact">Contact Us</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/10 pt-8 text-center text-sm">
            © 2024 NightPulse. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
