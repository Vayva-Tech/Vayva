"use client";

import { Zap, ArrowRight, Globe, Heart, Zap as ZapIcon, Coffee, MapPin, Briefcase, Clock } from "lucide-react";
import Link from "next/link";

const benefits = [
  { icon: Globe, title: "Remote First", description: "Work from anywhere in the world" },
  { icon: Heart, title: "Health & Wellness", description: "Premium health, dental, and vision coverage" },
  { icon: ZapIcon, title: "Learning Budget", description: "$2,000 annual learning stipend" },
  { icon: Coffee, title: "Flexible Schedule", description: "Work when you're most productive" },
];

const openings = [
  {
    title: "Senior Frontend Engineer",
    department: "Engineering",
    location: "Remote",
    type: "Full-time",
    description: "Build the future of web hosting with React, Next.js, and TypeScript",
  },
  {
    title: "Product Designer",
    department: "Design",
    location: "Remote",
    type: "Full-time",
    description: "Create beautiful, intuitive experiences for our users",
  },
  {
    title: "Developer Relations",
    department: "Marketing",
    location: "Remote",
    type: "Full-time",
    description: "Build relationships with developers and the community",
  },
  {
    title: "Site Reliability Engineer",
    department: "Infrastructure",
    location: "Remote",
    type: "Full-time",
    description: "Keep our global infrastructure running smoothly",
  },
  {
    title: "Customer Success Manager",
    department: "Support",
    location: "Remote",
    type: "Full-time",
    description: "Help our customers succeed on the platform",
  },
];

const values = [
  { title: "Customer Obsessed", description: "We put customers at the center of everything we do" },
  { title: "Move Fast", description: "Speed matters. We ship quickly and iterate" },
  { title: "Think Big", description: "We tackle ambitious challenges that others won't" },
  { title: "Stay Humble", description: "We're always learning and growing together" },
];

export default function CareersPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">CloudHost</span>
            </Link>
            <div className="hidden md:flex items-center gap-8">
              <Link href="/features" className="text-gray-600 hover:text-gray-900">Features</Link>
              <Link href="/pricing" className="text-gray-600 hover:text-gray-900">Pricing</Link>
              <Link href="/about" className="text-gray-600 hover:text-gray-900">About</Link>
              <Link href="/careers" className="text-blue-600 font-medium">Careers</Link>
            </div>
            <Link href="/signup" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-600 to-indigo-700 py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Join the Team Building the Future of the Web
          </h1>
          <p className="text-xl text-blue-100 mb-8">
            We're on a mission to make the web faster, more secure, and accessible to everyone.
          </p>
          <Link href="#openings" className="px-8 py-4 bg-white text-blue-600 font-semibold rounded-xl hover:bg-gray-100 inline-flex items-center gap-2">
            View Open Positions
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Why Work With Us</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit) => (
              <div key={benefit.title} className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <benefit.icon className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">{benefit.title}</h3>
                <p className="text-gray-600 text-sm">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Our Values</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value) => (
              <div key={value.title} className="bg-white rounded-xl p-6">
                <h3 className="font-semibold text-gray-900 mb-2">{value.title}</h3>
                <p className="text-gray-600 text-sm">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Open Positions */}
      <section id="openings" className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Open Positions</h2>
          <p className="text-gray-600 mb-8">Join our fully remote team</p>
          <div className="space-y-4">
            {openings.map((job) => (
              <div key={job.title} className="bg-white border rounded-xl p-6 hover:border-blue-500 transition-colors group">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">{job.title}</h3>
                    <p className="text-gray-600 mb-2">{job.description}</p>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Briefcase className="w-4 h-4" />
                        {job.department}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {job.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {job.type}
                      </span>
                    </div>
                  </div>
                  <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 whitespace-nowrap">
                    Apply Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-blue-600">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Don't see the right role?</h2>
          <p className="text-blue-100 mb-6">We're always looking for talented people. Send us your resume!</p>
          <Link href="/contact" className="px-6 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 inline-flex items-center gap-2">
            Get in Touch
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold">CloudHost</span>
          </div>
          <p className="text-gray-400 text-sm">
            © 2024 CloudHost. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
