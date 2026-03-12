"use client";

import { Search, MapPin, Bed, Bath, Square, Heart, ArrowRight, Shield, Clock, Award, Phone, Mail } from "lucide-react";
import Link from "next/link";

const featuredProperties = [
  { id: 1, title: "Modern Villa with Pool", location: "Beverly Hills, CA", price: "$2,450,000", beds: 5, baths: 4, sqft: 4200, image: "bg-gradient-to-br from-amber-100 to-orange-100" },
  { id: 2, title: "Luxury Penthouse", location: "Manhattan, NY", price: "$3,200,000", beds: 3, baths: 3, sqft: 2800, image: "bg-gradient-to-br from-blue-100 to-indigo-100" },
  { id: 3, title: "Beachfront Estate", location: "Miami Beach, FL", price: "$4,800,000", beds: 6, baths: 5, sqft: 5500, image: "bg-gradient-to-br from-cyan-100 to-teal-100" },
  { id: 4, title: "Mountain Retreat", location: "Aspen, CO", price: "$1,850,000", beds: 4, baths: 3, sqft: 3200, image: "bg-gradient-to-br from-emerald-100 to-green-100" },
];

const stats = [
  { value: "2,500+", label: "Properties Listed" },
  { value: "1,200+", label: "Happy Clients" },
  { value: "15+", label: "Years Experience" },
  { value: "50+", label: "Expert Agents" },
];

export default function LarkHomesHome() {
  return (
    <div className="min-h-screen bg-white">
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
              <Link href="/properties" className="text-gray-600 hover:text-gray-900">Properties</Link>
              <Link href="/agents" className="text-gray-600 hover:text-gray-900">Agents</Link>
              <Link href="/about" className="text-gray-600 hover:text-gray-900">About</Link>
              <Link href="/blog" className="text-gray-600 hover:text-gray-900">Blog</Link>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/auth/login" className="text-gray-600 hover:text-gray-900">Sign In</Link>
              <Link href="/auth/signup" className="btn-primary">List Property</Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero with Search */}
      <section className="relative bg-dark-900 py-20 lg:py-32">
        <div className="absolute inset-0 bg-gradient-to-r from-dark-900/90 to-dark-800/80" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
              Find Your Perfect Home
            </h1>
            <p className="text-xl text-gray-300 mb-8">
              Discover luxury properties in prime locations. Over 2,500+ homes waiting for you.
            </p>
          </div>
          
          {/* Search Box */}
          <div className="bg-white rounded-xl p-4 shadow-xl max-w-4xl">
            <div className="grid md:grid-cols-4 gap-4">
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input type="text" placeholder="Location" className="w-full pl-10 pr-4 py-3 border rounded-lg" />
              </div>
              <select className="w-full px-4 py-3 border rounded-lg">
                <option>Property Type</option>
                <option>House</option>
                <option>Apartment</option>
                <option>Condo</option>
                <option>Villa</option>
              </select>
              <select className="w-full px-4 py-3 border rounded-lg">
                <option>Price Range</option>
                <option>$100k - $500k</option>
                <option>$500k - $1M</option>
                <option>$1M - $5M</option>
                <option>$5M+</option>
              </select>
              <button className="btn-primary flex items-center justify-center gap-2">
                <Search className="w-5 h-5" />
                Search
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 bg-primary-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl font-bold text-primary-700">{stat.value}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Properties */}
      <section className="section-padding">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Featured Properties</h2>
              <p className="text-gray-600">Hand-picked luxury homes for you</p>
            </div>
            <Link href="/properties" className="btn-secondary inline-flex items-center gap-2">
              View All
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProperties.map((property) => (
              <div key={property.id} className="bg-white rounded-xl shadow-sm border overflow-hidden group">
                <div className={`h-48 ${property.image} relative`}>
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
      </section>

      {/* Why Choose Us */}
      <section className="section-padding bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose LarkHomes</h2>
            <p className="text-gray-600">We make finding your dream home simple and stress-free</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl p-6 text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Trusted Listings</h3>
              <p className="text-gray-600">All properties verified by our expert team</p>
            </div>
            <div className="bg-white rounded-xl p-6 text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Fast Process</h3>
              <p className="text-gray-600">From search to closing in record time</p>
            </div>
            <div className="bg-white rounded-xl p-6 text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Expert Agents</h3>
              <p className="text-gray-600">Top-rated agents with local expertise</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-dark-900">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Find Your Home?</h2>
          <p className="text-gray-400 mb-8">Get started with a free consultation from our expert agents</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/contact" className="btn-primary">Schedule a Call</Link>
            <Link href="/properties" className="px-6 py-3 border border-white text-white rounded-lg hover:bg-white/10">Browse Properties</Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-white" />
                </div>
                <span className="text-white font-bold text-xl">LarkHomes</span>
              </div>
              <p className="text-sm">Your trusted partner in finding the perfect property.</p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/properties">Properties</Link></li>
                <li><Link href="/agents">Agents</Link></li>
                <li><Link href="/about">About Us</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/help">Help Center</Link></li>
                <li><Link href="/contact">Contact</Link></li>
                <li><Link href="/faq">FAQ</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2"><Phone className="w-4 h-4" /> +1 (555) 123-4567</li>
                <li className="flex items-center gap-2"><Mail className="w-4 h-4" /> hello@larkhomes.com</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm">
            © 2024 LarkHomes. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
