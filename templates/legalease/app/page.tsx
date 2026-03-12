"use client";

import { Scale, Shield, Users, Clock, Phone, Mail, MapPin, ChevronRight } from "lucide-react";
import Link from "next/link";

const practices = [
  { title: "Corporate Law", desc: "Business formation & contracts", icon: "💼" },
  { title: "Family Law", desc: "Divorce, custody & adoption", icon: "👨‍👩‍👧" },
  { title: "Criminal Defense", desc: "Defense & representation", icon: "⚖️" },
  { title: "Real Estate", desc: "Property transactions", icon: "🏠" },
];

const stats = [
  { value: "25+", label: "Years Experience" },
  { value: "500+", label: "Cases Won" },
  { value: "50+", label: "Expert Lawyers" },
  { value: "99%", label: "Client Satisfaction" },
];

const team = [
  { name: "Robert Mitchell", role: "Managing Partner", exp: "30 years" },
  { name: "Sarah Anderson", role: "Senior Attorney", exp: "20 years" },
  { name: "James Chen", role: "Partner", exp: "15 years" },
];

export default function LegalEaseHome() {
  return (
    <div className="min-h-screen bg-white">
      <nav className="bg-gray-900 text-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <Scale className="w-8 h-8 text-amber-600" />
              <span className="text-xl font-bold">LegalEase</span>
            </Link>
            <div className="hidden md:flex items-center gap-8">
              <Link href="/practice-areas" className="text-gray-300 hover:text-white">Practice Areas</Link>
              <Link href="/attorneys" className="text-gray-300 hover:text-white">Attorneys</Link>
              <Link href="/cases" className="text-gray-300 hover:text-white">Case Results</Link>
              <Link href="/contact" className="text-gray-300 hover:text-white">Contact</Link>
            </div>
            <Link href="/consultation" className="btn-primary">Free Consultation</Link>
          </div>
        </div>
      </nav>

      <section className="section-padding bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
                Expert Legal <span className="text-amber-600">Representation</span>
              </h1>
              <p className="text-xl text-gray-400 mb-8">
                Dedicated attorneys fighting for your rights and protecting your interests
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="/consultation" className="btn-primary">Schedule Consultation</Link>
                <Link href="/practice-areas" className="px-8 py-3 border border-gray-600 text-white rounded-lg hover:bg-gray-800">Our Services</Link>
              </div>
            </div>
            <div className="bg-gray-800 rounded-2xl p-8">
              <h3 className="text-2xl font-bold mb-6">Request Case Review</h3>
              <form className="space-y-4">
                <input type="text" placeholder="Full Name" className="w-full px-4 py-3 bg-gray-700 rounded-lg border-0 text-white" />
                <input type="email" placeholder="Email Address" className="w-full px-4 py-3 bg-gray-700 rounded-lg border-0 text-white" />
                <select className="w-full px-4 py-3 bg-gray-700 rounded-lg border-0 text-white">
                  <option>Select Practice Area</option>
                  <option>Corporate Law</option>
                  <option>Family Law</option>
                  <option>Criminal Defense</option>
                </select>
                <button className="w-full btn-primary">Submit Request</button>
              </form>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 bg-amber-600">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center text-white">
                <div className="text-4xl font-bold mb-2">{stat.value}</div>
                <div className="text-white/80">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-padding">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Practice Areas</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {practices.map((p) => (
              <div key={p.title} className="p-6 bg-gray-50 rounded-2xl hover:shadow-lg transition-shadow cursor-pointer">
                <span className="text-4xl mb-4 block">{p.icon}</span>
                <h3 className="text-xl font-semibold mb-2">{p.title}</h3>
                <p className="text-gray-600">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-padding bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Our Attorneys</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {team.map((member) => (
              <div key={member.name} className="bg-white rounded-2xl overflow-hidden shadow-sm">
                <div className="bg-gray-300 h-48" />
                <div className="p-6">
                  <h3 className="text-xl font-semibold">{member.name}</h3>
                  <p className="text-amber-600 font-medium">{member.role}</p>
                  <p className="text-gray-500 mt-2">{member.exp} experience</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Scale className="w-8 h-8 text-amber-600" />
                <span className="text-white font-bold text-xl">LegalEase</span>
              </div>
              <p className="text-sm">Trusted legal representation since 1999.</p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Practice Areas</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/corporate">Corporate Law</Link></li>
                <li><Link href="/family">Family Law</Link></li>
                <li><Link href="/criminal">Criminal Defense</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2"><Phone className="w-4 h-4" /> (555) 123-4567</li>
                <li className="flex items-center gap-2"><Mail className="w-4 h-4" /> info@legalease.com</li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Office</h4>
              <p className="text-sm">123 Legal Avenue<br />New York, NY 10001</p>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm">
            © 2024 LegalEase. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
