"use client";

import { Smile, ArrowLeft, Shield, Truck, Users, Heart } from "lucide-react";
import Link from "next/link";

const values = [
  { icon: Shield, title: "Safety First", description: "All products tested and certified safe for children" },
  { icon: Truck, title: "Fast Shipping", description: "Quick delivery for birthdays and special occasions" },
  { icon: Users, title: "Parent Support", description: "Advice from real parents and child development experts" },
  { icon: Heart, title: "Curated Quality", description: "Only the best toys, games, and gear for your kids" },
];

const stats = [
  { value: "200K+", label: "Happy Families" },
  { value: "5K+", label: "Products" },
  { value: "30+", label: "Child Experts" },
  { value: "4.9★", label: "Rating" },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-yellow-50">
      {/* Navigation */}
      <nav className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center">
                <Smile className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">KidSpace</span>
            </Link>
            <Link href="/" className="text-gray-600 hover:text-gray-900 flex items-center gap-1">
              <ArrowLeft className="w-4 h-4" />
              Back
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="bg-gradient-to-br from-yellow-400 to-orange-500 py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">Play, Learn, Grow</h1>
          <p className="text-xl text-yellow-100 leading-relaxed">
            KidSpace is dedicated to helping children learn through play. 
            We curate the best toys, games, and gear for every stage of childhood.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-4xl font-bold text-yellow-500 mb-2">{stat.value}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Why KidSpace</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value) => (
              <div key={value.title} className="text-center">
                <div className="w-16 h-16 bg-yellow-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <value.icon className="w-8 h-8 text-yellow-600" />
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
              KidSpace was founded in 2015 by a mom who was overwhelmed by the toy aisle. 
              She wanted a place where parents could find quality toys that were both fun 
              and educational, with trusted safety ratings.
            </p>
            <p className="mb-4">
              Today, we&apos;ve helped over 200,000 families discover the perfect products for 
              their children. Our team includes child development experts who review every 
              product in our store to ensure it meets our high standards.
            </p>
            <p>
              From newborns to pre-teens, we&apos;re here to help you find toys and gear 
              that will spark imagination, encourage learning, and create lasting memories.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-400 text-sm">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center">
              <Smile className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">KidSpace</span>
          </div>
          <p>© 2024 KidSpace. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
