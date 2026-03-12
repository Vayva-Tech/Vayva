"use client";

import { Heart, Users, Calendar, MapPin, ArrowRight, CheckCircle, Star, Globe } from "lucide-react";
import Link from "next/link";

const opportunities = [
  {
    title: "Community Educator",
    location: "Remote / Local",
    commitment: "5-10 hours/week",
    description: "Teach basic literacy and numeracy skills to children in underserved communities.",
    icon: "📚",
  },
  {
    title: "Healthcare Volunteer",
    location: "International",
    commitment: "2-4 weeks",
    description: "Assist medical professionals in providing care at rural clinics and mobile health camps.",
    icon: "🏥",
  },
  {
    title: "Event Coordinator",
    location: "Local",
    commitment: "Event-based",
    description: "Help organize fundraising events, community drives, and awareness campaigns.",
    icon: "🎉",
  },
  {
    title: "Digital Ambassador",
    location: "Remote",
    commitment: "Flexible",
    description: "Spread awareness about our causes through social media and online platforms.",
    icon: "💻",
  },
];

const testimonials = [
  {
    name: "Sarah M.",
    role: "Volunteer since 2022",
    quote: "Volunteering with HopeRise has been the most rewarding experience of my life. I've seen firsthand the impact we make.",
  },
  {
    name: "David K.",
    role: "Community Educator",
    quote: "Teaching children to read and seeing their confidence grow is incredible. Every hour spent is worth it.",
  },
];

export default function VolunteerPage() {
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
              <Link href="/about" className="text-gray-600 hover:text-gray-900">About</Link>
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
            Be the Change You Want to See
          </h1>
          <p className="text-xl text-white/90 mb-8">
            Join our global community of volunteers making a real difference in the world
          </p>
          <Link href="#opportunities" className="px-8 py-4 bg-white text-rose-600 font-semibold rounded-xl hover:bg-gray-100 inline-flex items-center gap-2">
            Find Opportunities
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 border-b">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <p className="text-3xl font-bold text-rose-500 mb-1">10K+</p>
              <p className="text-gray-600">Active Volunteers</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-rose-500 mb-1">150+</p>
              <p className="text-gray-600">Countries</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-rose-500 mb-1">500K</p>
              <p className="text-gray-600">Hours Donated</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-rose-500 mb-1">98%</p>
              <p className="text-gray-600">Would Recommend</p>
            </div>
          </div>
        </div>
      </section>

      {/* Opportunities */}
      <section id="opportunities" className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-4 text-center">Volunteer Opportunities</h2>
          <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
            Find the perfect role that matches your skills and availability
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            {opportunities.map((op) => (
              <div key={op.title} className="bg-gray-50 rounded-xl p-6 hover:bg-gray-100 transition-colors">
                <div className="flex items-start gap-4">
                  <div className="text-4xl">{op.icon}</div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">{op.title}</h3>
                    <p className="text-gray-600 text-sm mb-3">{op.description}</p>
                    <div className="flex flex-wrap gap-2 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {op.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {op.commitment}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Why Volunteer With Us?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Globe className="w-8 h-8 text-rose-500" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Global Impact</h3>
              <p className="text-gray-600">Be part of worldwide initiatives that transform communities</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="w-8 h-8 text-rose-500" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Skill Building</h3>
              <p className="text-gray-600">Develop new skills and gain valuable experience</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-rose-500" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Community</h3>
              <p className="text-gray-600">Connect with like-minded people who share your passion</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Volunteer Stories</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {testimonials.map((t) => (
              <div key={t.name} className="bg-gray-50 rounded-xl p-8">
                <p className="text-gray-700 text-lg italic mb-6">&quot;{t.quote}&quot;</p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-rose-200 rounded-full flex items-center justify-center text-rose-600 font-bold">
                    {t.name[0]}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{t.name}</p>
                    <p className="text-gray-500 text-sm">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-rose-500 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Make a Difference?</h2>
          <p className="text-white/90 mb-8">Join 10,000+ volunteers already creating change</p>
          <button className="px-8 py-4 bg-white text-rose-600 font-semibold rounded-xl hover:bg-gray-100 inline-flex items-center gap-2">
            Apply to Volunteer
            <ArrowRight className="w-5 h-5" />
          </button>
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
