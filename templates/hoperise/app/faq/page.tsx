"use client";

import { Heart, Search, ChevronDown, ChevronUp, ArrowRight, Mail } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const faqs = [
  {
    question: "How is my donation used?",
    answer: "100% of your donation goes directly to our programs. We cover all operational costs through separate fundraising. Your donation provides education, healthcare, clean water, and economic opportunities to communities in need. We publish detailed annual reports showing exactly how funds are allocated.",
  },
  {
    question: "Is my donation tax-deductible?",
    answer: "Yes! HopeRise is a registered 501(c)(3) nonprofit organization. All donations are tax-deductible in the United States. You'll receive a receipt via email immediately after your donation, which you can use for tax purposes.",
  },
  {
    question: "Can I set up recurring donations?",
    answer: "Absolutely. Monthly giving is one of the most effective ways to support our work. It provides stable funding that allows us to plan long-term projects and make commitments to the communities we serve. You can set up, modify, or cancel recurring donations at any time.",
  },
  {
    question: "How do I volunteer with HopeRise?",
    answer: "Visit our volunteer page to browse current opportunities. We offer both local and international positions, ranging from a few hours per week to full-time commitments. All volunteers receive training and support from our team.",
  },
  {
    question: "Do you offer corporate partnerships?",
    answer: "Yes! We work with companies of all sizes on cause marketing, employee engagement, grant making, and sponsorship opportunities. Contact our partnerships team to discuss how your organization can get involved.",
  },
  {
    question: "How can I stay updated on your work?",
    answer: "Subscribe to our newsletter for monthly updates, impact stories, and event invitations. You can also follow us on social media for real-time updates from the field.",
  },
  {
    question: "What countries do you work in?",
    answer: "We currently operate in over 150 countries across Africa, Asia, Latin America, and the Middle East. Our focus is on communities facing extreme poverty, limited access to education, and healthcare challenges.",
  },
  {
    question: "How do you ensure transparency?",
    answer: "We undergo annual independent audits and publish detailed financial reports. We also hold a 4-star rating from Charity Navigator and the GuideStar Platinum Seal of Transparency. You can access all our reports on our transparency page.",
  },
];

const categories = [
  { name: "Donations", count: 8 },
  { name: "Volunteering", count: 5 },
  { name: "Partnerships", count: 4 },
  { name: "Our Work", count: 6 },
  { name: "General", count: 10 },
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
              <div className="w-8 h-8 bg-rose-500 rounded-lg flex items-center justify-center">
                <Heart className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">HopeRise</span>
            </Link>
            <div className="hidden md:flex items-center gap-8">
              <Link href="/" className="text-gray-600 hover:text-gray-900">Home</Link>
              <Link href="/about" className="text-gray-600 hover:text-gray-900">About</Link>
              <Link href="/contact" className="text-gray-600 hover:text-gray-900">Contact</Link>
            </div>
            <Link href="/donate" className="px-4 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600">
              Donate Now
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="bg-gradient-to-br from-rose-500 to-orange-400 py-16">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h1 className="text-3xl font-bold text-white mb-4">Frequently Asked Questions</h1>
          <p className="text-white/90 mb-8">Find answers to common questions about HopeRise</p>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search FAQs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white rounded-xl text-lg focus:outline-none focus:ring-2 focus:ring-white/50"
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
                className="bg-gray-50 rounded-xl overflow-hidden"
              >
                <button
                  onClick={() => setOpenIndex(openIndex === index ? null : index)}
                  className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-100 transition-colors"
                >
                  <span className="font-medium text-gray-900">{faq.question}</span>
                  {openIndex === index ? (
                    <ChevronUp className="w-5 h-5 text-rose-500" />
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
      <section className="py-16 bg-rose-500">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Still have questions?</h2>
          <p className="text-white/90 mb-6">We're here to help. Reach out to our team.</p>
          <Link href="/contact" className="px-6 py-3 bg-white text-rose-600 font-semibold rounded-lg hover:bg-gray-100 inline-flex items-center gap-2">
            <Mail className="w-4 h-4" />
            Contact Us
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-8 h-8 bg-rose-500 rounded-lg flex items-center justify-center">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold">HopeRise</span>
          </div>
          <p className="text-gray-400 text-sm">
            © 2024 HopeRise. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
