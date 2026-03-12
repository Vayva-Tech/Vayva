"use client";

import { Heart, Globe, Users, Award, ArrowRight, CheckCircle } from "lucide-react";
import Link from "next/link";

const stats = [
  { value: "$50M+", label: "Raised for Causes" },
  { value: "1M+", label: "Lives Impacted" },
  { value: "150+", label: "Countries Served" },
  { value: "10K+", label: "Volunteers" },
];

const values = [
  {
    title: "Transparency",
    description: "100% of donations go directly to our programs. We publish detailed annual reports.",
    icon: "🔍",
  },
  {
    title: "Impact First",
    description: "We measure success by lives changed, not dollars raised. Every program is results-driven.",
    icon: "🎯",
  },
  {
    title: "Community Led",
    description: "Local communities guide our work. We partner with grassroots organizations worldwide.",
    icon: "🤝",
  },
];

const team = [
  { name: "Sarah Mitchell", role: "Executive Director", image: "👩‍💼" },
  { name: "David Chen", role: "Operations Director", image: "👨‍💻" },
  { name: "Maria Garcia", role: "Programs Director", image: "👩‍💻" },
  { name: "James Wilson", role: "Partnerships Director", image: "👨‍💼" },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-rose-500 rounded-lg flex items-center justify-center">
                <Heart className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">HopeRise</span>
            </Link>
            <div className="hidden md:flex items-center gap-8">
              <Link href="/" className="text-gray-600 hover:text-gray-900">Home</Link>
              <Link href="/about" className="text-rose-600 font-medium">About</Link>
              <Link href="/contact" className="text-gray-600 hover:text-gray-900">Contact</Link>
            </div>
            <Link href="/donate" className="px-4 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600">
              Donate Now
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="bg-gradient-to-br from-rose-500 to-orange-400 py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Our Mission to Create Change
          </h1>
          <p className="text-xl text-white/90 mb-8">
            Founded in 2010, HopeRise has been dedicated to empowering communities 
            and creating sustainable solutions to global challenges.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 border-y">
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

      {/* Story */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Story</h2>
              <p className="text-lg text-gray-600 mb-6">
                HopeRise began with a simple belief: that everyone deserves access to 
                basic necessities and opportunities to thrive. What started as a small 
                local initiative has grown into a global movement.
              </p>
              <p className="text-lg text-gray-600 mb-6">
                Today, we work in over 150 countries, partnering with local organizations 
                to deliver education, healthcare, and economic opportunities to those who 
                need them most.
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center">
                  <Award className="w-6 h-6 text-rose-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Charity Navigator</p>
                  <p className="text-gray-500">4-Star Rating 2024</p>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-rose-50 to-orange-50 rounded-2xl p-8">
              <blockquote className="text-xl text-gray-700 italic mb-4">
                &quot;We believe in the power of community. When we come together, 
                there&apos;s no challenge we can&apos;t overcome.&quot;
              </blockquote>
              <p className="text-gray-900 font-medium">— Sarah Mitchell, Executive Director</p>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Values</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              The principles that guide everything we do at HopeRise
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {values.map((value) => (
              <div key={value.title} className="bg-white rounded-xl p-8 shadow-sm">
                <div className="text-4xl mb-4">{value.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{value.title}</h3>
                <p className="text-gray-600">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Leadership Team</h2>
            <p className="text-gray-600">Meet the people driving our mission forward</p>
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
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-rose-500 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Join Our Mission</h2>
          <p className="text-white/90 mb-8">
            Be part of the change. Donate, volunteer, or partner with us.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/donate" className="px-8 py-4 bg-white text-rose-600 font-semibold rounded-xl hover:bg-gray-100 inline-flex items-center gap-2">
              Donate Now
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link href="/volunteer" className="px-8 py-4 border-2 border-white text-white font-semibold rounded-xl hover:bg-white/10 inline-flex items-center gap-2">
              Volunteer
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-8 h-8 bg-rose-500 rounded-lg flex items-center justify-center">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold">HopeRise</span>
          </div>
          <p className="text-gray-400 text-sm">
            © 2024 HopeRise. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
