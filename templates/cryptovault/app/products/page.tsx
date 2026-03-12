"use client";

import { Shield, Bitcoin, ArrowRightLeft, Lock, Globe, Zap, ChevronRight, CheckCircle } from "lucide-react";
import Link from "next/link";

const features = [
  {
    title: "Secure Storage",
    description: "Military-grade encryption protects your digital assets. Your private keys never leave your device.",
    icon: "🔐",
  },
  {
    title: "Instant Swaps",
    description: "Exchange between 100+ cryptocurrencies at competitive rates with minimal slippage.",
    icon: "⚡",
  },
  {
    title: "Multi-Chain Support",
    description: "Bitcoin, Ethereum, Solana, and 50+ other blockchains all in one secure wallet.",
    icon: "🌐",
  },
];

const securityFeatures = [
  "Hardware wallet integration",
  "Biometric authentication",
  "Multi-signature support",
  "24/7 fraud monitoring",
  "Insurance coverage up to $250,000",
  "Cold storage for 98% of assets",
];

export default function ProductsPage() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Navigation */}
      <nav className="bg-gray-800 border-b border-gray-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                <Bitcoin className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">CryptoVault</span>
            </Link>
            <div className="hidden md:flex items-center gap-8">
              <Link href="/products" className="text-white font-medium">Products</Link>
              <Link href="/about" className="text-gray-400 hover:text-white">About</Link>
              <Link href="/security" className="text-gray-400 hover:text-white">Security</Link>
              <Link href="/support" className="text-gray-400 hover:text-white">Support</Link>
            </div>
            <Link href="/download" className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600">
              Download App
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="bg-gradient-to-br from-orange-600 to-red-700 py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Secure Crypto for Everyone</h1>
          <p className="text-xl text-orange-100 mb-8">
            The most trusted platform to store, trade, and grow your digital assets
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/download" className="px-8 py-4 bg-white text-orange-600 font-semibold rounded-xl hover:bg-gray-100 inline-flex items-center gap-2">
              Get Started Free
              <ChevronRight className="w-5 h-5" />
            </Link>
            <Link href="/learn" className="px-8 py-4 border-2 border-white text-white font-semibold rounded-xl hover:bg-white/10">
              Learn More
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Everything You Need</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              A complete suite of tools for managing your cryptocurrency portfolio
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature) => (
              <div key={feature.title} className="bg-gray-800 rounded-xl p-8">
                <div className="text-5xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Security */}
      <section className="py-20 bg-gray-800">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">Bank-Grade Security</h2>
              <p className="text-gray-400 mb-8">
                Your security is our top priority. We employ the same encryption standards 
                used by the world&apos;s leading financial institutions.
              </p>
              <div className="space-y-4">
                {securityFeatures.map((feature) => (
                  <div key={feature} className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-2xl p-12 flex items-center justify-center">
              <div className="text-8xl">🛡️</div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Simple Pricing</h2>
            <p className="text-gray-400">Choose the plan that works for you</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="bg-gray-800 rounded-xl p-8">
              <h3 className="text-xl font-semibold mb-2">Free</h3>
              <p className="text-gray-400 mb-6">Perfect for getting started</p>
              <p className="text-4xl font-bold mb-6">$0</p>
              <ul className="space-y-3 mb-8 text-gray-400">
                <li>Secure wallet</li>
                <li>Basic swaps</li>
                <li>5 chains</li>
                <li>Email support</li>
              </ul>
              <button className="w-full py-3 border border-gray-600 rounded-lg hover:bg-gray-700">
                Get Started
              </button>
            </div>
            <div className="bg-gradient-to-b from-orange-500/20 to-orange-600/20 rounded-xl p-8 border border-orange-500">
              <h3 className="text-xl font-semibold mb-2">Pro</h3>
              <p className="text-gray-400 mb-6">For active traders</p>
              <p className="text-4xl font-bold mb-6">$9.99<span className="text-lg font-normal text-gray-400">/mo</span></p>
              <ul className="space-y-3 mb-8">
                <li>Everything in Free</li>
                <li>Advanced trading</li>
                <li>50+ chains</li>
                <li>Priority support</li>
                <li>Lower fees</li>
              </ul>
              <button className="w-full py-3 bg-orange-500 rounded-lg hover:bg-orange-600">
                Upgrade to Pro
              </button>
            </div>
            <div className="bg-gray-800 rounded-xl p-8">
              <h3 className="text-xl font-semibold mb-2">Enterprise</h3>
              <p className="text-gray-400 mb-6">For institutions</p>
              <p className="text-4xl font-bold mb-6">Custom</p>
              <ul className="space-y-3 mb-8 text-gray-400">
                <li>Everything in Pro</li>
                <li>Dedicated manager</li>
                <li>Custom integrations</li>
                <li>SLA guarantee</li>
                <li>Insurance coverage</li>
              </ul>
              <button className="w-full py-3 border border-gray-600 rounded-lg hover:bg-gray-700">
                Contact Sales
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
