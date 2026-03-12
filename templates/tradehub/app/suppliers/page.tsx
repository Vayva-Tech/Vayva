"use client";

import { Building2, Search, MapPin, Star, Users, ArrowRight, Shield, Truck, Globe, CheckCircle, Package } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const suppliers = [
  {
    id: 1,
    name: "TechSource Global",
    location: "Shenzhen, China",
    category: "Electronics",
    rating: 4.9,
    reviews: 1256,
    orders: "50K+",
    since: "2015",
    verified: true,
    image: "🏭",
  },
  {
    id: 2,
    name: "ApparelCraft Inc",
    location: "Istanbul, Turkey",
    category: "Apparel",
    rating: 4.8,
    reviews: 892,
    orders: "35K+",
    since: "2012",
    verified: true,
    image: "👕",
  },
  {
    id: 3,
    name: "HomeGoods Direct",
    location: "Mumbai, India",
    category: "Home & Garden",
    rating: 4.7,
    reviews: 678,
    orders: "28K+",
    since: "2018",
    verified: true,
    image: "🏠",
  },
  {
    id: 4,
    name: "BeautyFirst Manufacturing",
    location: "Seoul, South Korea",
    category: "Beauty",
    rating: 4.9,
    reviews: 445,
    orders: "18K+",
    since: "2016",
    verified: true,
    image: "✨",
  },
];

const categories = [
  "All",
  "Electronics",
  "Apparel",
  "Home & Garden",
  "Beauty",
  "Industrial",
  "Food & Beverage",
];

export default function SuppliersPage() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredSuppliers = suppliers.filter((supplier) => {
    const matchesCategory = selectedCategory === "All" || supplier.category === selectedCategory;
    const matchesSearch = supplier.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         supplier.location.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">TradeHub</span>
            </Link>
            <div className="hidden md:flex items-center gap-8">
              <Link href="/suppliers" className="text-blue-600 font-medium">Find Suppliers</Link>
              <Link href="/products" className="text-gray-600 hover:text-gray-900">Products</Link>
              <Link href="/solutions" className="text-gray-600 hover:text-gray-900">Solutions</Link>
              <Link href="/about" className="text-gray-600 hover:text-gray-900">About</Link>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/login" className="text-gray-600 hover:text-gray-900">Sign In</Link>
              <Link href="/register" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-600 to-indigo-700 py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold text-white mb-4">Find Verified Suppliers</h1>
          <p className="text-xl text-blue-100 mb-8">
            Connect with 50,000+ verified manufacturers and wholesalers worldwide
          </p>
          <div className="flex gap-4 max-w-xl mx-auto">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by product, company, or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-lg text-gray-900 focus:outline-none"
              />
            </div>
            <button className="px-6 py-3 bg-blue-800 text-white font-semibold rounded-lg hover:bg-blue-900">
              Search
            </button>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          <div className="text-center">
            <p className="text-3xl font-bold text-blue-600">50K+</p>
            <p className="text-gray-600">Verified Suppliers</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-blue-600">150+</p>
            <p className="text-gray-600">Countries</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-blue-600">$2B+</p>
            <p className="text-gray-600">Annual Trade</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-blue-600">98%</p>
            <p className="text-gray-600">Satisfaction Rate</p>
          </div>
        </div>

        {/* Categories */}
        <div className="flex flex-wrap gap-2 mb-8">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full text-sm font-medium ${
                selectedCategory === category
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Suppliers Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredSuppliers.map((supplier) => (
            <div key={supplier.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all">
              <div className="h-48 bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center text-6xl">
                {supplier.image}
              </div>
              <div className="p-5">
                <div className="flex items-center gap-2 mb-2">
                  <span className="inline-block px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                    {supplier.category}
                  </span>
                  {supplier.verified && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded">
                      <CheckCircle className="w-3 h-3" />
                      Verified
                    </span>
                  )}
                </div>
                <h3 className="font-semibold text-lg text-gray-900 mb-1">{supplier.name}</h3>
                <div className="flex items-center gap-1 text-gray-500 text-sm mb-2">
                  <MapPin className="w-4 h-4" />
                  {supplier.location}
                </div>
                <div className="flex items-center gap-2 mb-3">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="font-medium">{supplier.rating}</span>
                  <span className="text-gray-500 text-sm">({supplier.reviews} reviews)</span>
                </div>
                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <span>{supplier.orders} orders</span>
                  <span>Since {supplier.since}</span>
                </div>
                <button className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  Contact Supplier
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
