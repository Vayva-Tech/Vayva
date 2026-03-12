"use client";

import { Car, ArrowLeft, Wrench, Truck, Shield, Award } from "lucide-react";
import Link from "next/link";

const values = [
  { icon: Wrench, title: "Expert Support", description: "ASE-certified techs to help you find the right parts" },
  { icon: Truck, title: "Fast Shipping", description: "Same-day shipping on orders before 3pm EST" },
  { icon: Shield, title: "Fitment Guarantee", description: "Free returns if the part doesn't fit your vehicle" },
  { icon: Award, title: "Quality Brands", description: "OEM and premium aftermarket parts only" },
];

const stats = [
  { value: "500K+", label: "Parts Sold" },
  { value: "50K+", label: "Products" },
  { value: "200K+", label: "Happy Drivers" },
  { value: "4.8★", label: "Rating" },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
                <Car className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">AutoLane</span>
            </Link>
            <Link href="/" className="text-gray-600 hover:text-gray-900 flex items-center gap-1">
              <ArrowLeft className="w-4 h-4" />
              Back
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="bg-gradient-to-br from-red-600 to-orange-600 py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">Parts Made Simple</h1>
          <p className="text-xl text-red-100 leading-relaxed">
            AutoLane is your trusted source for automotive parts and accessories. 
            We help you keep your vehicle running its best.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-4xl font-bold text-red-600 mb-2">{stat.value}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Why AutoLane</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value) => (
              <div key={value.title} className="text-center">
                <div className="w-16 h-16 bg-red-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <value.icon className="w-8 h-8 text-red-600" />
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
              AutoLane was founded in 2008 by a group of mechanics who were tired of 
              waiting weeks for parts. We started with a small warehouse in Charlotte, 
              NC, and have grown into a nationwide parts distributor.
            </p>
            <p className="mb-4">
              Today, we stock over 50,000 parts and ship to all 50 states. Our team includes 
              ASE-certified technicians who can help you find exactly what you need for your 
              repair or upgrade project.
            </p>
            <p>
              Whether you&apos;re a DIY enthusiast or a professional mechanic, we&apos;re here 
              to help you get the job done right. From maintenance parts to performance upgrades, 
              we&apos;ve got you covered.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-400 text-sm">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
              <Car className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">AutoLane</span>
          </div>
          <p>© 2024 AutoLane. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
