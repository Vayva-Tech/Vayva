"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Search, Gem, Heart, Sparkles, ArrowRight, Shield, Gift } from "lucide-react";

const products = [
  { id: 1, name: "18K Gold Necklace", category: "Necklaces", price: 250000, image: "bg-gradient-to-br from-amber-400 to-yellow-600" },
  { id: 2, name: "Diamond Ring", category: "Rings", price: 450000, image: "bg-gradient-to-br from-slate-200 to-slate-400" },
  { id: 3, name: "Pearl Earrings", category: "Earrings", price: 85000, image: "bg-gradient-to-br from-pink-100 to-pink-300" },
  { id: 4, name: "Gold Bracelet", category: "Bracelets", price: 180000, image: "bg-gradient-to-br from-amber-300 to-amber-500" },
];

const categories = [
  { name: "Rings", count: "200+" },
  { name: "Necklaces", count: "150+" },
  { name: "Earrings", count: "180+" },
  { name: "Bracelets", count: "120+" },
];

export default function JewelryHome() {
  return (
    <div className="min-h-screen bg-stone-100">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-stone-900 flex items-center gap-2">
            <Gem className="h-6 w-6 text-amber-500" /> LUXE Jewels
          </Link>
          <nav className="hidden md:flex items-center gap-8">
            <Link href="/engagement" className="text-stone-600 hover:text-amber-600">Engagement</Link>
            <Link href="/wedding" className="text-stone-600 hover:text-amber-600">Wedding</Link>
            <Link href="/gold" className="text-stone-600 hover:text-amber-600">Gold</Link>
            <Link href="/diamonds" className="text-stone-600 hover:text-amber-600">Diamonds</Link>
          </nav>
          <div className="flex items-center gap-4">
            <Heart className="h-6 w-6 text-stone-600" />
            <Button className="bg-stone-900 hover:bg-stone-800">Book Appointment</Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative bg-gradient-to-br from-stone-900 via-stone-800 to-amber-900 py-20">
        <div className="container mx-auto px-4 text-center text-white">
          <Sparkles className="h-8 w-8 mx-auto mb-4 text-amber-400" />
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Timeless Elegance
          </h1>
          <p className="text-xl text-stone-300 mb-8 max-w-2xl mx-auto">
            Exquisite jewelry crafted with precision. From engagement rings to statement pieces.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-amber-500 hover:bg-amber-600 text-stone-900">
              Shop Collection
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-stone-900">
              Book Consultation
            </Button>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-12 bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {categories.map((cat) => (
              <div key={cat.name} className="p-6 rounded-xl bg-stone-50 hover:bg-amber-50 cursor-pointer transition text-center">
                <p className="font-semibold text-stone-900">{cat.name}</p>
                <p className="text-sm text-stone-500">{cat.count} items</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-stone-900">New Arrivals</h2>
            <Link href="/collection" className="text-amber-600 font-medium hover:underline flex items-center gap-1">
              View All <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <div key={product.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border hover:shadow-md transition">
                <div className={`h-56 ${product.image}`} />
                <div className="p-4">
                  <p className="text-sm text-amber-600 font-medium">{product.category}</p>
                  <h3 className="font-semibold text-lg text-stone-900">{product.name}</h3>
                  <div className="flex items-center justify-between mt-3">
                    <p className="text-xl font-bold text-stone-900">₦{(product.price / 100).toFixed(0)}</p>
                    <Button size="sm" className="bg-stone-900 hover:bg-stone-800">View</Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust */}
      <section className="py-16 bg-stone-900 text-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <Shield className="h-10 w-10 mx-auto mb-4 text-amber-400" />
              <h3 className="font-semibold text-lg">Certified Authentic</h3>
              <p className="text-stone-400">All pieces come with certificates</p>
            </div>
            <div>
              <Gift className="h-10 w-10 mx-auto mb-4 text-amber-400" />
              <h3 className="font-semibold text-lg">Gift Wrapping</h3>
              <p className="text-stone-400">Luxury packaging included</p>
            </div>
            <div>
              <Gem className="h-10 w-10 mx-auto mb-4 text-amber-400" />
              <h3 className="font-semibold text-lg">Custom Design</h3>
              <p className="text-stone-400">Bespoke pieces available</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
