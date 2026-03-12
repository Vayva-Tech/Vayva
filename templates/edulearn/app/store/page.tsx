"use client";

import Header from "@/components/Header";
import { ShoppingBag, Star, Clock, Search, Filter, ChevronRight, ShoppingCart, Heart, Eye } from "lucide-react";
import { useState } from "react";
import Link from "next/link";

const categories = [
  { name: "All", count: 156 },
  { name: "Courses", count: 45 },
  { name: "Workshops", count: 12 },
  { name: "Programs", count: 8 },
  { name: "Templates", count: 34 },
  { name: "Assets", count: 57 },
];

const products = [
  {
    id: 1,
    title: "Complete Blender Masterclass 2024",
    description: "The ultimate Blender course covering modeling, sculpting, texturing, and animation.",
    type: "course",
    price: 149,
    originalPrice: 299,
    rating: 4.9,
    reviews: 2341,
    students: 8923,
    duration: "48 hours",
    instructor: "Ethan Brantley",
    image: "blender",
    bestseller: true,
  },
  {
    id: 2,
    title: "Unreal Engine 5: From Beginner to Pro",
    description: "Master UE5 for game development and real-time rendering.",
    type: "course",
    price: 199,
    originalPrice: 399,
    rating: 4.8,
    reviews: 1567,
    students: 5432,
    duration: "52 hours",
    instructor: "Sarah Chen",
    image: "ue5",
  },
  {
    id: 3,
    title: "VFX Production Bundle",
    description: "Access to all VFX courses + exclusive industry workshops.",
    type: "program",
    price: 499,
    originalPrice: 999,
    rating: 4.9,
    reviews: 445,
    students: 1234,
    duration: "6 months",
    instructor: "Multiple Instructors",
    image: "vfx",
    featured: true,
  },
  {
    id: 4,
    title: "Motion Graphics Templates Pack",
    description: "50+ professional After Effects templates for titles, transitions, and lower thirds.",
    type: "template",
    price: 49,
    originalPrice: 99,
    rating: 4.7,
    reviews: 892,
    students: 3456,
    instructor: "Motion Design School",
    image: "templates",
  },
  {
    id: 5,
    title: "Live: Character Animation Workshop",
    description: "Two-day intensive workshop with Disney animators.",
    type: "workshop",
    price: 299,
    originalPrice: 499,
    rating: 4.9,
    reviews: 234,
    students: 567,
    duration: "2 days",
    instructor: "Animation Pros",
    image: "workshop",
    live: true,
  },
  {
    id: 6,
    title: "3D Asset Library - Mega Bundle",
    description: "10,000+ 3D models, textures, and HDRIs for your projects.",
    type: "assets",
    price: 199,
    originalPrice: 399,
    rating: 4.8,
    reviews: 1234,
    students: 4567,
    instructor: "Asset Forge",
    image: "assets",
  },
];

const getIcon = (type: string) => {
  switch (type) {
    case "course": return <div className="w-3 h-3 rounded-full bg-blue-500" />;
    case "workshop": return <div className="w-3 h-3 rounded-full bg-red-500" />;
    case "program": return <div className="w-3 h-3 rounded-full bg-purple-500" />;
    case "template": return <div className="w-3 h-3 rounded-full bg-green-500" />;
    case "assets": return <div className="w-3 h-3 rounded-full bg-yellow-500" />;
    default: return <div className="w-3 h-3 rounded-full bg-gray-500" />;
  }
};

