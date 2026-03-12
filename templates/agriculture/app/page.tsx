"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Search, Leaf, Truck, Shield, ArrowRight, MapPin, Star } from "lucide-react";

const products = [
  { id: 1, name: "Fresh Tomatoes", farm: "Green Valley Farm", price: 2500, unit: "per basket", image: "bg-gradient-to-br from-red-400 to-red-600" },
  { id: 2, name: "Organic Rice", farm: "Sunrise Farms", price: 15000, unit: "per bag", image: "bg-gradient-to-br from-amber-100 to-amber-300" },
  { id: 3, name: "Fresh Eggs", farm: "Happy Hens Co-op", price: 3500, unit: "per crate", image: "bg-gradient-to-br from-yellow-100 to-yellow-300" },
  { id: 4, name: "Palm Oil", farm: "Tropical Harvest", price: 8000, unit: "per gallon", image: "bg-gradient-to-br from-orange-400 to-red-500" },
];

const categories = [
  { name: "Vegetables", count: "120+ items" },
  { name: "Grains", count: "80+ items" },
  { name: "Livestock", count: "45+ items" },
  { name: "Dairy", count: "60+ items" },
];

export default function AgricultureHome() {
  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-green-700 flex items-center gap-2">
            <Leaf className="h-6 w-6" /> FarmMarket
          </Link>
          <nav className="hidden md:flex items-center gap-8">
            <Link href="/produce" className="text-stone-600 hover:text-green-700">Fresh Produce</Link>
            <Link href="/grains" className="text-stone-600 hover:text-green-700">Grains</Link>
            <Link href="/livestock" className="text-stone-600 hover:text-green-700">Livestock</Link>
            <Link href="/equipment" className="text-stone-600 hover:text-green-700">Equipment</Link>
          </nav>
          <Button className="bg-green-700 hover:bg-green-800">Sell Your Produce</Button>
        </div>
      </header>

      {/* Hero */}
      <section className="relative bg-gradient-to-br from-green-800 via-green-700 to-amber-700 py-20">
        <div className="container mx-auto px-4 text-center text-white">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Fresh From Farm to Table
          </h1>
          <p className="text-xl text-green-100 mb-8 max-w-2xl mx-auto">
            Connect directly with local farmers. Fresh produce, grains, and livestock delivered to your door.
          </p>
          <div className="max-w-2xl mx-auto bg-white rounded-xl p-2 flex gap-2">
            <div className="flex-1 flex items-center gap-3 px-4 py-3 bg-stone-100 rounded-lg">
              <Search className="h-5 w-5 text-stone-500" />
              <input placeholder="Search for fresh produce..." className="bg-transparent flex-1 outline-none text-stone-900" />
            </div>
            <Button size="lg" className="bg-green-700 hover:bg-green-800">
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
              <div key={cat.name} className="p-6 rounded-xl bg-stone-50 hover:bg-green-50 cursor-pointer transition text-center">
                <p className="font-semibold text-stone-900">{cat.name}</p>
                <p className="text-sm text-stone-500">{cat.count}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-stone-900">Fresh from the Farm</h2>
            <Link href="/produce" className="text-green-700 font-medium hover:underline flex items-center gap-1">
              View All <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <div key={product.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border hover:shadow-md transition">
                <div className={`h-48 ${product.image}`} />
                <div className="p-4">
                  <p className="text-sm text-green-700 font-medium">{product.farm}</p>
                  <h3 className="font-semibold text-lg text-stone-900">{product.name}</h3>
                  <p className="text-sm text-stone-500">{product.unit}</p>
                  <div className="flex items-center justify-between mt-3">
                    <p className="text-xl font-bold text-green-700">₦{(product.price / 100).toFixed(0)}</p>
                    <Button size="sm" className="bg-green-700 hover:bg-green-800">Add</Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-16 bg-green-800 text-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <Truck className="h-10 w-10 mx-auto mb-4" />
              <h3 className="font-semibold text-lg">Fast Delivery</h3>
              <p className="text-green-100">Same-day delivery for local orders</p>
            </div>
            <div>
              <Shield className="h-10 w-10 mx-auto mb-4" />
              <h3 className="font-semibold text-lg">Quality Guaranteed</h3>
              <p className="text-green-100">100% fresh or money back</p>
            </div>
            <div>
              <MapPin className="h-10 w-10 mx-auto mb-4" />
              <h3 className="font-semibold text-lg">Local Farms</h3>
              <p className="text-green-100">Support local farmers directly</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
