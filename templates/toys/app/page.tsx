"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Search, Gamepad2, Rocket, Shield, ArrowRight, Heart, Smile } from "lucide-react";

const products = [
  { id: 1, name: "LEGO City Set", category: "Building", price: 25000, image: "bg-gradient-to-br from-red-400 to-red-600" },
  { id: 2, name: "Remote Car", category: "Vehicles", price: 18000, image: "bg-gradient-to-br from-blue-400 to-blue-600" },
  { id: 3, name: "Stuffed Bear", category: "Plush", price: 8500, image: "bg-gradient-to-br from-amber-300 to-amber-500" },
  { id: 4, name: "Puzzle 100pcs", category: "Educational", price: 5500, image: "bg-gradient-to-br from-green-400 to-green-600" },
];

const categories = [
  { name: "Action Figures", count: "300+" },
  { name: "Educational", count: "250+" },
  { name: "Outdoor", count: "150+" },
  { name: "Board Games", count: "100+" },
];

export default function ToysHome() {
  return (
    <div className="min-h-screen bg-yellow-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-rose-600 flex items-center gap-2">
            <Smile className="h-6 w-6" /> ToyJoy
          </Link>
          <nav className="hidden md:flex items-center gap-8">
            <Link href="/action" className="text-slate-600 hover:text-rose-600">Action</Link>
            <Link href="/educational" className="text-slate-600 hover:text-rose-600">Educational</Link>
            <Link href="/dolls" className="text-slate-600 hover:text-rose-600">Dolls</Link>
            <Link href="/games" className="text-slate-600 hover:text-rose-600">Games</Link>
          </nav>
          <div className="flex items-center gap-4">
            <Heart className="h-6 w-6 text-slate-600" />
            <Button className="bg-rose-600 hover:bg-rose-700">Shop Now</Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative bg-gradient-to-br from-rose-500 via-amber-400 to-yellow-400 py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-white">
            Where Fun Begins
          </h1>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Discover toys that spark imagination. From educational games to outdoor fun, find joy for every age.
          </p>
          <div className="max-w-2xl mx-auto bg-white rounded-2xl p-3 flex gap-2">
            <div className="flex-1 flex items-center gap-3 px-4 py-3 bg-slate-100 rounded-xl">
              <Search className="h-5 w-5 text-slate-500" />
              <input placeholder="Find the perfect toy..." className="bg-transparent flex-1 outline-none text-slate-900" />
            </div>
            <Button size="lg" className="bg-rose-600 hover:bg-rose-700 rounded-xl">
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
              <div key={cat.name} className="p-6 rounded-2xl bg-yellow-50 hover:bg-rose-50 cursor-pointer transition text-center">
                <p className="font-semibold text-slate-900">{cat.name}</p>
                <p className="text-sm text-slate-500">{cat.count} toys</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-slate-900">Popular Picks</h2>
            <Link href="/shop" className="text-rose-600 font-medium hover:underline flex items-center gap-1">
              View All <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <div key={product.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border-2 border-yellow-200 hover:shadow-md transition">
                <div className={`h-56 ${product.image}`} />
                <div className="p-4">
                  <p className="text-sm text-rose-600 font-medium">{product.category}</p>
                  <h3 className="font-semibold text-lg text-slate-900">{product.name}</h3>
                  <div className="flex items-center justify-between mt-3">
                    <p className="text-xl font-bold text-rose-600">₦{(product.price / 100).toFixed(0)}</p>
                    <Button size="sm" className="bg-rose-600 hover:bg-rose-700">Add</Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust */}
      <section className="py-16 bg-rose-600 text-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <Shield className="h-10 w-10 mx-auto mb-4" />
              <h3 className="font-semibold text-lg">Safe & Tested</h3>
              <p className="text-rose-100">All toys meet safety standards</p>
            </div>
            <div>
              <Rocket className="h-10 w-10 mx-auto mb-4" />
              <h3 className="font-semibold text-lg">Fast Delivery</h3>
              <p className="text-rose-100">48-hour delivery nationwide</p>
            </div>
            <div>
              <Gamepad2 className="h-10 w-10 mx-auto mb-4" />
              <h3 className="font-semibold text-lg">Fun Guarantee</h3>
              <p className="text-rose-100">Kids love them or money back</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
