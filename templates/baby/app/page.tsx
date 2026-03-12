"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Search, Baby, Heart, Shield, ArrowRight, Gift, Sparkles } from "lucide-react";

const products = [
  { id: 1, name: "Organic Cotton Onesie", category: "Clothing", price: 8500, image: "bg-gradient-to-br from-pink-200 to-pink-400" },
  { id: 2, name: "Baby Stroller Pro", category: "Gear", price: 85000, image: "bg-gradient-to-br from-slate-300 to-slate-500" },
  { id: 3, name: "Soft Teddy Bear", category: "Toys", price: 6500, image: "bg-gradient-to-br from-amber-200 to-amber-400" },
  { id: 4, name: "Baby Monitor HD", category: "Essentials", price: 35000, image: "bg-gradient-to-br from-teal-200 to-teal-400" },
];

const categories = [
  { name: "Clothing", count: "400+" },
  { name: "Gear", count: "150+" },
  { name: "Toys", count: "300+" },
  { name: "Care", count: "200+" },
];

export default function BabyHome() {
  return (
    <div className="min-h-screen bg-rose-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-pink-500 flex items-center gap-2">
            <Baby className="h-6 w-6" /> LittleOnes
          </Link>
          <nav className="hidden md:flex items-center gap-8">
            <Link href="/clothing" className="text-stone-600 hover:text-pink-500">Clothing</Link>
            <Link href="/gear" className="text-stone-600 hover:text-pink-500">Gear</Link>
            <Link href="/nursery" className="text-stone-600 hover:text-pink-500">Nursery</Link>
            <Link href="/maternity" className="text-stone-600 hover:text-pink-500">Maternity</Link>
          </nav>
          <div className="flex items-center gap-4">
            <Heart className="h-6 w-6 text-stone-600" />
            <Button className="bg-pink-500 hover:bg-pink-600">Shop Now</Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative bg-gradient-to-br from-pink-400 via-rose-300 to-teal-200 py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-white">
            Everything for Your Little One
          </h1>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Gentle, safe, and loving products for babies and expecting mothers. Because they deserve the best.
          </p>
          <div className="max-w-2xl mx-auto bg-white rounded-2xl p-3 flex gap-2">
            <div className="flex-1 flex items-center gap-3 px-4 py-3 bg-stone-100 rounded-xl">
              <Search className="h-5 w-5 text-stone-500" />
              <input placeholder="Search baby products..." className="bg-transparent flex-1 outline-none text-stone-900" />
            </div>
            <Button size="lg" className="bg-pink-500 hover:bg-pink-600 rounded-xl">
              Search
            </Button>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-12 bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {categories.map((cat) => (
              <div key={cat.name} className="p-6 rounded-2xl bg-rose-50 hover:bg-pink-50 cursor-pointer transition text-center">
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
            <Link href="/shop" className="text-pink-500 font-medium hover:underline flex items-center gap-1">
              View All <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <div key={product.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border-2 border-rose-100 hover:shadow-md transition">
                <div className={`h-56 ${product.image}`} />
                <div className="p-4">
                  <p className="text-sm text-pink-500 font-medium">{product.category}</p>
                  <h3 className="font-semibold text-lg text-stone-900">{product.name}</h3>
                  <div className="flex items-center justify-between mt-3">
                    <p className="text-xl font-bold text-pink-500">₦{(product.price / 100).toFixed(0)}</p>
                    <Button size="sm" className="bg-pink-500 hover:bg-pink-600">Add</Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust */}
      <section className="py-16 bg-pink-400 text-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <Shield className="h-10 w-10 mx-auto mb-4" />
              <h3 className="font-semibold text-lg">100% Safe</h3>
              <p className="text-pink-100">Non-toxic, baby-safe materials</p>
            </div>
            <div>
              <Gift className="h-10 w-10 mx-auto mb-4" />
              <h3 className="font-semibold text-lg">Gift Ready</h3>
              <p className="text-pink-100">Beautiful wrapping included</p>
            </div>
            <div>
              <Sparkles className="h-10 w-10 mx-auto mb-4" />
              <h3 className="font-semibold text-lg">Premium Quality</h3>
              <p className="text-pink-100">Curated for comfort & care</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
