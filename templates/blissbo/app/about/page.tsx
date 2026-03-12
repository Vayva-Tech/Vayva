"use client";

import { Sparkles, Award, Heart, Leaf, ArrowRight, MapPin, Phone, Clock } from "lucide-react";
import Link from "next/link";

const stats = [
  { value: "12+", label: "Years of Excellence" },
  { value: "50K+", label: "Happy Clients" },
  { value: "4.9", label: "Average Rating" },
  { value: "25", label: "Expert Therapists" },
];

const values = [
  { title: "Holistic Wellness", description: "We treat the whole person - mind, body, and spirit", icon: "🧘" },
  { title: "Natural Products", description: "Only organic, cruelty-free products touch your skin", icon: "🌿" },
  { title: "Expert Care", description: "Certified therapists with years of experience", icon: "💆" },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 to-pink-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-rose-500 rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">BlissBo</span>
            </Link>
            <div className="hidden md:flex items-center gap-8">
              <Link href="/services" className="text-gray-600 hover:text-gray-900">Services</Link>
              <Link href="/booking" className="text-gray-600 hover:text-gray-900">Book Now</Link>
              <Link href="/about" className="text-rose-600 font-medium">About</Link>
              <Link href="/contact" className="text-gray-600 hover:text-gray-900">Contact</Link>
            </div>
            <Link href="/booking" className="px-4 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600">
              Book Now
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">Our Sanctuary of Wellness</h1>
          <p className="text-xl text-gray-600 mb-8">
            Where ancient healing traditions meet modern luxury
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 border-y bg-white/50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-4xl font-bold text-rose-600 mb-2">{stat.value}</p>
                <p className="text-gray-600">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-16">
        {/* Story */}
        <section className="mb-20">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Story</h2>
              <p className="text-lg text-gray-600 mb-6">
                Founded in 2012, BlissBo began as a small wellness studio with a vision: 
                to create a sanctuary where guests could escape the stresses of daily life 
                and reconnect with their inner peace.
              </p>
              <p className="text-lg text-gray-600 mb-6">
                Today, we&apos;re a premier destination for holistic wellness, offering 
                a comprehensive menu of treatments designed to nurture your body, 
                calm your mind, and uplift your spirit.
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center">
                  <Award className="w-6 h-6 text-rose-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Award-Winning Spa</p>
                  <p className="text-gray-500">Best Luxury Spa 2024</p>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-rose-100 to-pink-200 rounded-2xl p-12 flex items-center justify-center">
              <div className="text-9xl">🧘‍♀️</div>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Philosophy</h2>
            <p className="text-gray-600">Guided by principles of holistic wellness</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {values.map((value) => (
              <div key={value.title} className="bg-white rounded-2xl p-8 text-center shadow-sm">
                <div className="text-5xl mb-4">{value.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{value.title}</h3>
                <p className="text-gray-600">{value.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="bg-rose-500 rounded-3xl p-12 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Begin Your Wellness Journey</h2>
          <p className="text-rose-100 mb-8 max-w-2xl mx-auto">
            Experience the BlissBo difference. Book your first visit today.
          </p>
          <Link href="/booking" className="inline-flex items-center gap-2 px-8 py-4 bg-white text-rose-500 font-semibold rounded-xl hover:bg-gray-100">
            Book Your Experience
            <ArrowRight className="w-5 h-5" />
          </Link>
        </section>
      </div>
    </div>
  );
}
