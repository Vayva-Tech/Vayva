"use client";

import { Search, Calendar, Star, ArrowRight, Heart, MapPin, Clock, Sparkles } from "lucide-react";
import Link from "next/link";

const services = [
  { name: "Hair Styling", icon: "💇", count: 45 },
  { name: "Facial Treatment", icon: "✨", count: 32 },
  { name: "Massage Therapy", icon: "💆", count: 28 },
  { name: "Nail Care", icon: "💅", count: 24 },
  { name: "Makeup", icon: "💄", count: 18 },
  { name: "Spa Package", icon: "🧖", count: 15 },
];

const featuredSpas = [
  { id: 1, name: "Glow Beauty Studio", location: "Downtown", rating: 4.9, reviews: 128, image: "bg-gradient-to-br from-pink-100 to-rose-100" },
  { id: 2, name: "Serenity Spa & Wellness", location: "Westside", rating: 4.8, reviews: 96, image: "bg-gradient-to-br from-purple-100 to-indigo-100" },
  { id: 3, name: "Luxe Nail Bar", location: "Uptown", rating: 4.7, reviews: 84, image: "bg-gradient-to-br from-amber-100 to-yellow-100" },
  { id: 4, name: "Bliss Hair Salon", location: "Midtown", rating: 4.9, reviews: 156, image: "bg-gradient-to-br from-cyan-100 to-teal-100" },
];

const features = [
  { icon: Calendar, title: "Easy Booking", desc: "Book appointments 24/7" },
  { icon: Star, title: "Verified Reviews", desc: "Real customer feedback" },
  { icon: Heart, title: "Favorites", desc: "Save your preferred spots" },
];

export default function BlissBoHome() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">BlissBo</span>
            </Link>
            <div className="hidden md:flex items-center gap-8">
              <Link href="/services" className="text-gray-600 hover:text-gray-900">Services</Link>
              <Link href="/spas" className="text-gray-600 hover:text-gray-900">Spas</Link>
              <Link href="/deals" className="text-gray-600 hover:text-gray-900">Deals</Link>
              <Link href="/gift-cards" className="text-gray-600 hover:text-gray-900">Gift Cards</Link>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/auth/login" className="text-gray-600 hover:text-gray-900">Sign In</Link>
              <Link href="/auth/signup" className="btn-primary">Book Now</Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="section-padding bg-gradient-to-br from-primary-50 via-white to-secondary-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
              Discover Your{" "}
              <span className="bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">Perfect Glow</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Book beauty and wellness services at top-rated salons and spas near you.
            </p>
            <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input type="text" placeholder="Search services or spas..." className="w-full pl-12 pr-4 py-3 bg-gray-50 rounded-xl border-0 focus:ring-2 focus:ring-primary-500" />
                </div>
                <div className="flex-1 relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input type="text" placeholder="Location" className="w-full pl-12 pr-4 py-3 bg-gray-50 rounded-xl border-0 focus:ring-2 focus:ring-primary-500" />
                </div>
                <button className="btn-primary px-8">Search</button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="section-padding">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Popular Services</h2>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-6">
            {services.map((service) => (
              <button key={service.name} className="flex flex-col items-center gap-3 p-6 bg-gray-50 rounded-2xl hover:bg-primary-50 hover:shadow-md transition-all group">
                <span className="text-4xl group-hover:scale-110 transition-transform">{service.icon}</span>
                <span className="font-medium text-gray-900">{service.name}</span>
                <span className="text-sm text-gray-500">{service.count} places</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Spas */}
      <section className="section-padding bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold">Top Rated Spas</h2>
            <Link href="/spas" className="text-primary-600 font-medium hover:underline flex items-center gap-1">
              View All <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredSpas.map((spa) => (
              <div key={spa.id} className="bg-white rounded-2xl shadow-sm overflow-hidden group hover:shadow-md transition-shadow">
                <div className={`h-48 ${spa.image} relative`}>
                  <button className="absolute top-4 right-4 w-10 h-10 bg-white/80 rounded-full flex items-center justify-center hover:bg-white">
                    <Heart className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
                <div className="p-4">
                  <div className="flex items-center gap-1 mb-2">
                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    <span className="font-semibold">{spa.rating}</span>
                    <span className="text-gray-500">({spa.reviews} reviews)</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">{spa.name}</h3>
                  <div className="flex items-center gap-1 text-gray-500 text-sm mb-3">
                    <MapPin className="w-4 h-4" />
                    {spa.location}
                  </div>
                  <button className="w-full py-2 bg-primary-50 text-primary-600 font-medium rounded-lg hover:bg-primary-100 transition-colors">
                    Book Appointment
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="section-padding">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature) => (
              <div key={feature.title} className="text-center p-8">
                <div className="w-16 h-16 bg-gradient-to-br from-primary-100 to-secondary-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="w-8 h-8 text-primary-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-secondary-600">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Pamper Yourself?</h2>
          <p className="text-white/80 mb-8">Book your first appointment and get 20% off</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/auth/signup" className="px-8 py-3 bg-white text-primary-600 font-medium rounded-full hover:bg-gray-100 transition-colors">
              Get Started
            </Link>
            <Link href="/services" className="px-8 py-3 border-2 border-white text-white font-medium rounded-full hover:bg-white/10 transition-colors">
              Explore Services
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <span className="text-white font-bold text-xl">BlissBo</span>
              </div>
              <p className="text-sm">Your beauty and wellness booking companion.</p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Services</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/hair">Hair</Link></li>
                <li><Link href="/nails">Nails</Link></li>
                <li><Link href="/facials">Facials</Link></li>
                <li><Link href="/massage">Massage</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">For Business</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/list-business">List Your Business</Link></li>
                <li><Link href="/partners">Partners</Link></li>
                <li><Link href="/pricing">Pricing</Link></li>
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
            © 2024 BlissBo. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
