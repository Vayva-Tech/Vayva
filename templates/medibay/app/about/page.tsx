"use client";

import { Stethoscope, ArrowLeft, Shield, Truck, Users, Award } from "lucide-react";
import Link from "next/link";

const values = [
  { icon: Shield, title: "Quality Assured", description: "All products meet strict medical-grade standards" },
  { icon: Truck, title: "Fast Delivery", description: "Same-day shipping for urgent medical supplies" },
  { icon: Users, title: "Expert Support", description: "Healthcare professionals available 24/7" },
  { icon: Award, title: "Trusted Partner", description: "Serving 10,000+ healthcare facilities nationwide" },
];

const stats = [
  { value: "10K+", label: "Healthcare Facilities" },
  { value: "50K+", label: "Products" },
  { value: "99.9%", label: "Fill Rate" },
  { value: "4.9★", label: "Rating" },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navigation */}
      <nav className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Stethoscope className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-slate-900">MediBay</span>
            </Link>
            <Link href="/" className="text-slate-600 hover:text-slate-900 flex items-center gap-1">
              <ArrowLeft className="w-4 h-4" />
              Back
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-600 to-cyan-600 py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">Healthcare Supply Partner</h1>
          <p className="text-xl text-blue-100 leading-relaxed">
            MediBay is your trusted source for medical supplies and equipment. 
            We help healthcare providers deliver better patient care.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-4xl font-bold text-blue-600 mb-2">{stat.value}</div>
                <div className="text-slate-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-slate-900 mb-12 text-center">Why MediBay</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value) => (
              <div key={value.title} className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <value.icon className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">{value.title}</h3>
                <p className="text-slate-600 text-sm">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-slate-900 mb-8 text-center">Our Story</h2>
          <div className="prose prose-gray mx-auto text-slate-600">
            <p className="mb-4">
              MediBay was founded in 2010 by a team of healthcare professionals who understood 
              the challenges of sourcing reliable medical supplies. We started as a small 
              distribution company serving local clinics and have grown into a nationwide provider.
            </p>
            <p className="mb-4">
              Today, we partner with over 10,000 healthcare facilities, from small practices 
              to major hospital systems. Our team includes registered nurses, physicians, and 
              supply chain experts who understand your needs.
            </p>
            <p>
              We&apos;re committed to helping healthcare providers focus on what matters most: 
              delivering excellent patient care. Let us handle your supply needs.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 text-center text-slate-400 text-sm">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Stethoscope className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">MediBay</span>
          </div>
          <p>© 2024 MediBay. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
