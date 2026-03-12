"use client";

import { Tent, ArrowLeft, Mountain, Truck, Users, Compass } from "lucide-react";
import Link from "next/link";

const values = [
  { icon: Mountain, title: "Adventure Ready", description: "Gear tested by real outdoor enthusiasts" },
  { icon: Truck, title: "Fast Shipping", description: "Get your gear quickly for spontaneous trips" },
  { icon: Users, title: "Expert Guides", description: "Advice from experienced hikers and campers" },
  { icon: Compass, title: "Trail Tested", description: "Only gear we'd use on our own adventures" },
];

const stats = [
  { value: "200K+", label: "Adventurers" },
  { value: "5000+", label: "Products" },
  { value: "20+", label: "Years Experience" },
  { value: "4.9★", label: "Rating" },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-stone-100">
      {/* Navigation */}
      <nav className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-green-700 rounded-lg flex items-center justify-center">
                <Tent className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">CampOut</span>
            </Link>
            <Link href="/" className="text-gray-600 hover:text-gray-900 flex items-center gap-1">
              <ArrowLeft className="w-4 h-4" />
              Back
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="bg-gradient-to-br from-green-700 to-emerald-800 py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">Gear for the Wild</h1>
          <p className="text-xl text-green-100 leading-relaxed">
            CampOut is your trusted partner for outdoor adventures. 
            We provide the gear you need to explore, discover, and reconnect with nature.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-4xl font-bold text-green-700 mb-2">{stat.value}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Why CampOut</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value) => (
              <div key={value.title} className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <value.icon className="w-8 h-8 text-green-700" />
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
              CampOut was founded in 2004 by a group of friends who loved backpacking 
              but were frustrated by the lack of quality gear at affordable prices. We 
              started with a small shop in Boulder, Colorado, and have grown into a 
              leading outdoor retailer.
            </p>
            <p className="mb-4">
              Today, we've helped over 200,000 adventurers gear up for their journeys. 
              Our team includes experienced hikers, climbers, and campers who test every 
              product we sell and can provide expert advice for any adventure.
            </p>
            <p>
              Whether you're planning a weekend car camping trip or a multi-week 
              backpacking expedition, we're here to help you get outside and explore 
              the world around you.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-400 text-sm">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-8 h-8 bg-green-700 rounded-lg flex items-center justify-center">
              <Tent className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">CampOut</span>
          </div>
          <p>© 2024 CampOut. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
