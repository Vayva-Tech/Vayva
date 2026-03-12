"use client";

import { Building2, ArrowLeft, TreeDeciduous, Truck, Users, Award } from "lucide-react";
import Link from "next/link";

const values = [
  { icon: TreeDeciduous, title: "Sustainable Design", description: "Eco-friendly materials and native plant selections" },
  { icon: Truck, title: "Full Service", description: "From design to installation, we handle it all" },
  { icon: Users, title: "Expert Team", description: "Certified landscape architects and designers" },
  { icon: Award, title: "Award Winning", description: "Recognized designs featured in industry publications" },
];

const stats = [
  { value: "500+", label: "Projects Completed" },
  { value: "15+", label: "Years Experience" },
  { value: "50+", label: "Design Awards" },
  { value: "4.9★", label: "Client Rating" },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-stone-50">
      {/* Navigation */}
      <nav className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-stone-700 rounded-lg flex items-center justify-center">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">UrbanScape</span>
            </Link>
            <Link href="/" className="text-gray-600 hover:text-gray-900 flex items-center gap-1">
              <ArrowLeft className="w-4 h-4" />
              Back
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="bg-gradient-to-br from-stone-700 to-stone-900 py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">Transforming Urban Spaces</h1>
          <p className="text-xl text-stone-300 leading-relaxed">
            UrbanScape designs and builds beautiful outdoor spaces that connect 
            people with nature in the urban environment.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-4xl font-bold text-stone-700 mb-2">{stat.value}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Why UrbanScape</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value) => (
              <div key={value.title} className="text-center">
                <div className="w-16 h-16 bg-stone-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <value.icon className="w-8 h-8 text-stone-700" />
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
              UrbanScape was founded in 2009 by a landscape architect who believed that 
              urban spaces could be both beautiful and sustainable. We started with 
              small residential projects and have grown into a full-service design-build firm.
            </p>
            <p className="mb-4">
              Today, we&apos;ve completed over 500 projects across the country, from rooftop 
              gardens to public parks. Our team includes certified landscape architects, 
              horticulturists, and installation specialists who share a passion for creating 
              outdoor spaces that inspire.
            </p>
            <p>
              Whether you have a small balcony or a large commercial property, we bring 
              the same attention to detail and commitment to sustainability to every project.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-400 text-sm">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-8 h-8 bg-stone-700 rounded-lg flex items-center justify-center">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">UrbanScape</span>
          </div>
          <p>© 2024 UrbanScape. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
