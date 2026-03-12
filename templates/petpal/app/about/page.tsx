"use client";

import { Cat, ArrowLeft, Heart, Truck, Users, ShieldCheck } from "lucide-react";
import Link from "next/link";

const values = [
  { icon: Heart, title: "Pet First", description: "Everything we do is for the love of pets" },
  { icon: Truck, title: "Fast Delivery", description: "Quick shipping so you never run out of supplies" },
  { icon: Users, title: "Pet Experts", description: "Advice from veterinarians and pet care specialists" },
  { icon: ShieldCheck, title: "Quality Assured", description: "Curated products from trusted brands" },
];

const stats = [
  { value: "500K+", label: "Pet Parents" },
  { value: "10K+", label: "Products" },
  { value: "50+", label: "Pet Experts" },
  { value: "4.9★", label: "Rating" },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-orange-50">
      {/* Navigation */}
      <nav className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                <Cat className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">PetPal</span>
            </Link>
            <Link href="/" className="text-gray-600 hover:text-gray-900 flex items-center gap-1">
              <ArrowLeft className="w-4 h-4" />
              Back
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="bg-gradient-to-br from-orange-500 to-amber-500 py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">For the Love of Pets</h1>
          <p className="text-xl text-orange-100 leading-relaxed">
            PetPal is dedicated to helping pet parents provide the best care for their 
            furry, feathered, and scaled family members. Because pets are family.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-4xl font-bold text-orange-500 mb-2">{stat.value}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Why PetPal</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value) => (
              <div key={value.title} className="text-center">
                <div className="w-16 h-16 bg-orange-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <value.icon className="w-8 h-8 text-orange-600" />
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
              PetPal was founded in 2010 by a veterinarian who saw pet parents struggling to 
              find quality products and reliable advice. She started with a small online 
              store and a blog, and the community grew rapidly.
            </p>
            <p className="mb-4">
              Today, we&apos;ve served over 500,000 pet parents across the country. Our team 
              includes veterinarians, certified trainers, and pet nutritionists who review 
              every product and create helpful content for our community.
            </p>
            <p>
              Whether you&apos;re a new pet parent or a seasoned pro, we&apos;re here to help 
              you give your pets the happy, healthy lives they deserve.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-400 text-sm">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
              <Cat className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">PetPal</span>
          </div>
          <p>© 2024 PetPal. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
