"use client";

import { Code, ArrowRight, Globe, Heart, Zap, Coffee, MapPin, Briefcase, Clock, BookOpen } from "lucide-react";
import Link from "next/link";

const benefits = [
  { icon: Globe, title: "Remote First", description: "Work from anywhere in the world" },
  { icon: BookOpen, title: "Free Courses", description: "Unlimited access to all our courses" },
  { icon: Zap, title: "Learning Budget", description: "$3,000 annual conference and book budget" },
  { icon: Coffee, title: "Flexible Hours", description: "Work when you're most productive" },
];

const openings = [
  {
    title: "Senior Full-Stack Instructor",
    department: "Education",
    location: "Remote",
    type: "Full-time",
    description: "Create world-class courses on modern web development",
  },
  {
    title: "Content Creator",
    department: "Marketing",
    location: "Remote",
    type: "Full-time",
    description: "Create tutorials, blog posts, and video content",
  },
  {
    title: "Platform Engineer",
    department: "Engineering",
    location: "Remote",
    type: "Full-time",
    description: "Build the learning platform used by 500K+ students",
  },
  {
    title: "Curriculum Designer",
    department: "Education",
    location: "Remote",
    type: "Full-time",
    description: "Design learning paths for emerging technologies",
  },
  {
    title: "Student Success Coach",
    department: "Support",
    location: "Remote",
    type: "Full-time",
    description: "Help students achieve their learning goals",
  },
];

const values = [
  { title: "Student First", description: "Every decision starts with what's best for our students" },
  { title: "Learn in Public", description: "We share what we learn and learn from each other" },
  { title: "Think Big", description: "We aim to educate millions of developers worldwide" },
  { title: "Stay Curious", description: "We're lifelong learners, always exploring new technologies" },
];

export default function CareersPage() {
  return (
    <div className="min-h-screen bg-dark-900">
      {/* Navigation */}
      <nav className="border-b border-dark-700 bg-dark-900 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="text-xl font-bold text-primary-500">CodeCamp</Link>
            <div className="hidden md:flex items-center gap-8">
              <Link href="/tracks" className="text-gray-300 hover:text-white">Tracks</Link>
              <Link href="/tutorials" className="text-gray-300 hover:text-white">Tutorials</Link>
              <Link href="/about" className="text-gray-300 hover:text-white">About</Link>
              <Link href="/careers" className="text-white font-medium">Careers</Link>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/auth/login" className="text-gray-300 hover:text-white">Sign In</Link>
              <Link href="/auth/signup" className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-500">Start Free</Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Join Us in Democratizing Tech Education
          </h1>
          <p className="text-xl text-gray-400 mb-8">
            Help us empower the next generation of developers worldwide
          </p>
          <Link href="#openings" className="px-8 py-4 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-500 inline-flex items-center gap-2">
            View Open Positions
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 border-y border-dark-700">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-white mb-12 text-center">Why Work With Us</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit) => (
              <div key={benefit.title} className="text-center">
                <div className="w-16 h-16 bg-primary-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <benefit.icon className="w-8 h-8 text-primary-500" />
                </div>
                <h3 className="font-semibold text-white mb-1">{benefit.title}</h3>
                <p className="text-gray-400 text-sm">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-white mb-12 text-center">Our Values</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value) => (
              <div key={value.title} className="bg-dark-800 rounded-xl p-6 border border-dark-700">
                <h3 className="font-semibold text-white mb-2">{value.title}</h3>
                <p className="text-gray-400 text-sm">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Open Positions */}
      <section id="openings" className="py-20 border-t border-dark-700">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-white mb-4">Open Positions</h2>
          <p className="text-gray-400 mb-8">Join our fully remote team</p>
          <div className="space-y-4">
            {openings.map((job) => (
              <div key={job.title} className="bg-dark-800 rounded-xl p-6 border border-dark-700 hover:border-primary-500/50 transition-colors group">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold text-white group-hover:text-primary-500 transition-colors">{job.title}</h3>
                    <p className="text-gray-400 mb-2">{job.description}</p>
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
                  <button className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-500 whitespace-nowrap">
                    Apply Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 border-t border-dark-700">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Don't see the right role?</h2>
          <p className="text-gray-400 mb-6">We're always looking for talented educators and technologists</p>
          <Link href="/contact" className="px-6 py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-500 inline-flex items-center gap-2">
            Get in Touch
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-dark-900 border-t border-dark-700 py-12">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-400 text-sm">
          © 2024 CodeCamp. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
