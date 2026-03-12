"use client";

import { PartyPopper, ArrowLeft, Sparkles, Truck, Users, Star } from "lucide-react";
import Link from "next/link";

const values = [
  { icon: Sparkles, title: "Unforgettable Events", description: "Everything you need for memorable celebrations" },
  { icon: Truck, title: "On-Time Delivery", description: "We ensure your supplies arrive before the big day" },
  { icon: Users, title: "Party Experts", description: "Our team helps plan perfect celebrations" },
  { icon: Star, title: "Premium Quality", description: "High-quality decorations and supplies" },
];

const stats = [
  { value: "200K+", label: "Parties" },
  { value: "10K+", label: "Products" },
  { value: "15+", label: "Years" },
  { value: "4.9★", label: "Rating" },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-purple-50">
      {/* Navigation */}
      <nav className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                <PartyPopper className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">PartyPop</span>
            </Link>
            <Link href="/" className="text-gray-600 hover:text-gray-900 flex items-center gap-1">
              <ArrowLeft className="w-4 h-4" />
              Back
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="bg-gradient-to-br from-purple-600 to-pink-500 py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">Make Every Moment Pop</h1>
          <p className="text-xl text-purple-100 leading-relaxed">
            PartyPop is your one-stop shop for unforgettable celebrations. 
            From decorations to tableware, we help you create magical moments.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-4xl font-bold text-purple-600 mb-2">{stat.value}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Why PartyPop</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value) => (
              <div key={value.title} className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <value.icon className="w-8 h-8 text-purple-600" />
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
              PartyPop was founded in 2009 by an event planner who was tired of running 
              to multiple stores to gather party supplies. She envisioned a single destination 
              where hosts could find everything they needed.
            </p>
            <p className="mb-4">
              Today, we&apos;ve helped create over 200,000 celebrations across the country. 
              Our team of party experts curates the best decorations, tableware, and accessories 
              for every occasion imaginable.
            </p>
            <p>
              Whether you&apos;re planning an intimate dinner party or a grand wedding, 
              we&apos;re here to help you create unforgettable memories with the people you love.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-400 text-sm">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
              <PartyPopper className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">PartyPop</span>
          </div>
          <p>© 2024 PartyPop. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
