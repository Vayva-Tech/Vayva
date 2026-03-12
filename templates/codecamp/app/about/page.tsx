"use client";

import { Code, Target, Users, Award, ArrowRight, Zap, Globe, BookOpen, Heart } from "lucide-react";
import Link from "next/link";

const stats = [
  { value: "500K+", label: "Students Worldwide" },
  { value: "1,200+", label: "Courses & Tutorials" },
  { value: "94%", label: "Completion Rate" },
  { value: "85%", label: "Career Advancement" },
];

const values = [
  {
    title: "Practical Learning",
    description: "Learn by building real projects, not just watching videos. Every course includes hands-on coding exercises.",
    icon: "💻",
  },
  {
    title: "Expert Instructors",
    description: "Learn from industry professionals who work at top tech companies and bring real-world experience.",
    icon: "👨‍🏫",
  },
  {
    title: "Community First",
    description: "Join a supportive community of learners. Get help, share projects, and grow together.",
    icon: "🤝",
  },
];

const team = [
  { name: "Alex Rivera", role: "CEO & Founder", image: "👨‍💼" },
  { name: "Maria Chen", role: "Head of Education", image: "👩‍💻" },
  { name: "James Park", role: "CTO", image: "👨‍💻" },
  { name: "Sarah Miller", role: "Community Lead", image: "👩‍💼" },
];

export default function AboutPage() {
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
              <Link href="/pricing" className="text-gray-300 hover:text-white">Pricing</Link>
              <Link href="/about" className="text-white font-medium">About</Link>
              <Link href="/contact" className="text-gray-300 hover:text-white">Contact</Link>
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
            Democratizing Tech Education
          </h1>
          <p className="text-xl text-gray-400 mb-8">
            Founded in 2019, CodeCamp has helped over 500,000 students worldwide 
            learn to code and launch their careers in tech.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 border-y border-dark-700">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map((stat) => (
              <div key={stat.label}>
                <p className="text-3xl md:text-4xl font-bold text-primary-500 mb-2">{stat.value}</p>
                <p className="text-gray-400">{stat.label}</p>
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
              <h2 className="text-3xl font-bold text-white mb-6">Our Mission</h2>
              <p className="text-gray-400 text-lg mb-6">
                We believe that quality tech education should be accessible to everyone, 
                regardless of background or location. Our mission is to empower people 
                worldwide with the skills they need to succeed in the digital economy.
              </p>
              <p className="text-gray-400 text-lg mb-6">
                Through project-based learning, mentorship from industry experts, and 
                a supportive community, we help students go from complete beginners 
                to job-ready professionals.
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary-500/20 rounded-full flex items-center justify-center">
                  <Award className="w-6 h-6 text-primary-500" />
                </div>
                <div>
                  <p className="font-semibold text-white">Award-Winning Platform</p>
                  <p className="text-gray-500">Best Online Learning Platform 2024</p>
                </div>
              </div>
            </div>
            <div className="bg-dark-800 rounded-2xl p-8 border border-dark-700">
              <blockquote className="text-xl text-gray-300 italic mb-4">
                &quot;The best investment I&apos;ve made in my career. CodeCamp gave me 
                the skills and confidence to land my dream job at a top tech company.&quot;
              </blockquote>
              <p className="text-primary-500 font-medium">— Michael Chen, Software Engineer at Google</p>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-dark-800">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">What Makes Us Different</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {values.map((value) => (
              <div key={value.title} className="bg-dark-900 rounded-xl p-8 border border-dark-700">
                <div className="text-4xl mb-4">{value.icon}</div>
                <h3 className="text-xl font-semibold text-white mb-3">{value.title}</h3>
                <p className="text-gray-400">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Meet the Team</h2>
            <p className="text-gray-400">The passionate people behind CodeCamp</p>
          </div>
          <div className="grid md:grid-cols-4 gap-8">
            {team.map((member) => (
              <div key={member.name} className="text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-primary-500/20 to-primary-600/20 rounded-full flex items-center justify-center text-5xl mx-auto mb-4 border border-dark-700">
                  {member.image}
                </div>
                <h3 className="font-semibold text-white">{member.name}</h3>
                <p className="text-gray-500">{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 border-t border-dark-700">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Start Your Learning Journey</h2>
          <p className="text-gray-400 mb-8">Join 500,000+ students already learning on CodeCamp</p>
          <Link href="/auth/signup" className="px-8 py-4 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-500 inline-flex items-center gap-2">
            Get Started Free
            <ArrowRight className="w-5 h-5" />
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
