"use client";

import { Music, ArrowLeft, Headphones, Truck, Users, Award } from "lucide-react";
import Link from "next/link";

const values = [
  { icon: Headphones, title: "Studio Quality", description: "Professional-grade audio equipment for creators" },
  { icon: Truck, title: "Fast Shipping", description: "Quick delivery so you never miss a session" },
  { icon: Users, title: "Artist Support", description: "24/7 support from fellow musicians and producers" },
  { icon: Award, title: "Trusted Brands", description: "Authorized dealer for all major audio brands" },
];

const stats = [
  { value: "50K+", label: "Artists" },
  { value: "2000+", label: "Products" },
  { value: "100+", label: "Studio Partners" },
  { value: "4.9★", label: "Rating" },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-black">
      {/* Navigation */}
      <nav className="bg-gray-900 border-b border-gray-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                <Music className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">StudioBox</span>
            </Link>
            <Link href="/" className="text-gray-400 hover:text-white flex items-center gap-1">
              <ArrowLeft className="w-4 h-4" />
              Back
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="bg-gradient-to-br from-orange-500 to-red-600 py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">Made for Music Makers</h1>
          <p className="text-xl text-orange-100 leading-relaxed">
            StudioBox is built by musicians, for musicians. We provide the gear you need 
            to create, record, and share your sound with the world.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-4xl font-bold text-orange-500 mb-2">{stat.value}</div>
                <div className="text-gray-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-white mb-12 text-center">Why StudioBox</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value) => (
              <div key={value.title} className="text-center">
                <div className="w-16 h-16 bg-orange-900/50 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <value.icon className="w-8 h-8 text-orange-500" />
                </div>
                <h3 className="font-semibold text-white mb-2">{value.title}</h3>
                <p className="text-gray-400 text-sm">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="py-20 bg-gray-900">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">Our Story</h2>
          <div className="prose prose-invert mx-auto text-gray-400">
            <p className="mb-4">
              StudioBox was founded in 2014 by a group of Nashville musicians who were tired 
              of driving all over town for studio equipment. We started as a small shop on Music 
              Row and have grown into a leading online destination for audio gear.
            </p>
            <p className="mb-4">
              Today, we work with artists from bedroom producers to Grammy-winning studios. 
              Our team includes working musicians who can help you find exactly what you need 
              for your setup, whether you&apos;re recording your first demo or outfitting a professional studio.
            </p>
            <p>
              Music is our passion. Let us help you make yours.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 border-t border-gray-800 py-12">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-400 text-sm">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
              <Music className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">StudioBox</span>
          </div>
          <p>© 2024 StudioBox. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
