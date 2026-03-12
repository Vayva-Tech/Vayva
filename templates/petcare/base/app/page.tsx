"use client";

import Link from "next/link";
import { useStore } from "@/lib/store-context";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";

export default function HomePage() {
  const { cartCount } = useStore();

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold">
            Store
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/cart" className="relative">
              <ShoppingCart className="h-6 w-6" />
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
      <section className="bg-gradient-to-r from-primary/10 to-secondary py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Welcome to Your Store
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Discover amazing products and shop with confidence
          </p>
          <Button asChild size="lg">
            <Link href="/shop">Shop Now</Link>
          </Button>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8">Featured Products</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Products will be fetched from API */}
            <ProductCard
              id="1"
              name="Premium T-Shirt"
              price={5000}
              image="/images/product-1.jpg"
            />
            <ProductCard
              id="2"
              name="Designer Jeans"
              price={15000}
              image="/images/product-2.jpg"
            />
            <ProductCard
              id="3"
              name="Stylish Sneakers"
              price={25000}
              image="/images/product-3.jpg"
            />
          </div>
        </div>
      </section>
    </div>
  );
}

function ProductCard({
  id,
  name,
  price,
  image,
}: {
  id: string;
  name: string;
  price: number;
  image: string;
}) {
  const { addToCart } = useStore();

  return (
    <div className="border rounded-lg overflow-hidden group">
      <div className="aspect-square bg-muted relative">
        <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
          {name}
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-semibold">{name}</h3>
        <p className="text-muted-foreground">₦{(price / 100).toFixed(2)}</p>
        <Button
          className="w-full mt-4"
          onClick={() =>
            addToCart({ id, name, price, quantity: 1, image })
          }
        >
          Add to Cart
        </Button>
      </div>
    </div>
  );
}
