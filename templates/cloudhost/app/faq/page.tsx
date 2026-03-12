"use client";

import { Zap, Search, ChevronDown, ChevronUp, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const faqs = [
  {
    question: "How do I deploy my first website?",
    answer: "Simply connect your Git repository or drag and drop your project files. We'll automatically detect your framework and configure the build settings. Your site will be live in seconds with a free .cloudhost.app domain.",
  },
  {
    question: "What frameworks do you support?",
    answer: "We support all major frameworks including Next.js, React, Vue, Angular, Svelte, Gatsby, Hugo, Jekyll, and more. We also support static HTML sites and custom build configurations.",
  },
  {
    question: "How does the free tier work?",
    answer: "Our free tier includes 100GB bandwidth per month, 1GB storage, and unlimited deployments. It's perfect for personal projects, portfolios, and small websites. No credit card required.",
  },
  {
    question: "Can I use my own domain?",
    answer: "Yes! You can add custom domains to any project. We provide free SSL certificates automatically via Let's Encrypt. Simply add your domain in the project settings and update your DNS records.",
  },
  {
    question: "What is serverless functions support?",
    answer: "Serverless functions let you run backend code without managing servers. Create API routes, process forms, authenticate users, and more. We support Node.js, Python, Go, and Ruby runtimes.",
  },
  {
    question: "How do I handle environment variables?",
    answer: "Environment variables can be added in your project settings. They're encrypted and only exposed to your deployments. You can have different variables for production and preview deployments.",
  },
  {
    question: "What happens if I exceed my plan limits?",
    answer: "We'll notify you when you're approaching your limits. You can upgrade anytime without downtime. We never shut down sites for exceeding limits - we just reach out to discuss options.",
  },
  {
    question: "Do you offer refunds?",
    answer: "Yes, we offer a 14-day money-back guarantee on all paid plans. If you're not satisfied, contact our support team for a full refund - no questions asked.",
  },
];

const categories = [
  { name: "Getting Started", count: 12 },
  { name: "Domains & SSL", count: 8 },
  { name: "Billing", count: 6 },
  { name: "API & CLI", count: 10 },
  { name: "Troubleshooting", count: 15 },
];

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredFaqs = faqs.filter(faq =>
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">CloudHost</span>
            </Link>
            <div className="hidden md:flex items-center gap-8">
              <Link href="/features" className="text-gray-600 hover:text-gray-900">Features</Link>
              <Link href="/pricing" className="text-gray-600 hover:text-gray-900">Pricing</Link>
              <Link href="/docs" className="text-gray-600 hover:text-gray-900">Docs</Link>
              <Link href="/faq" className="text-blue-600 font-medium">FAQ</Link>
            </div>
            <Link href="/signup" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Search */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h1>
          <p className="text-gray-600 mb-8">Find answers to common questions about CloudHost</p>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search FAQs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-xl text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-8 border-b">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat.name}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full text-sm transition-colors"
              >
                {cat.name} ({cat.count})
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ List */}
      <section className="py-12">
        <div className="max-w-3xl mx-auto px-4">
          <div className="space-y-4">
            {filteredFaqs.map((faq, index) => (
              <div
                key={index}
                className="bg-white border rounded-xl overflow-hidden"
              >
                <button
                  onClick={() => setOpenIndex(openIndex === index ? null : index)}
                  className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
                >
                  <span className="font-medium text-gray-900">{faq.question}</span>
                  {openIndex === index ? (
                    <ChevronUp className="w-5 h-5 text-gray-500" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-500" />
                  )}
                </button>
                {openIndex === index && (
                  <div className="px-6 pb-4">
                    <p className="text-gray-600">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {filteredFaqs.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No FAQs found matching your search.</p>
            </div>
          )}
        </div>
      </section>

      {/* Still Need Help */}
      <section className="py-16 bg-blue-600">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Still have questions?</h2>
          <p className="text-blue-100 mb-6">Our support team is available 24/7 to help</p>
          <Link href="/contact" className="px-6 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 inline-flex items-center gap-2">
            Contact Support
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold">CloudHost</span>
          </div>
          <p className="text-gray-400 text-sm">
            © 2024 CloudHost. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
