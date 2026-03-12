"use client";

import { Search, MapPin, Calendar, Users, Star, Heart, Wifi, Car, Coffee, Waves, ArrowRight } from "lucide-react";
import Link from "next/link";

const destinations = [
  { name: "Maldives", count: "240+ stays", image: "bg-gradient-to-br from-cyan-200 to-blue-300" },
  { name: "Bali", count: "180+ stays", image: "bg-gradient-to-br from-emerald-200 to-teal-300" },
  { name: "Paris", count: "320+ stays", image: "bg-gradient-to-br from-pink-200 to-rose-300" },
  { name: "Tokyo", count: "450+ stays", image: "bg-gradient-to-br from-purple-200 to-indigo-300" },
  { name: "New York", count: "380+ stays", image: "bg-gradient-to-br from-gray-200 to-slate-300" },
  { name: "Dubai", count: "290+ stays", image: "bg-gradient-to-br from-amber-200 to-orange-300" },
];

const featuredStays = [
  { id: 1, name: "Oceanfront Villa", location: "Maldives", price: 450, rating: 4.9, reviews: 128, image: "bg-gradient-to-br from-cyan-100 to-blue-200" },
  { id: 2, name: "Luxury Resort & Spa", location: "Bali", price: 280, rating: 4.8, reviews: 256, image: "bg-gradient-to-br from-emerald-100 to-teal-200" },
  { id: 3, name: "City Center Suite", location: "Paris", price: 195, rating: 4.7, reviews: 189, image: "bg-gradient-to-br from-pink-100 to-rose-200" },
  { id: 4, name: "Skyline Penthouse", location: "New York", price: 520, rating: 4.9, reviews: 94, image: "bg-gradient-to-br from-slate-100 to-gray-200" },
];

const amenities = [
  { icon: Wifi, name: "Free WiFi" },
  { icon: Car, name: "Parking" },
  { icon: Coffee, name: "Breakfast" },
  { icon: Waves, name: "Pool" },
];

export default function StaySavvyHome() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center">
                <span className="text-xl">🏨</span>
              </div>
              <span className="text-xl font-bold text-gray-900">StaySavvy</span>
            </Link>
            <div className="hidden md:flex items-center gap-8">
              <Link href="/hotels" className="text-gray-700 hover:text-primary-600">Hotels</Link>
              <Link href="/vacation-rentals" className="text-gray-700 hover:text-primary-600">Vacation Rentals</Link>
              <Link href="/resorts" className="text-gray-700 hover:text-primary-600">Resorts</Link>
              <Link href="/deals" className="text-gray-700 hover:text-primary-600">Deals</Link>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/auth/login" className="text-gray-700 hover:text-gray-900">Sign In</Link>
              <Link href="/auth/signup" className="btn-primary">List Property</Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative h-[500px] bg-gradient-to-br from-primary-600 to-blue-700">
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative h-full max-w-7xl mx-auto px-4 flex items-center justify-center">
          <div className="w-full max-w-4xl text-center text-white">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Find Your Perfect Stay</h1>
            <p className="text-xl text-white/80 mb-8">Discover amazing hotels, resorts, and vacation rentals worldwide</p>
            <div className="bg-white rounded-xl p-4 shadow-2xl">
              <div className="grid md:grid-cols-4 gap-4">
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input type="text" placeholder="Where to?" className="w-full pl-12 pr-4 py-3 bg-gray-100 rounded-lg border-0" />
                </div>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input type="text" placeholder="Check in - Check out" className="w-full pl-12 pr-4 py-3 bg-gray-100 rounded-lg border-0" />
                </div>
                <div className="relative">
                  <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <select className="w-full pl-12 pr-4 py-3 bg-gray-100 rounded-lg border-0 appearance-none">
                    <option>2 Guests</option>
                    <option>1 Guest</option>
                    <option>3 Guests</option>
                    <option>4+ Guests</option>
                  </select>
                </div>
                <button className="btn-primary flex items-center justify-center gap-2">
                  <Search className="w-5 h-5" />
                  Search
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Destinations */}
      <section className="section-padding">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8">Popular Destinations</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {destinations.map((dest) => (
              <div key={dest.name} className={`${dest.image} rounded-2xl p-4 aspect-[3/4] flex flex-col justify-end cursor-pointer hover:shadow-lg transition-shadow`}>
                <div className="bg-white/90 backdrop-blur-sm rounded-xl p-3">
                  <h3 className="font-semibold text-gray-900">{dest.name}</h3>
                  <p className="text-sm text-gray-600">{dest.count}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Stays */}
      <section className="section-padding bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold">Featured Stays</h2>
            <Link href="/hotels" className="text-primary-600 font-medium hover:underline flex items-center gap-1">
              View All <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredStays.map((stay) => (
              <div key={stay.id} className="bg-white rounded-xl shadow-sm overflow-hidden group hover:shadow-lg transition-shadow">
                <div className={`h-48 ${stay.image} relative`}>
                  <button className="absolute top-4 right-4 w-10 h-10 bg-white/80 rounded-full flex items-center justify-center hover:bg-white">
                    <Heart className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
                <div className="p-4">
                  <div className="flex items-center gap-1 mb-2">
                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    <span className="font-semibold">{stay.rating}</span>
                    <span className="text-gray-500">({stay.reviews} reviews)</span>
                  </div>
                  <h3 className="font-semibold text-lg text-gray-900 mb-1">{stay.name}</h3>
                  <p className="text-gray-500 text-sm mb-3">{stay.location}</p>
                  <div className="flex items-center gap-2 mb-3">
                    {amenities.map((am) => (
                      <am.icon key={am.name} className="w-4 h-4 text-gray-400" />
                    ))}
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t">
                    <div>
                      <span className="text-2xl font-bold text-gray-900">${stay.price}</span>
                      <span className="text-gray-500">/night</span>
                    </div>
                    <button className="btn-primary text-sm py-2 px-4">Book Now</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Amenities */}
      <section className="section-padding">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose StaySavvy</h2>
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { icon: Star, title: "Best Price Guarantee", desc: "Find lower price? We'll match it" },
              { icon: Users, title: "24/7 Support", desc: "Always here to help you" },
              { icon: Calendar, title: "Free Cancellation", desc: "Flexible booking options" },
              { icon: Heart, title: "Verified Stays", desc: "Quality checked properties" },
            ].map((feature) => (
              <div key={feature.title} className="text-center p-6">
                <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="w-8 h-8 text-primary-600" />
                </div>
                <h3 className="font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-blue-600">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-3xl font-bold text-white mb-4">List Your Property</h2>
          <p className="text-white/80 mb-8">Join thousands of hosts earning on StaySavvy</p>
          <button className="px-8 py-3 bg-white text-primary-600 font-medium rounded-lg hover:bg-gray-100 transition-colors">Become a Host</button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center">
                  <span className="text-xl">🏨</span>
                </div>
                <span className="text-white font-bold text-xl">StaySavvy</span>
              </div>
              <p className="text-sm">Your trusted partner for finding the perfect stay.</p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Discover</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/hotels">Hotels</Link></li>
                <li><Link href="/resorts">Resorts</Link></li>
                <li><Link href="/vacation-rentals">Vacation Rentals</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Host</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/list-property">List Property</Link></li>
                <li><Link href="/host-resources">Resources</Link></li>
                <li><Link href="/community">Community</Link></li>
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
          <div className="border-t border-gray-800 pt-8 text-center text-sm">
            © 2024 StaySavvy. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
