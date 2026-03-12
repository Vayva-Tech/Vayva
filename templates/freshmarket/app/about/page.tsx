"use client";

import { Apple, ArrowLeft, Leaf, Truck, Users, Award } from "lucide-react";
import Link from "next/link";

const values = [
  { icon: Leaf, title: "Farm Fresh", description: "Direct from local farms to your table within 24 hours" },
  { icon: Truck, title: "Fast Delivery", description: "Same-day delivery for orders placed before 2pm" },
  { icon: Users, title: "Community", description: "Supporting over 200 local farmers and producers" },
  { icon: Award, title: "Quality", description: "100% satisfaction guarantee on all products" },
];

const stats = [
  { value: "200+", label: "Local Farms" },
  { value: "50K+", label: "Happy Customers" },
  { value: "10K+", label: "Products" },
  { value: "99%", label: "Fresh Rating" },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-lime-500 rounded-lg flex items-center justify-center">
                <Apple className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">FreshMarket</span>
            </Link>
            <Link href="/" className="text-gray-600 hover:text-gray-900 flex items-center gap-1">
              <ArrowLeft className="w-4 h-4" />
              Back
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="bg-gradient-to-br from-lime-500 to-green-600 py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">Fresh From Farm to Table</h1>
          <p className="text-xl text-lime-100 leading-relaxed">
            We connect local farmers with families who care about where their food comes from. 
            Every purchase supports sustainable agriculture in our community.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-4xl font-bold text-lime-600 mb-2">{stat.value}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Why FreshMarket</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value) => (
              <div key={value.title} className="text-center">
                <div className="w-16 h-16 bg-lime-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <value.icon className="w-8 h-8 text-lime-600" />
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
              FreshMarket started in 2018 when a group of local farmers came together to create 
              a better way to sell their produce. Tired of seeing fresh food travel thousands of 
              miles, we built a marketplace that connects communities with local agriculture.
            </p>
            <p className="mb-4">
              Today, we work with over 200 farms within 100 miles of the city, delivering 
              everything from organic vegetables to artisanal cheeses directly to your door. 
              Our promise is simple: farm-fresh quality, delivered fast.
            </p>
            <p>
              When you shop with FreshMarket, you&apos;re not just buying groceries—you&apos;re 
              supporting local families, sustainable farming practices, and a healthier food system.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-8 h-8 bg-lime-500 rounded-lg flex items-center justify-center">
              <Apple className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold">FreshMarket</span>
          </div>
          <p className="text-gray-400 text-sm">
            © 2024 FreshMarket. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
