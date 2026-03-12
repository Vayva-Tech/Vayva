"use client";

import { Scale, Gavel, FileText, Shield, Users, Clock, DollarSign, ChevronRight, Phone, Mail, MapPin } from "lucide-react";
import Link from "next/link";

const services = [
  {
    title: "Corporate Law",
    description: "Business formation, contracts, mergers & acquisitions, compliance",
    icon: "🏢",
    price: "From $300/hr",
  },
  {
    title: "Criminal Defense",
    description: "DUI, felonies, misdemeanors, white collar crime defense",
    icon: "⚖️",
    price: "From $250/hr",
  },
  {
    title: "Family Law",
    description: "Divorce, custody, adoption, prenuptial agreements",
    icon: "👨‍👩‍👧‍👦",
    price: "From $200/hr",
  },
  {
    title: "Intellectual Property",
    description: "Patents, trademarks, copyrights, licensing",
    icon: "💡",
    price: "From $350/hr",
  },
  {
    title: "Real Estate",
    description: "Property transactions, zoning, landlord-tenant disputes",
    icon: "🏠",
    price: "From $275/hr",
  },
  {
    title: "Immigration",
    description: "Visas, green cards, citizenship, deportation defense",
    icon: "🌍",
    price: "From $225/hr",
  },
];

const whyChooseUs = [
  {
    title: "Experienced Attorneys",
    description: "Over 50 years of combined legal experience across all practice areas",
    icon: "👨‍⚖️",
  },
  {
    title: "Client-Focused",
    description: "We prioritize your needs with personalized attention and clear communication",
    icon: "🤝",
  },
  {
    title: "Transparent Pricing",
    description: "No hidden fees. Clear, upfront pricing with flexible payment options",
    icon: "💰",
  },
];

export default function ServicesPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                <Scale className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">Legalease</span>
            </Link>
            <div className="hidden md:flex items-center gap-8">
              <Link href="/services" className="text-indigo-600 font-medium">Services</Link>
              <Link href="/attorneys" className="text-gray-600 hover:text-gray-900">Attorneys</Link>
              <Link href="/about" className="text-gray-600 hover:text-gray-900">About</Link>
              <Link href="/contact" className="text-gray-600 hover:text-gray-900">Contact</Link>
            </div>
            <Link href="/consultation" className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
              Free Consultation
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="bg-gradient-to-br from-indigo-600 to-purple-700 py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">Our Legal Services</h1>
          <p className="text-xl text-indigo-200 mb-8">
            Comprehensive legal solutions tailored to your needs
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-16">
        {/* Services Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          {services.map((service) => (
            <div key={service.title} className="bg-white rounded-xl border border-gray-200 p-8 hover:shadow-lg transition-all group">
              <div className="text-5xl mb-6">{service.icon}</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">{service.title}</h3>
              <p className="text-gray-600 mb-4">{service.description}</p>
              <p className="text-indigo-600 font-medium mb-6">{service.price}</p>
              <Link
                href={`/services/${service.title.toLowerCase().replace(/\s+/g, '-')}`}
                className="inline-flex items-center gap-2 text-indigo-600 font-medium group-hover:gap-3 transition-all"
              >
                Learn More <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          ))}
        </div>

        {/* Why Choose Us */}
        <section className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose Legalease</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              We combine expertise with personalized service to deliver the best outcomes for our clients
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {whyChooseUs.map((item) => (
              <div key={item.title} className="text-center">
                <div className="text-5xl mb-4">{item.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="bg-gray-50 rounded-3xl p-12 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Need Legal Help?</h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Schedule a free consultation with one of our experienced attorneys. 
            We&apos;ll discuss your case and provide clear guidance on your options.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/consultation" className="px-8 py-4 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 inline-flex items-center gap-2">
              Schedule Consultation
              <ChevronRight className="w-5 h-5" />
            </Link>
            <Link href="/contact" className="px-8 py-4 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50">
              Contact Us
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
