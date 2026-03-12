"use client";

import { Code, Search, Book, Terminal, HelpCircle, MessageSquare, ChevronRight, ArrowRight, PlayCircle, FileText, Zap } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const docSections = [
  {
    title: "Getting Started",
    icon: Book,
    description: "Learn the basics of CodeCamp",
    articles: [
      "Creating your account",
      "Navigating the platform",
      "Setting up your profile",
      "Choosing a learning track",
    ],
  },
  {
    title: "Learning",
    icon: PlayCircle,
    description: "Make the most of your courses",
    articles: [
      "Video player features",
      "Taking notes",
      "Coding exercises",
      "Project submissions",
    ],
  },
  {
    title: "Coding Environment",
    icon: Terminal,
    description: "Using our built-in tools",
    articles: [
      "Online IDE guide",
      "Installing dependencies",
      "Running code",
      "Debugging tips",
    ],
  },
  {
    title: "Community",
    icon: MessageSquare,
    description: "Connect with other learners",
    articles: [
      "Forum guidelines",
      "Asking questions",
      "Finding study groups",
      "Mentorship program",
    ],
  },
];

const popularTopics = [
  "How to reset progress",
  "Download course videos",
  "Certificate requirements",
  "Refund policy",
  "Team plans",
];

export default function DocsPage() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="min-h-screen bg-dark-900">
      {/* Navigation */}
      <nav className="border-b border-dark-700 bg-dark-900 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="text-xl font-bold text-primary-500">CodeCamp</Link>
            <div className="hidden md:flex items-center gap-8">
              <Link href="/tracks" className="text-gray-300 hover:text-white">Tracks</Link>
              <Link href="/tutorials" className="text-gray-300 hover:text-white">Tutorials</Link>
              <Link href="/pricing" className="text-gray-300 hover:text-white">Pricing</Link>
              <Link href="/docs" className="text-white font-medium">Docs</Link>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/auth/login" className="text-gray-300 hover:text-white">Sign In</Link>
              <Link href="/auth/signup" className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-500">Start Free</Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Search */}
      <section className="py-20">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h1 className="text-3xl font-bold text-white mb-4">Help Center</h1>
          <p className="text-gray-400 mb-8">Find answers and learn how to get the most out of CodeCamp</p>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="text"
              placeholder="Search help articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-dark-800 border border-dark-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-primary-500"
            />
          </div>
        </div>
      </section>

      {/* Popular Topics */}
      <section className="py-8 border-y border-dark-700">
        <div className="max-w-7xl mx-auto px-4">
          <p className="text-sm text-gray-500 mb-3">Popular topics:</p>
          <div className="flex flex-wrap gap-2">
            {popularTopics.map((topic) => (
              <Link
                key={topic}
                href="#"
                className="px-4 py-2 bg-dark-800 hover:bg-dark-700 text-gray-300 rounded-full text-sm transition-colors"
              >
                {topic}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Documentation Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {docSections.map((section) => (
              <div key={section.title} className="bg-dark-800 rounded-xl p-6 border border-dark-700">
                <div className="w-10 h-10 bg-primary-500/20 rounded-lg flex items-center justify-center mb-4">
                  <section.icon className="w-5 h-5 text-primary-500" />
                </div>
                <h2 className="font-semibold text-white mb-1">{section.title}</h2>
                <p className="text-gray-400 text-sm mb-4">{section.description}</p>
                <ul className="space-y-2">
                  {section.articles.map((article) => (
                    <li key={article}>
                      <Link
                        href="#"
                        className="text-gray-500 hover:text-primary-500 text-sm flex items-center gap-1 group"
                      >
                        {article}
                        <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-16 border-t border-dark-700">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <HelpCircle className="w-12 h-12 text-primary-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Still need help?</h2>
          <p className="text-gray-400 mb-6">Can&apos;t find what you&apos;re looking for? Contact our support team</p>
          <Link href="/contact" className="px-6 py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-500 inline-flex items-center gap-2">
            Contact Support
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-dark-900 border-t border-dark-700 py-12">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-400 text-sm">
          © 2024 CodeCamp. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
