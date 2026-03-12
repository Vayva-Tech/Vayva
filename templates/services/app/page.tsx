"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckCircle, ArrowRight, Briefcase, Users, Clock, Award, Phone, Mail } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-indigo-600">
            PROSERVE
          </Link>
          <nav className="hidden md:flex items-center gap-8">
            <Link href="/services" className="text-sm font-medium hover:text-indigo-600">
              Services
            </Link>
            <Link href="/about" className="text-sm font-medium hover:text-indigo-600">
              About
            </Link>
            <Link href="/portfolio" className="text-sm font-medium hover:text-indigo-600">
              Portfolio
            </Link>
            <Link href="/contact" className="text-sm font-medium hover:text-indigo-600">
              Contact
            </Link>
          </nav>
          <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700">
            Get Quote
          </Button>
        </div>
      </header>

      {/* Hero */}
      <section className="relative bg-gradient-to-br from-indigo-900 to-purple-900 py-24 md:py-32">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-indigo-300 font-medium mb-4 uppercase tracking-wider">Professional Services</p>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Expert Solutions for Your Business
            </h1>
            <p className="text-xl text-indigo-100 mb-8 max-w-2xl mx-auto">
              We deliver exceptional consulting, marketing, and creative services 
              to help your business grow and succeed.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="bg-white text-indigo-900 hover:bg-indigo-50">
                <Link href="/services">Our Services</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                <Link href="/contact">Contact Us</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 bg-indigo-50 border-b">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <p className="text-3xl font-bold text-indigo-600">500+</p>
              <p className="text-sm text-gray-600">Projects Completed</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-indigo-600">150+</p>
              <p className="text-sm text-gray-600">Happy Clients</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-indigo-600">10+</p>
              <p className="text-sm text-gray-600">Years Experience</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-indigo-600">24/7</p>
              <p className="text-sm text-gray-600">Support</p>
            </div>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Our Services</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Comprehensive solutions tailored to meet your business needs
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <ServiceCard
              icon={<Briefcase className="h-8 w-8" />}
              title="Business Consulting"
              description="Strategic planning and operational improvement to maximize your business potential."
              price={150000}
            />
            <ServiceCard
              icon={<Users className="h-8 w-8" />}
              title="Digital Marketing"
              description="Results-driven marketing campaigns that increase visibility and drive conversions."
              price={100000}
            />
            <ServiceCard
              icon={<Award className="h-8 w-8" />}
              title="Brand Strategy"
              description="Build a compelling brand identity that resonates with your target audience."
              price={200000}
            />
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">Why Choose Us</h2>
              <div className="space-y-4">
                {[
                  "Certified industry experts with proven track records",
                  "Customized solutions tailored to your specific needs",
                  "Transparent pricing with no hidden fees",
                  "Dedicated project manager for every client",
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-indigo-600 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-lg">
              <h3 className="text-xl font-semibold mb-4">Request a Free Consultation</h3>
              <div className="space-y-4">
                <Input placeholder="Your Name" />
                <Input placeholder="Email Address" type="email" />
                <Input placeholder="Phone Number" />
                <select className="w-full border rounded-md px-3 py-2 text-sm">
                  <option>Select Service</option>
                  <option>Business Consulting</option>
                  <option>Digital Marketing</option>
                  <option>Brand Strategy</option>
                </select>
                <Button className="w-full bg-indigo-600 hover:bg-indigo-700">
                  Schedule Call <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function ServiceCard({ icon, title, description, price }: { icon: React.ReactNode; title: string; description: string; price: number }) {
  return (
    <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow border">
      <div className="w-16 h-16 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600 mb-6">
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-3">{title}</h3>
      <p className="text-gray-600 mb-4">{description}</p>
      <p className="text-2xl font-bold text-indigo-600">From ₦{(price / 100).toFixed(0)}</p>
    </div>
  );
}
