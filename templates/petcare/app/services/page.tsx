"use client";

import { PawPrint, Heart, Scissors, Stethoscope, Calendar, MapPin, Phone, Star, Search, Filter, Check } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const services = [
  { name: "Grooming", icon: "✂️", description: "Professional pet grooming services", price: "From $45" },
  { name: "Veterinary", icon: "🩺", description: "Complete health checkups & care", price: "From $75" },
  { name: "Daycare", icon: "🏠", description: "Safe and fun daycare facility", price: "From $35/day" },
  { name: "Training", icon: "🎾", description: "Obedience and behavior training", price: "From $60/session" },
  { name: "Boarding", icon: "🛏️", description: "Overnight care while you're away", price: "From $50/night" },
  { name: "Walking", icon: "🦮", description: "Daily walks and exercise", price: "From $25/walk" },
];

const providers = [
  {
    id: 1,
    name: "Happy Tails Grooming",
    service: "Grooming",
    rating: 4.9,
    reviews: 234,
    location: "Downtown",
    phone: "(555) 123-4567",
    image: "🐕",
  },
  {
    id: 2,
    name: "PetCare Plus",
    service: "Veterinary",
    rating: 4.8,
    reviews: 189,
    location: "Westside",
    phone: "(555) 234-5678",
    image: "🐈",
  },
  {
    id: 3,
    name: "Furry Friends Daycare",
    service: "Daycare",
    rating: 4.9,
    reviews: 156,
    location: "Eastside",
    phone: "(555) 345-6789",
    image: "🐕‍🦺",
  },
  {
    id: 4,
    name: "Paws & Relax Spa",
    service: "Grooming",
    rating: 4.7,
    reviews: 203,
    location: "North Hills",
    phone: "(555) 456-7890",
    image: "🐩",
  },
];

export default function ServicesPage() {
  const [selectedService, setSelectedService] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredProviders = providers.filter((provider) => {
    const matchesService = selectedService === "All" || provider.service === selectedService;
    const matchesSearch = provider.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         provider.location.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesService && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                <PawPrint className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">PetCare</span>
            </Link>
            <div className="hidden md:flex items-center gap-8">
              <Link href="/services" className="text-orange-600 font-medium">Services</Link>
              <Link href="/booking" className="text-gray-600 hover:text-gray-900">Book Now</Link>
              <Link href="/shop" className="text-gray-600 hover:text-gray-900">Shop</Link>
              <Link href="/about" className="text-gray-600 hover:text-gray-900">About</Link>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/login" className="text-gray-600 hover:text-gray-900">Sign In</Link>
              <Link href="/booking" className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600">
                Book Service
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="bg-gradient-to-br from-orange-500 to-amber-600 py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold text-white mb-4">Pet Services</h1>
          <p className="text-xl text-orange-100 mb-8">
            Professional care for your furry friends
          </p>
          <div className="flex gap-4 max-w-xl mx-auto">
            <input
              type="text"
              placeholder="Search services or providers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 px-4 py-3 rounded-lg text-gray-900 focus:outline-none"
            />
            <button className="px-6 py-3 bg-orange-700 text-white font-semibold rounded-lg hover:bg-orange-800">
              Search
            </button>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Service Categories */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Our Services</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => (
              <div
                key={service.name}
                onClick={() => setSelectedService(service.name)}
                className={`p-6 rounded-xl border cursor-pointer transition-all ${
                  selectedService === service.name
                    ? "border-orange-500 bg-orange-50"
                    : "border-gray-200 hover:border-orange-300"
                }`}
              >
                <div className="text-4xl mb-4">{service.icon}</div>
                <h3 className="font-semibold text-lg text-gray-900 mb-2">{service.name}</h3>
                <p className="text-gray-600 mb-3">{service.description}</p>
                <p className="text-orange-600 font-medium">{service.price}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Service Providers */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Service Providers</h2>
            <button
              onClick={() => setSelectedService("All")}
              className="text-orange-600 hover:underline"
            >
              View All
            </button>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredProviders.map((provider) => (
              <div key={provider.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all">
                <div className="h-48 bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center text-6xl">
                  {provider.image}
                </div>
                <div className="p-5">
                  <span className="inline-block px-3 py-1 bg-orange-100 text-orange-700 text-xs font-medium rounded-full mb-2">
                    {provider.service}
                  </span>
                  <h3 className="font-semibold text-lg text-gray-900 mb-1">{provider.name}</h3>
                  <div className="flex items-center gap-2 mb-3">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="font-medium">{provider.rating}</span>
                    <span className="text-gray-500 text-sm">({provider.reviews} reviews)</span>
                  </div>
                  <div className="flex items-center gap-1 text-gray-500 text-sm mb-2">
                    <MapPin className="w-4 h-4" />
                    {provider.location}
                  </div>
                  <div className="flex items-center gap-1 text-gray-500 text-sm mb-4">
                    <Phone className="w-4 h-4" />
                    {provider.phone}
                  </div>
                  <button className="w-full py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600">
                    Book Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
