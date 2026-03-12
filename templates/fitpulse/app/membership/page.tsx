"use client";

import { Dumbbell, CheckCircle, ArrowRight, Star, Zap, Shield } from "lucide-react";
import Link from "next/link";

const plans = [
  {
    name: "Basic",
    price: "$29",
    period: "per month",
    description: "Perfect for beginners",
    features: [
      "Access to gym equipment",
      "Locker room access",
      "2 group classes per week",
      "Fitness app access",
      "Basic workout plans",
    ],
    popular: false,
  },
  {
    name: "Premium",
    price: "$59",
    period: "per month",
    description: "Most popular choice",
    features: [
      "All Basic features",
      "Unlimited group classes",
      "1 personal training session/month",
      "Nutrition consultation",
      "Sauna & steam room",
      "Guest passes (2/month)",
    ],
    popular: true,
  },
  {
    name: "Elite",
    price: "$99",
    period: "per month",
    description: "For serious athletes",
    features: [
      "All Premium features",
      "4 personal training sessions/month",
      "Recovery room access",
      "Priority class booking",
      "Body composition analysis",
      "Unlimited guest passes",
    ],
    popular: false,
  },
];

export default function MembershipPage() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Navigation */}
      <nav className="bg-gray-800 border-b border-gray-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                <Dumbbell className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">FitPulse</span>
            </Link>
            <div className="hidden md:flex items-center gap-8">
              <Link href="/classes" className="text-gray-400 hover:text-white">Classes</Link>
              <Link href="/trainers" className="text-gray-400 hover:text-white">Trainers</Link>
              <Link href="/membership" className="text-orange-500 font-medium">Membership</Link>
              <Link href="/dashboard" className="text-gray-400 hover:text-white">Dashboard</Link>
            </div>
            <Link href="/join" className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600">
              Join Now
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="bg-gradient-to-br from-orange-600 to-red-700 py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Choose Your Plan</h1>
          <p className="text-xl text-orange-100 mb-8">
            Flexible memberships designed for every fitness journey
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-2xl p-8 ${
                plan.popular
                  ? "bg-orange-500 text-white scale-105 shadow-xl"
                  : "bg-gray-800 border border-gray-700"
              }`}
            >
              {plan.popular && (
                <span className="inline-block px-3 py-1 bg-white/20 text-white text-sm rounded-full mb-4">
                  Most Popular
                </span>
              )}
              <h3 className={`text-2xl font-bold mb-2 ${plan.popular ? "text-white" : ""}`}>
                {plan.name}
              </h3>
              <p className={`mb-4 ${plan.popular ? "text-orange-100" : "text-gray-400"}`}>
                {plan.description}
              </p>
              <div className="mb-6">
                <span className={`text-4xl font-bold ${plan.popular ? "text-white" : ""}`}>
                  {plan.price}
                </span>
                <span className={plan.popular ? "text-orange-100" : "text-gray-500"}>
                  {" "}{plan.period}
                </span>
              </div>
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-3">
                    <CheckCircle className={`w-5 h-5 ${plan.popular ? "text-white" : "text-orange-500"}`} />
                    <span className={plan.popular ? "text-white" : "text-gray-300"}>{feature}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/join"
                className={`block w-full py-3 text-center rounded-lg font-semibold ${
                  plan.popular
                    ? "bg-white text-orange-600 hover:bg-gray-100"
                    : "bg-orange-500 text-white hover:bg-orange-600"
                }`}
              >
                Get Started
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gray-800 py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Not sure which plan is right?</h2>
          <p className="text-gray-400 mb-8">
            Start with a free trial class and see what FitPulse is all about.
          </p>
          <Link href="/classes" className="inline-flex items-center gap-2 px-8 py-4 bg-orange-500 text-white font-semibold rounded-xl hover:bg-orange-600">
            Try a Free Class
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </div>
  );
}
