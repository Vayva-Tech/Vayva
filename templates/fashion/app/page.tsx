"use client";

import Link from "next/link";
import { useStore } from "@/lib/store-context";
import { Button } from "@/components/ui/button";
import { ShoppingBag, ArrowRight, Sparkles, Truck, Heart } from "lucide-react";

export default function HomePage() {
  const { cartCount } = useStore();

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold italic tracking-tight">
            VOGUE
          </Link>
          <nav className="hidden md:flex items-center gap-8">
            <Link href="/shop" className="text-sm font-medium hover:text-primary uppercase tracking-wider">
              New Arrivals
            </Link>
            <Link href="/shop" className="text-sm font-medium hover:text-primary uppercase tracking-wider">
              Women
            </Link>
            <Link href="/shop" className="text-sm font-medium hover:text-primary uppercase tracking-wider">
              Men
            </Link>
            <Link href="/shop" className="text-sm font-medium hover:text-primary uppercase tracking-wider">
              Accessories
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            <Link href="/cart" className="relative">
              <ShoppingBag className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground rounded-full w-5 h-5 text-xs flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative bg-stone-950 text-white py-24 md:py-32">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-sm uppercase tracking-[0.3em] mb-4 text-stone-400">New Collection 2025</p>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight italic">
              Style Redefined
            </h1>
            <p className="text-xl text-stone-300 mb-10 max-w-xl mx-auto">
              Discover the latest trends in fashion. Curated for the modern wardrobe.
            </p>
            <Button asChild size="lg" className="bg-white text-stone-900 hover:bg-stone-100 rounded-none px-8">
              <Link href="/shop">
                Shop Collection
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-8 border-b">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="flex items-center justify-center gap-3">
              <Truck className="h-5 w-5 text-primary" />
              <span className="text-sm">Free Shipping on Orders ₦30,000+</span>
            </div>
            <div className="flex items-center justify-center gap-3">
              <Sparkles className="h-5 w-5 text-primary" />
              <span className="text-sm">Premium Quality Guaranteed</span>
            </div>
            <div className="flex items-center justify-center gap-3">
              <Heart className="h-5 w-5 text-primary" />
              <span className="text-sm">30-Day Easy Returns</span>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl font-bold mb-2">Trending Now</h2>
              <p className="text-muted-foreground">This season&apos;s must-haves</p>
            </div>
            <Button variant="outline" asChild>
              <Link href="/shop">View All</Link>
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <ProductCard id="1" name="Silk Blouse" price={35000} image="/images/blouse.jpg" tag="New" />
            <ProductCard id="2" name="Tailored Trousers" price={42000} image="/images/trousers.jpg" />
            <ProductCard id="3" name="Leather Handbag" price={68000} image="/images/bag.jpg" tag="Bestseller" />
            <ProductCard id="4" name="Cashmere Scarf" price={28000} image="/images/scarf.jpg" />
          </div>
        </div>
      </section>
    </div>
  );
}

function ProductCard({ id, name, price, image, tag }: { id: string; name: string; price: number; image: string; tag?: string }) {
  const { addToCart } = useStore();

  return (
    <div className="group">
      <div className="aspect-[3/4] bg-stone-100 relative overflow-hidden">
        {tag && (
          <span className="absolute top-3 left-3 bg-primary text-primary-foreground text-xs font-medium px-3 py-1 uppercase tracking-wider">
            {tag}
          </span>
        )}
        <div className="absolute inset-0 flex items-center justify-center text-stone-300">
          <span className="text-4xl font-light italic">{name[0]}</span>
        </div>
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
        <Button
          className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity rounded-none"
          onClick={() => addToCart({ id, name, price, quantity: 1, image })}
        >
          Add to Cart
        </Button>
      </div>
      <div className="mt-4 text-center">
        <h3 className="font-medium text-sm uppercase tracking-wider">{name}</h3>
        <p className="text-muted-foreground mt-1">₦{(price / 100).toFixed(2)}</p>
      </div>
    </div>
  );
}
