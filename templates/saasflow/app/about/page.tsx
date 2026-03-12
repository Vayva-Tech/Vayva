"use client";

import { Target, Heart, Users, Zap, Globe, Award, ArrowRight, Linkedin, Twitter, Github } from "lucide-react";
import Link from "next/link";

const values = [
  { icon: Target, title: "Customer First", description: "We obsess over solving customer problems and delivering value" },
  { icon: Zap, title: "Move Fast", description: "Speed matters. We ship quickly and iterate based on feedback" },
  { icon: Users, title: "Teamwork", description: "Great things are built by teams that trust and support each other" },
  { icon: Heart, title: "Passion", description: "We love what we do and bring that energy to everything" },
];

const stats = [
  { value: "50K+", label: "Active Users" },
  { value: "100+", label: "Countries" },
  { value: "$10M+", label: "Funding Raised" },
  { value: "4.9/5", label: "User Rating" },
];

const team = [
  { name: "Sarah Chen", role: "CEO & Co-founder", image: "👩‍💼", bio: "Former Google PM, Stanford MBA" },
  { name: "Mike Johnson", role: "CTO & Co-founder", image: "👨‍💻", bio: "Ex-Netflix engineer, distributed systems expert" },
  { name: "Emily Davis", role: "Head of Design", image: "👩‍🎨", bio: "Previously led design at Figma" },
  { name: "Alex Rivera", role: "VP Engineering", image: "👨‍💼", bio: "Built scale at Stripe and Airbnb" },
  { name: "Lisa Park", role: "Head of Marketing", image: "👩‍💼", bio: "Growth lead at multiple unicorns" },
  { name: "David Kim", role: "Head of Sales", image: "👨‍💼", bio: "Closed $100M+ in ARR throughout career" },
];

const investors = [
  { name: "Accel Partners", tier: "Series A Lead" },
  { name: "Andreessen Horowitz", tier: "Seed" },
  { name: "Y Combinator", tier: "Accelerator" },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="border-b sticky top-0 z-50 bg-white/80 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg" />
              <span className="text-xl font-bold text-gray-900">SaaSFlow</span>
            </Link>
            <div className="hidden md:flex items-center gap-8">
              <Link href="/features" className="text-gray-600 hover:text-gray-900">Features</Link>
              <Link href="/pricing" className="text-gray-600 hover:text-gray-900">Pricing</Link>
              <Link href="/about" className="text-indigo-600 font-medium">About</Link>
              <Link href="/blog" className="text-gray-600 hover:text-gray-900">Blog</Link>
            </div>
            <Link href="/auth/login" className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="py-20 bg-gradient-to-br from-indigo-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Building the Future of
            <span className="text-indigo-600"> Work</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            SaaSFlow was founded in 2020 with a simple mission: to help teams work smarter, 
            not harder. Today, we&apos;re trusted by 50,000+ companies worldwide.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/careers" className="px-8 py-4 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 inline-flex items-center gap-2">
              Join Our Team
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link href="/contact" className="px-8 py-4 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50">
              Contact Us
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 border-b">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
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
                We believe that great work happens when teams have the right tools. Our mission 
                is to build software that removes friction, automates busywork, and lets people 
                focus on what matters most.
              </p>
              <p className="text-lg text-gray-600 mb-6">
                From startups to Fortune 500s, teams use SaaSFlow to collaborate, track progress, 
                and ship faster. We&apos;re just getting started.
              </p>
              <div className="flex items-center gap-4">
                <div className="flex -space-x-2">
                  {["👩‍💼", "👨‍💻", "👩‍🎨", "👨‍💼"].map((avatar, i) => (
                    <div key={i} className="w-10 h-10 bg-gray-200 rounded-full border-2 border-white flex items-center justify-center">
                      {avatar}
                    </div>
                  ))}
                </div>
                <p className="text-sm text-gray-600">Join 200+ team members worldwide</p>
              </div>
            </div>
            <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl p-8 text-white">
              <Globe className="w-12 h-12 mb-4" />
              <blockquote className="text-xl font-medium mb-4">
                &quot;The best teams in the world use SaaSFlow. We&apos;re honored to be part of their success stories.&quot;
              </blockquote>
              <p className="text-indigo-200">— Sarah Chen, CEO & Co-founder</p>
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
              These principles guide everything we do, from product decisions to how we treat each other.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value) => (
              <div key={value.title} className="bg-white rounded-xl p-6 shadow-sm">
                <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mb-4">
                  <value.icon className="w-6 h-6 text-indigo-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{value.title}</h3>
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
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Meet the Team</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              We&apos;re a diverse team of builders, designers, and problem-solvers.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {team.map((member) => (
              <div key={member.name} className="bg-gray-50 rounded-xl p-6 text-center">
                <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center text-4xl">
                  {member.image}
                </div>
                <h3 className="text-lg font-semibold text-gray-900">{member.name}</h3>
                <p className="text-indigo-600 font-medium mb-2">{member.role}</p>
                <p className="text-gray-600 text-sm mb-4">{member.bio}</p>
                <div className="flex justify-center gap-3">
                  <a href="#" className="p-2 text-gray-400 hover:text-gray-600">
                    <Linkedin className="w-5 h-5" />
                  </a>
                  <a href="#" className="p-2 text-gray-400 hover:text-gray-600">
                    <Twitter className="w-5 h-5" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Investors */}
      <section className="py-20 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Backed by the Best</h2>
          <p className="text-gray-400 mb-12">We&apos;re fortunate to work with world-class investors</p>
          <div className="flex flex-wrap justify-center gap-8">
            {investors.map((investor) => (
              <div key={investor.name} className="px-8 py-4 bg-gray-800 rounded-xl">
                <p className="font-semibold text-lg">{investor.name}</p>
                <p className="text-sm text-gray-400">{investor.tier}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-br from-indigo-600 to-purple-700 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Join Us?</h2>
          <p className="text-xl text-indigo-200 mb-8">
            We&apos;re always looking for talented people to help us build the future of work.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/careers" className="px-8 py-4 bg-white text-indigo-600 font-semibold rounded-xl hover:bg-gray-100">
              View Open Positions
            </Link>
            <Link href="/contact" className="px-8 py-4 border border-white/30 text-white font-semibold rounded-xl hover:bg-white/10">
              Get in Touch
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
