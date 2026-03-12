"use client";

import { Search, MapPin, Bed, Bath, Square, Heart, Filter, ChevronDown, Home, Building2, Warehouse, Castle, Star, ArrowRight, Calendar, User, Phone, Mail } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const properties = [
  {
    id: 1,
    title: "Modern Luxury Villa with Ocean View",
    location: "Malibu, California",
    price: 8500000,
    beds: 5,
    baths: 6,
    sqft: 7200,
    image: "🏡",
    type: "Villa",
    featured: true,
    tags: ["Ocean View", "Pool", "Smart Home"]
  },
  {
    id: 2,
    title: "Contemporary Penthouse in Downtown",
    location: "Manhattan, New York",
    price: 4200000,
    beds: 3,
    baths: 3,
    sqft: 3200,
    image: "🌆",
    type: "Penthouse",
    featured: true,
    tags: ["Skyline View", "Doorman", "Gym"]
  },
  {
    id: 3,
    title: "Historic Brownstone Townhouse",
    location: "Brooklyn, New York",
    price: 1850000,
    beds: 4,
    baths: 3,
    sqft: 2800,
    image: "🏘️",
    type: "Townhouse",
    featured: false,
    tags: ["Historic", "Garden", "Fireplace"]
  },
  {
    id: 4,
    title: "Seaside Cottage with Private Beach",
    location: "Nantucket, Massachusetts",
    price: 3200000,
    beds: 4,
    baths: 3,
    sqft: 2400,
    image: "🌊",
    type: "Cottage",
    featured: false,
    tags: ["Beachfront", "Renovated", "Deck"]
  },
  {
    id: 5,
    title: "Mountain Retreat with Panoramic Views",
    location: "Aspen, Colorado",
    price: 5600000,
    beds: 6,
    baths: 7,
    sqft: 5800,
    image: "🏔️",
    type: "Chalet",
    featured: true,
    tags: ["Ski-in/Ski-out", "Spa", "Wine Cellar"]
  },
  {
    id: 6,
    title: "Waterfront Estate with Private Dock",
    location: "Miami Beach, Florida",
    price: 12000000,
    beds: 7,
    baths: 9,
    sqft: 9500,
    image: "🌴",
    type: "Estate",
    featured: true,
    tags: ["Waterfront", "Guest House", "Tennis Court"]
  }
];

const propertyTypes = [
  { name: "All Types", icon: Home, count: 2847 },
  { name: "House", icon: Home, count: 1234 },
  { name: "Apartment", icon: Building2, count: 892 },
  { name: "Villa", icon: Castle, count: 456 },
  { name: "Commercial", icon: Warehouse, count: 265 }
];

const priceRanges = [
  { label: "Under $500K", min: 0, max: 500000 },
  { label: "$500K - $1M", min: 500000, max: 1000000 },
  { label: "$1M - $3M", min: 1000000, max: 3000000 },
  { label: "$3M - $5M", min: 3000000, max: 5000000 },
  { label: "$5M+", min: 5000000, max: Infinity }
];

const agents = [
  {
    id: 1,
    name: "Sarah Mitchell",
    title: "Luxury Property Specialist",
    image: "SM",
    sales: 127,
    rating: 4.9,
    reviews: 89,
    phone: "+1 (310) 555-0123",
    email: "sarah@larkhomes.com"
  },
  {
    id: 2,
    name: "David Chen",
    title: "Commercial Real Estate Expert",
    image: "DC",
    sales: 203,
    rating: 4.8,
    reviews: 156,
    phone: "+1 (212) 555-0456",
    email: "david@larkhomes.com"
  },
  {
    id: 3,
    name: "Emma Rodriguez",
    title: "Residential Specialist",
    image: "ER",
    sales: 89,
    rating: 5.0,
    reviews: 67,
    phone: "+1 (305) 555-0789",
    email: "emma@larkhomes.com"
  },
  {
    id: 4,
    name: "Michael Thompson",
    title: "Investment Property Advisor",
    image: "MT",
    sales: 145,
    rating: 4.7,
    reviews: 98,
    phone: "+1 (415) 555-0321",
    email: "michael@larkhomes.com"
  }
];

function formatPrice(price: number) {
  if (price >= 1000000) {
    return `$${(price / 1000000).toFixed(1)}M`;
  }
  return `$${(price / 1000).toFixed(0)}K`;
}

