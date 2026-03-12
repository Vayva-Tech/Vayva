"use client";

import { TreeDeciduous, ArrowLeft, Heart, Truck, Users, Hammer } from "lucide-react";
import Link from "next/link";

const values = [
  { icon: Heart, title: "Handcrafted Quality", description: "Each piece made with care and precision" },
  { icon: Truck, title: "White Glove Delivery", description: "Careful handling of your heirloom furniture" },
  { icon: Users, title: "Design Experts", description: "Guidance from furniture specialists" },
  { icon: Hammer, title: "Custom Work", description: "Bespoke pieces made to order" },
];

const stats = [
  { value: "50K+", label: "Customers" },
  { value: "1000+", label: "Unique Pieces" },
  { value: "25+", label: "Years" },
  { value: "4.9★", label: "Rating" },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-amber-50">
      {/* Navigation */}
      <nav className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-amber-800 rounded-lg flex items-center justify-center">
                <TreeDeciduous className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">VintageWoods</span>
            </Link>
            <Link href="/" className="text-gray-600 hover:text-gray-900 flex items-center gap-1">
              <ArrowLeft className="w-4 h-4" />
              Back
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="bg-gradient-to-br from-amber-800 to-yellow-900 py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">Timeless Craftsmanship</h1>
          <p className="text-xl text-amber-100 leading-relaxed">
            VintageWoods creates heirloom-quality furniture and decor that brings 
            warmth and character to your home for generations to come.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-4xl font-bold text-amber-800 mb-2">{stat.value}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Why VintageWoods</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value) => (
              <div key={value.title} className="text-center">
                <div className="w-16 h-16 bg-amber-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <value.icon className="w-8 h-8 text-amber-800" />
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
              VintageWoods began in 1999 as a small woodworking shop in Nashville. Our 
              founder, a third-generation furniture maker, believed that quality craftsmanship 
              should be accessible to everyone who values lasting beauty.
            </p>
            <p className="mb-4">
              Today, we&apos;ve grown into a destination for those who appreciate the warmth 
              and character of well-made wood furniture. Each piece is crafted by skilled 
              artisans using traditional techniques passed down through generations.
            </p>
            <p>
              From rustic farmhouse tables to elegant bedroom sets, we create furniture 
              that becomes part of your family&apos;s story. We invite you to discover pieces 
              that will be cherished for years to come.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-400 text-sm">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-8 h-8 bg-amber-800 rounded-lg flex items-center justify-center">
              <TreeDeciduous className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">VintageWoods</span>
          </div>
          <p>© 2024 VintageWoods. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
