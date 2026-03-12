"use client";

import Link from "next/link";
import { useStore } from "@/lib/store-context";
import { Button } from "@/components/ui/button";
import { Phone, Calendar, Gauge, Shield, ChevronRight } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-slate-950/95 backdrop-blur border-b border-slate-800">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-white tracking-tight">
            MOTORS<span className="text-blue-500">.</span>
          </Link>
          <nav className="hidden md:flex items-center gap-8">
            <Link href="/inventory" className="text-sm font-medium text-slate-300 hover:text-white">
              New Cars
            </Link>
            <Link href="/used" className="text-sm font-medium text-slate-300 hover:text-white">
              Used Cars
            </Link>
            <Link href="/service" className="text-sm font-medium text-slate-300 hover:text-white">
              Service
            </Link>
            <Link href="/parts" className="text-sm font-medium text-slate-300 hover:text-white">
              Parts
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" className="border-slate-600 text-slate-300">
              <Phone className="h-4 w-4 mr-2" />
              Contact
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-slate-950" />
        <div className="container mx-auto px-4 relative">
          <div className="max-w-2xl">
            <p className="text-blue-400 font-medium mb-4">PREMIUM AUTOMOTIVE</p>
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
              Drive Your
              <br />
              <span className="text-blue-500">Dream Car</span>
            </h1>
            <p className="text-xl text-slate-400 mb-8">
              Explore our extensive collection of new and certified pre-owned vehicles. 
              Financing available with competitive rates.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild size="lg" className="bg-blue-500 hover:bg-blue-600">
                <Link href="/inventory">Browse Inventory</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-slate-600 text-white">
                <Link href="/test-drive">Schedule Test Drive</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-12 border-y border-slate-800 bg-slate-900/50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center">
                <Shield className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Certified Pre-Owned</h3>
                <p className="text-sm text-slate-400">Rigorous 150-point inspection</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center">
                <Gauge className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Easy Financing</h3>
                <p className="text-sm text-slate-400">Rates as low as 4.9% APR</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center">
                <Calendar className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <h3 className="font-semibold text-white">5-Year Warranty</h3>
                <p className="text-sm text-slate-400">On all new vehicles</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Vehicles */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">Featured Vehicles</h2>
              <p className="text-slate-400">Hand-picked premium selection</p>
            </div>
            <Button variant="outline" asChild className="border-slate-600 text-white">
              <Link href="/inventory">View All</Link>
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <VehicleCard
              id="1"
              name="Mercedes-Benz C-Class"
              year={2024}
              price={4500000}
              mileage="0 km"
              type="New"
            />
            <VehicleCard
              id="2"
              name="BMW X5 xDrive"
              year={2023}
              price={5200000}
              mileage="15,000 km"
              type="Used"
            />
            <VehicleCard
              id="3"
              name="Lexus RX 350"
              year={2024}
              price={3800000}
              mileage="0 km"
              type="New"
            />
          </div>
        </div>
      </section>
    </div>
  );
}

function VehicleCard({
  id,
  name,
  year,
  price,
  mileage,
  type,
}: {
  id: string;
  name: string;
  year: number;
  price: number;
  mileage: string;
  type: string;
}) {
  return (
    <div className="bg-slate-900 rounded-xl overflow-hidden group hover:ring-2 hover:ring-blue-500/50 transition-all">
      <div className="aspect-video bg-gradient-to-br from-slate-800 to-slate-700 relative">
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-6xl font-bold text-slate-600">{name[0]}</span>
        </div>
        <div className="absolute top-3 left-3">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${type === "New" ? "bg-green-500/20 text-green-400" : "bg-blue-500/20 text-blue-400"}`}>
            {type}
          </span>
        </div>
      </div>
      <div className="p-6">
        <h3 className="text-lg font-semibold text-white mb-1">{year} {name}</h3>
        <p className="text-slate-400 text-sm mb-4">{mileage}</p>
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold text-white">₦{(price / 100).toFixed(0)}</span>
          <Button size="sm" className="bg-blue-500 hover:bg-blue-600">
            Details <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
}
