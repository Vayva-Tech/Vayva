"use client";

import { Beer, ArrowLeft, Award, Truck, Users, Star } from "lucide-react";
import Link from "next/link";

const values = [
  { icon: Award, title: "Craft Quality", description: "Small-batch brewing with premium ingredients" },
  { icon: Truck, title: "Fresh Delivery", description: "Direct from our brewery to your door" },
  { icon: Users, title: "Community", description: "Supporting local breweries and home brewers" },
  { icon: Star, title: "Curated Selection", description: "Hand-picked beers from the best craft breweries" },
];

const stats = [
  { value: "200+", label: "Craft Breweries" },
  { value: "1000+", label: "Unique Beers" },
  { value: "50K+", label: "Happy Customers" },
  { value: "4.8★", label: "Rating" },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-amber-50">
      {/* Navigation */}
      <nav className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-amber-700 rounded-lg flex items-center justify-center">
                <Beer className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">CraftBrew</span>
            </Link>
            <Link href="/" className="text-gray-600 hover:text-gray-900 flex items-center gap-1">
              <ArrowLeft className="w-4 h-4" />
              Back
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="bg-gradient-to-br from-amber-700 to-orange-800 py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">Craft Beer Delivered</h1>
          <p className="text-xl text-amber-100 leading-relaxed">
            We&apos;re on a mission to bring the best craft beers from local breweries 
            straight to your door. Discover your new favorite brew today.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-4xl font-bold text-amber-700 mb-2">{stat.value}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Why CraftBrew</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value) => (
              <div key={value.title} className="text-center">
                <div className="w-16 h-16 bg-amber-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <value.icon className="w-8 h-8 text-amber-700" />
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
              CraftBrew was founded in 2018 by a group of beer enthusiasts who were frustrated 
              by the limited selection at their local liquor stores. We wanted to create a 
              marketplace that celebrates the incredible diversity of American craft brewing.
            </p>
            <p className="mb-4">
              Today, we partner with over 200 craft breweries across the country, offering 
              everything from hazy IPAs to barrel-aged stouts. Our team includes certified 
              cicerones who can help you find the perfect beer for any occasion.
            </p>
            <p>
              Whether you&apos;re a seasoned beer geek or just starting to explore craft brewing, 
              we&apos;re here to help you discover your next favorite pint.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-8 h-8 bg-amber-700 rounded-lg flex items-center justify-center">
              <Beer className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold">CraftBrew</span>
          </div>
          <p className="text-gray-400 text-sm">
            © 2024 CraftBrew. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
