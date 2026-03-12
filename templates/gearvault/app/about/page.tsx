"use client";

import { Backpack, ArrowLeft, Compass, Truck, Users, Mountain } from "lucide-react";
import Link from "next/link";

const values = [
  { icon: Compass, title: "Adventure Tested", description: "Gear tested on real expeditions" },
  { icon: Truck, title: "Fast Shipping", description: "Quick delivery for spontaneous trips" },
  { icon: Users, title: "Gear Experts", description: "Advice from experienced adventurers" },
  { icon: Mountain, title: "Premium Selection", description: "Curated gear from top brands" },
];

const stats = [
  { value: "80K+", label: "Adventurers" },
  { value: "2500+", label: "Products" },
  { value: "15+", label: "Years" },
  { value: "4.8★", label: "Rating" },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-stone-100">
      {/* Navigation */}
      <nav className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-stone-700 rounded-lg flex items-center justify-center">
                <Backpack className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">GearVault</span>
            </Link>
            <Link href="/" className="text-gray-600 hover:text-gray-900 flex items-center gap-1">
              <ArrowLeft className="w-4 h-4" />
              Back
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="bg-gradient-to-br from-stone-700 to-stone-800 py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">Gear for Every Adventure</h1>
          <p className="text-xl text-stone-300 leading-relaxed">
            GearVault curates the best outdoor gear for hikers, campers, and adventurers. 
            Quality equipment for your next expedition.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-4xl font-bold text-stone-700 mb-2">{stat.value}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Why GearVault</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value) => (
              <div key={value.title} className="text-center">
                <div className="w-16 h-16 bg-stone-200 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <value.icon className="w-8 h-8 text-stone-700" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{value.title}</h3>
                <p className="text-gray-600 text-sm">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Our Story</h2>
          <div className="prose prose-gray mx-auto text-gray-600">
            <p className="mb-4">
              GearVault was founded in 2009 by a group of backpackers who were frustrated 
              by the overwhelming options and inconsistent quality in outdoor gear. They 
              set out to create a curated selection of only the best equipment.
            </p>
            <p className="mb-4">
              Today, we&apos;ve helped over 80,000 adventurers find the perfect gear for 
              their journeys. Our team tests products in the field and provides honest 
              recommendations based on real experience.
            </p>
            <p>
              Whether you&apos;re planning a weekend hike or a month-long expedition, we&apos;re 
              here to help you find gear that won&apos;t let you down when it matters most.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-400 text-sm">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-8 h-8 bg-stone-700 rounded-lg flex items-center justify-center">
              <Backpack className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">GearVault</span>
          </div>
          <p>© 2024 GearVault. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
