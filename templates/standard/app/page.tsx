"use client";

import Link from "next/link";
import { useStore } from "@/lib/store-context";
import { Button } from "@/components/ui/button";
import { ShoppingCart, ArrowRight, Star, Truck, Shield, Clock } from "lucide-react";

export default function HomePage() {
  const { cartCount } = useStore();

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold tracking-tight">
            Standard Store
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/shop" className="text-sm font-medium hover:text-primary">
              Shop
            </Link>
            <Link href="/about" className="text-sm font-medium hover:text-primary">
              About
            </Link>
            <Link href="/contact" className="text-sm font-medium hover:text-primary">
              Contact
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            <Link href="/cart" className="relative">
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground rounded-full w-5 h-5 text-xs flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white py-24 md:py-32">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Premium Products for Modern Living
            </h1>
            <p className="text-xl text-slate-300 mb-10 max-w-2xl mx-auto">
              Discover our curated collection of high-quality products designed for your lifestyle
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="bg-white text-slate-900 hover:bg-slate-100">
                <Link href="/shop">
                  Shop Collection
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                <Link href="/about">Learn More</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-12 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <FeatureCard icon={Truck} title="Free Shipping" description="On orders over ₦50,000" />
            <FeatureCard icon={Shield} title="Secure Payment" description="100% secure checkout" />
            <FeatureCard icon={Clock} title="Fast Delivery" description="2-5 business days" />
            <FeatureCard icon={Star} title="Quality Guarantee" description="Premium products only" />
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Featured Products</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Handpicked items from our premium collection
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <ProductCard id="1" name="Minimalist Watch" price={45000} image="/images/watch.jpg" badge="Bestseller" />
            <ProductCard id="2" name="Leather Wallet" price={18000} image="/images/wallet.jpg" />
            <ProductCard id="3" name="Wireless Earbuds" price={75000} image="/images/earbuds.jpg" badge="New" />
            <ProductCard id="4" name="Canvas Backpack" price={32000} image="/images/backpack.jpg" />
          </div>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, description }: { icon: any; title: string; description: string }) {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
        <Icon className="h-6 w-6 text-primary" />
      </div>
      <h3 className="font-semibold mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

function ProductCard({ id, name, price, image, badge }: { id: string; name: string; price: number; image: string; badge?: string }) {
  const { addToCart } = useStore();

  return (
    <div className="group relative">
      <div className="aspect-square bg-muted rounded-lg overflow-hidden relative">
        {badge && (
          <span className="absolute top-3 left-3 bg-primary text-primary-foreground text-xs font-medium px-2 py-1 rounded">
            {badge}
          </span>
        )}
        <div className="absolute inset-0 flex items-center justify-center text-muted-foreground bg-gradient-to-br from-muted to-muted/50">
          <span className="text-4xl font-bold text-muted-foreground/30">{name[0]}</span>
        </div>
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
      </div>
      <div className="mt-4">
        <h3 className="font-medium">{name}</h3>
        <p className="text-muted-foreground font-semibold mt-1">₦{(price / 100).toFixed(2)}</p>
        <Button className="w-full mt-3 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => addToCart({ id, name, price, quantity: 1, image })} size="sm">
          Add to Cart
        </Button>
      </div>
    </div>
  );
}
