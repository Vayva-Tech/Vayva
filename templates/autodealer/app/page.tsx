"use client";

import { Search, Phone, MapPin, ChevronRight, Gauge, Calendar, Fuel, Users } from "lucide-react";
import Link from "next/link";

const brands = [
  { name: "Mercedes", logo: "⭐" },
  { name: "BMW", logo: "🔵" },
  { name: "Audi", logo: "⚪" },
  { name: "Toyota", logo: "🔴" },
  { name: "Honda", logo: "🟢" },
  { name: "Ford", logo: "🔷" },
];

const featuredCars = [
  { id: 1, name: "Mercedes-Benz C-Class", year: 2023, price: 45200, mileage: 12000, fuel: "Petrol", image: "bg-gradient-to-br from-gray-200 to-slate-300" },
  { id: 2, name: "BMW 3 Series", year: 2023, price: 41900, mileage: 8500, fuel: "Diesel", image: "bg-gradient-to-br from-blue-200 to-indigo-300" },
  { id: 3, name: "Audi A4", year: 2022, price: 38900, mileage: 15000, fuel: "Petrol", image: "bg-gradient-to-br from-slate-200 to-gray-300" },
  { id: 4, name: "Toyota Camry", year: 2023, price: 28900, mileage: 5000, fuel: "Hybrid", image: "bg-gradient-to-br from-red-100 to-rose-200" },
];

const stats = [
  { value: "500+", label: "Cars in Stock" },
  { value: "10K+", label: "Happy Customers" },
  { value: "15+", label: "Years Experience" },
  { value: "50+", label: "Expert Staff" },
];

export default function AutoDealerHome() {
  return (
    <div className="min-h-screen bg-white">
      {/* Top Bar */}
      <div className="bg-dark-900 text-white py-2 text-sm">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-2"><Phone className="w-4 h-4" /> +1 (555) 123-4567</span>
            <span className="hidden md:flex items-center gap-2"><MapPin className="w-4 h-4" /> 123 Auto Drive, Downtown</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/financing" className="hover:text-primary-400">Financing</Link>
            <Link href="/trade-in" className="hover:text-primary-400">Trade-In</Link>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-xl">🚗</span>
              </div>
              <span className="text-xl font-bold text-dark-900">AutoDealer</span>
            </Link>
            <div className="hidden md:flex items-center gap-8">
              <Link href="/inventory" className="text-gray-700 hover:text-primary-600">Inventory</Link>
              <Link href="/new-cars" className="text-gray-700 hover:text-primary-600">New Cars</Link>
              <Link href="/used-cars" className="text-gray-700 hover:text-primary-600">Used Cars</Link>
              <Link href="/services" className="text-gray-700 hover:text-primary-600">Services</Link>
              <Link href="/about" className="text-gray-700 hover:text-primary-600">About</Link>
            </div>
            <Link href="/contact" className="btn-primary">Get a Quote</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative h-[600px] bg-dark-900">
        <div className="absolute inset-0 bg-gradient-to-r from-dark-900/90 to-dark-800/70" />
        <div className="relative h-full max-w-7xl mx-auto px-4 flex items-center">
          <div className="max-w-2xl text-white">
            <span className="inline-block px-4 py-1 bg-primary-600 rounded-full text-sm font-medium mb-4">Premium Selection</span>
            <h1 className="text-5xl md:text-6xl font-bold mb-4">Find Your Dream Car</h1>
            <p className="text-xl text-gray-300 mb-8">Browse our extensive collection of new and certified pre-owned vehicles.</p>
            <div className="bg-white rounded-xl p-4">
              <div className="grid md:grid-cols-4 gap-4">
                <select className="w-full px-4 py-3 bg-gray-100 rounded-lg border-0">
                  <option>All Makes</option>
                  <option>Mercedes</option>
                  <option>BMW</option>
                  <option>Audi</option>
                </select>
                <select className="w-full px-4 py-3 bg-gray-100 rounded-lg border-0">
                  <option>All Models</option>
                  <option>Sedan</option>
                  <option>SUV</option>
                  <option>Coupe</option>
                </select>
                <select className="w-full px-4 py-3 bg-gray-100 rounded-lg border-0">
                  <option>Price Range</option>
                  <option>$0 - $25k</option>
                  <option>$25k - $50k</option>
                  <option>$50k+</option>
                </select>
                <button className="btn-primary flex items-center justify-center gap-2">
                  <Search className="w-5 h-5" />
                  Search
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Brands */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-3 md:grid-cols-6 gap-8">
            {brands.map((brand) => (
              <div key={brand.name} className="flex flex-col items-center gap-2 p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                <span className="text-3xl">{brand.logo}</span>
                <span className="font-medium text-gray-900">{brand.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Cars */}
      <section className="section-padding">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold">Featured Vehicles</h2>
            <Link href="/inventory" className="text-primary-600 font-medium hover:underline flex items-center gap-1">
              View All <ChevronRight className="w-5 h-5" />
            </Link>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredCars.map((car) => (
              <div key={car.id} className="bg-white rounded-xl shadow-sm overflow-hidden group hover:shadow-lg transition-shadow">
                <div className={`h-48 ${car.image} relative`}>
                  <span className="absolute top-4 left-4 px-3 py-1 bg-primary-600 text-white text-sm font-medium rounded">{car.year}</span>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-lg text-gray-900 mb-2">{car.name}</h3>
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                    <span className="flex items-center gap-1"><Gauge className="w-4 h-4" /> {car.mileage.toLocaleString()} mi</span>
                    <span className="flex items-center gap-1"><Fuel className="w-4 h-4" /> {car.fuel}</span>
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t">
                    <span className="text-2xl font-bold text-primary-600">${car.price.toLocaleString()}</span>
                    <button className="text-sm font-medium text-primary-600 hover:underline">View Details</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-primary-600 text-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-4xl font-bold mb-2">{stat.value}</div>
                <div className="text-white/80">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-dark-900">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Drive Your New Car?</h2>
          <p className="text-gray-400 mb-8">Get pre-approved for financing in minutes. Trade-ins welcome!</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/financing" className="btn-primary">Apply for Financing</Link>
            <Link href="/trade-in" className="px-8 py-3 border-2 border-white text-white rounded-lg hover:bg-white hover:text-dark-900 transition-colors">Value Your Trade</Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
                  <span className="text-xl">🚗</span>
                </div>
                <span className="text-white font-bold text-xl">AutoDealer</span>
              </div>
              <p className="text-sm">Your trusted partner in finding the perfect vehicle.</p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Inventory</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/new-cars">New Cars</Link></li>
                <li><Link href="/used-cars">Used Cars</Link></li>
                <li><Link href="/certified">Certified Pre-Owned</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Services</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/financing">Financing</Link></li>
                <li><Link href="/service-center">Service Center</Link></li>
                <li><Link href="/trade-in">Trade-In</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-sm">
                <li>+1 (555) 123-4567</li>
                <li>sales@autodealer.com</li>
                <li>123 Auto Drive</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm">
            © 2024 AutoDealer. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
