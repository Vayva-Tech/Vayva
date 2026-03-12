"use client";

import { Zap, Server, Globe, Shield, Clock, Users, ArrowRight, CheckCircle, Award, TrendingUp } from "lucide-react";
import Link from "next/link";

const stats = [
  { value: "99.99%", label: "Uptime SLA" },
  { value: "150+", label: "Countries Served" },
  { value: "50K+", label: "Active Customers" },
  { value: "24/7", label: "Expert Support" },
];

const values = [
  {
    title: "Reliability First",
    description: "We build our infrastructure with redundancy at every layer. Your applications stay online, period.",
    icon: "🛡️",
  },
  {
    title: "Performance Obsessed",
    description: "Sub-millisecond response times. Global edge network. We obsess over speed so you don't have to.",
    icon: "⚡",
  },
  {
    title: "Developer Friendly",
    description: "Simple APIs, comprehensive docs, and SDKs in your favorite languages. Deploy in minutes, not days.",
    icon: "👨‍💻",
  },
];

const team = [
  { name: "Alex Rivera", role: "CEO & Co-founder", image: "👨‍💼" },
  { name: "Jordan Chen", role: "CTO & Co-founder", image: "👩‍💻" },
  { name: "Taylor Kim", role: "VP of Engineering", image: "👨‍💻" },
  { name: "Morgan Blake", role: "Head of Customer Success", image: "👩‍💼" },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">CloudHost</span>
            </Link>
            <div className="hidden md:flex items-center gap-8">
              <Link href="/products" className="text-gray-600 hover:text-gray-900">Products</Link>
              <Link href="/pricing" className="text-gray-600 hover:text-gray-900">Pricing</Link>
              <Link href="/about" className="text-blue-600 font-medium">About</Link>
              <Link href="/docs" className="text-gray-600 hover:text-gray-900">Docs</Link>
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
            Building the Future of Cloud Infrastructure
          </h1>
          <p className="text-xl text-blue-100 mb-8">
            Founded in 2018, CloudHost has grown from a small startup to a global cloud platform 
            serving 50,000+ customers across 150 countries.
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
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Story</h2>
              <p className="text-lg text-gray-600 mb-6">
                CloudHost began with a simple mission: make cloud infrastructure accessible to everyone. 
                Our founders, Alex Rivera and Jordan Chen, experienced firsthand the complexity and 
                cost barriers that prevented startups from accessing enterprise-grade infrastructure.
              </p>
              <p className="text-lg text-gray-600 mb-6">
                Today, we&apos;re proud to power everything from individual developer projects to 
                Fortune 500 companies. Our platform handles millions of requests per second 
                with the reliability and performance that modern applications demand.
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Award className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Industry Recognition</p>
                  <p className="text-gray-500">Gartner Magic Quadrant Leader 2024</p>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8">
              <blockquote className="text-xl text-gray-700 italic mb-4">
                &quot;We believe every developer deserves access to world-class infrastructure. 
                Our job is to make the complex simple, so you can focus on what you do best—building.&quot;
              </blockquote>
              <p className="text-gray-900 font-medium">— Alex Rivera, CEO & Co-founder</p>
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
              The principles that guide everything we build at CloudHost
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
            <p className="text-gray-600">Meet the people driving CloudHost forward</p>
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
          <h2 className="text-3xl font-bold mb-4">Ready to Experience CloudHost?</h2>
          <p className="text-blue-100 mb-8">
            Join 50,000+ developers and businesses building on our platform
          </p>
          <Link href="/signup" className="px-8 py-4 bg-white text-blue-600 font-semibold rounded-xl hover:bg-gray-100 inline-flex items-center gap-2">
            Start Free Trial
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </div>
  );
}
