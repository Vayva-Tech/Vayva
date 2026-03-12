"use client";

import { Building2, ArrowLeft, Mail, MapPin, Phone, Clock } from "lucide-react";
import Link from "next/link";

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-stone-50">
      {/* Navigation */}
      <nav className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-stone-700 rounded-lg flex items-center justify-center">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">UrbanScape</span>
            </Link>
            <Link href="/" className="text-gray-600 hover:text-gray-900 flex items-center gap-1">
              <ArrowLeft className="w-4 h-4" />
              Back
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="bg-gradient-to-br from-stone-700 to-stone-900 py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-3xl font-bold text-white mb-4">Contact Us</h1>
          <p className="text-stone-300">Get in touch for urban design solutions</p>
        </div>
      </section>

      {/* Contact Info */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div className="bg-white rounded-xl p-8 border border-stone-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Send a Message</h2>
              <form className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <input type="text" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-stone-500 focus:border-transparent" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input type="email" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-stone-500 focus:border-transparent" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Project Type</label>
                  <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-stone-500 focus:border-transparent">
                    <option>Landscape Design</option>
                    <option>Hardscape Installation</option>
                    <option>Outdoor Lighting</option>
                    <option>Commercial Project</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                  <textarea rows={5} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-stone-500 focus:border-transparent" />
                </div>
                <button type="submit" className="w-full px-6 py-3 bg-stone-700 text-white font-semibold rounded-lg hover:bg-stone-800">
                  Send Message
                </button>
              </form>
            </div>

            {/* Contact Details */}
            <div className="space-y-6">
              <div className="bg-white rounded-xl p-6 border border-stone-200">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-stone-100 rounded-lg flex items-center justify-center">
                    <Mail className="w-5 h-5 text-stone-700" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Email</h3>
                    <p className="text-gray-600">hello@urbanscape.com</p>
                    <p className="text-gray-600">projects@urbanscape.com</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl p-6 border border-stone-200">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-stone-100 rounded-lg flex items-center justify-center">
                    <Phone className="w-5 h-5 text-stone-700" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Phone</h3>
                    <p className="text-gray-600">1-800-URBANSCAPE</p>
                    <p className="text-gray-500 text-sm">Mon-Fri 8am-6pm EST</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl p-6 border border-stone-200">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-stone-100 rounded-lg flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-stone-700" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Design Studio</h3>
                    <p className="text-gray-600">456 Design District</p>
                    <p className="text-gray-600">Denver, CO 80202</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl p-6 border border-stone-200">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-stone-100 rounded-lg flex items-center justify-center">
                    <Clock className="w-5 h-5 text-stone-700" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Office Hours</h3>
                    <p className="text-gray-600">Mon-Fri: 8am - 6pm</p>
                    <p className="text-gray-600">Sat: By appointment</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-400 text-sm">
          © 2024 UrbanScape. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
