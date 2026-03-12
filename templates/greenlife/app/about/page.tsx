"use client";

import { Leaf, ArrowLeft, Heart, Globe, Users, Award } from "lucide-react";
import Link from "next/link";

const values = [
  { icon: Heart, title: "Sustainability First", description: "Every product we offer is carefully vetted for environmental impact" },
  { icon: Globe, title: "Global Impact", description: "We partner with eco-conscious brands worldwide" },
  { icon: Users, title: "Community Driven", description: "Join a community of people who care about the planet" },
  { icon: Award, title: "Quality Assured", description: "Sustainable doesn't mean sacrificing quality" },
];

const stats = [
  { value: "50K+", label: "Happy Customers" },
  { value: "1000+", label: "Eco Products" },
  { value: "100%", label: "Carbon Neutral Shipping" },
  { value: "1M+", label: "Trees Planted" },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                <Leaf className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">GreenLife</span>
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
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">Our Mission</h1>
          <p className="text-xl text-green-100 leading-relaxed">
            To make sustainable living accessible to everyone. We believe that small changes 
            in our daily choices can create a massive positive impact on our planet.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-gray-50">
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
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Our Values</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value) => (
              <div key={value.title} className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <value.icon className="w-8 h-8 text-green-600" />
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
              GreenLife started in 2019 with a simple idea: make it easy for people to make 
              eco-friendly choices. We noticed that while many people wanted to live more 
              sustainably, finding reliable green products was challenging.
            </p>
            <p className="mb-4">
              Today, we&apos;ve grown into a community of over 50,000 conscious consumers, 
              offering everything from zero-waste household items to sustainable fashion. 
              Every product in our store meets strict environmental standards.
            </p>
            <p>
              We&apos;re committed to transparency, quality, and continuous improvement. 
              Our goal is to prove that sustainable living can be convenient, affordable, 
              and beautiful.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold">GreenLife</span>
          </div>
          <p className="text-gray-400 text-sm">
            © 2024 GreenLife. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
