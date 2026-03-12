"use client";

import { MapPin, DollarSign, Percent, Calendar, Home, Info, ChevronDown } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";

export default function MortgageCalculatorPage() {
  const [homePrice, setHomePrice] = useState(450000);
  const [downPayment, setDownPayment] = useState(90000);
  const [downPaymentPercent, setDownPaymentPercent] = useState(20);
  const [interestRate, setInterestRate] = useState(6.5);
  const [loanTerm, setLoanTerm] = useState(30);
  const [propertyTax, setPropertyTax] = useState(4500);
  const [homeInsurance, setHomeInsurance] = useState(1200);
  const [hoaFees, setHoaFees] = useState(0);

  const loanAmount = homePrice - downPayment;
  const monthlyRate = interestRate / 100 / 12;
  const numberOfPayments = loanTerm * 12;
  
  const monthlyPrincipalInterest = 
    monthlyRate === 0 
      ? loanAmount / numberOfPayments
      : (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) / 
        (Math.pow(1 + monthlyRate, numberOfPayments) - 1);

  const monthlyPropertyTax = propertyTax / 12;
  const monthlyInsurance = homeInsurance / 12;
  const totalMonthlyPayment = monthlyPrincipalInterest + monthlyPropertyTax + monthlyInsurance + hoaFees;

  const updateDownPaymentFromPercent = (percent: number) => {
    setDownPaymentPercent(percent);
    setDownPayment(Math.round(homePrice * (percent / 100)));
  };

  const updateDownPaymentFromAmount = (amount: number) => {
    setDownPayment(amount);
    setDownPaymentPercent(Math.round((amount / homePrice) * 100));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                <MapPin className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">LarkHomes</span>
            </Link>
            <div className="hidden md:flex items-center gap-8">
              <Link href="/properties" className="text-gray-600 hover:text-gray-900">Properties</Link>
              <Link href="/agents" className="text-gray-600 hover:text-gray-900">Agents</Link>
              <Link href="/about" className="text-gray-600 hover:text-gray-900">About</Link>
              <Link href="/contact" className="text-gray-600 hover:text-gray-900">Contact</Link>
            </div>
            <Link href="/auth/login" className="px-4 py-2 text-gray-600 hover:text-gray-900">Sign In</Link>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-2">Mortgage Calculator</h1>
        <p className="text-gray-600 mb-8">Estimate your monthly mortgage payments and see how much house you can afford.</p>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Calculator Inputs */}
          <div className="lg:col-span-2 space-y-6">
            {/* Home Price */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <label className="block font-semibold mb-3">Home Price</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="number"
                  value={homePrice}
                  onChange={(e) => setHomePrice(Number(e.target.value))}
                  className="w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:border-indigo-600 text-lg"
                />
              </div>
              <input
                type="range"
                min="100000"
                max="2000000"
                step="10000"
                value={homePrice}
                onChange={(e) => setHomePrice(Number(e.target.value))}
                className="w-full mt-3"
              />
            </div>

            {/* Down Payment */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <label className="font-semibold">Down Payment</label>
                <span className="text-sm text-gray-500">{downPaymentPercent}%</span>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-3">
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="number"
                    value={downPayment}
                    onChange={(e) => updateDownPaymentFromAmount(Number(e.target.value))}
                    className="w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:border-indigo-600"
                  />
                </div>
                <div className="relative">
                  <Percent className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="number"
                    value={downPaymentPercent}
                    onChange={(e) => updateDownPaymentFromPercent(Number(e.target.value))}
                    className="w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:border-indigo-600"
                  />
                </div>
              </div>
              <input
                type="range"
                min="0"
                max="50"
                step="1"
                value={downPaymentPercent}
                onChange={(e) => updateDownPaymentFromPercent(Number(e.target.value))}
                className="w-full"
              />
            </div>

            {/* Interest Rate & Loan Term */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <label className="block font-semibold mb-3">Interest Rate</label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    value={interestRate}
                    onChange={(e) => setInterestRate(Number(e.target.value))}
                    className="w-full pl-4 pr-10 py-3 border rounded-xl focus:outline-none focus:border-indigo-600"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">%</span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="15"
                  step="0.1"
                  value={interestRate}
                  onChange={(e) => setInterestRate(Number(e.target.value))}
                  className="w-full mt-3"
                />
              </div>
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <label className="block font-semibold mb-3">Loan Term</label>
                <select
                  value={loanTerm}
                  onChange={(e) => setLoanTerm(Number(e.target.value))}
                  className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:border-indigo-600"
                >
                  <option value={15}>15 years</option>
                  <option value={20}>20 years</option>
                  <option value={30}>30 years</option>
                </select>
              </div>
            </div>

            {/* Additional Costs */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="font-semibold mb-4">Additional Costs (per year)</h3>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Property Tax</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="number"
                      value={propertyTax}
                      onChange={(e) => setPropertyTax(Number(e.target.value))}
                      className="w-full pl-8 pr-3 py-2 border rounded-lg focus:outline-none focus:border-indigo-600"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Home Insurance</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="number"
                      value={homeInsurance}
                      onChange={(e) => setHomeInsurance(Number(e.target.value))}
                      className="w-full pl-8 pr-3 py-2 border rounded-lg focus:outline-none focus:border-indigo-600"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">HOA Fees /mo</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="number"
                      value={hoaFees}
                      onChange={(e) => setHoaFees(Number(e.target.value))}
                      className="w-full pl-8 pr-3 py-2 border rounded-lg focus:outline-none focus:border-indigo-600"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Results Sidebar */}
          <div className="lg:sticky lg:top-24 h-fit">
            <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl p-6 text-white">
              <h2 className="text-lg font-medium mb-1">Estimated Monthly Payment</h2>
              <div className="text-4xl font-bold mb-6">
                ${Math.round(totalMonthlyPayment).toLocaleString()}
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-white/20">
                  <span className="text-indigo-200">Principal & Interest</span>
                  <span className="font-semibold">${Math.round(monthlyPrincipalInterest).toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-white/20">
                  <span className="text-indigo-200">Property Tax</span>
                  <span className="font-semibold">${Math.round(monthlyPropertyTax).toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-white/20">
                  <span className="text-indigo-200">Home Insurance</span>
                  <span className="font-semibold">${Math.round(monthlyInsurance).toLocaleString()}</span>
                </div>
                {hoaFees > 0 && (
                  <div className="flex justify-between items-center py-2 border-b border-white/20">
                    <span className="text-indigo-200">HOA Fees</span>
                    <span className="font-semibold">${hoaFees.toLocaleString()}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Loan Summary */}
            <div className="bg-white rounded-2xl p-6 shadow-sm mt-4">
              <h3 className="font-semibold mb-4">Loan Summary</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Loan Amount</span>
                  <span className="font-medium">${loanAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Down Payment</span>
                  <span className="font-medium">${downPayment.toLocaleString()} ({downPaymentPercent}%)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Interest Rate</span>
                  <span className="font-medium">{interestRate}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Loan Term</span>
                  <span className="font-medium">{loanTerm} years</span>
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="bg-white rounded-2xl p-6 shadow-sm mt-4">
              <h3 className="font-semibold mb-2">Ready to Get Started?</h3>
              <p className="text-sm text-gray-600 mb-4">
                Get pre-approved and start your home search today.
              </p>
              <button className="w-full py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700">
                Get Pre-Approved
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
