"use client";

import { Cloud, Shield, Zap, Globe, Server, Headphones, CheckCircle, ArrowRight, Star } from "lucide-react";
import Link from "next/link";

const features = [
  { icon: Zap, title: "99.9% Uptime", desc: "Guaranteed availability" },
  { icon: Shield, title: "Free SSL", desc: "Secure your site" },
  { icon: Globe, title: "Global CDN", desc: "Fast worldwide" },
  { icon: Server, title: "Daily Backups", desc: "Never lose data" },
];

const plans = [
  { name: "Starter", price: "$3.99", features: ["10GB SSD", "1 Website", "Free SSL", "10k visits/mo"] },
  { name: "Business", price: "$9.99", features: ["50GB SSD", "10 Websites", "Free SSL", "100k visits/mo"], popular: true },
  { name: "Enterprise", price: "$29.99", features: ["Unlimited SSD", "Unlimited Sites", "Priority Support", "1M visits/mo"] },
];

const stats = [
  { value: "99.9%", label: "Uptime" },
  { value: "50K+", label: "Customers" },
  { value: "24/7", label: "Support" },
  { value: "100Gbps", label: "Network" },
];

export default function CloudHostHome() {
  return (
    <div className="min-h-screen bg-background">
      <nav className="bg-card border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                <Cloud className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-foreground">CloudHost</span>
            </Link>
            <div className="hidden md:flex items-center gap-8">
              <Link href="/hosting" className="text-muted-foreground hover:text-foreground transition-colors">Hosting</Link>
              <Link href="/domains" className="text-muted-foreground hover:text-foreground transition-colors">Domains</Link>
              <Link href="/security" className="text-muted-foreground hover:text-foreground transition-colors">Security</Link>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/login" className="text-muted-foreground hover:text-foreground transition-colors">Sign In</Link>
              <Link href="/signup" className="px-6 py-2 bg-primary text-primary-foreground font-medium rounded-lg hover:opacity-90 transition-colors">Get Started</Link>
            </div>
          </div>
        </div>
      </nav>

      <section className="section-padding bg-gradient-to-br from-primary/10 to-secondary/10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-6">
              Lightning Fast <span className="text-primary">Web Hosting</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Blazing fast SSD hosting with 99.9% uptime guarantee
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/plans" className="px-8 py-3 bg-primary text-primary-foreground font-medium rounded-lg hover:opacity-90 transition-colors">View Plans</Link>
              <Link href="/compare" className="px-8 py-3 bg-card text-foreground font-medium rounded-lg border hover:bg-accent/10 transition-colors">Compare</Link>
            </div>
          </div>
        </div>
      </section>

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

      <section className="section-padding">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Features</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((f) => (
              <div key={f.title} className="text-center p-6">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <f.icon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">{f.title}</h3>
                <p className="text-muted-foreground">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-padding bg-muted/30">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Hosting Plans</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {plans.map((plan) => (
              <div key={plan.name} className={`bg-card rounded-2xl p-8 shadow-sm border ${plan.popular ? 'ring-2 ring-primary' : ''}`}>
                {plan.popular && <span className="px-3 py-1 bg-primary text-primary-foreground rounded-full text-sm">Most Popular</span>}
                <h3 className="text-2xl font-bold mt-4">{plan.name}</h3>
                <div className="text-4xl font-bold text-primary my-4">{plan.price}<span className="text-lg text-muted-foreground">/mo</span></div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feat) => (
                    <li key={feat} className="flex items-center gap-2"><CheckCircle className="w-5 h-5 text-green-500" /> {feat}</li>
                  ))}
                </ul>
                <button className={`w-full py-3 rounded-lg font-medium ${plan.popular ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground'}`}>
                  Choose Plan
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="bg-card border-t py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                  <Cloud className="w-6 h-6 text-primary-foreground" />
                </div>
                <span className="font-bold text-xl">CloudHost</span>
              </div>
              <p className="text-sm text-muted-foreground">Reliable hosting for your business.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Products</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/hosting" className="hover:text-foreground">Web Hosting</Link></li>
                <li><Link href="/vps" className="hover:text-foreground">VPS</Link></li>
                <li><Link href="/domains" className="hover:text-foreground">Domains</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/help" className="hover:text-foreground">Help Center</Link></li>
                <li><Link href="/contact" className="hover:text-foreground">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/about" className="hover:text-foreground">About</Link></li>
                <li><Link href="/blog" className="hover:text-foreground">Blog</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t pt-8 text-center text-sm text-muted-foreground">
            © 2024 CloudHost. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