export default function StorePage() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [cartCount, setCartCount] = useState(0);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header breadcrumbs={[{ label: "Store" }]} />

      {/* Hero */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white">
        <div className="px-6 py-12 max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-3">Learning Marketplace</h1>
              <p className="text-gray-400 text-lg max-w-xl">
                Premium courses, workshops, templates, and assets to accelerate your creative career.
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-2xl font-bold">{cartCount}</div>
                <div className="text-sm text-gray-400">items in cart</div>
              </div>
              <button className="p-3 bg-white/10 rounded-xl hover:bg-white/20 transition-colors">
                <ShoppingCart className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 py-8 max-w-7xl mx-auto">
        {/* Search & Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search courses, workshops, templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-200"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50">
            <Filter className="w-4 h-4" />
            Filters
          </button>
        </div>

        {/* Category Pills */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {categories.map((category) => (
            <button
              key={category.name}
              onClick={() => setActiveCategory(category.name)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                activeCategory === category.name
                  ? "bg-gray-900 text-white"
                  : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
              }`}
            >
              {category.name}
              <span className={`px-2 py-0.5 rounded-full text-xs ${
                activeCategory === category.name ? "bg-white/20" : "bg-gray-100"
              }`}>
                {category.count}
              </span>
            </button>
          ))}
        </div>

        {/* Featured Product */}
        {products.find(p => p.featured) && (
          <div className="mb-8 card overflow-hidden">
            <div className="grid md:grid-cols-2">
              <div className="h-64 md:h-auto bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
                <ShoppingBag className="w-24 h-24 text-white/30" />
              </div>
              <div className="p-8">
                <div className="flex items-center gap-2 mb-3">
                  <span className="px-3 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-full">
                    Featured
                  </span>
                  <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
                    Program
                  </span>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-3">
                  VFX Production Bundle
                </h2>
                <p className="text-gray-600 mb-4">
                  Get unlimited access to all VFX courses, exclusive workshops, and 1-on-1 mentorship.
                  The complete package for aspiring VFX artists.
                </p>
                <div className="flex items-center gap-4 mb-6">
                  <span className="flex items-center gap-1 text-sm text-gray-600">
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    4.9 (445 reviews)
                  </span>
                  <span className="flex items-center gap-1 text-sm text-gray-600">
                    <Clock className="w-4 h-4" />
                    6 months
                  </span>
                </div>
                <div className="flex items-baseline gap-3 mb-6">
                  <span className="text-3xl font-bold text-gray-900">$499</span>
                  <span className="text-xl text-gray-400 line-through">$999</span>
                  <span className="px-2 py-1 bg-red-100 text-red-600 text-sm rounded-md">
                    50% OFF
                  </span>
                </div>
                <div className="flex gap-3">
                  <button 
                    onClick={() => setCartCount(c => c + 1)}
                    className="btn-primary flex items-center gap-2"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    Add to Cart
                  </button>
                  <button className="btn-secondary">
                    <Heart className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.filter(p => !p.featured).map((product) => (
            <div key={product.id} className="card overflow-hidden group hover:shadow-lg transition-shadow">
              {/* Image */}
              <div className="relative h-48 bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center">
                {product.bestseller && (
                  <div className="absolute top-3 left-3 px-2 py-1 bg-yellow-500 text-white text-xs font-bold rounded">
                    BESTSELLER
                  </div>
                )}
                {product.live && (
                  <div className="absolute top-3 left-3 px-2 py-1 bg-red-500 text-white text-xs font-bold rounded flex items-center gap-1">
                    <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                    LIVE
                  </div>
                )}
                <ShoppingBag className="w-16 h-16 text-white/20" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <button className="px-4 py-2 bg-white text-gray-900 rounded-lg font-medium flex items-center gap-2">
                    <Eye className="w-4 h-4" />
                    Quick View
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-5">
                <div className="flex items-center gap-2 mb-2">
                  {getIcon(product.type)}
                  <span className="text-xs text-gray-500 uppercase tracking-wider">{product.type}</span>
                </div>

                <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{product.title}</h3>
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{product.description}</p>

                <div className="flex items-center gap-2 mb-3">
                  <span className="text-sm text-gray-500">by {product.instructor}</span>
                </div>

                <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                  <span className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    {product.rating}
                  </span>
                  <span>({product.reviews})</span>
                  <span>•</span>
                  <span>{product.students.toLocaleString()} students</span>
                </div>

                {product.duration && (
                  <div className="flex items-center gap-1 text-sm text-gray-500 mb-4">
                    <Clock className="w-4 h-4" />
                    {product.duration}
                  </div>
                )}

                <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-xl font-bold text-gray-900">${product.price}</span>
                  {product.originalPrice && (
                    <span className="text-sm text-gray-400 line-through">${product.originalPrice}</span>
                  )}
                </div>

                <div className="flex gap-2">
                  <button 
                    onClick={() => setCartCount(c => c + 1)}
                    className="flex-1 btn-primary text-sm"
                  >
                    Add to Cart
                  </button>
                  <button className="btn-secondary px-3">
                    <Heart className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
