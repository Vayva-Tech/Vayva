"use client";

import { MapPin, Phone, Mail, Star, Award, TrendingUp, Home, Search, Filter } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const agents = [
  {
    id: 1,
    name: "Sarah Mitchell",
    title: "Luxury Real Estate Specialist",
    location: "Beverly Hills, CA",
    phone: "+1 (555) 234-5678",
    email: "sarah@larkhomes.com",
    sales: 127,
    rating: 5.0,
    reviews: 89,
    experience: "12 years",
    specialties: ["Luxury Homes", "Waterfront", "Estates"],
    image: "👩‍💼",
    featured: true,
  },
  {
    id: 2,
    name: "Michael Chen",
    title: "Commercial & Investment Properties",
    location: "Manhattan, NY",
    phone: "+1 (555) 345-6789",
    email: "michael@larkhomes.com",
    sales: 203,
    rating: 4.9,
    reviews: 156,
    experience: "15 years",
    specialties: ["Commercial", "Investment", "Multi-Family"],
    image: "👨‍💼",
    featured: true,
  },
  {
    id: 3,
    name: "Emily Rodriguez",
    title: "First-Time Buyer Specialist",
    location: "Austin, TX",
    phone: "+1 (555) 456-7890",
    email: "emily@larkhomes.com",
    sales: 94,
    rating: 4.8,
    reviews: 67,
    experience: "8 years",
    specialties: ["First-Time Buyers", "Condos", "Starter Homes"],
    image: "👩‍💼",
    featured: false,
  },
  {
    id: 4,
    name: "James Thompson",
    title: "Mountain & Vacation Properties",
    location: "Aspen, CO",
    phone: "+1 (555) 567-8901",
    email: "james@larkhomes.com",
    sales: 78,
    rating: 4.9,
    reviews: 54,
    experience: "10 years",
    specialties: ["Ski Properties", "Vacation Homes", "Luxury Cabins"],
    image: "👨‍💼",
    featured: false,
  },
  {
    id: 5,
    name: "Lisa Park",
    title: "Coastal Property Expert",
    location: "Miami Beach, FL",
    phone: "+1 (555) 678-9012",
    email: "lisa@larkhomes.com",
    sales: 156,
    rating: 4.9,
    reviews: 112,
    experience: "14 years",
    specialties: ["Beachfront", "Condos", "Waterfront"],
    image: "👩‍💼",
    featured: true,
  },
  {
    id: 6,
    name: "David Kim",
    title: "New Development Specialist",
    location: "San Francisco, CA",
    phone: "+1 (555) 789-0123",
    email: "david@larkhomes.com",
    sales: 134,
    rating: 4.8,
    reviews: 98,
    experience: "11 years",
    specialties: ["New Construction", "Pre-Construction", "Condos"],
    image: "👨‍💼",
    featured: false,
  },
];

const locations = ["All Locations", "Beverly Hills, CA", "Manhattan, NY", "Austin, TX", "Aspen, CO", "Miami Beach, FL", "San Francisco, CA"];
const specialties = ["All Specialties", "Luxury Homes", "Commercial", "First-Time Buyers", "Vacation Homes", "Waterfront", "New Construction"];

