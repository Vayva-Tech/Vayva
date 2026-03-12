"use client";

import { Palette, Brush, Camera, Layers, Star, Heart, ArrowRight, Mail, MapPin, Phone } from "lucide-react";
import Link from "next/link";

const portfolio = [
  { id: 1, title: "Brand Identity - Luxe Cosmetics", category: "Branding", image: "💄" },
  { id: 2, title: "Website Design - Tech Startup", category: "Web Design", image: "💻" },
  { id: 3, title: "Editorial - Vogue Magazine", category: "Photography", image: "📸" },
  { id: 4, title: "Packaging - Artisan Coffee", category: "Packaging", image: "☕" },
  { id: 5, title: "App UI - Fitness Tracker", category: "UI/UX", image: "📱" },
  { id: 6, title: "Campaign - Summer Collection", category: "Advertising", image: "🌴" },
];

const services = [
  { name: "Brand Identity", description: "Logo design, brand guidelines, visual systems", icon: "🎨" },
  { name: "Web Design", description: "Responsive websites that convert visitors", icon: "🌐" },
  { name: "Photography", description: "Product, portrait, and commercial photography", icon: "📷" },
  { name: "Print Design", description: "Brochures, packaging, publications", icon: "🖨️" },
];

export default function PortfolioPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center">
                <Palette className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">Artistry</span>
            </Link>
            <div className="hidden md:flex items-center gap-8">
              <Link href="/portfolio" className="text-violet-600 font-medium">Portfolio</Link>
              <Link href="/services" className="text-gray-600 hover:text-gray-900">Services</Link>
              <Link href="/about" className="text-gray-600 hover:text-gray-900">About</Link>
              <Link href="/contact" className="text-gray-600 hover:text-gray-900">Contact</Link>
            </div>
            <Link href="/contact" className="px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700">
              Get in Touch
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="bg-gradient-to-br from-violet-600 to-purple-700 py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">Our Work</h1>
          <p className="text-xl text-violet-200 mb-8">
            A curated selection of projects that showcase our creative capabilities
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-16">
        {/* Portfolio Grid */}
        <section className="mb-20">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {portfolio.map((item) => (
              <div key={item.id} className="group cursor-pointer">
                <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center text-6xl mb-4 group-hover:scale-105 transition-transform">
                  {item.image}
                </div>
                <span className="text-violet-600 text-sm font-medium">{item.category}</span>
                <h3 className="font-semibold text-lg text-gray-900">{item.title}</h3>
              </div>
            ))}
          </div>
        </section>

        {/* Services */}
        <section className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">What We Do</h2>
            <p className="text-gray-600">Comprehensive creative services for your brand</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service) => (
              <div key={service.name} className="bg-gray-50 rounded-xl p-6">
                <div className="text-4xl mb-4">{service.icon}</div>
                <h3 className="font-semibold text-gray-900 mb-2">{service.name}</h3>
                <p className="text-gray-600 text-sm">{service.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="bg-violet-50 rounded-3xl p-12 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Have a Project in Mind?</h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Let&apos;s collaborate to bring your vision to life. We&apos;re always excited to work on new creative challenges.
          </p>
          <Link href="/contact" className="px-8 py-4 bg-violet-600 text-white font-semibold rounded-xl hover:bg-violet-700 inline-flex items-center gap-2">
            Start a Project
            <ArrowRight className="w-5 h-5" />
          </Link>
        </section>
      </div>
    </div>
  );
}
