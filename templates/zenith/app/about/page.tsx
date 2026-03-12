"use client";

import { Mountain, ArrowLeft, Trophy, Truck, Users, Target } from "lucide-react";
import Link from "next/link";

const values = [
  { icon: Trophy, title: "Peak Performance", description: "Gear trusted by professional athletes" },
  { icon: Truck, title: "Expedition Ready", description: "Fast shipping for time-critical adventures" },
  { icon: Users, title: "Expert Guides", description: "Advice from mountaineers and athletes" },
  { icon: Target, title: "Precision Engineered", description: "Technical gear for extreme conditions" },
];

const stats = [
  { value: "100K+", label: "Athletes" },
  { value: "3000+", label: "Products" },
  { value: "25+", label: "Years" },
  { value: "4.9★", label: "Rating" },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-slate-900">
      {/* Navigation */}
      <nav className="bg-slate-800 border-b border-slate-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center">
                <Mountain className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">Zenith</span>
            </Link>
            <Link href="/" className="text-slate-400 hover:text-white flex items-center gap-1">
              <ArrowLeft className="w-4 h-4" />
              Back
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="bg-gradient-to-br from-indigo-600 to-purple-700 py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">Reach Your Zenith</h1>
          <p className="text-xl text-indigo-100 leading-relaxed">
            Zenith creates premium athletic and mountaineering gear for those who 
            push the limits of human potential. Reach new heights with confidence.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-slate-800/50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-4xl font-bold text-indigo-400 mb-2">{stat.value}</div>
                <div className="text-slate-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-white mb-12 text-center">Why Zenith</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value) => (
              <div key={value.title} className="text-center">
                <div className="w-16 h-16 bg-indigo-900/50 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <value.icon className="w-8 h-8 text-indigo-400" />
                </div>
                <h3 className="font-semibold text-white mb-2">{value.title}</h3>
                <p className="text-slate-400 text-sm">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="py-20 bg-slate-800/50">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">Our Story</h2>
          <div className="prose prose-invert mx-auto text-slate-400">
            <p className="mb-4">
              Zenith was founded in 1999 by a team of professional mountaineers who 
              were dissatisfied with the gear available to them. They set out to 
              create equipment that could withstand the most extreme conditions on Earth.
            </p>
            <p className="mb-4">
              Today, Zenith is trusted by Olympic athletes, professional climbers, and 
              adventurers worldwide. Our gear has been to the summit of Everest, across 
              Antarctica, and through countless other extreme environments.
            </p>
            <p>
              Every product we make is tested by our team of professional athletes 
              before it reaches you. When you choose Zenith, you&apos;re choosing gear 
              that&apos;s been proven at the highest levels of human performance.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-800 border-t border-slate-700 py-12">
        <div className="max-w-7xl mx-auto px-4 text-center text-slate-400 text-sm">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center">
              <Mountain className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">Zenith</span>
          </div>
          <p>© 2024 Zenith. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
