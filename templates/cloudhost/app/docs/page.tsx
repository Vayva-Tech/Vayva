"use client";

import { Zap, Search, BookOpen, Code, Terminal, Server, Shield, ChevronRight, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const docSections = [
  {
    title: "Getting Started",
    icon: BookOpen,
    articles: [
      { title: "Quick Start Guide", slug: "quick-start" },
      { title: "Deploy Your First Site", slug: "deploy" },
      { title: "Custom Domains", slug: "domains" },
      { title: "SSL Certificates", slug: "ssl" },
    ],
  },
  {
    title: "API Reference",
    icon: Code,
    articles: [
      { title: "Authentication", slug: "auth" },
      { title: "Deployments API", slug: "deployments" },
      { title: "Domains API", slug: "domains-api" },
      { title: "Logs API", slug: "logs" },
    ],
  },
  {
    title: "CLI",
    icon: Terminal,
    articles: [
      { title: "Installation", slug: "cli-install" },
      { title: "Commands Reference", slug: "cli-commands" },
      { title: "Configuration", slug: "cli-config" },
      { title: "Environment Variables", slug: "env-vars" },
    ],
  },
  {
    title: "Platform",
    icon: Server,
    articles: [
      { title: "Build System", slug: "build" },
      { title: "Serverless Functions", slug: "functions" },
      { title: "Edge Network", slug: "edge" },
      { title: "Storage", slug: "storage" },
    ],
  },
];

const popularArticles = [
  "Custom domain configuration",
  "Environment variables",
  "Serverless functions",
  "Build configuration",
  "Preview deployments",
];

export default function DocsPage() {
  const [searchQuery, setSearchQuery] = useState("");

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
              <Link href="/docs" className="text-blue-600 font-medium">Docs</Link>
              <Link href="/contact" className="text-gray-600 hover:text-gray-900">Contact</Link>
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
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Documentation</h1>
          <p className="text-gray-600 mb-8">Everything you need to know about hosting with CloudHost</p>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search documentation..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-xl text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </section>

      {/* Popular Topics */}
      <section className="py-8 border-b">
        <div className="max-w-7xl mx-auto px-4">
          <p className="text-sm text-gray-500 mb-3">Popular topics:</p>
          <div className="flex flex-wrap gap-2">
            {popularArticles.map((article) => (
              <Link
                key={article}
                href="#"
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full text-sm transition-colors"
              >
                {article}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Documentation Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {docSections.map((section) => (
              <div key={section.title}>
                <div className="flex items-center gap-2 mb-4">
                  <section.icon className="w-5 h-5 text-blue-600" />
                  <h2 className="font-semibold text-gray-900">{section.title}</h2>
                </div>
                <ul className="space-y-2">
                  {section.articles.map((article) => (
                    <li key={article.slug}>
                      <Link
                        href={`/docs/${article.slug}`}
                        className="text-gray-600 hover:text-blue-600 text-sm flex items-center gap-1 group"
                      >
                        {article.title}
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

      {/* Help CTA */}
      <section className="py-16 bg-blue-600">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Need more help?</h2>
          <p className="text-blue-100 mb-6">Our support team is available 24/7 to assist you</p>
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
