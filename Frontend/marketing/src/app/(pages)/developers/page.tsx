"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Code,
  Webhook,
  Key,
  FileText,
  Book,
  Terminal,
  CheckCircle,
  ArrowRight,
  Copy,
  Check,
  Zap,
  Shield,
  Globe,
} from "@phosphor-icons/react";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

// Code examples
const codeExamples = {
  authentication: `// Authenticate with API key
const response = await fetch('https://api.vayva.ng/v1/orders', {
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json',
  },
});

const data = await response.json();`,

  createOrder: `// Create a new order
const order = await fetch('https://api.vayva.ng/v1/orders', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    customer: {
      name: 'John Doe',
      phone: '+2348100000000',
    },
    items: [
      {
        productId: 'prod_123',
        quantity: 2,
        price: 5000,
      },
    ],
    currency: 'NGN',
  }),
});`,

  webhook: `// Webhook payload example
{
  "event": "order.created",
  "timestamp": "2026-03-10T12:00:00Z",
  "data": {
    "orderId": "ord_123456",
    "orderNumber": "VA-2026-001",
    "status": "pending_payment",
    "total": 10000,
    "currency": "NGN",
    "customer": {
      "name": "John Doe",
      "phone": "+2348100000000"
    }
  }
}`,
};

// Feature cards
const features = [
  {
    icon: Code,
    title: "RESTful API",
    description: "Clean, intuitive REST API with predictable resource-oriented URLs.",
    color: "from-blue-500 to-cyan-500",
  },
  {
    icon: Webhook,
    title: "Webhooks",
    description: "Real-time event notifications for orders, payments, and deliveries.",
    color: "from-purple-500 to-pink-500",
  },
  {
    icon: Shield,
    title: "Secure",
    description: "API key authentication with granular permissions and IP allowlisting.",
    color: "from-green-500 to-emerald-500",
  },
  {
    icon: Globe,
    title: "Multi-currency",
    description: "Support for NGN, USD, EUR, and GBP with automatic conversion.",
    color: "from-orange-500 to-red-500",
  },
];

// API endpoints
const endpoints = [
  {
    method: "GET",
    path: "/v1/orders",
    description: "List all orders",
    auth: true,
  },
  {
    method: "POST",
    path: "/v1/orders",
    description: "Create a new order",
    auth: true,
  },
  {
    method: "GET",
    path: "/v1/orders/{id}",
    description: "Get order details",
    auth: true,
  },
  {
    method: "PATCH",
    path: "/v1/orders/{id}",
    description: "Update order status",
    auth: true,
  },
  {
    method: "GET",
    path: "/v1/products",
    description: "List all products",
    auth: true,
  },
  {
    method: "POST",
    path: "/v1/products",
    description: "Create a new product",
    auth: true,
  },
  {
    method: "GET",
    path: "/v1/customers",
    description: "List customers",
    auth: true,
  },
  {
    method: "POST",
    path: "/v1/webhooks",
    description: "Register webhook endpoint",
    auth: true,
  },
];

// Code block component
function CodeBlock({ code, language = "javascript" }: { code: string; language?: string }) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group">
      <div className="absolute right-3 top-3 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={copyToClipboard}
          className="p-2 bg-gray-700 rounded-lg text-gray-300 hover:text-white hover:bg-gray-600 transition-colors"
        >
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
        </button>
      </div>
      <pre className="bg-gray-900 rounded-xl p-5 overflow-x-auto">
        <code className="text-sm text-gray-300 font-mono">{code}</code>
      </pre>
    </div>
  );
}

// Method badge component
function MethodBadge({ method }: { method: string }) {
  const colors: Record<string, string> = {
    GET: "bg-green-100 text-green-700 border-green-200",
    POST: "bg-blue-100 text-blue-700 border-blue-200",
    PUT: "bg-yellow-100 text-yellow-700 border-yellow-200",
    PATCH: "bg-orange-100 text-orange-700 border-orange-200",
    DELETE: "bg-red-100 text-red-700 border-red-200",
  };

  return (
    <span className={`px-2.5 py-1 rounded-md text-xs font-bold border ${colors[method] || colors.GET}`}>
      {method}
    </span>
  );
}

