"use client";

import { Shield, Lock, Eye, Server, Globe, Zap, ChevronRight, Check, ArrowRight, Users, Award, Clock } from "lucide-react";
import Link from "next/link";

const features = [
  {
    title: "Military-Grade Encryption",
    description: "AES-256 encryption protects all your stored passwords and sensitive data",
    icon: Lock,
  },
  {
    title: "Zero-Knowledge Architecture",
    description: "We can't access your data. Only you hold the keys to your vault",
    icon: Eye,
  },
  {
    title: "Secure Cloud Sync",
    description: "Access your passwords from any device with end-to-end encrypted sync",
    icon: Server,
  },
  {
    title: "Global CDN",
    description: "Lightning-fast access from anywhere in the world",
    icon: Globe,
  },
];

const stats = [
  { value: "10M+", label: "Active Users" },
  { value: "50M+", label: "Passwords Secured" },
  { value: "99.9%", label: "Uptime" },
  { value: "0", label: "Data Breaches" },
];

const testimonials = [
  {
    name: "Sarah Chen",
    role: "CISO, TechCorp",
    content: "CryptoVault has transformed our company's security posture. The team loves how easy it is to use.",
  },
  {
    name: "Michael Ross",
    role: "IT Director",
    content: "Best password manager we've ever used. The security features give us complete peace of mind.",
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">CryptoVault</span>
            </Link>
            <div className="hidden md:flex items-center gap-8">
              <Link href="/features" className="text-gray-600 hover:text-gray-900">Features</Link>
              <Link href="/pricing" className="text-gray-600 hover:text-gray-900">Pricing</Link>
              <Link href="/about" className="text-indigo-600 font-medium">About</Link>
              <Link href="/security" className="text-gray-600 hover:text-gray-900">Security</Link>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/login" className="text-gray-600 hover:text-gray-900">Sign In</Link>
              <Link href="/signup" className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="py-20 bg-gradient-to-br from-indigo-50 to-purple-50">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Securing the World&apos;s
            <span className="text-indigo-600"> Digital Identity</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Founded in 2018, CryptoVault has grown from a small security project to 
            protecting millions of users worldwide. Our mission is simple: make security effortless.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 border-y">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-4xl font-bold text-indigo-600 mb-2">{stat.value}</p>
                <p className="text-gray-600">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Mission</h2>
              <p className="text-lg text-gray-600 mb-6">
                We believe everyone deserves enterprise-grade security without the complexity. 
                That&apos;s why we built CryptoVault - to put powerful security tools in the hands 
                of everyday users and businesses alike.
              </p>
              <p className="text-lg text-gray-600 mb-6">
                Our team of security experts, engineers, and designers work tirelessly to stay 
                ahead of threats while maintaining an experience that&apos;s simple and intuitive.
              </p>
              <div className="flex items-center gap-4">
                <div className="flex -space-x-2">
                  {["👨‍💼", "👩‍💻", "👨‍💻", "👩‍💼"].map((avatar, i) => (
                    <div key={i} className="w-10 h-10 bg-gray-200 rounded-full border-2 border-white flex items-center justify-center">
                      {avatar}
                    </div>
                  ))}
                </div>
                <p className="text-sm text-gray-600">Join our team of 100+ security experts</p>
              </div>
            </div>
            <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl p-8 text-white">
              <Shield className="w-16 h-16 mb-6" />
              <blockquote className="text-xl font-medium mb-4">
                &quot;Security should be invisible. If users have to think about it, we&apos;ve failed.&quot;
              </blockquote>
              <p className="text-indigo-200">— Alex Rivera, Founder & CEO</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose CryptoVault</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Industry-leading security meets world-class usability
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            {features.map((feature) => (
              <div key={feature.title} className="flex gap-4 p-6 bg-white rounded-xl shadow-sm">
                <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center shrink-0">
                  <feature.icon className="w-6 h-6 text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Trusted by Professionals</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {testimonials.map((t) => (
              <div key={t.name} className="bg-gray-50 rounded-2xl p-8">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-yellow-400">★</span>
                  ))}
                </div>
                <p className="text-gray-700 mb-6 text-lg">&quot;{t.content}&quot;</p>
                <div>
                  <p className="font-semibold text-gray-900">{t.name}</p>
                  <p className="text-gray-500">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gray-900 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Join the Security Revolution</h2>
          <p className="text-gray-400 mb-8">
            Start protecting your digital life today with CryptoVault
          </p>
          <Link href="/signup" className="px-8 py-4 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 inline-flex items-center gap-2">
            Get Started Free
            <ArrowRight className="w-5 h-5" />
          </Link>
          <p className="text-gray-500 mt-4">Free forever for personal use</p>
        </div>
      </section>
    </div>
  );
}
