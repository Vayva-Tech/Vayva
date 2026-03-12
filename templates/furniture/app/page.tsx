"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Search, Sofa, Truck, Award, ArrowRight, Heart } from "lucide-react";

const products = [
  { id: 1, name: "Modern Sofa Set", category: "Living Room", price: 150000, image: "bg-gradient-to-br from-stone-300 to-stone-500" },
  { id: 2, name: "Dining Table 6-Seater", category: "Dining", price: 85000, image: "bg-gradient-to-br from-amber-700 to-amber-900" },
  { id: 3, name: "King Size Bed Frame", category: "Bedroom", price: 120000, image: "bg-gradient-to-br from-stone-600 to-stone-800" },
  { id: 4, name: "Office Desk", category: "Office", price: 45000, image: "bg-gradient-to-br from-orange-200 to-orange-400" },
];

const categories = [
  { name: "Living Room", count: "150+" },
  { name: "Bedroom", count: "120+" },
  { name: "Dining", count: "80+" },
  { name: "Office", count: "60+" },
];

export default function FurnitureHome() {
  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-amber-800 flex items-center gap-2">
            <Sofa className="h-6 w-6" /> LuxeHome
          </Link>
          <nav className="hidden md:flex items-center gap-8">
            <Link href="/living" className="text-stone-600 hover:text-amber-800">Living Room</Link>
            <Link href="/bedroom" className="text-stone-600 hover:text-amber-800">Bedroom</Link>
            <Link href="/dining" className="text-stone-600 hover:text-amber-800">Dining</Link>
            <Link href="/office" className="text-stone-600 hover:text-amber-800">Office</Link>
          </nav>
          <div className="flex items-center gap-4">
            <Heart className="h-6 w-6 text-stone-600" />
            <Button className="bg-amber-800 hover:bg-amber-900">Contact Us</Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative bg-gradient-to-br from-amber-900 via-amber-800 to-stone-800 py-20">
        <div className="container mx-auto px-4 text-center text-white">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Crafted for Your Comfort
          </h1>
          <p className="text-xl text-amber-100 mb-8 max-w-2xl mx-auto">
            Premium furniture made with quality materials. Transform your home with timeless designs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-amber-700 hover:bg-amber-600">
              Browse Collection
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-amber-900">
              Visit Showroom
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
            <h2 className="text-3xl font-bold text-stone-900">Featured Collection</h2>
            <Link href="/collection" className="text-amber-800 font-medium hover:underline flex items-center gap-1">
              View All <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <div key={product.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border hover:shadow-md transition">
                <div className={`h-56 ${product.image}`} />
                <div className="p-4">
                  <p className="text-sm text-amber-700 font-medium">{product.category}</p>
                  <h3 className="font-semibold text-lg text-stone-900">{product.name}</h3>
                  <div className="flex items-center justify-between mt-3">
                    <p className="text-xl font-bold text-amber-800">₦{(product.price / 100).toFixed(0)}</p>
                    <Button size="sm" className="bg-amber-800 hover:bg-amber-900">View</Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust */}
      <section className="py-16 bg-amber-900 text-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <Truck className="h-10 w-10 mx-auto mb-4" />
              <h3 className="font-semibold text-lg">Free Delivery</h3>
              <p className="text-amber-100">Within Lagos, Abuja & PH</p>
            </div>
            <div>
              <Award className="h-10 w-10 mx-auto mb-4" />
              <h3 className="font-semibold text-lg">5-Year Warranty</h3>
              <p className="text-amber-100">On all furniture pieces</p>
            </div>
            <div>
              <Sofa className="h-10 w-10 mx-auto mb-4" />
              <h3 className="font-semibold text-lg">Custom Orders</h3>
              <p className="text-amber-100">Bespoke furniture available</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
