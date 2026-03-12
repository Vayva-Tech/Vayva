"use client";

import { Bed, Bath, Square, MapPin, Heart, Share2, Phone, Mail, Calendar, Home, Car, Thermometer, Check, ArrowLeft, Image as ImageIcon } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const property = {
  id: 1,
  title: "Modern Villa with Pool",
  location: "Beverly Hills, CA 90210",
  price: "$2,450,000",
  pricePerSqft: "$583",
  beds: 5,
  baths: 4,
  sqft: 4200,
  lotSize: "0.5 acres",
  yearBuilt: 2018,
  type: "Single Family Home",
  description: "Stunning modern villa featuring an open floor plan with floor-to-ceiling windows, gourmet kitchen with Viking appliances, master suite with spa-like bathroom, and a resort-style backyard with infinity pool and outdoor kitchen. Smart home technology throughout.",
  features: [
    "Infinity Pool",
    "Smart Home System",
    "Wine Cellar",
    "Home Theater",
    "3-Car Garage",
    "Solar Panels",
    "Outdoor Kitchen",
    "Fire Pit",
  ],
  images: ["🏠", "🏡", "🌴", "🏊", "🍳", "🛋️"],
  agent: {
    name: "Sarah Mitchell",
    title: "Luxury Real Estate Specialist",
    phone: "+1 (555) 234-5678",
    email: "sarah@larkhomes.com",
    sales: 127,
    rating: 5.0,
  },
};

