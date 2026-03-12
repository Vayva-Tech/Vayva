"use client";

import { Heart, Users, Globe, Target, ArrowRight, Check } from "lucide-react";
import Link from "next/link";

const causes = [
  { name: "Education", raised: 125000, goal: 200000, donors: 1245, image: "bg-gradient-to-br from-blue-100 to-indigo-200" },
  { name: "Clean Water", raised: 89000, goal: 150000, donors: 892, image: "bg-gradient-to-br from-cyan-100 to-blue-200" },
  { name: "Healthcare", raised: 156000, goal: 250000, donors: 2103, image: "bg-gradient-to-br from-rose-100 to-pink-200" },
  { name: "Food Security", raised: 67000, goal: 100000, donors: 678, image: "bg-gradient-to-br from-amber-100 to-orange-200" },
];

const stats = [
  { value: "$2.5M+", label: "Funds Raised" },
  { value: "50K+", label: "Donors Worldwide" },
  { value: "120+", label: "Countries Served" },
  { value: "200+", label: "Projects Completed" },
];

const features = [
  { icon: Heart, title: "100% Transparent", desc: "See exactly where your donation goes" },
  { icon: Users, title: "Community Driven", desc: "Powered by people like you" },
  { icon: Globe, title: "Global Impact", desc: "Making a difference worldwide" },
  { icon: Target, title: "Goal Focused", desc: "Every project has clear objectives" },
];

export default function HopeRiseHome() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">HopeRise</span>
            </Link>
            <div className="hidden md:flex items-center gap-8">
              <Link href="/causes" className="text-gray-700 hover:text-primary-600">Our Causes</Link>
              <Link href="/impact" className="text-gray-700 hover:text-primary-600">Impact</Link>
              <Link href="/about" className="text-gray-700 hover:text-primary-600">About</Link>
              <Link href="/volunteer" className="text-gray-700 hover:text-primary-600">Volunteer</Link>
            </div>
            <Link href="/donate" className="btn-primary">Donate Now</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative bg-gradient-to-br from-primary/10 to-secondary/10 section-padding">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="inline-block px-4 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium mb-4">Nonprofit Organization</span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-6">
                Making a <span className="text-primary">Difference</span> Together
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                Join us in our mission to create positive change in communities around the world through education, healthcare, and sustainable development.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="/donate" className="px-6 py-3 bg-primary text-primary-foreground font-medium rounded-lg hover:opacity-90 transition-colors inline-flex items-center gap-2">
                  Donate Now <ArrowRight className="w-5 h-5" />
                </Link>
                <Link href="/causes" className="px-6 py-3 bg-card text-foreground font-medium rounded-lg border hover:bg-accent/10 transition-colors">Explore Causes</Link>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square bg-gradient-to-br from-primary/20 to-secondary/20 rounded-3xl" />
              <div className="absolute -bottom-6 -left-6 bg-card rounded-2xl shadow-xl p-6 border">
                <div className="text-3xl font-bold text-primary">$2.5M+</div>
                <div className="text-muted-foreground">Total Raised</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 bg-primary">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center text-primary-foreground">
                <div className="text-4xl font-bold mb-2">{stat.value}</div>
                <div className="text-primary-foreground/80">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Causes */}
      <section className="section-padding">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl font-bold mb-4">Our Causes</h2>
            <p className="text-muted-foreground">Support causes that matter. Every donation brings us closer to our goals.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {causes.map((cause) => (
              <div key={cause.name} className="bg-card rounded-2xl shadow-sm overflow-hidden group hover:shadow-lg transition-shadow border">
                <div className={`h-48 ${cause.image}`} />
                <div className="p-6">
                  <h3 className="font-semibold text-lg mb-2">{cause.name}</h3>
                  <div className="mb-4">
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full" style={{ width: `${(cause.raised / cause.goal) * 100}%` }} />
                    </div>
                    <div className="flex justify-between text-sm mt-2">
                      <span className="font-semibold text-primary">${(cause.raised / 1000).toFixed(0)}k raised</span>
                      <span className="text-muted-foreground">of ${(cause.goal / 1000).toFixed(0)}k</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">{cause.donors.toLocaleString()} donors</span>
                    <button className="text-primary font-medium hover:underline">Donate</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="section-padding bg-muted/30">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl font-bold mb-4">Why Choose HopeRise</h2>
            <p className="text-muted-foreground">We're committed to transparency, accountability, and measurable impact.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature) => (
              <div key={feature.title} className="text-center p-6">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-primary to-secondary">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-3xl font-bold text-primary-foreground mb-4">Ready to Make an Impact?</h2>
          <p className="text-primary-foreground/80 mb-8">Join thousands of donors creating positive change worldwide</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/donate" className="px-8 py-3 bg-white text-primary font-medium rounded-lg hover:bg-white/90 transition-colors">
              Donate Now
            </Link>
            <Link href="/volunteer" className="px-8 py-3 border-2 border-white text-white font-medium rounded-lg hover:bg-white/10 transition-colors">
              Become a Volunteer
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center">
                  <Heart className="w-6 h-6 text-white" />
                </div>
                <span className="font-bold text-xl">HopeRise</span>
              </div>
              <p className="text-sm text-muted-foreground">Making a difference in communities worldwide through sustainable development and compassionate action.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Causes</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/education" className="hover:text-foreground">Education</Link></li>
                <li><Link href="/healthcare" className="hover:text-foreground">Healthcare</Link></li>
                <li><Link href="/water" className="hover:text-foreground">Clean Water</Link></li>
                <li><Link href="/food" className="hover:text-foreground">Food Security</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Get Involved</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/donate" className="hover:text-foreground">Donate</Link></li>
                <li><Link href="/volunteer" className="hover:text-foreground">Volunteer</Link></li>
                <li><Link href="/fundraise" className="hover:text-foreground">Fundraise</Link></li>
                <li><Link href="/partner" className="hover:text-foreground">Partner With Us</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>info@hoperise.org</li>
                <li>+1 (555) 123-4567</li>
                <li>123 Charity Lane, City</li>
              </ul>
            </div>
          </div>
          <div className="border-t pt-8 text-center text-sm text-muted-foreground">
            © 2024 HopeRise. All rights reserved. Registered 501(c)(3) nonprofit.
          </div>
        </div>
      </footer>
    </div>
  );
}
