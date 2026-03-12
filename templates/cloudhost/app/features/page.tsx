"use client";

import { Zap, Shield, Globe, Server, Clock, Headphones, ArrowRight, CheckCircle } from "lucide-react";
import Link from "next/link";

const features = [
  {
    icon: Zap,
    title: "Lightning Fast SSD Storage",
    description: "All plans include NVMe SSD storage for up to 10x faster performance than traditional drives.",
    color: "blue",
  },
  {
    icon: Shield,
    title: "Enterprise Security",
    description: "Free SSL certificates, DDoS protection, and automatic malware scanning keep your site safe.",
    color: "green",
  },
  {
    icon: Globe,
    title: "Global CDN Network",
    description: "Content delivered from 200+ locations worldwide for ultra-low latency.",
    color: "purple",
  },
  {
    icon: Server,
    title: "99.9% Uptime Guarantee",
    description: "Redundant infrastructure ensures your website stays online, always.",
    color: "orange",
  },
  {
    icon: Clock,
    title: "Automated Daily Backups",
    description: "Rest easy knowing your data is backed up daily with 30-day retention.",
    color: "pink",
  },
  {
    icon: Headphones,
    title: "24/7 Expert Support",
    description: "Our support team is always available via chat, email, or phone.",
    color: "indigo",
  },
];

const plans = [
  { name: "Starter", price: "$4.99", features: ["1 Website", "10GB SSD Storage", "100GB Bandwidth", "Free SSL"] },
  { name: "Business", price: "$9.99", features: ["10 Websites", "50GB SSD Storage", "Unlimited Bandwidth", "Free SSL + CDN", "Daily Backups"] },
  { name: "Pro", price: "$19.99", features: ["Unlimited Websites", "200GB SSD Storage", "Unlimited Bandwidth", "Free SSL + CDN", "Hourly Backups", "Priority Support"] },
];

export default function FeaturesPage() {
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
              <Link href="/features" className="text-blue-600 font-medium">Features</Link>
              <Link href="/pricing" className="text-gray-600 hover:text-gray-900">Pricing</Link>
              <Link href="/about" className="text-gray-600 hover:text-gray-900">About</Link>
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
            Everything You Need to Host Online
          </h1>
          <p className="text-xl text-blue-100 mb-8">
            Powerful features designed for developers, businesses, and everyone in between
          </p>
          <Link href="/pricing" className="px-8 py-4 bg-white text-blue-600 font-semibold rounded-xl hover:bg-gray-100 inline-flex items-center gap-2">
            See Plans & Pricing
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature) => (
              <div key={feature.title} className="bg-gray-50 rounded-xl p-8 hover:bg-gray-100 transition-colors">
                <div className={`w-12 h-12 bg-${feature.color}-100 rounded-lg flex items-center justify-center mb-4`}>
                  <feature.icon className={`w-6 h-6 text-${feature.color}-600`} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Compare Plans</h2>
            <p className="text-gray-600">Choose the perfect plan for your needs</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {plans.map((plan) => (
              <div key={plan.name} className="bg-white rounded-xl p-8 border-2 border-transparent hover:border-blue-500 transition-colors">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <p className="text-3xl font-bold text-blue-600 mb-6">{plan.price}<span className="text-sm text-gray-400">/mo</span></p>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-gray-600">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <button className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  Choose Plan
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-blue-600 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-blue-100 mb-8">Join 50,000+ websites already hosting with CloudHost</p>
          <Link href="/signup" className="px-8 py-4 bg-white text-blue-600 font-semibold rounded-xl hover:bg-gray-100 inline-flex items-center gap-2">
            Start Free Trial
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold">CloudHost</span>
          </div>
          <p className="text-gray-400 text-sm">
            © 2024 CloudHost. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
