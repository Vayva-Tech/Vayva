"use client";

import { Sparkles, Flower2, Droplets, Heart, Clock, ArrowRight, Star, CheckCircle } from "lucide-react";
import Link from "next/link";

const services = [
  {
    id: 1,
    name: "Signature Massage",
    description: "A customized massage combining Swedish and deep tissue techniques",
    duration: "60 min",
    price: 120,
    icon: "💆",
  },
  {
    id: 2,
    name: "Facial Treatment",
    description: "Hydrating facial with premium organic products",
    duration: "75 min",
    price: 150,
    icon: "✨",
  },
  {
    id: 3,
    name: "Aromatherapy",
    description: "Relaxing essential oil treatment for mind and body",
    duration: "90 min",
    price: 180,
    icon: "🌸",
  },
  {
    id: 4,
    name: "Body Wrap",
    description: "Detoxifying body wrap with mineral-rich mud",
    duration: "60 min",
    price: 140,
    icon: "🧖",
  },
];

const packages = [
  {
    name: "Bliss Package",
    includes: ["Signature Massage", "Facial Treatment", "Aromatherapy"],
    price: 399,
    savings: 51,
  },
  {
    name: "Ultimate Relaxation",
    includes: ["All Services + Lunch"],
    price: 599,
    savings: 91,
  },
];

export default function ServicesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 to-pink-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-rose-500 rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">BlissBo</span>
            </Link>
            <div className="hidden md:flex items-center gap-8">
              <Link href="/services" className="text-rose-600 font-medium">Services</Link>
              <Link href="/booking" className="text-gray-600 hover:text-gray-900">Book Now</Link>
              <Link href="/about" className="text-gray-600 hover:text-gray-900">About</Link>
              <Link href="/contact" className="text-gray-600 hover:text-gray-900">Contact</Link>
            </div>
            <Link href="/booking" className="px-4 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600">
              Book Now
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">Our Spa Services</h1>
          <p className="text-xl text-gray-600 mb-8">
            Indulge in our luxurious treatments designed to rejuvenate your body and soul
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 pb-20">
        {/* Services Grid */}
        <section className="mb-20">
          <div className="grid md:grid-cols-2 gap-8">
            {services.map((service) => (
              <div key={service.id} className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-lg transition-all">
                <div className="flex items-start gap-6">
                  <div className="text-5xl">{service.icon}</div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{service.name}</h3>
                    <p className="text-gray-600 mb-4">{service.description}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {service.duration}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-rose-600">${service.price}</span>
                      <Link href="/booking" className="px-6 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600">
                        Book Now
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Packages */}
        <section className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Spa Packages</h2>
            <p className="text-gray-600">Save more with our curated packages</p>
          </div>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {packages.map((pkg) => (
              <div key={pkg.name} className="bg-white rounded-2xl p-8 shadow-sm border-2 border-rose-100">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">{pkg.name}</h3>
                <ul className="space-y-3 mb-6">
                  {pkg.includes.map((item) => (
                    <li key={item} className="flex items-center gap-2 text-gray-600">
                      <CheckCircle className="w-5 h-5 text-rose-500" />
                      {item}
                    </li>
                  ))}
                </ul>
                <div className="flex items-center justify-between pt-6 border-t">
                  <div>
                    <span className="text-3xl font-bold text-rose-600">${pkg.price}</span>
                    <p className="text-sm text-green-600">Save ${pkg.savings}</p>
                  </div>
                  <Link href="/booking" className="px-6 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600">
                    Book Package
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="bg-rose-500 rounded-3xl p-12 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Relax?</h2>
          <p className="text-rose-100 mb-8 max-w-2xl mx-auto">
            Book your appointment today and experience pure bliss
          </p>
          <Link href="/booking" className="inline-flex items-center gap-2 px-8 py-4 bg-white text-rose-500 font-semibold rounded-xl hover:bg-gray-100">
            Book Your Visit
            <ArrowRight className="w-5 h-5" />
          </Link>
        </section>
      </div>
    </div>
  );
}
