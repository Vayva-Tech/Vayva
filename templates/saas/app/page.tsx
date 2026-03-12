"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Check, ArrowRight, BarChart3, Shield, Zap, Users, Cloud } from "lucide-react";

const features = [
  { name: "Analytics Dashboard", desc: "Real-time insights", icon: <BarChart3 className="h-6 w-6" /> },
  { name: "Cloud Storage", desc: "Unlimited storage", icon: <Cloud className="h-6 w-6" /> },
  { name: "Team Collaboration", desc: "Work together", icon: <Users className="h-6 w-6" /> },
  { name: "Security", desc: "Enterprise-grade", icon: <Shield className="h-6 w-6" /> },
];

const plans = [
  { name: "Starter", price: 15000, features: ["5 users", "10GB storage", "Basic analytics", "Email support"] },
  { name: "Pro", price: 50000, features: ["25 users", "100GB storage", "Advanced analytics", "Priority support", "API access"], popular: true },
  { name: "Enterprise", price: 150000, features: ["Unlimited users", "Unlimited storage", "Custom analytics", "24/7 support", "SLA guarantee"] },
];

const stats = [
  { value: "50K+", label: "Active Users" },
  { value: "99.9%", label: "Uptime" },
  { value: "150+", label: "Countries" },
  { value: "4.9/5", label: "Rating" },
];

export default function SaaSHome() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b sticky top-0 z-50 bg-white/80 backdrop-blur">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-blue-600">
            CloudFlow
          </Link>
          <nav className="hidden md:flex items-center gap-8">
            <Link href="/features" className="text-gray-600 hover:text-blue-600">Features</Link>
            <Link href="/pricing" className="text-gray-600 hover:text-blue-600">Pricing</Link>
            <Link href="/docs" className="text-gray-600 hover:text-blue-600">Docs</Link>
            <Link href="/blog" className="text-gray-600 hover:text-blue-600">Blog</Link>
          </nav>
          <div className="flex items-center gap-4">
            <Button variant="ghost">Sign In</Button>
            <Button className="bg-blue-600 hover:bg-blue-700">Get Started</Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-50" />
        <div className="container mx-auto px-4 relative">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Build Faster with <span className="text-blue-600">CloudFlow</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              The all-in-one platform for modern teams. Deploy, scale, and manage your applications effortlessly.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                Start Free Trial <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
              <Button size="lg" variant="outline">
                View Demo
              </Button>
            </div>
            <p className="text-sm text-gray-500 mt-4">14-day free trial • No credit card required</p>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y bg-gray-50">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-gray-600">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Everything you need to scale</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((f) => (
              <div key={f.name} className="p-6 rounded-2xl bg-gray-50 hover:bg-blue-50 transition">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 mb-4">
                  {f.icon}
                </div>
                <h3 className="font-semibold text-lg mb-2">{f.name}</h3>
                <p className="text-gray-600">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-4">Simple, transparent pricing</h2>
          <p className="text-gray-600 text-center mb-12">Choose the plan that's right for your team</p>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {plans.map((plan) => (
              <div key={plan.name} className={`rounded-2xl p-8 ${plan.popular ? 'bg-blue-600 text-white' : 'bg-white border'}`}>
                {plan.popular && <span className="text-xs font-medium bg-blue-500 px-3 py-1 rounded-full">Most Popular</span>}
                <h3 className="text-xl font-semibold mt-4">{plan.name}</h3>
                <p className="text-3xl font-bold mt-2">₦{(plan.price / 100).toFixed(0)}<span className="text-sm font-normal opacity-80">/mo</span></p>
                <ul className="space-y-3 mt-6">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2">
                      <Check className={`h-5 w-5 ${plan.popular ? 'text-blue-200' : 'text-green-500'}`} />
                      <span className={plan.popular ? 'text-blue-100' : 'text-gray-600'}>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button className={`w-full mt-8 ${plan.popular ? 'bg-white text-blue-600 hover:bg-gray-100' : 'bg-blue-600 hover:bg-blue-700'}`}>
                  Get Started
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-blue-600">
        <div className="container mx-auto px-4 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to get started?</h2>
          <p className="text-blue-100 mb-8 max-w-xl mx-auto">
            Join thousands of teams already using CloudFlow to build better software
          </p>
          <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
            Start Free Trial
          </Button>
        </div>
      </section>
    </div>
  );
}
