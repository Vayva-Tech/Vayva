"use client";

import { Heart, ArrowLeft, Leaf, Truck, Users, Award } from "lucide-react";
import Link from "next/link";

const values = [
  { icon: Leaf, title: "Natural Products", description: "Organic, clean ingredients you can trust" },
  { icon: Truck, title: "Fast Delivery", description: "Free shipping on wellness orders over $50" },
  { icon: Users, title: "Expert Guidance", description: "Wellness advisors to help you on your journey" },
  { icon: Award, title: "Certified Quality", description: "Third-party tested for purity and potency" },
];

const stats = [
  { value: "100K+", label: "Wellness Seekers" },
  { value: "500+", label: "Products" },
  { value: "50+", label: "Expert Advisors" },
  { value: "4.9★", label: "Rating" },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-teal-500 rounded-lg flex items-center justify-center">
                <Heart className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">Wellness</span>
            </Link>
            <Link href="/" className="text-gray-600 hover:text-gray-900 flex items-center gap-1">
              <ArrowLeft className="w-4 h-4" />
              Back
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="bg-gradient-to-br from-teal-500 to-cyan-600 py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">Your Wellness Journey</h1>
          <p className="text-xl text-teal-100 leading-relaxed">
            We believe wellness is a journey, not a destination. Our mission is to provide 
            you with the tools, products, and guidance to live your healthiest life.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-4xl font-bold text-teal-600 mb-2">{stat.value}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Why Wellness</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value) => (
              <div key={value.title} className="text-center">
                <div className="w-16 h-16 bg-teal-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <value.icon className="w-8 h-8 text-teal-600" />
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
              Wellness was founded in 2016 by a team of nutritionists, fitness experts, and 
              wellness advocates who saw a need for trustworthy, high-quality wellness products. 
              We were tired of confusing labels and questionable ingredients.
            </p>
            <p className="mb-4">
              Today, we&apos;ve helped over 100,000 people on their wellness journeys. Every product 
              in our store is carefully vetted by our team of experts, and we provide personalized 
              guidance to help you find what works for your unique needs.
            </p>
            <p>
              Whether you&apos;re just starting out or deep into your wellness journey, 
              we&apos;re here to support you every step of the way.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-8 h-8 bg-teal-500 rounded-lg flex items-center justify-center">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold">Wellness</span>
          </div>
          <p className="text-gray-400 text-sm">
            © 2024 Wellness. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
