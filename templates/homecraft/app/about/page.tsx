"use client";

import { Hammer, ArrowLeft, Wrench, Truck, Users, ShieldCheck } from "lucide-react";
import Link from "next/link";

const values = [
  { icon: Wrench, title: "Quality Tools", description: "Professional-grade tools for every project, big or small" },
  { icon: Truck, title: "Fast Shipping", description: "Free delivery on orders over $75 to your home or job site" },
  { icon: Users, title: "Expert Advice", description: "Our team includes experienced contractors and DIYers" },
  { icon: ShieldCheck, title: "Price Match", description: "Found it cheaper? We'll match any competitor's price" },
];

const stats = [
  { value: "100K+", label: "DIY Enthusiasts" },
  { value: "15K+", label: "Products" },
  { value: "4.9★", label: "Rating" },
  { value: "50+", label: "Expert Advisors" },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-amber-600 rounded-lg flex items-center justify-center">
                <Hammer className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">HomeCraft</span>
            </Link>
            <Link href="/" className="text-gray-600 hover:text-gray-900 flex items-center gap-1">
              <ArrowLeft className="w-4 h-4" />
              Back
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="bg-gradient-to-br from-amber-600 to-orange-700 py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">Build It Yourself</h1>
          <p className="text-xl text-amber-100 leading-relaxed">
            We believe everyone should have the tools and knowledge to create something amazing. 
            From first-time DIYers to professional contractors, we're here to help you build.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-4xl font-bold text-amber-600 mb-2">{stat.value}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Why HomeCraft</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value) => (
              <div key={value.title} className="text-center">
                <div className="w-16 h-16 bg-amber-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <value.icon className="w-8 h-8 text-amber-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{value.title}</h3>
                <p className="text-gray-600 text-sm">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Our Story</h2>
          <div className="prose prose-gray mx-auto text-gray-600">
            <p className="mb-4">
              HomeCraft was founded in 2012 by a group of contractors who were tired of making 
              multiple trips to different stores for every project. We started with a simple 
              mission: make DIY and home improvement accessible to everyone.
            </p>
            <p className="mb-4">
              Today, we're a one-stop shop for tools, materials, and expert advice. Our team 
              includes licensed contractors, experienced DIYers, and customer support staff 
              who can help you pick the right tools for any job.
            </p>
            <p>
              Whether you're building a deck, renovating a bathroom, or just hanging a picture, 
              we've got the tools and know-how to help you do it right.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-8 h-8 bg-amber-600 rounded-lg flex items-center justify-center">
              <Hammer className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold">HomeCraft</span>
          </div>
          <p className="text-gray-400 text-sm">
            © 2024 HomeCraft. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
