"use client";

import { Droplets, ArrowLeft, Waves, Truck, Users, ShieldCheck } from "lucide-react";
import Link from "next/link";

const values = [
  { icon: Waves, title: "Crystal Clear Water", description: "Advanced filtration and chemical solutions" },
  { icon: Truck, title: "Fast Delivery", description: "Quick shipping for all your pool and spa needs" },
  { icon: Users, title: "Expert Advice", description: "Certified pool technicians to answer your questions" },
  { icon: ShieldCheck, title: "Quality Guaranteed", description: "Top brands and professional-grade products" },
];

const stats = [
  { value: "100K+", label: "Pool Owners" },
  { value: "3000+", label: "Products" },
  { value: "25+", label: "Years Experience" },
  { value: "4.8★", label: "Rating" },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-cyan-50">
      {/* Navigation */}
      <nav className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-cyan-500 rounded-lg flex items-center justify-center">
                <Droplets className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">AquaVibe</span>
            </Link>
            <Link href="/" className="text-gray-600 hover:text-gray-900 flex items-center gap-1">
              <ArrowLeft className="w-4 h-4" />
              Back
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="bg-gradient-to-br from-cyan-500 to-blue-600 py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">Your Pool, Perfected</h1>
          <p className="text-xl text-cyan-100 leading-relaxed">
            AquaVibe is your one-stop shop for everything pools and spas. 
            We help you create the perfect backyard oasis.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-4xl font-bold text-cyan-500 mb-2">{stat.value}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Why AquaVibe</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value) => (
              <div key={value.title} className="text-center">
                <div className="w-16 h-16 bg-cyan-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <value.icon className="w-8 h-8 text-cyan-600" />
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
              AquaVibe started in 1999 as a small pool supply store in Florida. Our founder, 
              a former pool technician, was frustrated by the lack of quality products and 
              expert advice available to pool owners.
            </p>
            <p className="mb-4">
              Today, we&apos;re a leading online destination for pool and spa supplies, serving 
              over 100,000 pool owners nationwide. Our team includes certified pool technicians 
              who can help you with everything from water chemistry to equipment selection.
            </p>
            <p>
              Whether you&apos;re a new pool owner or a seasoned pro, we&apos;re here to help 
              you keep your water crystal clear and your pool running smoothly all season long.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-400 text-sm">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-8 h-8 bg-cyan-500 rounded-lg flex items-center justify-center">
              <Droplets className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">AquaVibe</span>
          </div>
          <p>© 2024 AquaVibe. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
