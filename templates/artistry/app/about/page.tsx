"use client";

import { Palette, Users, Award, ArrowRight, Mail, MapPin, Phone, Star, CheckCircle } from "lucide-react";
import Link from "next/link";

const stats = [
  { value: "12+", label: "Years Experience" },
  { value: "500+", label: "Projects Completed" },
  { value: "98%", label: "Client Satisfaction" },
  { value: "50+", label: "Industry Awards" },
];

const team = [
  { name: "Alex Rivera", role: "Creative Director", image: "🎨" },
  { name: "Jordan Chen", role: "Lead Designer", image: "✏️" },
  { name: "Taylor Kim", role: "Senior Developer", image: "💻" },
  { name: "Morgan Blake", role: "Photographer", image: "📷" },
];

const values = [
  { title: "Creativity First", description: "We believe great design solves problems beautifully", icon: "💡" },
  { title: "Client Partnership", description: "Your success is our success. We work closely with you every step", icon: "🤝" },
  { title: "Attention to Detail", description: "Pixel-perfect execution in everything we deliver", icon: "🔍" },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center">
                <Palette className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">Artistry</span>
            </Link>
            <div className="hidden md:flex items-center gap-8">
              <Link href="/portfolio" className="text-gray-600 hover:text-gray-900">Portfolio</Link>
              <Link href="/services" className="text-gray-600 hover:text-gray-900">Services</Link>
              <Link href="/about" className="text-violet-600 font-medium">About</Link>
              <Link href="/contact" className="text-gray-600 hover:text-gray-900">Contact</Link>
            </div>
            <Link href="/contact" className="px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700">
              Get in Touch
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="bg-gradient-to-br from-violet-600 to-purple-700 py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">We Are Artistry</h1>
          <p className="text-xl text-violet-200 mb-8">
            A creative studio passionate about crafting exceptional digital experiences
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 border-y">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-4xl font-bold text-violet-600 mb-2">{stat.value}</p>
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
                Founded in 2012, Artistry began as a small design studio with a big vision: 
                to help businesses tell their stories through exceptional design. 
                Over the years, we&apos;ve grown into a full-service creative agency 
                serving clients worldwide.
              </p>
              <p className="text-lg text-gray-600 mb-6">
                Our team of designers, developers, and strategists work together 
                to create experiences that resonate with audiences and drive results.
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-violet-100 rounded-full flex items-center justify-center">
                  <Award className="w-6 h-6 text-violet-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Award Winning Agency</p>
                  <p className="text-gray-500">Design Excellence Award 2024</p>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-violet-100 to-purple-100 rounded-2xl p-8 flex items-center justify-center">
              <div className="text-9xl">🎨</div>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Values</h2>
            <p className="text-gray-600">The principles that guide our work</p>
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
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Meet the Team</h2>
            <p className="text-gray-600">The creative minds behind Artistry</p>
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

        {/* CTA */}
        <section className="bg-violet-600 rounded-3xl p-12 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Let&apos;s Create Together</h2>
          <p className="text-violet-100 mb-8">
            Ready to bring your vision to life? We&apos;d love to hear from you.
          </p>
          <Link href="/contact" className="px-8 py-4 bg-white text-violet-600 font-semibold rounded-xl hover:bg-gray-100 inline-flex items-center gap-2">
            Start a Project
            <ArrowRight className="w-5 h-5" />
          </Link>
        </section>
      </div>
    </div>
  );
}