export default function AgentsPage() {
  const [selectedLocation, setSelectedLocation] = useState("All Locations");
  const [selectedSpecialty, setSelectedSpecialty] = useState("All Specialties");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredAgents = agents.filter((agent) => {
    const matchesLocation = selectedLocation === "All Locations" || agent.location === selectedLocation;
    const matchesSpecialty = selectedSpecialty === "All Specialties" || agent.specialties.includes(selectedSpecialty);
    const matchesSearch = agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         agent.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesLocation && matchesSpecialty && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                <MapPin className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">LarkHomes</span>
            </Link>
            <div className="hidden md:flex items-center gap-8">
              <Link href="/properties" className="text-gray-600 hover:text-gray-900">Properties</Link>
              <Link href="/agents" className="text-indigo-600 font-medium">Agents</Link>
              <Link href="/about" className="text-gray-600 hover:text-gray-900">About</Link>
              <Link href="/contact" className="text-gray-600 hover:text-gray-900">Contact</Link>
            </div>
            <Link href="/auth/login" className="px-4 py-2 text-gray-600 hover:text-gray-900">Sign In</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <div className="bg-gradient-to-r from-indigo-900 to-purple-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-4">Meet Our Expert Agents</h1>
          <p className="text-xl text-indigo-200 max-w-2xl mx-auto">
            Our team of experienced real estate professionals is here to help you find your perfect property
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search agents..."
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:border-indigo-600"
              />
            </div>
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="px-4 py-2 border rounded-lg focus:outline-none focus:border-indigo-600"
            >
              {locations.map((loc) => (
                <option key={loc} value={loc}>{loc}</option>
              ))}
            </select>
            <select
              value={selectedSpecialty}
              onChange={(e) => setSelectedSpecialty(e.target.value)}
              className="px-4 py-2 border rounded-lg focus:outline-none focus:border-indigo-600"
            >
              {specialties.map((spec) => (
                <option key={spec} value={spec}>{spec}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Featured Agents */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAgents.map((agent) => (
            <div key={agent.id} className="bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-lg transition-shadow">
              <div className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center text-4xl shrink-0">
                    {agent.image}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-lg">{agent.name}</h3>
                      {agent.featured && (
                        <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
                          ⭐ Featured
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 mb-2">{agent.title}</p>
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <MapPin className="w-4 h-4" />
                      {agent.location}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mt-6 py-4 border-y">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-amber-500">
                      <Star className="w-4 h-4 fill-current" />
                      <span className="font-bold">{agent.rating}</span>
                    </div>
                    <p className="text-xs text-gray-500">{agent.reviews} reviews</p>
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-lg">{agent.sales}</p>
                    <p className="text-xs text-gray-500">Sales</p>
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-lg">{agent.experience}</p>
                    <p className="text-xs text-gray-500">Experience</p>
                  </div>
                </div>

                <div className="mt-4">
                  <p className="text-sm text-gray-500 mb-2">Specialties:</p>
                  <div className="flex flex-wrap gap-2">
                    {agent.specialties.map((spec) => (
                      <span key={spec} className="px-2 py-1 bg-indigo-50 text-indigo-700 text-xs rounded-full">
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-6 space-y-2">
                  <button className="w-full py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700">
                    Contact Agent
                  </button>
                  <div className="flex gap-2">
                    <a
                      href={`tel:${agent.phone}`}
                      className="flex-1 py-2 border border-gray-300 text-gray-700 rounded-lg text-center hover:bg-gray-50 flex items-center justify-center gap-2"
                    >
                      <Phone className="w-4 h-4" />
                      Call
                    </a>
                    <a
                      href={`mailto:${agent.email}`}
                      className="flex-1 py-2 border border-gray-300 text-gray-700 rounded-lg text-center hover:bg-gray-50 flex items-center justify-center gap-2"
                    >
                      <Mail className="w-4 h-4" />
                      Email
                    </a>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredAgents.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No agents found matching your criteria.</p>
          </div>
        )}
      </div>

      {/* Why Work With Us */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Why Work With Our Agents?</h2>
            <p className="text-gray-600">Expert guidance every step of the way</p>
          </div>
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="w-8 h-8 text-indigo-600" />
              </div>
              <h3 className="font-semibold mb-2">Top Rated</h3>
              <p className="text-sm text-gray-600">Average 4.9 star rating across all agents</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-indigo-600" />
              </div>
              <h3 className="font-semibold mb-2">Proven Results</h3>
              <p className="text-sm text-gray-600">Over 10,000 successful transactions</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Home className="w-8 h-8 text-indigo-600" />
              </div>
              <h3 className="font-semibold mb-2">Local Experts</h3>
              <p className="text-sm text-gray-600">Deep knowledge of local markets</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-8 h-8 text-indigo-600" />
              </div>
              <h3 className="font-semibold mb-2">Nationwide</h3>
              <p className="text-sm text-gray-600">Coverage in all major US markets</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="bg-indigo-900 py-16">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-3xl font-bold text-white mb-4">Become a LarkHomes Agent</h2>
          <p className="text-indigo-200 mb-8">
            Join our network of successful real estate professionals and grow your business
          </p>
          <button className="px-8 py-4 bg-white text-indigo-900 font-semibold rounded-xl hover:bg-indigo-50">
            Apply Now
          </button>
        </div>
      </div>
    </div>
  );
}
