"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Search, Trophy, Zap, Truck, ArrowRight, Heart, Flame } from "lucide-react";

const products = [
  { id: 1, name: "Nike Air Max", category: "Footwear", price: 65000, image: "bg-gradient-to-br from-red-600 to-red-800" },
  { id: 2, name: "Pro Basketball", category: "Equipment", price: 15000, image: "bg-gradient-to-br from-orange-500 to-orange-700" },
  { id: 3, name: "Gym Dumbbell Set", category: "Fitness", price: 45000, image: "bg-gradient-to-br from-slate-700 to-slate-900" },
  { id: 4, name: "Football Jersey", category: "Apparel", price: 25000, image: "bg-gradient-to-br from-blue-600 to-blue-800" },
];

const categories = [
  { name: "Footwear", count: "200+" },
  { name: "Apparel", count: "500+" },
  { name: "Equipment", count: "300+" },
  { name: "Fitness", count: "150+" },
];

export default function SportsHome() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-blue-700 flex items-center gap-2">
            <Flame className="h-6 w-6" /> ProSport
          </Link>
          <nav className="hidden md:flex items-center gap-8">
            <Link href="/footwear" className="text-slate-600 hover:text-blue-700">Footwear</Link>
            <Link href="/apparel" className="text-slate-600 hover:text-blue-700">Apparel</Link>
            <Link href="/equipment" className="text-slate-600 hover:text-blue-700">Equipment</Link>
            <Link href="/fitness" className="text-slate-600 hover:text-blue-700">Fitness</Link>
          </nav>
          <div className="flex items-center gap-4">
            <Heart className="h-6 w-6 text-slate-600" />
            <Button className="bg-blue-700 hover:bg-blue-800">Shop Now</Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative bg-gradient-to-br from-blue-800 via-blue-700 to-slate-800 py-20">
        <div className="container mx-auto px-4 text-center text-white">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Elevate Your Game
          </h1>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Premium athletic gear for champions. From running shoes to team jerseys, gear up for greatness.
          </p>
          <div className="max-w-2xl mx-auto bg-white rounded-xl p-2 flex gap-2">
            <div className="flex-1 flex items-center gap-3 px-4 py-3 bg-slate-100 rounded-lg">
              <Search className="h-5 w-5 text-slate-500" />
              <input placeholder="Search sports gear..." className="bg-transparent flex-1 outline-none text-slate-900" />
            </div>
            <Button size="lg" className="bg-blue-700 hover:bg-blue-800">
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
              <div key={cat.name} className="p-6 rounded-xl bg-slate-50 hover:bg-blue-50 cursor-pointer transition text-center">
                <p className="font-semibold text-slate-900">{cat.name}</p>
                <p className="text-sm text-slate-500">{cat.count} items</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-slate-900">Trending Now</h2>
            <Link href="/shop" className="text-blue-700 font-medium hover:underline flex items-center gap-1">
              View All <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <div key={product.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border hover:shadow-md transition">
                <div className={`h-56 ${product.image}`} />
                <div className="p-4">
                  <p className="text-sm text-blue-700 font-medium">{product.category}</p>
                  <h3 className="font-semibold text-lg text-slate-900">{product.name}</h3>
                  <div className="flex items-center justify-between mt-3">
                    <p className="text-xl font-bold text-blue-700">₦{(product.price / 100).toFixed(0)}</p>
                    <Button size="sm" className="bg-blue-700 hover:bg-blue-800">Add</Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust */}
      <section className="py-16 bg-blue-800 text-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <Trophy className="h-10 w-10 mx-auto mb-4" />
              <h3 className="font-semibold text-lg">Pro Grade</h3>
              <p className="text-blue-100">Quality gear for athletes</p>
            </div>
            <div>
              <Truck className="h-10 w-10 mx-auto mb-4" />
              <h3 className="font-semibold text-lg">Fast Shipping</h3>
              <p className="text-blue-100">Next day delivery available</p>
            </div>
            <div>
              <Zap className="h-10 w-10 mx-auto mb-4" />
              <h3 className="font-semibold text-lg">Performance</h3>
              <p className="text-blue-100">Engineered for excellence</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
