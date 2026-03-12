"use client";

import { Heart, Gift, ArrowRight, Shield, CheckCircle, Users, Globe } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const donationAmounts = [25, 50, 100, 250, 500];

const impactStats = [
  { amount: "$25", impact: "Provides school supplies for 5 children" },
  { amount: "$50", impact: "Feeds a family for a week" },
  { amount: "$100", impact: "Gives medical care to 10 people" },
  { amount: "$250", impact: "Builds a clean water access point" },
];

export default function DonatePage() {
  const [selectedAmount, setSelectedAmount] = useState(50);
  const [customAmount, setCustomAmount] = useState("");

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
      <section className="bg-gradient-to-br from-rose-500 to-orange-400 py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Make a Difference Today
          </h1>
          <p className="text-xl text-white/90 mb-8">
            Your donation helps us provide education, healthcare, and hope to communities in need.
          </p>
        </div>
      </section>

      {/* Donation Form */}
      <section className="py-20">
        <div className="max-w-3xl mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-lg p-8 border">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Choose Your Impact</h2>
            
            {/* Amount Buttons */}
            <div className="grid grid-cols-3 md:grid-cols-5 gap-3 mb-6">
              {donationAmounts.map((amount) => (
                <button
                  key={amount}
                  onClick={() => {
                    setSelectedAmount(amount);
                    setCustomAmount("");
                  }}
                  className={`py-3 rounded-lg font-semibold transition-colors ${
                    selectedAmount === amount && !customAmount
                      ? "bg-rose-500 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  ${amount}
                </button>
              ))}
            </div>

            {/* Custom Amount */}
            <div className="mb-8">
              <label className="block text-sm font-medium text-gray-700 mb-2">Custom Amount</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                <input
                  type="number"
                  placeholder="Enter amount"
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Impact Statement */}
            <div className="bg-rose-50 rounded-xl p-4 mb-8">
              <div className="flex items-center gap-2 mb-2">
                <Gift className="w-5 h-5 text-rose-500" />
                <span className="font-medium text-gray-900">Your Impact</span>
              </div>
              <p className="text-gray-600">
                ${customAmount || selectedAmount} will {impactStats.find(s => s.amount === `$${customAmount || selectedAmount}`)?.impact || "help support our mission to create positive change in communities worldwide."}
              </p>
            </div>

            {/* Donate Button */}
            <button className="w-full py-4 bg-rose-500 text-white font-semibold rounded-lg hover:bg-rose-600 flex items-center justify-center gap-2">
              Donate ${customAmount || selectedAmount}
              <ArrowRight className="w-5 h-5" />
            </button>

            {/* Security Note */}
            <div className="flex items-center justify-center gap-2 mt-4 text-sm text-gray-500">
              <Shield className="w-4 h-4" />
              <span>Secure payment processing. Tax deductible.</span>
            </div>
          </div>
        </div>
      </section>

      {/* Impact Stats */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Your Impact</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {impactStats.map((stat) => (
              <div key={stat.amount} className="bg-white rounded-xl p-6 text-center">
                <p className="text-3xl font-bold text-rose-500 mb-2">{stat.amount}</p>
                <p className="text-gray-600">{stat.impact}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-1">100% Transparent</h3>
              <p className="text-gray-600 text-sm">See exactly where your money goes</p>
            </div>
            <div>
              <Shield className="w-8 h-8 text-blue-500 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-1">Secure Donations</h3>
              <p className="text-gray-600 text-sm">256-bit encryption protection</p>
            </div>
            <div>
              <Globe className="w-8 h-8 text-rose-500 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-1">Global Impact</h3>
              <p className="text-gray-600 text-sm">Operating in 150+ countries</p>
            </div>
          </div>
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
            © 2024 HopeRise. All rights reserved. 501(c)(3) nonprofit organization.
          </p>
        </div>
      </footer>
    </div>
  );
}
