"use client";

import { Scissors, ArrowLeft, Heart, Truck, Users, Sparkles } from "lucide-react";
import Link from "next/link";

const values = [
  { icon: Heart, title: "Made with Love", description: "Supplies for handmade creations" },
  { icon: Truck, title: "Quick Shipping", description: "Get your supplies fast for projects" },
  { icon: Users, title: "Creative Community", description: "Join fellow crafters and share ideas" },
  { icon: Sparkles, title: "Quality Materials", description: "Premium crafting supplies" },
];

const stats = [
  { value: "120K+", label: "Crafters" },
  { value: "8000+", label: "Products" },
  { value: "12+", label: "Years" },
  { value: "4.9★", label: "Rating" },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-rose-50">
      {/* Navigation */}
      <nav className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-rose-500 rounded-lg flex items-center justify-center">
                <Scissors className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">CraftCorner</span>
            </Link>
            <Link href="/" className="text-gray-600 hover:text-gray-900 flex items-center gap-1">
              <ArrowLeft className="w-4 h-4" />
              Back
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="bg-gradient-to-br from-rose-500 to-pink-600 py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">Create Something Beautiful</h1>
          <p className="text-xl text-rose-100 leading-relaxed">
            CraftCorner is your creative haven for all things handmade. From knitting 
            to jewelry making, we have the supplies and inspiration for your next project.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-4xl font-bold text-rose-500 mb-2">{stat.value}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Why CraftCorner</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value) => (
              <div key={value.title} className="text-center">
                <div className="w-16 h-16 bg-rose-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <value.icon className="w-8 h-8 text-rose-600" />
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
              CraftCorner began in 2012 when a group of friends who loved knitting and 
              crochet couldn&apos;t find quality yarn at reasonable prices. They started 
              selling yarn online and the community grew rapidly.
            </p>
            <p className="mb-4">
              Today, we&apos;re a creative hub for all types of crafters with over 120,000 
              members in our community. We offer supplies for knitting, crochet, paper 
              crafts, jewelry making, painting, and more.
            </p>
            <p>
              Whether you&apos;re a beginner looking to learn or an experienced crafter 
              seeking new inspiration, CraftCorner is here to help you create something 
              beautiful with your own two hands.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-400 text-sm">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-8 h-8 bg-rose-500 rounded-lg flex items-center justify-center">
              <Scissors className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">CraftCorner</span>
          </div>
          <p>© 2024 CraftCorner. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
