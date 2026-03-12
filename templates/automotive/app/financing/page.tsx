"use client";

import { useState } from "react";
import Link from "next/link";
import { Calculator, Car, CreditCard, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SAMPLE_VEHICLES, FINANCING_TERMS } from "@/lib/automotive-config";

export default function FinancingCalculatorPage() {
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);
  const [downPayment, setDownPayment] = useState(500000);
  const [selectedTerm, setSelectedTerm] = useState(36); // months
  const [showResults, setShowResults] = useState(false);

  const selectedVehicle = SAMPLE_VEHICLES.find(v => v.id === selectedVehicleId);
  const selectedTermData = FINANCING_TERMS.find(t => t.months === selectedTerm);
  
  const vehiclePrice = selectedVehicle?.price ?? 0;
  const loanAmount = Math.max(0, vehiclePrice - downPayment);
  const monthlyPayment = selectedTermData 
    ? (loanAmount * (selectedTermData.apr / 100 / 12) * 
       Math.pow(1 + selectedTermData.apr / 100 / 12, selectedTerm)) / 
       (Math.pow(1 + selectedTermData.apr / 100 / 12, selectedTerm) - 1)
    : 0;
  const totalInterest = monthlyPayment * selectedTerm - loanAmount;
  const totalCost = vehiclePrice + totalInterest;

  return (
    <div className="min-h-screen bg-slate-950">
      <nav className="bg-slate-950/95 backdrop-blur border-b border-slate-800 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" asChild className="text-white">
              <Link href="/" className="flex items-center gap-2">
                <ChevronLeft className="w-5 h-5" />
                Back
              </Link>
            </Button>
            <span className="text-xl font-bold text-white flex items-center gap-2">
              <Calculator className="w-5 h-5" />
              Financing Calculator
            </span>
          </div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Calculate Your Payments</h1>
          <p className="text-slate-400">See how much your monthly payments would be</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Panel - Inputs */}
          <div className="space-y-6">
            <div className="bg-slate-900 rounded-xl border border-slate-800 p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Vehicle Selection</h2>
              <div className="grid grid-cols-2 gap-3">
                {SAMPLE_VEHICLES.map((vehicle) => (
                  <button
                    key={vehicle.id}
                    onClick={() => setSelectedVehicleId(vehicle.id)}
                    className={`p-4 rounded-lg border text-left transition-all ${
                      selectedVehicleId === vehicle.id
                        ? "border-blue-500 bg-blue-500/10"
                        : "border-slate-700 hover:border-slate-600"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">{vehicle.image}</span>
                      <div>
                        <p className="font-medium text-white text-sm">
                          {vehicle.year} {vehicle.make}
                        </p>
                        <p className="text-xs text-slate-400">{vehicle.model}</p>
                      </div>
                    </div>
                    <p className="text-lg font-bold text-white">
                      ₦{(vehicle.price / 100).toLocaleString()}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {selectedVehicle && (
              <>
                <div className="bg-slate-900 rounded-xl border border-slate-800 p-6">
                  <h2 className="text-xl font-semibold text-white mb-4">Down Payment</h2>
                  <div className="space-y-4">
                    <input
                      type="range"
                      min="0"
                      max={selectedVehicle.price}
                      step="50000"
                      value={downPayment}
                      onChange={(e) => setDownPayment(Number(e.target.value))}
                      className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-500"
                    />
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">₦0</span>
                      <input
                        type="number"
                        value={downPayment}
                        onChange={(e) => setDownPayment(Number(e.target.value))}
                        className="w-32 px-3 py-2 bg-slate-800 border border-slate-700 rounded text-white text-center"
                      />
                      <span className="text-slate-400">₦{(selectedVehicle.price / 100).toLocaleString()}</span>
                    </div>
                    <div className="pt-2 border-t border-slate-800">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Vehicle Price:</span>
                        <span className="text-white">₦{(selectedVehicle.price / 100).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Down Payment:</span>
                        <span className="text-green-400">-₦{(downPayment / 100).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between font-medium pt-2 border-t border-slate-800">
                        <span className="text-white">Loan Amount:</span>
                        <span className="text-blue-400">₦{(loanAmount / 100).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-900 rounded-xl border border-slate-800 p-6">
                  <h2 className="text-xl font-semibold text-white mb-4">Loan Term</h2>
                  <div className="grid grid-cols-3 gap-2">
                    {FINANCING_TERMS.map((term) => (
                      <button
                        key={term.months}
                        onClick={() => setSelectedTerm(term.months)}
                        className={`py-3 rounded-lg text-sm font-medium transition-all ${
                          selectedTerm === term.months
                            ? "bg-blue-500 text-white"
                            : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                        }`}
                      >
                        {term.months}mo
                      </button>
                    ))}
                  </div>
                  <p className="text-sm text-slate-400 mt-3">
                    APR: {selectedTermData?.apr.toFixed(1)}%
                  </p>
                </div>

                <Button
                  size="lg"
                  className="w-full bg-blue-500 hover:bg-blue-600"
                  onClick={() => setShowResults(true)}
                >
                  Calculate Payments
                </Button>
              </>
            )}
          </div>

          {/* Right Panel - Results */}
          <div className="bg-slate-900 rounded-xl border border-slate-800 p-6">
            <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Payment Summary
            </h2>

            {!showResults ? (
              <div className="text-center py-12">
                <Car className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400">Select a vehicle and configure your financing to see estimates</p>
              </div>
            ) : !selectedVehicle ? (
              <div className="text-center py-12">
                <p className="text-slate-400">Please select a vehicle first</p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="text-center p-4 bg-slate-800 rounded-lg">
                  <p className="text-slate-400 text-sm">Monthly Payment</p>
                  <p className="text-3xl font-bold text-white mt-1">
                    ₦{(monthlyPayment / 100).toLocaleString()}
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between pb-2 border-b border-slate-800">
                    <span className="text-slate-400">Loan Amount</span>
                    <span className="text-white">₦{(loanAmount / 100).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between pb-2 border-b border-slate-800">
                    <span className="text-slate-400">Interest Rate</span>
                    <span className="text-white">{selectedTermData?.apr.toFixed(1)}% APR</span>
                  </div>
                  <div className="flex justify-between pb-2 border-b border-slate-800">
                    <span className="text-slate-400">Loan Term</span>
                    <span className="text-white">{selectedTerm} months</span>
                  </div>
                  <div className="flex justify-between pt-2">
                    <span className="text-slate-400">Total Interest</span>
                    <span className="text-red-400">₦{(totalInterest / 100).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold pt-3 border-t border-slate-700">
                    <span className="text-white">Total Cost</span>
                    <span className="text-blue-400">₦{(totalCost / 100).toLocaleString()}</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-800">
                  <h3 className="font-medium text-white mb-3">Payment Breakdown</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="bg-slate-800 p-3 rounded">
                      <p className="text-slate-400">Principal</p>
                      <p className="text-white font-medium">₦{(loanAmount / 100).toLocaleString()}</p>
                    </div>
                    <div className="bg-slate-800 p-3 rounded">
                      <p className="text-slate-400">Interest</p>
                      <p className="text-red-400 font-medium">₦{(totalInterest / 100).toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                <Button size="lg" className="w-full bg-green-600 hover:bg-green-700 mt-4">
                  Apply for Financing
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}