"use client";

import { Building2, MapPin, Star, Users, ArrowRight, Globe, Award, TrendingUp, Phone, Mail } from "lucide-react";
import Link from "next/link";

const stats = [
  { value: "50K+", label: "Verified Suppliers" },
  { value: "200K+", label: "Active Buyers" },
  { value: "$2B+", label: "Annual Trade Volume" },
  { value: "150+", label: "Countries Served" },
];

const values = [
  {
    title: "Trust & Transparency",
    description: "Every supplier is thoroughly vetted. We verify business licenses, inspect facilities, and ensure quality standards.",
    icon: "🤝",
  },
  {
    title: "Global Reach",
    description: "Connect with manufacturers and wholesalers from 150+ countries. Find the perfect supplier for your needs.",
    icon: "🌍",
  },
  {
    title: "Secure Trading",
    description: "Our Trade Assurance program protects your payments and ensures you receive exactly what you ordered.",
    icon: "🛡️",
  },
];

const team = [
  { name: "David Chen", role: "CEO & Founder", image: "👨‍💼" },
  { name: "Sarah Williams", role: "Chief Operations Officer", image: "👩‍💼" },
  { name: "Michael Park", role: "Head of Global Sourcing", image: "👨‍💻" },
  { name: "Emily Rodriguez", role: "Chief Technology Officer", image: "👩‍💻" },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">TradeHub</span>
            </Link>
            <div className="hidden md:flex items-center gap-8">
              <Link href="/suppliers" className="text-gray-600 hover:text-gray-900">Find Suppliers</Link>
              <Link href="/products" className="text-gray-600 hover:text-gray-900">Products</Link>
              <Link href="/about" className="text-blue-600 font-medium">About</Link>
              <Link href="/contact" className="text-gray-600 hover:text-gray-900">Contact</Link>
            </div>
            <Link href="/signup" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-600 to-indigo-700 py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Connecting Businesses Worldwide
          </h1>
          <p className="text-xl text-blue-100 mb-8">
            TradeHub is the world&apos;s leading B2B platform, connecting millions of buyers 
            with verified suppliers across the globe.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 border-y">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-4xl font-bold text-blue-600 mb-2">{stat.value}</p>
                <p className="text-gray-600">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Mission</h2>
              <p className="text-lg text-gray-600 mb-6">
                Founded in 2015, TradeHub set out to solve a fundamental problem in global trade: 
                the difficulty of finding trustworthy suppliers. What started as a small directory 
                has grown into the world&apos;s largest B2B marketplace.
              </p>
              <p className="text-lg text-gray-600 mb-6">
                Today, we empower businesses of all sizes to source products globally with confidence. 
                Our verification process, secure payment systems, and logistics support have 
                facilitated over $2 billion in trade across 150 countries.
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Award className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Industry Recognition</p>
                  <p className="text-gray-500">Top B2B Platform 2023</p>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8">
              <blockquote className="text-xl text-gray-700 italic mb-4">
                &quot;Our goal is to make global trade as easy as shopping online. Every business, 
                regardless of size, deserves access to the world&apos;s best suppliers.&quot;
              </blockquote>
              <p className="text-gray-900 font-medium">— David Chen, Founder & CEO</p>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Values</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              The principles that guide everything we do at TradeHub
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {values.map((value) => (
              <div key={value.title} className="bg-white rounded-xl p-8 shadow-sm">
                <div className="text-4xl mb-4">{value.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{value.title}</h3>
                <p className="text-gray-600">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Leadership Team</h2>
            <p className="text-gray-600">Meet the people behind TradeHub</p>
          </div>
          <div className="grid md:grid-cols-4 gap-8">
            {team.map((member) => (
              <div key={member.name} className="text-center">
                <div className="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center text-5xl mx-auto mb-4">
                  {member.image}
                </div>
                <h3 className="font-semibold text-gray-900">{member.name}</h3>
                <p className="text-gray-500">{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-blue-600 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Grow Your Business?</h2>
          <p className="text-blue-100 mb-8">
            Join thousands of businesses already trading on TradeHub
          </p>
          <Link href="/signup" className="px-8 py-4 bg-white text-blue-600 font-semibold rounded-xl hover:bg-gray-100 inline-flex items-center gap-2">
            Get Started Free
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </div>
  );
}