export default function PropertyDetailPage({ params }: { params: { id: string } }) {
  const [activeImage, setActiveImage] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                <MapPin className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">LarkHomes</span>
            </Link>
            <Link href="/properties" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
              <ArrowLeft className="w-4 h-4" />
              Back to Listings
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{property.title}</h1>
            <div className="flex items-center gap-2 text-gray-600">
              <MapPin className="w-4 h-4" />
              {property.location}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsFavorite(!isFavorite)}
              className={`p-3 rounded-full border ${isFavorite ? "bg-red-50 border-red-200" : "hover:bg-gray-50"}`}
            >
              <Heart className={`w-5 h-5 ${isFavorite ? "fill-red-500 text-red-500" : "text-gray-600"}`} />
            </button>
            <button className="p-3 rounded-full border hover:bg-gray-50">
              <Share2 className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Price */}
        <div className="flex items-baseline gap-4 mb-8">
          <span className="text-4xl font-bold text-indigo-600">{property.price}</span>
          <span className="text-gray-500">{property.pricePerSqft}/sqft</span>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Image Gallery */}
            <div className="space-y-4">
              <div className="aspect-video bg-gradient-to-br from-amber-100 to-orange-100 rounded-2xl flex items-center justify-center text-8xl">
                {property.images[activeImage]}
              </div>
              <div className="grid grid-cols-6 gap-2">
                {property.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(idx)}
                    className={`aspect-square bg-gradient-to-br rounded-lg flex items-center justify-center text-2xl ${
                      idx === activeImage
                        ? "from-amber-100 to-orange-100 ring-2 ring-indigo-600"
                        : "from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300"
                    }`}
                  >
                    {img}
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-4 gap-4">
              <div className="bg-white rounded-xl p-4 text-center">
                <Bed className="w-6 h-6 mx-auto mb-2 text-indigo-600" />
                <p className="font-semibold">{property.beds}</p>
                <p className="text-sm text-gray-500">Bedrooms</p>
              </div>
              <div className="bg-white rounded-xl p-4 text-center">
                <Bath className="w-6 h-6 mx-auto mb-2 text-indigo-600" />
                <p className="font-semibold">{property.baths}</p>
                <p className="text-sm text-gray-500">Bathrooms</p>
              </div>
              <div className="bg-white rounded-xl p-4 text-center">
                <Square className="w-6 h-6 mx-auto mb-2 text-indigo-600" />
                <p className="font-semibold">{property.sqft.toLocaleString()}</p>
                <p className="text-sm text-gray-500">Sq Ft</p>
              </div>
              <div className="bg-white rounded-xl p-4 text-center">
                <Home className="w-6 h-6 mx-auto mb-2 text-indigo-600" />
                <p className="font-semibold">{property.yearBuilt}</p>
                <p className="text-sm text-gray-500">Year Built</p>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-2xl p-6">
              <h2 className="text-xl font-bold mb-4">About This Home</h2>
              <p className="text-gray-600 leading-relaxed">{property.description}</p>
            </div>

            {/* Features */}
            <div className="bg-white rounded-2xl p-6">
              <h2 className="text-xl font-bold mb-4">Features & Amenities</h2>
              <div className="grid grid-cols-2 gap-3">
                {property.features.map((feature) => (
                  <div key={feature} className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-green-600" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Additional Details */}
            <div className="bg-white rounded-2xl p-6">
              <h2 className="text-xl font-bold mb-4">Property Details</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-500">Property Type</span>
                  <span className="font-medium">{property.type}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-500">Lot Size</span>
                  <span className="font-medium">{property.lotSize}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-500">Year Built</span>
                  <span className="font-medium">{property.yearBuilt}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-500">Price/Sqft</span>
                  <span className="font-medium">{property.pricePerSqft}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar - Agent & Contact */}
          <div className="lg:sticky lg:top-24 h-fit space-y-6">
            {/* Agent Card */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="text-center mb-4">
                <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-3 flex items-center justify-center text-4xl">
                  👩‍💼
                </div>
                <h3 className="font-bold text-lg">{property.agent.name}</h3>
                <p className="text-sm text-gray-500">{property.agent.title}</p>
                <div className="flex items-center justify-center gap-4 mt-2 text-sm">
                  <span className="flex items-center gap-1">
                    ⭐ {property.agent.rating}
                  </span>
                  <span>{property.agent.sales} sales</span>
                </div>
              </div>
              <div className="space-y-2">
                <button className="w-full py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700">
                  Schedule Tour
                </button>
                <button className="w-full py-3 border border-indigo-600 text-indigo-600 font-semibold rounded-xl hover:bg-indigo-50">
                  Contact Agent
                </button>
              </div>
              <div className="mt-4 pt-4 border-t space-y-2 text-sm">
                <a href={`tel:${property.agent.phone}`} className="flex items-center gap-2 text-gray-600">
                  <Phone className="w-4 h-4" />
                  {property.agent.phone}
                </a>
                <a href={`mailto:${property.agent.email}`} className="flex items-center gap-2 text-gray-600">
                  <Mail className="w-4 h-4" />
                  {property.agent.email}
                </a>
              </div>
            </div>

            {/* Quick Contact Form */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="font-bold mb-4">Interested in this home?</h3>
              <form className="space-y-3">
                <input
                  type="text"
                  placeholder="Your Name"
                  className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:border-indigo-600"
                />
                <input
                  type="email"
                  placeholder="Your Email"
                  className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:border-indigo-600"
                />
                <input
                  type="tel"
                  placeholder="Phone Number"
                  className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:border-indigo-600"
                />
                <textarea
                  placeholder="I'm interested in this property..."
                  rows={3}
                  className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:border-indigo-600 resize-none"
                />
                <button className="w-full py-3 bg-gray-900 text-white font-semibold rounded-xl hover:bg-gray-800">
                  Send Message
                </button>
              </form>
            </div>

            {/* Mortgage Calculator Preview */}
            <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl p-6 text-white">
              <h3 className="font-bold mb-2">Estimated Monthly Payment</h3>
              <p className="text-3xl font-bold mb-4">$11,245/mo</p>
              <p className="text-sm text-indigo-200 mb-4">
                Based on 20% down ($490,000) and 6.5% interest rate
              </p>
              <Link href="/mortgage-calculator" className="block w-full py-3 bg-white text-indigo-600 text-center font-semibold rounded-xl hover:bg-indigo-50">
                Calculate Your Payment
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
