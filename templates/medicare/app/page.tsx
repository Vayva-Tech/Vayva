"use client";

import { Heart, Activity, Calendar, Phone, MapPin, Stethoscope, Ambulance, Pill, ArrowRight } from "lucide-react";
import Link from "next/link";

const services = [
  { name: "General Medicine", icon: "🩺", desc: "Primary care for all ages" },
  { name: "Cardiology", icon: "❤️", desc: "Heart health specialists" },
  { name: "Pediatrics", icon: "👶", desc: "Children's healthcare" },
  { name: "Orthopedics", icon: "🦴", desc: "Bone & joint care" },
  { name: "Dentistry", icon: "🦷", desc: "Dental & oral health" },
  { name: "Emergency", icon: "🚑", desc: "24/7 emergency services" },
];

const doctors = [
  { id: 1, name: "Dr. Sarah Johnson", specialty: "Cardiologist", exp: "15 years", image: "bg-gradient-to-br from-pink-100 to-rose-100" },
  { id: 2, name: "Dr. Michael Chen", specialty: "Neurologist", exp: "12 years", image: "bg-gradient-to-br from-blue-100 to-cyan-100" },
  { id: 3, name: "Dr. Emily Davis", specialty: "Pediatrician", exp: "10 years", image: "bg-gradient-to-br from-green-100 to-emerald-100" },
  { id: 4, name: "Dr. James Wilson", specialty: "Orthopedic", exp: "18 years", image: "bg-gradient-to-br from-amber-100 to-yellow-100" },
];

const stats = [
  { value: "50+", label: "Expert Doctors" },
  { value: "25K+", label: "Patients Served" },
  { value: "15+", label: "Years Experience" },
  { value: "99%", label: "Satisfaction Rate" },
];

export default function MediCareHome() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">MediCare</span>
            </Link>
            <div className="hidden md:flex items-center gap-8">
              <Link href="/services" className="text-gray-700 hover:text-primary-600">Services</Link>
              <Link href="/doctors" className="text-gray-700 hover:text-primary-600">Doctors</Link>
              <Link href="/about" className="text-gray-700 hover:text-primary-600">About</Link>
              <Link href="/contact" className="text-gray-700 hover:text-primary-600">Contact</Link>
            </div>
            <Link href="/appointment" className="btn-primary">Book Appointment</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="section-padding bg-gradient-to-br from-primary-50 to-secondary-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="inline-block px-4 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-medium mb-4">Welcome to MediCare</span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
                Your Health is Our <span className="text-primary-600">Priority</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                Providing quality healthcare services with experienced doctors and modern facilities.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="/appointment" className="btn-primary flex items-center gap-2">
                  <Calendar className="w-5 h-5" /> Book Appointment
                </Link>
                <Link href="/services" className="btn-secondary">Our Services</Link>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square bg-gradient-to-br from-primary-200 to-secondary-200 rounded-3xl" />
              <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl shadow-xl p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                    <Activity className="w-6 h-6 text-primary-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-primary-600">99%</div>
                    <div className="text-gray-600">Patient Satisfaction</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
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

      {/* Services */}
      <section className="section-padding">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl font-bold mb-4">Our Medical Services</h2>
            <p className="text-gray-600">Comprehensive healthcare services for you and your family</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => (
              <div key={service.name} className="p-6 bg-gray-50 rounded-2xl hover:bg-primary-50 hover:shadow-md transition-all group">
                <span className="text-4xl mb-4 block">{service.icon}</span>
                <h3 className="font-semibold text-lg mb-2">{service.name}</h3>
                <p className="text-gray-600">{service.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Doctors */}
      <section className="section-padding bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold">Our Expert Doctors</h2>
            <Link href="/doctors" className="text-primary-600 font-medium hover:underline flex items-center gap-1">
              View All <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {doctors.map((doc) => (
              <div key={doc.id} className="bg-white rounded-2xl overflow-hidden shadow-sm group hover:shadow-lg transition-shadow">
                <div className={`h-48 ${doc.image}`} />
                <div className="p-4">
                  <h3 className="font-semibold text-lg">{doc.name}</h3>
                  <p className="text-primary-600">{doc.specialty}</p>
                  <p className="text-gray-500 text-sm">{doc.exp} experience</p>
                  <button className="w-full mt-4 py-2 bg-primary-50 text-primary-600 rounded-lg hover:bg-primary-100 transition-colors">
                    Book Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Emergency CTA */}
      <section className="py-20 bg-gradient-to-r from-red-500 to-rose-600">
        <div className="max-w-4xl mx-auto text-center px-4">
          <div className="flex items-center justify-center gap-4 mb-4">
            <Ambulance className="w-10 h-10 text-white" />
            <h2 className="text-3xl font-bold text-white">24/7 Emergency Services</h2>
          </div>
          <p className="text-white/80 mb-8">Immediate medical attention when you need it most</p>
          <div className="flex flex-wrap justify-center gap-4">
            <a href="tel:911" className="px-8 py-3 bg-white text-red-600 font-medium rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-2">
              <Phone className="w-5 h-5" /> Emergency: 911
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center">
                  <Heart className="w-6 h-6 text-white" />
                </div>
                <span className="text-white font-bold text-xl">MediCare</span>
              </div>
              <p className="text-sm">Providing quality healthcare services with compassion and excellence.</p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Services</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/general-medicine">General Medicine</Link></li>
                <li><Link href="/cardiology">Cardiology</Link></li>
                <li><Link href="/pediatrics">Pediatrics</Link></li>
                <li><Link href="/orthopedics">Orthopedics</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2"><MapPin className="w-4 h-4" /> 123 Medical Center Dr</li>
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
            © 2024 MediCare. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
