"use client";

import { MapPin, Phone, Mail, Clock, Send, Check } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const offices = [
  {
    city: "New York",
    address: "350 Fifth Avenue, Suite 4500",
    phone: "+1 (555) 123-4567",
    hours: "Mon-Fri: 9AM - 6PM",
    image: "🗽",
  },
  {
    city: "Los Angeles",
    address: "10250 Santa Monica Blvd",
    phone: "+1 (555) 234-5678",
    hours: "Mon-Fri: 9AM - 6PM",
    image: "🌴",
  },
  {
    city: "Miami",
    address: "100 Biscayne Blvd, Suite 2800",
    phone: "+1 (555) 345-6789",
    hours: "Mon-Fri: 9AM - 6PM",
    image: "🏖️",
  },
];

const contactReasons = [
  "Buying a Home",
  "Selling a Home",
  "Property Management",
  "General Inquiry",
  "Careers",
  "Partnerships",
];

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    reason: "",
    message: "",
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
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
              <Link href="/about" className="text-gray-600 hover:text-gray-900">About</Link>
              <Link href="/contact" className="text-indigo-600 font-medium">Contact</Link>
            </div>
            <Link href="/auth/login" className="px-4 py-2 text-gray-600 hover:text-gray-900">Sign In</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <div className="bg-gradient-to-r from-indigo-900 to-purple-900 py-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Get in Touch</h1>
          <p className="text-xl text-indigo-200 max-w-2xl mx-auto">
            Have questions? We&apos;re here to help you find your perfect home
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid lg:grid-cols-3 gap-12">
          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl p-8 shadow-sm">
              {isSubmitted ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Check className="w-8 h-8 text-green-600" />
                  </div>
                  <h2 className="text-2xl font-bold mb-2">Message Sent!</h2>
                  <p className="text-gray-600 mb-6">
                    Thank you for reaching out. We&apos;ll get back to you within 24 hours.
                  </p>
                  <button
                    onClick={() => {
                      setIsSubmitted(false);
                      setFormData({ name: "", email: "", phone: "", reason: "", message: "" });
                    }}
                    className="px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <>
                  <h2 className="text-2xl font-bold mb-6">Send us a Message</h2>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1.5">Full Name</label>
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:border-indigo-600"
                          placeholder="John Doe"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1.5">Email</label>
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:border-indigo-600"
                          placeholder="john@example.com"
                          required
                        />
                      </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1.5">Phone (optional)</label>
                        <input
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:border-indigo-600"
                          placeholder="+1 (555) 123-4567"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1.5">Reason for Contact</label>
                        <select
                          value={formData.reason}
                          onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                          className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:border-indigo-600"
                          required
                        >
                          <option value="">Select a reason</option>
                          {contactReasons.map((reason) => (
                            <option key={reason} value={reason}>{reason}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1.5">Message</label>
                      <textarea
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        rows={5}
                        className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:border-indigo-600 resize-none"
                        placeholder="Tell us more about what you're looking for..."
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full py-4 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 flex items-center justify-center gap-2"
                    >
                      <Send className="w-5 h-5" />
                      Send Message
                    </button>
                  </form>
                </>
              )}
            </div>

            {/* Office Locations */}
            <div className="mt-12">
              <h2 className="text-2xl font-bold mb-6">Our Offices</h2>
              <div className="grid md:grid-cols-3 gap-6">
                {offices.map((office) => (
                  <div key={office.city} className="bg-white rounded-xl p-6 shadow-sm">
                    <div className="text-4xl mb-4">{office.image}</div>
                    <h3 className="font-semibold text-lg mb-2">{office.city}</h3>
                    <p className="text-gray-600 text-sm mb-4">{office.address}</p>
                    <div className="space-y-2 text-sm">
                      <a href={`tel:${office.phone}`} className="flex items-center gap-2 text-gray-600">
                        <Phone className="w-4 h-4" />
                        {office.phone}
                      </a>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Clock className="w-4 h-4" />
                        {office.hours}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Contact */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="font-bold mb-4">Quick Contact</h3>
              <div className="space-y-4">
                <a href="tel:+15551234567" className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100">
                  <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                    <Phone className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <p className="font-medium">Call Us</p>
                    <p className="text-sm text-gray-500">+1 (555) 123-4567</p>
                  </div>
                </a>
                <a href="mailto:hello@larkhomes.com" className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100">
                  <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                    <Mail className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <p className="font-medium">Email Us</p>
                    <p className="text-sm text-gray-500">hello@larkhomes.com</p>
                  </div>
                </a>
              </div>
            </div>

            {/* FAQ Preview */}
            <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl p-6 text-white">
              <h3 className="font-bold mb-2">Have Questions?</h3>
              <p className="text-indigo-200 text-sm mb-4">
                Check our FAQ section for quick answers to common questions.
              </p>
              <Link href="/faq" className="block w-full py-3 bg-white text-indigo-600 text-center font-semibold rounded-xl hover:bg-indigo-50">
                View FAQ
              </Link>
            </div>

            {/* Support Hours */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="font-bold mb-4">Support Hours</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Monday - Friday</span>
                  <span className="font-medium">9AM - 8PM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Saturday</span>
                  <span className="font-medium">10AM - 6PM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Sunday</span>
                  <span className="font-medium">Closed</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
