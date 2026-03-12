"use client";

import Link from "next/link";
import { useStore } from "@/lib/store-context";
import { Button } from "@/components/ui/button";
import { ShoppingBag, Clock, MapPin, Star, Flame } from "lucide-react";

export default function HomePage() {
  const { cartCount } = useStore();

  return (
    <div className="min-h-screen bg-orange-50/30">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-orange-100">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-orange-600">
            FLAVOR
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/menu" className="text-sm font-medium hover:text-orange-600">
              Menu
            </Link>
            <Link href="/deals" className="text-sm font-medium hover:text-orange-600">
              Deals
            </Link>
            <Link href="/catering" className="text-sm font-medium hover:text-orange-600">
              Catering
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            <Link href="/cart" className="relative">
              <ShoppingBag className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-orange-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-br from-orange-500 to-red-500 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Flame className="h-5 w-5" />
            <span className="text-sm font-medium uppercase tracking-wider">Fresh & Hot</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Delicious Food
            <br />
            <span className="text-yellow-200">Delivered Fast</span>
          </h1>
          <p className="text-xl text-white/90 mb-8 max-w-xl mx-auto">
            Order from the best local restaurants. Fast delivery, great prices.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-white text-orange-600 hover:bg-orange-50">
              <Link href="/menu">Order Now</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
              <Link href="/deals">View Deals</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-8 bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div className="flex items-center justify-center gap-3">
              <Clock className="h-5 w-5 text-orange-500" />
              <span className="text-sm font-medium">30-45 min Delivery</span>
            </div>
            <div className="flex items-center justify-center gap-3">
              <MapPin className="h-5 w-5 text-orange-500" />
              <span className="text-sm font-medium">Live Order Tracking</span>
            </div>
            <div className="flex items-center justify-center gap-3">
              <Star className="h-5 w-5 text-orange-500" />
              <span className="text-sm font-medium">Top Rated Restaurants</span>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold mb-6">Popular Categories</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {["Pizza", "Burgers", "Sushi", "Local Dishes"].map((cat) => (
              <Link
                key={cat}
                href={`/menu?category=${cat.toLowerCase()}`}
                className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow text-center"
              >
                <div className="w-16 h-16 bg-orange-100 rounded-full mx-auto mb-3 flex items-center justify-center text-2xl">
                  {cat[0]}
                </div>
                <span className="font-medium">{cat}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Menu */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold">Featured Dishes</h2>
            <Button variant="outline" asChild>
              <Link href="/menu">View All</Link>
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <FoodCard id="1" name="Jollof Rice & Chicken" price={3500} restaurant="Mama&apos;s Kitchen" time="25 min" />
            <FoodCard id="2" name="Pepperoni Pizza" price={6800} restaurant="Pizza Palace" time="35 min" />
            <FoodCard id="3" name="Suya Platter" price={4200} restaurant="Suya Spot" time="20 min" />
            <FoodCard id="4" name="Grilled Catfish" price={5500} restaurant="Fish House" time="40 min" />
          </div>
        </div>
      </section>
    </div>
  );
}

function FoodCard({ id, name, price, restaurant, time }: { id: string; name: string; price: number; restaurant: string; time: string }) {
  const { addToCart } = useStore();

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden group hover:shadow-md transition-shadow">
      <div className="aspect-square bg-gradient-to-br from-orange-100 to-red-100 relative">
        <div className="absolute inset-0 flex items-center justify-center text-orange-300">
          <span className="text-5xl">{name[0]}</span>
        </div>
        <div className="absolute top-3 left-3 bg-white/90 px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {time}
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-lg">{name}</h3>
        <p className="text-sm text-muted-foreground mb-2">{restaurant}</p>
        <div className="flex items-center justify-between">
          <span className="font-bold text-lg">₦{(price / 100).toFixed(2)}</span>
          <Button size="sm" onClick={() => addToCart({ id, name, price, quantity: 1, image: "" })}>
            Add
          </Button>
        </div>
      </div>
    </div>
  );
}
