"use client";

import { Stethoscope, Calendar, Clock, MapPin, Phone, Star, Check, User, FileText, Heart } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const services = [
  { name: "Primary Care", icon: "👨‍⚕️", description: "Comprehensive health checkups and preventive care", price: "$100" },
  { name: "Cardiology", icon: "❤️", description: "Heart health monitoring and treatment", price: "$250" },
  { name: "Pediatrics", icon: "👶", description: "Specialized care for children and adolescents", price: "$120" },
  { name: "Orthopedics", icon: "🦴", description: "Bone and joint treatment and rehabilitation", price: "$200" },
  { name: "Dermatology", icon: "🔬", description: "Skin conditions diagnosis and treatment", price: "$150" },
  { name: "Mental Health", icon: "🧠", description: "Counseling and psychiatric services", price: "$180" },
];

const steps = [
  { step: 1, title: "Choose Service", description: "Select the medical service you need" },
  { step: 2, title: "Pick a Doctor", description: "Browse and select your preferred doctor" },
  { step: 3, title: "Select Time", description: "Choose a convenient appointment slot" },
  { step: 4, title: "Confirm", description: "Review and confirm your booking" },
];

export default function AppointmentsPage() {
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(1);

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-teal-500 rounded-lg flex items-center justify-center">
                <Stethoscope className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">Medicare</span>
            </Link>
            <div className="hidden md:flex items-center gap-8">
              <Link href="/doctors" className="text-gray-600 hover:text-gray-900">Find Doctors</Link>
              <Link href="/services" className="text-gray-600 hover:text-gray-900">Services</Link>
              <Link href="/appointments" className="text-teal-600 font-medium">Book Appointment</Link>
              <Link href="/about" className="text-gray-600 hover:text-gray-900">About</Link>
            </div>
            <Link href="/patient-portal" className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600">
              Patient Portal
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="bg-gradient-to-br from-teal-500 to-cyan-600 py-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">Book an Appointment</h1>
          <p className="text-teal-100">Schedule your visit in just a few simple steps</p>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 py-12">
        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-12">
          {steps.map((s, idx) => (
            <div key={s.step} className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                currentStep >= s.step ? "bg-teal-500 text-white" : "bg-gray-200 text-gray-500"
              }`}>
                {currentStep > s.step ? <Check className="w-5 h-5" /> : s.step}
              </div>
              <div className="ml-3 hidden md:block">
                <p className="font-medium text-gray-900">{s.title}</p>
                <p className="text-sm text-gray-500">{s.description}</p>
              </div>
              {idx < steps.length - 1 && (
                <div className={`w-12 h-0.5 mx-4 ${currentStep > s.step ? "bg-teal-500" : "bg-gray-200"}`} />
              )}
            </div>
          ))}
        </div>

        {/* Service Selection */}
        {currentStep === 1 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Select a Service</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((service) => (
                <button
                  key={service.name}
                  onClick={() => setSelectedService(service.name)}
                  className={`p-6 rounded-xl border text-left transition-all ${
                    selectedService === service.name
                      ? "border-teal-500 bg-teal-50"
                      : "border-gray-200 hover:border-teal-300"
                  }`}
                >
                  <div className="text-4xl mb-4">{service.icon}</div>
                  <h3 className="font-semibold text-lg text-gray-900 mb-2">{service.name}</h3>
                  <p className="text-gray-600 text-sm mb-3">{service.description}</p>
                  <p className="text-teal-600 font-medium">Starting at {service.price}</p>
                </button>
              ))}
            </div>
            <div className="mt-8 flex justify-end">
              <button
                onClick={() => setCurrentStep(2)}
                disabled={!selectedService}
                className="px-8 py-3 bg-teal-500 text-white font-semibold rounded-lg hover:bg-teal-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {/* Summary */}
        {currentStep > 1 && (
          <div className="bg-gray-50 rounded-xl p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Booking Summary</h3>
            <div className="space-y-2 text-sm">
              <p><span className="text-gray-500">Service:</span> {selectedService}</p>
              <p><span className="text-gray-500">Step:</span> {currentStep} of 4</p>
            </div>
            <div className="mt-6 flex gap-4">
              <button
                onClick={() => setCurrentStep(currentStep - 1)}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Back
              </button>
              <button
                onClick={() => currentStep < 4 ? setCurrentStep(currentStep + 1) : alert("Booking confirmed!")}
                className="px-6 py-3 bg-teal-500 text-white rounded-lg hover:bg-teal-600"
              >
                {currentStep === 4 ? "Confirm Booking" : "Continue"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
