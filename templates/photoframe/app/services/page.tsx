"use client";

import { Camera, Clock, CheckCircle, ArrowRight } from "lucide-react";
import Link from "next/link";

const services = [
  {
    id: 1,
    name: "Portrait Session",
    description: "Professional headshots and personal branding photography",
    duration: "1 hour",
    photos: 20,
    price: 299,
    icon: "👤",
    popular: false,
  },
  {
    id: 2,
    name: "Wedding Photography",
    description: "Full day coverage of your special day with all edited photos",
    duration: "8 hours",
    photos: 500,
    price: 2499,
    icon: "💍",
    popular: true,
  },
  {
    id: 3,
    name: "Event Coverage",
    description: "Corporate events, parties, and special occasions",
    duration: "4 hours",
    photos: 200,
    price: 799,
    icon: "🎉",
    popular: false,
  },
  {
    id: 4,
    name: "Product Photography",
    description: "E-commerce and catalog photography for your products",
    duration: "2 hours",
    photos: 30,
    price: 499,
    icon: "📦",
    popular: false,
  },
  {
    id: 5,
    name: "Family Portrait",
    description: "Capture beautiful moments with your loved ones",
    duration: "1.5 hours",
    photos: 40,
    price: 399,
    icon: "👨‍👩‍👧‍👦",
    popular: false,
  },
  {
    id: 6,
    name: "Real Estate Photography",
    description: "High-quality photos for property listings",
    duration: "2 hours",
    photos: 25,
    price: 349,
    icon: "🏠",
    popular: false,
  },
];

export default function ServicesPage() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Navigation */}
      <nav className="bg-gray-800 border-b border-gray-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-pink-500 rounded-lg flex items-center justify-center">
                <Camera className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">PhotoFrame</span>
            </Link>
            <div className="hidden md:flex items-center gap-8">
              <Link href="/galleries" className="text-gray-400 hover:text-white">Galleries</Link>
              <Link href="/services" className="text-pink-500 font-medium">Services</Link>
              <Link href="/booking" className="text-gray-400 hover:text-white">Book Now</Link>
              <Link href="/about" className="text-gray-400 hover:text-white">About</Link>
            </div>
            <Link href="/booking" className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600">
              Book a Shoot
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Photography Services</h1>
          <p className="text-xl text-gray-400 mb-8">
            Professional photography packages tailored to your needs
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 pb-20">
        {/* Services Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service) => (
            <div key={service.id} className="bg-gray-800 rounded-xl overflow-hidden hover:shadow-lg transition-all">
              <div className="h-48 bg-gradient-to-br from-gray-700 to-gray-600 flex items-center justify-center text-6xl">
                {service.icon}
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xl font-semibold">{service.name}</h3>
                  {service.popular && (
                    <span className="px-2 py-1 bg-pink-500 text-white text-xs rounded-full">
                      Popular
                    </span>
                  )}
                </div>
                <p className="text-gray-400 mb-4">{service.description}</p>
                <div className="space-y-2 text-sm text-gray-400 mb-4">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    {service.duration}
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    {service.photos} edited photos
                  </div>
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-gray-700">
                  <span className="text-2xl font-bold text-pink-500">${service.price}</span>
                  <Link href="/booking" className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600">
                    Book Now
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
