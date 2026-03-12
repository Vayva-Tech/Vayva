"use client";

import { Car, DollarSign, Percent, Calculator, CheckCircle, Shield, Clock, ChevronRight, ArrowRight } from "lucide-react";
import Link from "next/link";

const rates = [
  { term: "24 Months", apr: "2.9%", monthly: "$450" },
  { term: "36 Months", apr: "3.9%", monthly: "$320" },
  { term: "48 Months", apr: "4.5%", monthly: "$260" },
  { term: "60 Months", apr: "5.2%", monthly: "$220" },
  { term: "72 Months", apr: "5.9%", monthly: "$190" },
];

const benefits = [
  "Pre-approval in minutes",
  "No impact on credit score",
  "Multiple lender options",
  "Flexible down payment",
  "Trade-in accepted",
  "Same-day approval",
];

export default function FinancingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Car className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">AutoDealer</span>
            </Link>
            <div className="hidden md:flex items-center gap-8">
              <Link href="/inventory" className="text-gray-600 hover:text-gray-900">Inventory</Link>
              <Link href="/financing" className="text-blue-600 font-medium">Financing</Link>
              <Link href="/about" className="text-gray-600 hover:text-gray-900">About</Link>
              <Link href="/contact" className="text-gray-600 hover:text-gray-900">Contact</Link>
            </div>
            <Link href="/apply" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Apply Now
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-600 to-indigo-700 py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">Auto Financing Made Simple</h1>
          <p className="text-xl text-blue-100 mb-8">
            Get pre-approved in minutes with rates as low as 2.9% APR
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/apply" className="px-8 py-4 bg-white text-blue-600 font-semibold rounded-xl hover:bg-gray-100 inline-flex items-center gap-2">
              Get Pre-Approved
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link href="/calculator" className="px-8 py-4 border-2 border-white text-white font-semibold rounded-xl hover:bg-white/10">
              Payment Calculator
            </Link>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-16">
        {/* Benefits */}
        <section className="mb-20">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-blue-50 rounded-xl p-8 text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Quick Approval</h3>
              <p className="text-gray-600">Get approved in minutes, not days. Drive home today!</p>
            </div>
            <div className="bg-blue-50 rounded-xl p-8 text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Percent className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Low Rates</h3>
              <p className="text-gray-600">Competitive rates starting at just 2.9% APR</p>
            </div>
            <div className="bg-blue-50 rounded-xl p-8 text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No Impact</h3>
              <p className="text-gray-600">Check your rate without affecting your credit score</p>
            </div>
          </div>
        </section>

        {/* Rates Table */}
        <section className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Current Rates</h2>
            <p className="text-gray-600">Competitive financing options for every budget</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 border-b font-semibold text-gray-700">
              <div>Loan Term</div>
              <div>APR Rate</div>
              <div>Est. Monthly Payment*</div>
            </div>
            {rates.map((rate) => (
              <div key={rate.term} className="grid grid-cols-3 gap-4 p-4 border-b last:border-0 hover:bg-gray-50">
                <div className="font-medium">{rate.term}</div>
                <div className="text-blue-600 font-semibold">{rate.apr}</div>
                <div>{rate.monthly}</div>
              </div>
            ))}
          </div>
          <p className="text-sm text-gray-500 mt-4">*Based on $25,000 loan amount. Actual rates may vary based on credit score and other factors.</p>
        </section>

        {/* Benefits List */}
        <section className="grid lg:grid-cols-2 gap-16 items-center mb-20">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Why Finance With Us?</h2>
            <div className="space-y-4">
              {benefits.map((benefit) => (
                <div key={benefit} className="flex items-center gap-3">
                  <CheckCircle className="w-6 h-6 text-green-500" />
                  <span className="text-lg text-gray-700">{benefit}</span>
                </div>
              ))}
            </div>
            <Link href="/apply" className="inline-flex items-center gap-2 mt-8 px-8 py-4 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700">
              Start Your Application
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
          <div className="bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl p-12 flex items-center justify-center">
            <div className="text-9xl">🚗</div>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-gray-900 rounded-3xl p-12 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Get Started?</h2>
          <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
            Apply now and get pre-approved for your dream car. Our finance team is ready to help!
          </p>
          <Link href="/apply" className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700">
            Apply for Financing
            <ArrowRight className="w-5 h-5" />
          </Link>
        </section>
      </div>
    </div>
  );
}
