"use client";

import { Car, Users, Award, ArrowRight, MapPin, Phone, Mail, Clock, Star } from "lucide-react";
import Link from "next/link";

const stats = [
  { value: "15+", label: "Years Experience" },
  { value: "10K+", label: "Cars Sold" },
  { value: "98%", label: "Customer Satisfaction" },
  { value: "50+", label: "Expert Staff" },
];

const values = [
  { title: "Transparency", description: "No hidden fees. Full vehicle history reports on every car.", icon: "🔍" },
  { title: "Quality", description: "Every vehicle undergoes 150-point inspection.", icon: "✅" },
  { title: "Service", description: "Lifetime warranty on all vehicles. 24/7 roadside assistance.", icon: "🛡️" },
];

const team = [
  { name: "Michael Roberts", role: "General Manager", image: "👨‍💼" },
  { name: "Sarah Chen", role: "Sales Director", image: "👩‍💼" },
  { name: "James Wilson", role: "Finance Manager", image: "👨‍💻" },
  { name: "Emily Davis", role: "Service Manager", image: "👩‍🔧" },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Car className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">AutoDealer</span>
            </Link>
            <div className="hidden md:flex items-center gap-8">
              <Link href="/inventory" className="text-gray-600 hover:text-gray-900">Inventory</Link>
              <Link href="/financing" className="text-gray-600 hover:text-gray-900">Financing</Link>
              <Link href="/about" className="text-blue-600 font-medium">About</Link>
              <Link href="/contact" className="text-gray-600 hover:text-gray-900">Contact</Link>
            </div>
            <Link href="/contact" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Get in Touch
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-600 to-indigo-700 py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">Your Trusted Auto Partner</h1>
          <p className="text-xl text-blue-100 mb-8">
            Serving the community with quality vehicles and exceptional service since 2009
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 border-y">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-4xl font-bold text-blue-600 mb-2">{stat.value}</p>
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
                Founded in 2009, AutoDealer began with a simple mission: make car buying honest and hassle-free. 
                What started as a small family dealership has grown into one of the region&apos;s most trusted automotive retailers.
              </p>
              <p className="text-lg text-gray-600 mb-6">
                We believe everyone deserves a reliable vehicle at a fair price. That&apos;s why we pioneered 
                transparent pricing, comprehensive vehicle inspections, and no-haggle buying experiences.
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Award className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">#1 Rated Dealership</p>
                  <p className="text-gray-500">Consumer Choice Award 2024</p>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl p-12 flex items-center justify-center">
              <div className="text-9xl">🏢</div>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Values</h2>
            <p className="text-gray-600">The principles that guide everything we do</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {values.map((value) => (
              <div key={value.title} className="bg-gray-50 rounded-xl p-8 text-center">
                <div className="text-5xl mb-4">{value.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{value.title}</h3>
                <p className="text-gray-600">{value.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Team */}
        <section className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Leadership Team</h2>
            <p className="text-gray-600">Meet the experts behind AutoDealer</p>
          </div>
          <div className="grid md:grid-cols-4 gap-8">
            {team.map((member) => (
              <div key={member.name} className="text-center">
                <div className="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center text-5xl mx-auto mb-4">
                  {member.image}
                </div>
                <h3 className="font-semibold text-gray-900">{member.name}</h3>
                <p className="text-gray-500">{member.role}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Contact CTA */}
        <section className="bg-gray-900 rounded-3xl p-12 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Visit Our Showroom</h2>
          <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
            Experience the AutoDealer difference. Browse our inventory, take a test drive, 
            and let our team help you find your perfect vehicle.
          </p>
          <div className="flex flex-wrap justify-center gap-8 mb-8 text-gray-300">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              123 Auto Drive, Los Angeles, CA
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-5 h-5" />
              (555) 123-4567
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Mon-Sat: 9AM-8PM
            </div>
          </div>
          <Link href="/contact" className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700">
            Contact Us
            <ArrowRight className="w-5 h-5" />
          </Link>
        </section>
      </div>
    </div>
  );
}
