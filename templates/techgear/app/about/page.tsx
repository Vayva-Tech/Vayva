"use client";

import { Cpu, ArrowLeft, Zap, Shield, Truck, HeadphonesIcon } from "lucide-react";
import Link from "next/link";

const features = [
  { icon: Zap, title: "Latest Tech", description: "We stock the newest gadgets and electronics as soon as they launch" },
  { icon: Shield, title: "2-Year Warranty", description: "Every product comes with our comprehensive warranty coverage" },
  { icon: Truck, title: "Fast Shipping", description: "Free expedited shipping on orders over $50" },
  { icon: HeadphonesIcon, title: "Expert Support", description: "Our tech specialists are available 24/7 to help you" },
];

const stats = [
  { value: "500K+", label: "Customers" },
  { value: "50K+", label: "Products" },
  { value: "99.8%", label: "Satisfaction" },
  { value: "24/7", label: "Support" },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                <Cpu className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">TechGear</span>
            </Link>
            <Link href="/" className="text-gray-600 hover:text-gray-900 flex items-center gap-1">
              <ArrowLeft className="w-4 h-4" />
              Back
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="bg-gradient-to-br from-purple-600 to-indigo-700 py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">Powering Your Digital Life</h1>
          <p className="text-xl text-purple-100 leading-relaxed">
            TechGear is your one-stop destination for cutting-edge technology. 
            From gaming rigs to smart home devices, we bring you the future today.
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

      {/* Features */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Why Choose TechGear</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature) => (
              <div key={feature.title} className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm">{feature.description}</p>
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
              Founded in 2015 by a group of tech enthusiasts, TechGear began as a small online 
              store selling custom PC components. Today, we&apos;ve grown into one of the leading 
              electronics retailers, serving over 500,000 customers worldwide.
            </p>
            <p className="mb-4">
              Our mission is simple: make cutting-edge technology accessible to everyone. 
              We work directly with manufacturers to bring you the best prices on authentic 
              products, backed by industry-leading support and warranties.
            </p>
            <p>
              Whether you&apos;re a professional creator, a competitive gamer, or just someone 
              who loves great tech, we&apos;re here to help you find exactly what you need.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
              <Cpu className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold">TechGear</span>
          </div>
          <p className="text-gray-400 text-sm">
            © 2024 TechGear. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
