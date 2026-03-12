"use client";

import { Heart, Stethoscope, Scissors, Pill, Phone, MapPin, Clock, Star, ArrowRight } from "lucide-react";
import Link from "next/link";

const services = [
  { name: "Wellness Exams", icon: "🩺", desc: "Annual health checkups" },
  { name: "Vaccinations", icon: "💉", desc: "Keep pets protected" },
  { name: "Surgery", icon: "🏥", desc: "Advanced procedures" },
  { name: "Dental Care", icon: "🦷", desc: "Oral health services" },
  { name: "Grooming", icon: "✂️", desc: "Professional grooming" },
  { name: "Emergency", icon: "🚑", desc: "24/7 emergency care" },
];

const vets = [
  { id: 1, name: "Dr. Amanda Lee", specialty: "Small Animals", exp: "10 years", image: "bg-gradient-to-br from-pink-100 to-rose-100" },
  { id: 2, name: "Dr. Robert Chen", specialty: "Exotic Pets", exp: "8 years", image: "bg-gradient-to-br from-blue-100 to-cyan-100" },
  { id: 3, name: "Dr. Maria Garcia", specialty: "Surgery", exp: "15 years", image: "bg-gradient-to-br from-green-100 to-emerald-100" },
  { id: 4, name: "Dr. James Wilson", specialty: "Dentistry", exp: "12 years", image: "bg-gradient-to-br from-amber-100 to-yellow-100" },
];

const stats = [
  { value: "20K+", label: "Pets Treated" },
  { value: "15+", label: "Expert Vets" },
  { value: "25", label: "Years Service" },
  { value: "98%", label: "Satisfaction" },
];

export default function PetCareHome() {
  return (
    <div className="min-h-screen bg-white">
      <nav className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">PetCare</span>
            </Link>
            <div className="hidden md:flex items-center gap-8">
              <Link href="/services" className="text-gray-700 hover:text-primary-600">Services</Link>
              <Link href="/vets" className="text-gray-700 hover:text-primary-600">Our Vets</Link>
              <Link href="/about" className="text-gray-700 hover:text-primary-600">About</Link>
            </div>
            <Link href="/book" className="btn-primary">Book Appointment</Link>
          </div>
        </div>
      </nav>

      <section className="section-padding bg-gradient-to-br from-primary-50 to-secondary-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
                We Care for Your <span className="text-primary-600">Best Friends</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                Comprehensive veterinary care with compassion and expertise
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="/book" className="btn-primary flex items-center gap-2">
                  <Clock className="w-5 h-5" /> Book Now
                </Link>
                <Link href="/services" className="btn-secondary">Our Services</Link>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square bg-gradient-to-br from-primary-200 to-secondary-200 rounded-3xl" />
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 bg-primary-600">
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
          <h2 className="text-3xl font-bold text-center mb-12">Our Services</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((s) => (
              <div key={s.name} className="p-6 bg-gray-50 rounded-2xl hover:bg-primary-50 transition-all">
                <span className="text-4xl mb-4 block">{s.icon}</span>
                <h3 className="font-semibold text-lg mb-2">{s.name}</h3>
                <p className="text-gray-600">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-padding bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold">Our Veterinarians</h2>
            <Link href="/vets" className="text-primary-600 font-medium hover:underline flex items-center gap-1">
              View All <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {vets.map((v) => (
              <div key={v.id} className="bg-white rounded-2xl overflow-hidden shadow-sm">
                <div className={`h-48 ${v.image}`} />
                <div className="p-4">
                  <h3 className="font-semibold text-lg">{v.name}</h3>
                  <p className="text-primary-600">{v.specialty}</p>
                  <p className="text-gray-500 text-sm">{v.exp} experience</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-r from-primary-600 to-secondary-600">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-3xl font-bold text-white mb-4">Emergency? We're Here 24/7</h2>
          <a href="tel:5551234567" className="px-8 py-3 bg-white text-primary-600 font-medium rounded-lg hover:bg-gray-100 transition-colors inline-flex items-center gap-2">
            <Phone className="w-5 h-5" /> Call Now
          </a>
        </div>
      </section>

      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center">
                  <Heart className="w-6 h-6 text-white" />
                </div>
                <span className="text-white font-bold text-xl">PetCare</span>
              </div>
              <p className="text-sm">Caring for your pets like family.</p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Services</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/wellness">Wellness Exams</Link></li>
                <li><Link href="/surgery">Surgery</Link></li>
                <li><Link href="/dental">Dental Care</Link></li>
                <li><Link href="/emergency">Emergency</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2"><MapPin className="w-4 h-4" /> 123 Pet Lane</li>
                <li className="flex items-center gap-2"><Phone className="w-4 h-4" /> +1 (555) 123-4567</li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Hours</h4>
              <ul className="space-y-2 text-sm">
                <li>Mon-Fri: 8AM - 8PM</li>
                <li>Sat: 9AM - 5PM</li>
                <li>Sun: Emergency Only</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm">
            © 2024 PetCare. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
