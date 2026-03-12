"use client";

import { Search, Building2, Package, Truck, Shield, Users, ArrowRight, Check } from "lucide-react";
import Link from "next/link";

const categories = [
  { name: "Electronics", suppliers: 1200, icon: "💻" },
  { name: "Apparel", suppliers: 2800, icon: "👕" },
  { name: "Home & Garden", suppliers: 1500, icon: "🏠" },
  { name: "Beauty", suppliers: 900, icon: "✨" },
  { name: "Industrial", suppliers: 2100, icon: "⚙️" },
  { name: "Food & Beverage", suppliers: 800, icon: "🍔" },
];

const features = [
  { icon: Shield, title: "Verified Suppliers", desc: "All suppliers vetted and verified" },
  { icon: Truck, title: "Global Shipping", desc: "Connect with suppliers worldwide" },
  { icon: Package, title: "Bulk Orders", desc: "Minimum order quantities as low as 50 units" },
  { icon: Building2, title: "Trade Assurance", desc: "Secure payment protection" },
];

const stats = [
  { value: "50K+", label: "Verified Suppliers" },
  { value: "200K+", label: "Active Buyers" },
  { value: "$2B+", label: "Annual Trade Volume" },
  { value: "150+", label: "Countries Served" },
];

const testimonials = [
  { name: "Sarah Chen", company: "Urban Retail Co.", quote: "Found reliable suppliers within days. TradeHub streamlined our entire procurement process." },
  { name: "Michael Roberts", company: "TechGear Inc.", quote: "The verified supplier network gives us confidence. Quality has been consistently excellent." },
];

export default function TradeHubHome() {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="bg-card border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <Building2 className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-foreground">TradeHub</span>
            </Link>
            <div className="hidden md:flex items-center gap-8">
              <Link href="/suppliers" className="text-muted-foreground hover:text-foreground transition-colors">Find Suppliers</Link>
              <Link href="/products" className="text-muted-foreground hover:text-foreground transition-colors">Products</Link>
              <Link href="/solutions" className="text-muted-foreground hover:text-foreground transition-colors">Solutions</Link>
              <Link href="/pricing" className="text-muted-foreground hover:text-foreground transition-colors">Pricing</Link>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/auth/login" className="text-muted-foreground hover:text-foreground transition-colors">Sign In</Link>
              <Link href="/auth/signup" className="px-6 py-2 bg-primary text-primary-foreground font-medium rounded-lg hover:opacity-90 transition-colors">Get Started</Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="section-padding bg-gradient-to-br from-primary/10 to-secondary/10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto">
            <span className="inline-block px-4 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium mb-4">B2B Wholesale Marketplace</span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-6">
              Connect with <span className="text-primary">Verified Suppliers</span> Worldwide
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Source products directly from manufacturers. Secure, efficient, and scalable wholesale trading.
            </p>
            <div className="max-w-2xl mx-auto bg-card rounded-2xl shadow-lg p-4 border">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input type="text" placeholder="Search products or suppliers..." className="w-full pl-12 pr-4 py-3 bg-muted rounded-xl border-0" />
                </div>
                <button className="px-6 py-3 bg-primary text-primary-foreground font-medium rounded-lg hover:opacity-90 transition-colors">Search</button>
              </div>
            </div>
            <div className="flex flex-wrap justify-center gap-2 mt-6">
              <span className="text-sm text-muted-foreground">Popular:</span>
              {["Electronics", "Apparel", "Home Goods", "Beauty"].map((tag) => (
                <span key={tag} className="px-3 py-1 bg-muted rounded-full text-sm text-muted-foreground border">{tag}</span>
              ))}
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

      {/* Categories */}
      <section className="section-padding">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Browse Categories</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((cat) => (
              <button key={cat.name} className="p-6 bg-muted rounded-2xl hover:bg-primary/10 hover:shadow-md transition-all text-center group">
                <span className="text-4xl mb-3 block group-hover:scale-110 transition-transform">{cat.icon}</span>
                <h3 className="font-medium text-foreground">{cat.name}</h3>
                <p className="text-sm text-muted-foreground">{cat.suppliers.toLocaleString()} suppliers</p>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="section-padding bg-muted/30">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl font-bold mb-4">Why TradeHub</h2>
            <p className="text-muted-foreground">The trusted platform for global B2B wholesale trading</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature) => (
              <div key={feature.title} className="bg-card rounded-2xl p-6 border">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="section-padding">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Trusted by Businesses</h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {testimonials.map((t) => (
              <div key={t.name} className="bg-card rounded-2xl p-6 shadow-sm border">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-yellow-400">★</span>
                  ))}
                </div>
                <p className="text-muted-foreground mb-4">"{t.quote}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <Users className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <div className="font-semibold">{t.name}</div>
                    <div className="text-sm text-muted-foreground">{t.company}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-primary to-secondary">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-3xl font-bold text-primary-foreground mb-4">Start Sourcing Today</h2>
          <p className="text-primary-foreground/80 mb-8">Join thousands of businesses finding reliable suppliers on TradeHub</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/auth/signup" className="px-8 py-3 bg-white text-primary font-medium rounded-lg hover:bg-white/90 transition-colors">
              Create Free Account
            </Link>
            <Link href="/suppliers" className="px-8 py-3 border-2 border-white text-white font-medium rounded-lg hover:bg-white/10 transition-colors">
              Browse Suppliers
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
                <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-primary-foreground" />
                </div>
                <span className="font-bold text-xl">TradeHub</span>
              </div>
              <p className="text-sm text-muted-foreground">The leading B2B wholesale marketplace connecting buyers and suppliers worldwide.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">For Buyers</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/suppliers" className="hover:text-foreground">Find Suppliers</Link></li>
                <li><Link href="/products" className="hover:text-foreground">Source Products</Link></li>
                <li><Link href="/requests" className="hover:text-foreground">Post RFQ</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">For Suppliers</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/sell" className="hover:text-foreground">Start Selling</Link></li>
                <li><Link href="/membership" className="hover:text-foreground">Membership</Link></li>
                <li><Link href="/ads" className="hover:text-foreground">Advertise</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/help" className="hover:text-foreground">Help Center</Link></li>
                <li><Link href="/contact" className="hover:text-foreground">Contact Us</Link></li>
                <li><Link href="/safety" className="hover:text-foreground">Trade Safety</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t pt-8 text-center text-sm text-muted-foreground">
            © 2024 TradeHub. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
