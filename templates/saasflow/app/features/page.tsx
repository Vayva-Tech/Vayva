"use client";

import { Zap, Shield, BarChart3, ArrowRight, Check, Play, Star, Users, Globe, Lock, Server, Smartphone, Cloud, Code, Workflow, Database, LineChart, Megaphone, Headphones, FileText } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const features = [
  {
    category: "Core Features",
    items: [
      { icon: Workflow, title: "Workflow Automation", description: "Build complex automation with our visual workflow builder" },
      { icon: Database, title: "Data Management", description: "Centralized data storage with powerful query capabilities" },
      { icon: LineChart, title: "Analytics Dashboard", description: "Real-time insights into your business metrics" },
      { icon: Megaphone, title: "Marketing Tools", description: "Email campaigns, notifications, and user engagement" }
    ]
  },
  {
    category: "Integrations",
    items: [
      { icon: Code, title: "API Access", description: "RESTful API with comprehensive documentation" },
      { icon: Cloud, title: "Cloud Storage", description: "Secure file storage with CDN delivery" },
      { icon: Server, title: "Webhooks", description: "Real-time event notifications to your systems" },
      { icon: Globe, title: "Custom Domains", description: "Use your own domain with SSL certificates" }
    ]
  },
  {
    category: "Security",
    items: [
      { icon: Shield, title: "Enterprise Security", description: "SOC 2 Type II certified with end-to-end encryption" },
      { icon: Lock, title: "SSO & SAML", description: "Single sign-on with major identity providers" },
      { icon: FileText, title: "Audit Logs", description: "Comprehensive activity tracking and compliance" },
      { icon: Headphones, title: "Priority Support", description: "24/7 dedicated support with SLA guarantees" }
    ]
  }
];

const integrations = [
  { name: "Slack", category: "Communication", icon: "💬" },
  { name: "Zapier", category: "Automation", icon: "⚡" },
  { name: "Stripe", category: "Payments", icon: "💳" },
  { name: "GitHub", category: "Development", icon: "🐙" },
  { name: "Google", category: "Identity", icon: "🔍" },
  { name: "AWS", category: "Infrastructure", icon: "☁️" },
  { name: "Salesforce", category: "CRM", icon: "📊" },
  { name: "HubSpot", category: "Marketing", icon: "🎯" },
  { name: "Figma", category: "Design", icon: "🎨" },
  { name: "Notion", category: "Productivity", icon: "📝" },
  { name: "MongoDB", category: "Database", icon: "🍃" },
  { name: "Redis", category: "Cache", icon: "⚡" }
];

const stats = [
  { value: "10K+", label: "Active Users" },
  { value: "99.99%", label: "Uptime SLA" },
  { value: "50M+", label: "API Calls/Day" },
  { value: "4.9/5", label: "User Rating" }
];

const testimonials = [
  {
    company: "TechCorp",
    logo: "TC",
    content: "SaaSFlow transformed how our team operates. We automated 80% of our manual processes in just two weeks.",
    author: "Sarah Chen",
    role: "CTO",
    rating: 5
  },
  {
    company: "StartupX",
    logo: "SX",
    content: "The ROI was incredible. We saw a 300% increase in productivity within the first month of adoption.",
    author: "Mike Johnson",
    role: "Founder",
    rating: 5
  },
  {
    company: "GlobalRetail",
    logo: "GR",
    content: "Enterprise-grade security with consumer-grade simplicity. Best investment we've made.",
    author: "Emily Davis",
    role: "VP Operations",
    rating: 5
  }
];

const pricingPlans = [
  {
    name: "Starter",
    price: 29,
    description: "Perfect for small teams getting started",
    features: [
      "Up to 5 team members",
      "10,000 API calls/month",
      "Basic analytics",
      "Email support",
      "5 integrations",
      "1GB storage"
    ],
    cta: "Start Free Trial",
    popular: false
  },
  {
    name: "Professional",
    price: 99,
    description: "For growing businesses with advanced needs",
    features: [
      "Up to 25 team members",
      "100,000 API calls/month",
      "Advanced analytics",
      "Priority support",
      "Unlimited integrations",
      "50GB storage",
      "Custom workflows",
      "SSO authentication"
    ],
    cta: "Start Free Trial",
    popular: true
  },
  {
    name: "Enterprise",
    price: 299,
    description: "For large organizations with custom requirements",
    features: [
      "Unlimited team members",
      "Unlimited API calls",
      "Enterprise analytics",
      "24/7 dedicated support",
      "Custom integrations",
      "Unlimited storage",
      "SLA guarantees",
      "On-premise option"
    ],
    cta: "Contact Sales",
    popular: false
  }
];

