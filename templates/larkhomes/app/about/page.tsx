"use client";

import { MapPin, Award, Users, Home, TrendingUp, Shield, Check, ArrowRight, Heart } from "lucide-react";
import Link from "next/link";

const milestones = [
  { year: "2009", title: "Founded", description: "LarkHomes was established with a vision to transform real estate" },
  { year: "2012", title: "1,000 Sales", description: "Reached our first major milestone in property sales" },
  { year: "2015", title: "National Expansion", description: "Expanded operations to 10 major US cities" },
  { year: "2018", title: "Tech Innovation", description: "Launched AI-powered property matching platform" },
  { year: "2021", title: "10,000+ Clients", description: "Helped over 10,000 families find their dream homes" },
  { year: "2024", title: "Industry Leader", description: "Ranked #1 in customer satisfaction nationwide" },
];

const values = [
  {
    title: "Trust & Integrity",
    description: "We believe in transparent dealings and honest communication with every client.",
    icon: Shield,
  },
  {
    title: "Client First",
    description: "Your needs and preferences guide every recommendation we make.",
    icon: Heart,
  },
  {
    title: "Market Expertise",
    description: "Deep local knowledge combined with national market insights.",
    icon: TrendingUp,
  },
  {
    title: "Innovation",
    description: "Leveraging technology to make your home search easier and faster.",
    icon: Home,
  },
];

const team = [
  { name: "Robert Chen", role: "CEO & Founder", image: "👨‍💼", bio: "20+ years in real estate, former investment banker" },
  { name: "Amanda Foster", role: "Chief Operations Officer", image: "👩‍💼", bio: "Scaling startups and building world-class teams" },
  { name: "David Park", role: "Head of Technology", image: "👨‍💻", bio: "Tech veteran from Google and Meta" },
  { name: "Lisa Martinez", role: "Director of Sales", image: "👩‍💼", bio: "Top-performing agent turned sales leader" },
];

const stats = [
  { value: "$2.5B+", label: "Properties Sold" },
  { value: "15,000+", label: "Happy Clients" },
  { value: "50+", label: "Cities Covered" },
  { value: "98%", label: "Client Satisfaction" },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                <MapPin className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">LarkHomes</span>
            </Link>
            <div className="hidden md:flex items-center gap-8">
              <Link href="/properties" className="text-gray-600 hover:text-gray-900">Properties</Link>
              <Link href="/agents" className="text-gray-600 hover:text-gray-900">Agents</Link>
              <Link href="/about" className="text-indigo-600 font-medium">About</Link>
              <Link href="/contact" className="text-gray-600 hover:text-gray-900">Contact</Link>
            </div>
            <Link href="/auth/login" className="px-4 py-2 text-gray-600 hover:text-gray-900">Sign In</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative bg-gradient-to-br from-indigo-900 to-purple-900 py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Reimagining Real Estate Since 2009
            </h1>
            <p className="text-xl text-indigo-200">
              We&apos;re on a mission to make finding your dream home simple, transparent, and enjoyable. 
              With over 15 years of experience, we&apos;ve helped thousands of families find their perfect place.
            </p>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-indigo-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-4xl font-bold text-indigo-700 mb-2">{stat.value}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">Our Story</h2>
              <p className="text-gray-600 mb-4 leading-relaxed">
                LarkHomes was founded in 2009 with a simple belief: that finding a home should be 
                an exciting journey, not a stressful ordeal. What started as a small team of 
                passionate real estate professionals has grown into a nationwide network of 
                expert agents and satisfied clients.
              </p>
              <p className="text-gray-600 mb-4 leading-relaxed">
                Today, we combine cutting-edge technology with personalized service to deliver 
                an unmatched home-buying experience. Our AI-powered matching system and 
                comprehensive market analysis tools help you find properties that truly fit 
                your lifestyle and budget.
              </p>
              <p className="text-gray-600 leading-relaxed">
                But technology is just a tool. At the heart of LarkHomes are our people—
                dedicated agents who understand that a home is more than just a property; 
                it&apos;s where memories are made and dreams take shape.
              </p>
            </div>
            <div className="bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl h-96 flex items-center justify-center">
              <span className="text-8xl">🏢</span>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Our Core Values</h2>
            <p className="text-gray-600">The principles that guide everything we do</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value) => (
              <div key={value.title} className="bg-white rounded-xl p-6 shadow-sm">
                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                  <value.icon className="w-6 h-6 text-indigo-600" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{value.title}</h3>
                <p className="text-gray-600 text-sm">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Our Journey</h2>
            <p className="text-gray-600">Key milestones in our growth</p>
          </div>
          <div className="relative">
            <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-0.5 bg-gray-200 hidden lg:block" />
            <div className="space-y-8">
              {milestones.map((milestone, idx) => (
                <div key={milestone.year} className={`flex items-center gap-8 ${idx % 2 === 0 ? "lg:flex-row" : "lg:flex-row-reverse"}`}>
                  <div className="flex-1 lg:text-right">
                    <div className={`bg-white rounded-xl p-6 shadow-sm inline-block ${idx % 2 === 0 ? "lg:text-right" : "lg:text-left"}`}>
                      <span className="text-indigo-600 font-bold text-lg">{milestone.year}</span>
                      <h3 className="font-semibold mt-1">{milestone.title}</h3>
                      <p className="text-gray-600 text-sm mt-1">{milestone.description}</p>
                    </div>
                  </div>
                  <div className="w-4 h-4 bg-indigo-600 rounded-full hidden lg:block z-10" />
                  <div className="flex-1" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Leadership */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Leadership Team</h2>
            <p className="text-gray-600">Meet the people behind LarkHomes</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {team.map((member) => (
              <div key={member.name} className="bg-white rounded-xl p-6 text-center shadow-sm">
                <div className="w-24 h-24 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center text-4xl">
                  {member.image}
                </div>
                <h3 className="font-semibold text-lg">{member.name}</h3>
                <p className="text-indigo-600 text-sm mb-2">{member.role}</p>
                <p className="text-gray-600 text-sm">{member.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Awards */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Recognition & Awards</h2>
            <p className="text-gray-600">Industry recognition for our commitment to excellence</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-6 text-center">
              <div className="text-4xl mb-4">🏆</div>
              <h3 className="font-semibold mb-1">Best Real Estate Platform 2024</h3>
              <p className="text-gray-600 text-sm">Tech Innovators Award</p>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 text-center">
              <div className="text-4xl mb-4">⭐</div>
              <h3 className="font-semibold mb-1">Top Rated Agency</h3>
              <p className="text-gray-600 text-sm">4.9/5 from 5,000+ reviews</p>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 text-center">
              <div className="text-4xl mb-4">🌱</div>
              <h3 className="font-semibold mb-1">Sustainable Business Award</h3>
              <p className="text-gray-600 text-sm">Green Business Bureau</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-indigo-900">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Find Your Dream Home?</h2>
          <p className="text-indigo-200 mb-8">
            Let our experienced team guide you through every step of the home buying process
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/properties" className="px-8 py-4 bg-white text-indigo-900 font-semibold rounded-xl hover:bg-indigo-50">
              Browse Properties
            </Link>
            <Link href="/contact" className="px-8 py-4 border border-white text-white font-semibold rounded-xl hover:bg-white/10">
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
