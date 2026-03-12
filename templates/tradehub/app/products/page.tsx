"use client";

import { Building2, ShoppingBag, Search, MapPin, Star, Users, ArrowRight, Filter, Heart, Truck, Shield, CheckCircle } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const products = [
  {
    id: 1,
    name: "Wireless Earbuds Pro",
    supplier: "TechSource Global",
    moq: "500 units",
    price: 12.50,
    rating: 4.8,
    reviews: 234,
    image: "🎧",
    category: "Electronics",
  },
  {
    id: 2,
    name: "Organic Cotton T-Shirts",
    supplier: "ApparelCraft Inc",
    moq: "1000 units",
    price: 4.75,
    rating: 4.6,
    reviews: 189,
    image: "👕",
    category: "Apparel",
  },
  {
    id: 3,
    name: "Ceramic Dinner Set",
    supplier: "HomeGoods Direct",
    moq: "200 units",
    price: 28.00,
    rating: 4.7,
    reviews: 156,
    image: "🍽️",
    category: "Home",
  },
  {
    id: 4,
    name: "Skincare Bundle",
    supplier: "BeautyFirst Manufacturing",
    moq: "300 units",
    price: 18.50,
    rating: 4.9,
    reviews: 445,
    image: "✨",
    category: "Beauty",
  },
];

const categories = ["All", "Electronics", "Apparel", "Home", "Beauty", "Industrial", "Food"];

export default function ProductsPage() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredProducts = products.filter((product) => {
    const matchesCategory = selectedCategory === "All" || product.category === selectedCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
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
              <Link href="/suppliers" className="text-gray-600 hover:text-gray-900">Suppliers</Link>
              <Link href="/products" className="text-blue-600 font-medium">Products</Link>
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
      <section className="bg-gradient-to-br from-blue-600 to-indigo-700 py-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">Source Products Globally</h1>
          <p className="text-blue-100 mb-8">Discover millions of wholesale products from verified suppliers</p>
          <div className="flex gap-4 max-w-xl mx-auto">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search products, suppliers..."
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
        {/* Features */}
        <div className="grid grid-cols-3 gap-8 mb-12">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Shield className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="font-semibold">Verified Suppliers</p>
              <p className="text-gray-500 text-sm">100% supplier verification</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Truck className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="font-semibold">Global Shipping</p>
              <p className="text-gray-500 text-sm">To 150+ countries</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="font-semibold">Trade Assurance</p>
              <p className="text-gray-500 text-sm">Secure transactions</p>
            </div>
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

        {/* Products Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <div key={product.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all group">
              <div className="h-48 bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center text-6xl">
                {product.image}
              </div>
              <div className="p-5">
                <span className="inline-block px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded mb-2">
                  {product.category}
                </span>
                <h3 className="font-semibold text-gray-900 mb-1">{product.name}</h3>
                <p className="text-gray-500 text-sm mb-3">{product.supplier}</p>
                <div className="flex items-center gap-2 mb-3">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="font-medium">{product.rating}</span>
                  <span className="text-gray-500 text-sm">({product.reviews})</span>
                </div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <span className="text-lg font-bold text-gray-900">${product.price}</span>
                    <span className="text-gray-500 text-sm">/unit</span>
                  </div>
                  <span className="text-gray-500 text-sm">MOQ: {product.moq}</span>
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
