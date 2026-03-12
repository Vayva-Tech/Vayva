"use client";

import { Wrench, ArrowLeft, Hammer, Truck, Users, ShieldCheck } from "lucide-react";
import Link from "next/link";

const values = [
  { icon: Hammer, title: "Professional Grade", description: "Tools built for pros, available to everyone" },
  { icon: Truck, title: "Fast Shipping", description: "Get your tools when you need them" },
  { icon: Users, title: "Expert Support", description: "Advice from experienced tradespeople" },
  { icon: ShieldCheck, title: "Lifetime Warranty", description: "We stand behind every tool we sell" },
];

const stats = [
  { value: "150K+", label: "DIYers & Pros" },
  { value: "8000+", label: "Tools" },
  { value: "30+", label: "Years" },
  { value: "4.9★", label: "Rating" },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navigation */}
      <nav className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-amber-600 rounded-lg flex items-center justify-center">
                <Wrench className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">ToolCraft</span>
            </Link>
            <Link href="/" className="text-gray-600 hover:text-gray-900 flex items-center gap-1">
              <ArrowLeft className="w-4 h-4" />
              Back
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="bg-gradient-to-br from-amber-600 to-yellow-700 py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">Tools You Can Trust</h1>
          <p className="text-xl text-amber-100 leading-relaxed">
            ToolCraft has been supplying professional-grade tools to DIYers and tradespeople 
            for over 30 years. Quality tools, expert advice, and unbeatable service.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-4xl font-bold text-amber-600 mb-2">{stat.value}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Why ToolCraft</h2>
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
              ToolCraft was founded in 1994 by a master carpenter who was tired of 
              seeing DIYers struggle with poor-quality tools. He set out to create 
              a store where professionals and homeowners alike could find tools that 
              would last a lifetime.
            </p>
            <p className="mb-4">
              Today, we&apos;ve helped over 150,000 customers complete their projects 
              with confidence. Our team includes experienced tradespeople who can 
              help you choose the right tool for any job and offer tips to help 
              you work smarter.
            </p>
            <p>
              Whether you&apos;re tackling your first home improvement project or 
              you&apos;re a seasoned professional, we&apos;re here to provide the tools 
              and support you need to get the job done right.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-400 text-sm">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-8 h-8 bg-amber-600 rounded-lg flex items-center justify-center">
              <Wrench className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">ToolCraft</span>
          </div>
          <p>© 2024 ToolCraft. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
