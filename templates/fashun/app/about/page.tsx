"use client";

import { Search, ShoppingBag, Heart, User, Menu, Award, Globe, Leaf, Sparkles } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

const values = [
  {
    icon: Sparkles,
    title: "Timeless Design",
    description: "Creating pieces that transcend seasons and trends, designed to be cherished for years.",
  },
  {
    icon: Leaf,
    title: "Sustainable Practices",
    description: "Committed to reducing our environmental impact through responsible sourcing and production.",
  },
  {
    icon: Award,
    title: "Artisan Craftsmanship",
    description: "Partnering with skilled artisans who bring decades of expertise to every piece.",
  },
  {
    icon: Globe,
    title: "Global Community",
    description: "Building connections across cultures through the universal language of style.",
  },
];

const team = [
  { name: "Isabella Chen", role: "Creative Director", image: "👩‍🎨" },
  { name: "Marcus Webb", role: "Head of Design", image: "👨‍💼" },
  { name: "Sofia Martinez", role: "Sustainability Lead", image: "👩‍🌾" },
  { name: "James Okonkwo", role: "Production Director", image: "👨‍🏭" },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <button className="lg:hidden">
                <Menu className="w-6 h-6" />
              </button>
              <Link href="/" className="text-2xl font-bold tracking-tight">
                FASHUN
              </Link>
              <div className="hidden lg:flex items-center gap-6 text-sm">
                <Link href="/shop" className="text-gray-600 hover:text-black">Shop</Link>
                <Link href="/new-arrivals" className="text-gray-600 hover:text-black">New Arrivals</Link>
                <Link href="/lookbook" className="text-gray-600 hover:text-black">Lookbook</Link>
                <Link href="/about" className="font-medium">About</Link>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button className="hidden sm:block">
                <Search className="w-5 h-5" />
              </button>
              <Link href="/account">
                <User className="w-5 h-5" />
              </Link>
              <Link href="/wishlist">
                <Heart className="w-5 h-5" />
              </Link>
              <Link href="/cart" className="relative">
                <ShoppingBag className="w-5 h-5" />
                <span className="absolute -top-2 -right-2 w-5 h-5 bg-black text-white text-xs rounded-full flex items-center justify-center">
                  0
                </span>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative h-[60vh] bg-gray-900 flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-black/40" />
        <div className="relative text-center text-white px-4">
          <h1 className="text-5xl md:text-7xl font-bold mb-6">Our Story</h1>
          <p className="text-xl md:text-2xl text-gray-200 max-w-2xl mx-auto">
            Redefining modern luxury through timeless design and sustainable practices
          </p>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20 max-w-7xl mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold mb-6">From Vision to Reality</h2>
            <p className="text-gray-600 mb-4 leading-relaxed">
              Founded in 2018, Fashun emerged from a simple belief: that luxury fashion should be 
              both beautiful and responsible. What began as a small studio in New York has grown 
              into a global brand, yet our core mission remains unchanged.
            </p>
            <p className="text-gray-600 mb-4 leading-relaxed">
              We partner with skilled artisans and ateliers around the world, from the silk 
              workshops of Lake Como to the ateliers of Paris, ensuring each piece meets our 
              exacting standards of quality and craftsmanship.
            </p>
            <p className="text-gray-600 leading-relaxed">
              Today, Fashun represents a new era of conscious luxury—where impeccable design 
              meets environmental responsibility, and where every garment tells a story of 
              dedication, artistry, and care.
            </p>
          </div>
          <div className="aspect-[4/5] bg-gray-100 rounded-lg flex items-center justify-center text-[150px]">
            🏛️
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Our Values</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              These principles guide everything we do, from design to delivery
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value) => (
              <div key={value.title} className="bg-white p-8 rounded-xl">
                <value.icon className="w-10 h-10 mb-4" />
                <h3 className="font-semibold text-lg mb-2">{value.title}</h3>
                <p className="text-gray-600 text-sm">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20 max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">Meet Our Team</h2>
          <p className="text-gray-600">The passionate individuals behind Fashun</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {team.map((member) => (
            <div key={member.name} className="text-center">
              <div className="w-40 h-40 mx-auto bg-gray-100 rounded-full flex items-center justify-center text-6xl mb-4">
                {member.image}
              </div>
              <h3 className="font-semibold text-lg">{member.name}</h3>
              <p className="text-gray-600 text-sm">{member.role}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Stats */}
      <section className="py-20 bg-black text-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2">50+</div>
              <p className="text-gray-400">Artisan Partners</p>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">12</div>
              <p className="text-gray-400">Countries</p>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">100K+</div>
              <p className="text-gray-400">Happy Customers</p>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">6</div>
              <p className="text-gray-400">Years of Excellence</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 max-w-7xl mx-auto px-4">
        <div className="bg-gray-100 rounded-2xl p-12 md:p-16 text-center">
          <h2 className="text-3xl font-bold mb-4">Join the Fashun Community</h2>
          <p className="text-gray-600 mb-8 max-w-xl mx-auto">
            Subscribe to our newsletter for exclusive access to new collections, 
            styling tips, and special events.
          </p>
          <div className="flex max-w-md mx-auto gap-4">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 border rounded-lg focus:outline-none focus:border-black"
            />
            <button className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800">
              Subscribe
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black text-white">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <h4 className="font-bold mb-4">SHOP</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/shop" className="hover:text-white">All Products</Link></li>
                <li><Link href="/new-arrivals" className="hover:text-white">New Arrivals</Link></li>
                <li><Link href="/sale" className="hover:text-white">Sale</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">HELP</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/size-guide" className="hover:text-white">Size Guide</Link></li>
                <li><Link href="/shipping" className="hover:text-white">Shipping & Returns</Link></li>
                <li><Link href="/faq" className="hover:text-white">FAQ</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">COMPANY</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/about" className="hover:text-white">About Us</Link></li>
                <li><Link href="/careers" className="hover:text-white">Careers</Link></li>
                <li><Link href="/contact" className="hover:text-white">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">NEWSLETTER</h4>
              <p className="text-sm text-gray-400 mb-4">Subscribe for exclusive offers</p>
              <input
                type="email"
                placeholder="Your email"
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded text-white placeholder:text-gray-500 focus:outline-none focus:border-white"
              />
            </div>
          </div>
          <div className="border-t border-white/20 mt-8 pt-8 text-center text-sm text-gray-400">
            © 2024 Fashun. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
