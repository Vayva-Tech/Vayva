"use client";

import { Gamepad2, ArrowLeft, Zap, Truck, Users, Trophy } from "lucide-react";
import Link from "next/link";

const values = [
  { icon: Zap, title: "Latest Gear", description: "First to stock the newest gaming hardware and accessories" },
  { icon: Truck, title: "Fast Shipping", description: "Free express delivery on orders over $100" },
  { icon: Users, title: "Gamer Community", description: "Join 100K+ gamers in our community" },
  { icon: Trophy, title: "Esports Ready", description: "Professional-grade equipment for competitive play" },
];

const stats = [
  { value: "500K+", label: "Gamers" },
  { value: "10K+", label: "Products" },
  { value: "50+", label: "Esports Partners" },
  { value: "4.9★", label: "Rating" },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-900">
      {/* Navigation */}
      <nav className="bg-gray-800 border-b border-gray-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                <Gamepad2 className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">PlayZone</span>
            </Link>
            <Link href="/" className="text-gray-400 hover:text-white flex items-center gap-1">
              <ArrowLeft className="w-4 h-4" />
              Back
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="bg-gradient-to-br from-purple-600 to-pink-600 py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">Level Up Your Game</h1>
          <p className="text-xl text-purple-100 leading-relaxed">
            PlayZone is the ultimate destination for gamers. We provide the gear, 
            the community, and the support you need to dominate.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-gray-800">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-4xl font-bold text-purple-400 mb-2">{stat.value}</div>
                <div className="text-gray-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-white mb-12 text-center">Why PlayZone</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value) => (
              <div key={value.title} className="text-center">
                <div className="w-16 h-16 bg-purple-900/50 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <value.icon className="w-8 h-8 text-purple-400" />
                </div>
                <h3 className="font-semibold text-white mb-2">{value.title}</h3>
                <p className="text-gray-400 text-sm">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="py-20 bg-gray-800">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">Our Story</h2>
          <div className="prose prose-invert mx-auto text-gray-400">
            <p className="mb-4">
              PlayZone started in 2015 when a group of competitive gamers got tired of 
              searching multiple sites for the best gear. We built the store we wished existed 
              — one place for everything a gamer needs.
            </p>
            <p className="mb-4">
              Today, we&apos;re the official gear partner for 50+ esports teams and sponsor 
              dozens of tournaments worldwide. From casual players to pro athletes, we provide 
              the equipment that wins championships.
            </p>
            <p>
              Whether you&apos;re grinding ranked, streaming to fans, or just gaming for fun, 
              PlayZone has your back. Game on.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 border-t border-gray-700 py-12">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-400 text-sm">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
              <Gamepad2 className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">PlayZone</span>
          </div>
          <p>© 2024 PlayZone. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
