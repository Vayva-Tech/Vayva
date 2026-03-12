"use client";

import { Zap, Check, ArrowRight, Shield, Clock, RefreshCw, ExternalLink, Search, Filter } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const integrations = [
  {
    id: 1,
    name: "Slack",
    category: "Communication",
    description: "Get notifications and updates directly in your Slack channels",
    icon: "💬",
    connected: true,
    popular: true,
  },
  {
    id: 2,
    name: "GitHub",
    category: "Development",
    description: "Sync repositories and track code changes automatically",
    icon: "🐙",
    connected: true,
    popular: true,
  },
  {
    id: 3,
    name: "Zapier",
    category: "Automation",
    description: "Connect with 5000+ apps through automated workflows",
    icon: "⚡",
    connected: false,
    popular: true,
  },
  {
    id: 4,
    name: "Google Workspace",
    category: "Productivity",
    description: "Sync calendars, docs, and emails with your projects",
    icon: "📧",
    connected: false,
    popular: true,
  },
  {
    id: 5,
    name: "Jira",
    category: "Project Management",
    description: "Two-way sync with Jira issues and sprints",
    icon: "📋",
    connected: false,
    popular: false,
  },
  {
    id: 6,
    name: "Notion",
    category: "Productivity",
    description: "Embed tasks and projects in your Notion workspace",
    icon: "📝",
    connected: true,
    popular: false,
  },
  {
    id: 7,
    name: "Figma",
    category: "Design",
    description: "Link design files and get feedback notifications",
    icon: "🎨",
    connected: false,
    popular: false,
  },
  {
    id: 8,
    name: "Stripe",
    category: "Finance",
    description: "Track payments and billing within your dashboard",
    icon: "💳",
    connected: false,
    popular: false,
  },
  {
    id: 9,
    name: "AWS",
    category: "Infrastructure",
    description: "Monitor resources and deploy directly from SaaSFlow",
    icon: "☁️",
    connected: false,
    popular: false,
  },
  {
    id: 10,
    name: "Datadog",
    category: "Monitoring",
    description: "Get alerts and visualize metrics in one place",
    icon: "📊",
    connected: false,
    popular: false,
  },
  {
    id: 11,
    name: "Salesforce",
    category: "CRM",
    description: "Sync customer data and track sales activities",
    icon: "☁️",
    connected: false,
    popular: false,
  },
  {
    id: 12,
    name: "HubSpot",
    category: "Marketing",
    description: "Connect marketing campaigns with project tasks",
    icon: "🎯",
    connected: false,
    popular: false,
  },
];

const categories = ["All", "Popular", "Communication", "Development", "Productivity", "Automation", "Design", "Finance"];

export default function IntegrationsPage() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredIntegrations = integrations.filter((integration) => {
    const matchesCategory = selectedCategory === "All" || 
      (selectedCategory === "Popular" ? integration.popular : integration.category === selectedCategory);
    const matchesSearch = integration.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      integration.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const connectedCount = integrations.filter(i => i.connected).length;

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="border-b sticky top-0 z-50 bg-white/80 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg" />
              <span className="text-xl font-bold text-gray-900">SaaSFlow</span>
            </Link>
            <div className="hidden md:flex items-center gap-8">
              <Link href="/features" className="text-gray-600 hover:text-gray-900">Features</Link>
              <Link href="/pricing" className="text-gray-600 hover:text-gray-900">Pricing</Link>
              <Link href="/about" className="text-gray-600 hover:text-gray-900">About</Link>
              <Link href="/integrations" className="text-indigo-600 font-medium">Integrations</Link>
            </div>
            <Link href="/auth/login" className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-full text-sm font-medium mb-6">
            <Zap className="w-4 h-4" />
            100+ Integrations Available
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Connect Your Favorite Tools
          </h1>
          <p className="text-xl text-gray-600">
            Seamlessly integrate with the tools you already use. Sync data, automate workflows, and boost productivity.
          </p>
        </div>

        {/* Connected Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-gray-50 rounded-xl p-6 text-center">
            <p className="text-3xl font-bold text-indigo-600 mb-1">{connectedCount}</p>
            <p className="text-gray-600">Connected</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-6 text-center">
            <p className="text-3xl font-bold text-gray-900 mb-1">{integrations.length}</p>
            <p className="text-gray-600">Available</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-6 text-center">
            <p className="text-3xl font-bold text-gray-900 mb-1">100+</p>
            <p className="text-gray-600">More via Zapier</p>
          </div>
        </div>

        {/* Search & Filter */}
        <div className="flex flex-wrap gap-4 mb-8">
          <div className="relative flex-1 min-w-[300px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search integrations..."
              className="w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:border-indigo-600"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-3 border rounded-xl hover:bg-gray-50">
            <Filter className="w-5 h-5" />
            Filters
          </button>
        </div>

        {/* Categories */}
        <div className="flex flex-wrap gap-2 mb-8">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedCategory === category
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Integrations Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredIntegrations.map((integration) => (
            <div key={integration.id} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="text-4xl">{integration.icon}</div>
                {integration.connected ? (
                  <span className="flex items-center gap-1 text-green-600 text-sm font-medium">
                    <Check className="w-4 h-4" />
                    Connected
                  </span>
                ) : (
                  <button className="text-indigo-600 text-sm font-medium hover:underline">
                    Connect
                  </button>
                )}
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">{integration.name}</h3>
              <p className="text-sm text-gray-500 mb-3">{integration.category}</p>
              <p className="text-gray-600 text-sm mb-4">{integration.description}</p>
              {integration.connected ? (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <RefreshCw className="w-4 h-4" />
                  Last synced 2 min ago
                </div>
              ) : (
                <button className="w-full py-2 border border-indigo-600 text-indigo-600 rounded-lg font-medium hover:bg-indigo-50">
                  Learn More
                </button>
              )}
            </div>
          ))}
        </div>

        {/* API Section */}
        <div className="mt-16 bg-gradient-to-br from-gray-900 to-indigo-900 rounded-2xl p-8 md:p-12 text-white">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">Build Custom Integrations</h2>
            <p className="text-gray-300 mb-8">
              Our REST API and webhooks make it easy to build custom integrations for your specific needs.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/docs/api" className="px-6 py-3 bg-white text-gray-900 font-semibold rounded-xl hover:bg-gray-100 inline-flex items-center gap-2">
                <ExternalLink className="w-5 h-5" />
                API Documentation
              </Link>
              <Link href="/docs/webhooks" className="px-6 py-3 border border-white/30 text-white font-semibold rounded-xl hover:bg-white/10">
                Webhook Guide
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