export default function DevelopersPage() {
  const [activeTab, setActiveTab] = useState<"auth" | "orders" | "webhooks">("auth");

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 opacity-5" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <motion.div
            initial="initial"
            animate="animate"
            variants={staggerContainer}
            className="text-center"
          >
            <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 rounded-full mb-6">
              <Zap className="h-4 w-4 text-indigo-600" weight="fill" />
              <span className="text-sm font-medium text-indigo-700">Developer Platform</span>
            </motion.div>

            <motion.h1
              variants={fadeInUp}
              className="text-5xl md:text-6xl font-bold text-gray-900 mb-6"
            >
              Build on <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Vayva</span>
            </motion.h1>

            <motion.p
              variants={fadeInUp}
              className="text-xl text-gray-600 max-w-2xl mx-auto mb-10"
            >
              Powerful APIs, webhooks, and tools to integrate Vayva into your applications. 
              Build custom solutions for your business.
            </motion.p>

            <motion.div variants={fadeInUp} className="flex flex-wrap justify-center gap-4">
              <a
                href="#getting-started"
                className="inline-flex items-center gap-2 px-8 py-4 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors"
              >
                <Book className="h-5 w-5" />
                Get Started
              </a>
              <a
                href="/api/openapi.yaml"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white text-gray-700 border border-gray-200 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
              >
                <FileText className="h-5 w-5" />
                API Reference
              </a>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4`}>
                  <feature.icon className="h-6 w-6 text-white" weight="fill" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Quick Start */}
      <section id="getting-started" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            <motion.div variants={fadeInUp} className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Quick Start</h2>
              <p className="text-gray-600">Get up and running with the Vayva API in minutes</p>
            </motion.div>

            <motion.div variants={fadeInUp} className="grid lg:grid-cols-2 gap-12 items-start">
              {/* Steps */}
              <div className="space-y-6">
                {[
                  {
                    step: 1,
                    title: "Get API Key",
                    description: "Generate an API key from your merchant dashboard under Settings > API Keys.",
                    icon: Key,
                  },
                  {
                    step: 2,
                    title: "Make Your First Request",
                    description: "Use your API key to authenticate requests to the Vayva API.",
                    icon: Terminal,
                  },
                  {
                    step: 3,
                    title: "Handle Webhooks",
                    description: "Set up webhook endpoints to receive real-time event notifications.",
                    icon: Webhook,
                  },
                ].map((item) => (
                  <div key={item.step} className="flex gap-4">
                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                      <span className="text-indigo-700 font-bold">{item.step}</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                        {item.title}
                        <item.icon className="h-4 w-4 text-gray-400" />
                      </h3>
                      <p className="text-gray-600 mt-1">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Code Examples */}
              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                <div className="flex border-b border-gray-200">
                  {[
                    { id: "auth", label: "Authentication" },
                    { id: "orders", label: "Create Order" },
                    { id: "webhooks", label: "Webhooks" },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as typeof activeTab)}
                      className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                        activeTab === tab.id
                          ? "bg-gray-50 text-indigo-600 border-b-2 border-indigo-600"
                          : "text-gray-600 hover:text-gray-900"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
                <div className="p-6">
                  <CodeBlock code={codeExamples[activeTab]} />
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* API Endpoints */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            <motion.div variants={fadeInUp} className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">API Endpoints</h2>
              <p className="text-gray-600">Core endpoints for building with Vayva</p>
            </motion.div>

            <motion.div variants={fadeInUp} className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Method
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Endpoint
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Description
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Auth
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {endpoints.map((endpoint, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <MethodBadge method={endpoint.method} />
                        </td>
                        <td className="px-6 py-4">
                          <code className="text-sm font-mono text-gray-900">{endpoint.path}</code>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">{endpoint.description}</td>
                        <td className="px-6 py-4">
                          {endpoint.auth ? (
                            <CheckCircle className="h-5 w-5 text-green-500" weight="fill" />
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                <a
                  href="/api/openapi.yaml"
                  className="inline-flex items-center gap-2 text-indigo-600 font-medium hover:text-indigo-700"
                >
                  View Full API Reference
                  <ArrowRight className="h-4 w-4" />
                </a>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Resources */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            <motion.div variants={fadeInUp} className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Developer Resources</h2>
              <p className="text-gray-600">Everything you need to build with Vayva</p>
            </motion.div>

            <motion.div variants={fadeInUp} className="grid md:grid-cols-3 gap-6">
              {[
                {
                  title: "API Documentation",
                  description: "Complete API reference with examples and schemas.",
                  icon: FileText,
                  href: "/api/openapi.yaml",
                  color: "bg-blue-500",
                },
                {
                  title: "Webhooks Guide",
                  description: "Learn how to receive and verify webhook events.",
                  icon: Webhook,
                  href: "#",
                  color: "bg-purple-500",
                },
                {
                  title: "SDKs & Libraries",
                  description: "Official SDKs for Node.js, Python, and PHP.",
                  icon: Code,
                  href: "#",
                  color: "bg-green-500",
                },
                {
                  title: "Changelog",
                  description: "Stay up to date with API changes and new features.",
                  icon: Book,
                  href: "#",
                  color: "bg-orange-500",
                },
                {
                  title: "Postman Collection",
                  description: "Import our Postman collection to test APIs.",
                  icon: Terminal,
                  href: "#",
                  color: "bg-red-500",
                },
                {
                  title: "Support",
                  description: "Get help from our developer support team.",
                  icon: Shield,
                  href: "/contact",
                  color: "bg-indigo-500",
                },
              ].map((resource, index) => (
                <a
                  key={index}
                  href={resource.href}
                  className="group bg-white rounded-xl p-6 border border-gray-200 hover:border-indigo-300 hover:shadow-md transition-all"
                >
                  <div className={`h-12 w-12 rounded-xl ${resource.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <resource.icon className="h-6 w-6 text-white" weight="fill" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{resource.title}</h3>
                  <p className="text-gray-600 text-sm">{resource.description}</p>
                </a>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl p-12 text-center text-white"
          >
            <h2 className="text-3xl font-bold mb-4">Ready to start building?</h2>
            <p className="text-indigo-100 mb-8 max-w-xl mx-auto">
              Create your merchant account and get your API keys in minutes. 
              No credit card required to get started.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <a
                href="/signup"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white text-indigo-600 rounded-xl font-semibold hover:bg-gray-100 transition-colors"
              >
                Create Account
                <ArrowRight className="h-5 w-5" />
              </a>
              <a
                href="/contact"
                className="inline-flex items-center gap-2 px-8 py-4 bg-indigo-500 text-white rounded-xl font-semibold hover:bg-indigo-400 transition-colors"
              >
                Contact Sales
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