export default function FeaturesPage() {
  const [activeTab, setActiveTab] = useState("Core Features");

  return (
    <div className="min-h-screen bg-white">
      <nav className="border-b bg-white/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary-600 rounded-lg" />
              <span className="text-xl font-bold text-gray-900">SaaSFlow</span>
            </Link>
            <div className="hidden md:flex items-center gap-8">
              <Link href="/features" className="text-primary-600 font-medium">Features</Link>
              <Link href="/integrations" className="text-gray-600 hover:text-gray-900">Integrations</Link>
              <Link href="/pricing" className="text-gray-600 hover:text-gray-900">Pricing</Link>
              <Link href="/docs" className="text-gray-600 hover:text-gray-900">Docs</Link>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/auth/login" className="text-gray-600 hover:text-gray-900">Sign In</Link>
              <Link href="/auth/signup" className="btn-primary">Get Started</Link>
            </div>
          </div>
        </div>
      </nav>

      <section className="section-padding gradient-bg">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
              Everything You Need to{" "}
              <span className="text-primary-600">Scale</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Powerful features designed to streamline your operations and accelerate growth
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/auth/signup" className="btn-primary inline-flex items-center gap-2">
                Start Free Trial
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link href="/demo" className="px-8 py-3 bg-white text-gray-700 font-medium rounded-lg border border-gray-200 hover:bg-gray-50 inline-flex items-center gap-2">
                <Play className="w-5 h-5" />
                Watch Demo
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="section-padding">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Powerful Features</h2>
            <p className="text-gray-600">Tools built for modern teams</p>
          </div>

          <div className="flex flex-wrap justify-center gap-4 mb-12">
            {features.map((section) => (
              <button
                key={section.category}
                onClick={() => setActiveTab(section.category)}
                className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                  activeTab === section.category
                    ? "bg-primary-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {section.category}
              </button>
            ))}
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {features
              .find((f) => f.category === activeTab)
              ?.items.map((feature) => {
                const Icon = feature.icon;
                return (
                  <div key={feature.title} className="p-6 bg-white border border-gray-200 rounded-xl hover:shadow-lg transition-shadow">
                    <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center mb-4">
                      <Icon className="w-6 h-6 text-primary-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                    <p className="text-gray-600">{feature.description}</p>
                  </div>
                );
              })}
          </div>
        </div>
      </section>

      <section className="section-padding bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Connect Your Favorite Tools</h2>
            <p className="text-gray-600">Integrate with 100+ apps and services seamlessly</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {integrations.map((integration) => (
              <div key={integration.name} className="p-6 bg-white border border-gray-200 rounded-xl text-center hover:shadow-lg transition-shadow">
                <span className="text-4xl mb-3 block">{integration.icon}</span>
                <h3 className="font-semibold text-gray-900">{integration.name}</h3>
                <p className="text-sm text-gray-500">{integration.category}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link href="/integrations" className="text-primary-600 font-medium inline-flex items-center gap-2 hover:text-primary-700">
              View All Integrations
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16 bg-gradient-to-r from-primary-600 to-primary-700">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-white mb-2">{stat.value}</div>
                <div className="text-primary-200">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-padding">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Pricing Plans</h2>
            <p className="text-gray-600">Choose the perfect plan for your team</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {pricingPlans.map((plan) => (
              <div
                key={plan.name}
                className={`p-8 rounded-2xl border ${
                  plan.popular
                    ? "border-primary-500 bg-primary-50"
                    : "border-gray-200 bg-white"
                }`}
              >
                {plan.popular && (
                  <span className="inline-block px-4 py-1 bg-primary-600 text-white text-sm font-medium rounded-full mb-4">
                    Most Popular
                  </span>
                )}
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <p className="text-gray-600 mb-4">{plan.description}</p>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-gray-900">${plan.price}</span>
                  <span className="text-gray-500">/month</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span className="text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/auth/signup"
                  className={`block text-center py-3 rounded-lg font-medium transition-colors ${
                    plan.popular
                      ? "bg-primary-600 text-white hover:bg-primary-700"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-padding bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Trusted by Industry Leaders</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial) => (
              <div key={testimonial.company} className="p-6 bg-white rounded-xl border border-gray-200">
                <div className="flex items-center gap-2 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 mb-6">"{testimonial.content}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-bold">
                    {testimonial.logo}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{testimonial.author}</div>
                    <div className="text-sm text-gray-500">{testimonial.role}, {testimonial.company}</div>
                  </div>
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
                <div className="w-8 h-8 bg-primary-600 rounded-lg" />
                <span className="text-white font-bold text-xl">SaaSFlow</span>
              </div>
              <p className="text-sm">Streamline your workflow with the all-in-one platform.</p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/features" className="hover:text-white">Features</Link></li>
                <li><Link href="/integrations" className="hover:text-white">Integrations</Link></li>
                <li><Link href="/pricing" className="hover:text-white">Pricing</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/docs" className="hover:text-white">Documentation</Link></li>
                <li><Link href="/api" className="hover:text-white">API Reference</Link></li>
                <li><Link href="/blog" className="hover:text-white">Blog</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/help" className="hover:text-white">Help Center</Link></li>
                <li><Link href="/contact" className="hover:text-white">Contact</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm">
            © 2024 SaaSFlow. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