export default function ListingsPage() {
  const [activeType, setActiveType] = useState("All Types");
  const [priceRange, setPriceRange] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [favorites, setFavorites] = useState<number[]>([]);

  const toggleFavorite = (id: number) => {
    setFavorites(prev => 
      prev.includes(id) ? prev.filter(fid => fid !== id) : [...prev, id]
    );
  };

  const filteredProperties = properties.filter(property => {
    if (activeType !== "All Types" && property.type !== activeType) return false;
    if (priceRange) {
      const range = priceRanges.find(r => r.label === priceRange);
      if (range && (property.price < range.min || property.price > range.max)) return false;
    }
    if (searchQuery && !property.location.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <Home className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">LarkHomes</span>
            </Link>
            <div className="hidden md:flex items-center gap-8">
              <Link href="/listings" className="text-primary-600 font-medium">Properties</Link>
              <Link href="/agents" className="text-gray-600 hover:text-gray-900">Agents</Link>
              <Link href="/about" className="text-gray-600 hover:text-gray-900">About</Link>
              <Link href="/contact" className="text-gray-600 hover:text-gray-900">Contact</Link>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/auth/login" className="text-gray-600 hover:text-gray-900">Sign In</Link>
              <Link href="/auth/signup" className="btn-primary">List Property</Link>
            </div>
          </div>
        </div>
      </nav>

      <section className="bg-gradient-to-br from-primary-600 to-primary-700 py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Find Your Dream Home</h1>
            <p className="text-primary-100 text-lg">Discover luxury properties across the world's most desirable locations</p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-6 max-w-4xl mx-auto">
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by location..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-primary-500"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="flex items-center gap-2 px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <Filter className="w-5 h-5 text-gray-500" />
                  <span className="text-gray-700">Filters</span>
                </button>
                <button className="btn-primary px-8 py-3">
                  <Search className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section-padding">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-wrap gap-4 mb-8">
            {propertyTypes.map((type) => {
              const Icon = type.icon;
              return (
                <button
                  key={type.name}
                  onClick={() => setActiveType(type.name)}
                  className={`flex items-center gap-3 px-6 py-3 rounded-xl transition-colors ${
                    activeType === type.name
                      ? "bg-primary-600 text-white"
                      : "bg-white border border-gray-200 text-gray-700 hover:border-primary-500"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{type.name}</span>
                  <span className={`text-sm ${activeType === type.name ? "text-primary-200" : "text-gray-500"}`}>
                    ({type.count})
                  </span>
                </button>
              );
            })}
          </div>

          <div className="flex flex-wrap gap-3 mb-8">
            {priceRanges.map((range) => (
              <button
                key={range.label}
                onClick={() => setPriceRange(priceRange === range.label ? null : range.label)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  priceRange === range.label
                    ? "bg-primary-600 text-white"
                    : "bg-white border border-gray-200 text-gray-700 hover:border-primary-500"
                }`}
              >
                {range.label}
              </button>
            ))}
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {filteredProperties.map((property) => (
              <div key={property.id} className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-xl transition-shadow group">
                <div className="relative h-56 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-8xl">
                  {property.image}
                  {property.featured && (
                    <span className="absolute top-4 left-4 px-3 py-1 bg-primary-600 text-white text-sm font-medium rounded-full">
                      Featured
                    </span>
                  )}
                  <button
                    onClick={() => toggleFavorite(property.id)}
                    className="absolute top-4 right-4 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-red-50 transition-colors"
                  >
                    <Heart className={`w-5 h-5 ${favorites.includes(property.id) ? "text-red-500 fill-current" : "text-gray-400"}`} />
                  </button>
                </div>
                <div className="p-6">
                  <div className="flex gap-2 mb-3">
                    {property.tags.map((tag) => (
                      <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
                    {property.title}
                  </h3>
                  <div className="flex items-center gap-2 text-gray-500 mb-4">
                    <MapPin className="w-4 h-4" />
                    <span>{property.location}</span>
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Bed className="w-4 h-4" />
                        {property.beds}
                      </span>
                      <span className="flex items-center gap-1">
                        <Bath className="w-4 h-4" />
                        {property.baths}
                      </span>
                      <span className="flex items-center gap-1">
                        <Square className="w-4 h-4" />
                        {property.sqft.toLocaleString()} sqft
                      </span>
                    </div>
                    <span className="text-2xl font-bold text-primary-600">{formatPrice(property.price)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredProperties.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No properties found matching your criteria.</p>
            </div>
          )}
        </div>
      </section>

      <section className="section-padding bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Top Agents</h2>
            <p className="text-gray-600">Expert guidance for your real estate journey</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {agents.map((agent) => (
              <div key={agent.id} className="bg-white border border-gray-200 rounded-xl p-6 text-center hover:shadow-lg transition-shadow">
                <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center text-2xl font-bold text-primary-600 mx-auto mb-4">
                  {agent.image}
                </div>
                <h3 className="font-bold text-gray-900 mb-1">{agent.name}</h3>
                <p className="text-sm text-primary-600 mb-3">{agent.title}</p>
                <div className="flex items-center justify-center gap-1 mb-4">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="font-medium text-gray-900">{agent.rating}</span>
                  <span className="text-gray-500 text-sm">({agent.reviews} reviews)</span>
                </div>
                <div className="text-sm text-gray-500 mb-4">
                  <span className="font-medium text-gray-900">{agent.sales}</span> properties sold
                </div>
                <div className="flex justify-center gap-2">
                  <button className="p-2 bg-primary-50 text-primary-600 rounded-lg hover:bg-primary-100">
                    <Phone className="w-4 h-4" />
                  </button>
                  <button className="p-2 bg-primary-50 text-primary-600 rounded-lg hover:bg-primary-100">
                    <Mail className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-primary-600">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Find Your Perfect Home?</h2>
          <p className="text-primary-100 text-lg mb-8">Let our expert agents guide you through the journey</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/contact" className="px-8 py-3 bg-white text-primary-600 font-medium rounded-lg hover:bg-gray-100">
              Schedule a Consultation
            </Link>
            <Link href="/agents" className="px-8 py-3 border-2 border-white text-white font-medium rounded-lg hover:bg-white/10">
              Meet Our Agents
            </Link>
          </div>
        </div>
      </section>

      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                  <Home className="w-5 h-5 text-white" />
                </div>
                <span className="text-white font-bold text-xl">LarkHomes</span>
              </div>
              <p className="text-sm">Luxury real estate for discerning buyers worldwide.</p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Properties</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/listings" className="hover:text-white">Buy</Link></li>
                <li><Link href="/rent" className="hover:text-white">Rent</Link></li>
                <li><Link href="/new-developments" className="hover:text-white">New Developments</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/mortgage" className="hover:text-white">Mortgage Calculator</Link></li>
                <li><Link href="/blog" className="hover:text-white">Real Estate Blog</Link></li>
                <li><Link href="/market-reports" className="hover:text-white">Market Reports</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/contact" className="hover:text-white">Contact Us</Link></li>
                <li><Link href="/careers" className="hover:text-white">Careers</Link></li>
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
