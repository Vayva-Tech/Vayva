"use client";

import { Leaf, ArrowLeft, Sprout, Truck, Users, Sun } from "lucide-react";
import Link from "next/link";

const values = [
  { icon: Sprout, title: "Grow Together", description: "Expert advice for gardeners of all levels" },
  { icon: Truck, title: "Healthy Delivery", description: "Careful shipping for live plants and supplies" },
  { icon: Users, title: "Expert Horticulturists", description: "Advice from certified master gardeners" },
  { icon: Sun, title: "Sustainable Practices", description: "Eco-friendly products and organic options" },
];

const stats = [
  { value: "300K+", label: "Gardeners" },
  { value: "5000+", label: "Plant Varieties" },
  { value: "40+", label: "Garden Experts" },
  { value: "4.8★", label: "Rating" },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-green-50">
      {/* Navigation */}
      <nav className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                <Leaf className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">Gardenia</span>
            </Link>
            <Link href="/" className="text-gray-600 hover:text-gray-900 flex items-center gap-1">
              <ArrowLeft className="w-4 h-4" />
              Back
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="bg-gradient-to-br from-green-600 to-emerald-700 py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">Grow Your Paradise</h1>
          <p className="text-xl text-green-100 leading-relaxed">
            Gardenia helps gardeners of all levels create beautiful, thriving gardens. 
            From seeds to tools to expert advice, we&apos;re here for every step of your journey.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-4xl font-bold text-green-600 mb-2">{stat.value}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Why Gardenia</h2>
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
              Gardenia was founded in 2008 by a master gardener who wanted to make quality 
              plants and expert advice accessible to everyone. We started as a small 
              neighborhood nursery and have grown into a beloved destination for gardeners 
              nationwide.
            </p>
            <p className="mb-4">
              Today, we&apos;ve helped over 300,000 gardeners transform their spaces into 
              thriving green oases. Our team includes certified horticulturists who can 
              help you with everything from plant selection to pest management.
            </p>
            <p>
              Whether you&apos;re tending a windowsill herb garden or landscaping a large 
              property, we&apos;re here to help you grow something beautiful.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-400 text-sm">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">Gardenia</span>
          </div>
          <p>© 2024 Gardenia. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
