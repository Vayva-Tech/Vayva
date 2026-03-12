"use client";

import { Search, ShoppingCart, ArrowRight, Star, Clock, Truck, Leaf, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useStore } from "@/lib/store-context";
import { toast } from "sonner";

const categories = [
  { name: "Vegetables", icon: "🥬", count: 45 },
  { name: "Fruits", icon: "🍎", count: 32 },
  { name: "Meat", icon: "🥩", count: 28 },
  { name: "Dairy", icon: "🥛", count: 24 },
  { name: "Bakery", icon: "🥐", count: 18 },
  { name: "Beverages", icon: "🥤", count: 35 },
];

const featuredProducts = [
  { id: 1, name: "Fresh Organic Avocados", price: 5.99, originalPrice: 7.99, unit: "4 pcs", rating: 4.8, image: "bg-gradient-to-br from-green-100 to-emerald-100" },
  { id: 2, name: "Premium Salmon Fillet", price: 18.99, originalPrice: 22.99, unit: "500g", rating: 4.9, image: "bg-gradient-to-br from-orange-100 to-red-100" },
  { id: 3, name: "Organic Strawberries", price: 6.49, originalPrice: 8.49, unit: "300g", rating: 4.7, image: "bg-gradient-to-br from-red-100 to-pink-100" },
  { id: 4, name: "Artisan Sourdough", price: 4.99, originalPrice: 6.49, unit: "1 loaf", rating: 4.6, image: "bg-gradient-to-br from-amber-100 to-yellow-100" },
];

const features = [
  { icon: Truck, title: "Free Delivery", desc: "On orders over $35" },
  { icon: Clock, title: "Fast Shipping", desc: "2-4 hours delivery" },
  { icon: Leaf, title: "Fresh & Organic", desc: "Quality guaranteed" },
];

export default function GroverHome() {
  const { cartCount, addToCart } = useStore();

  const handleAddToCart = (product: typeof featuredProducts[0]) => {
    addToCart({
      id: product.id.toString(),
      name: product.name,
      price: product.price,
      quantity: 1,
    });
    toast.success(`${product.name} added to cart`);
  };
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center">
                <span className="text-xl">🥗</span>
              </div>
              <span className="text-xl font-bold text-gray-900">Grover</span>
            </Link>
            <div className="hidden md:flex flex-1 max-w-md mx-8">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input type="text" placeholder="Search fresh groceries..." className="w-full pl-10 pr-4 py-2 bg-gray-100 border-0 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/auth/login" className="text-gray-600 hover:text-gray-900">Sign In</Link>
              <Link href="/cart" className="relative p-2 bg-gray-100 rounded-full">
                <ShoppingCart className="w-5 h-5 text-gray-700" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-secondary-500 text-white text-xs rounded-full flex items-center justify-center">{cartCount}</span>
                )}
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="section-padding bg-gradient-to-br from-primary-50 to-green-100">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm mb-6">
                <span className="text-sm text-gray-600">Free delivery on first order</span>
                <ChevronRight className="w-4 h-4 text-primary-600" />
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
                Fresh Groceries
                <span className="text-primary-600"> Delivered</span> to Your Door
              </h1>
              <p className="text-lg text-gray-600 mb-8">
                Shop from 5000+ fresh products. Get them delivered in as fast as 2 hours.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="/products" className="btn-primary inline-flex items-center gap-2">
                  Shop Now
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <button className="btn-secondary">View Deals</button>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square bg-gradient-to-br from-primary-100 to-secondary-100 rounded-3xl flex items-center justify-center">
                <span className="text-9xl">🥗</span>
              </div>
              <div className="absolute -bottom-4 -left-4 bg-white rounded-2xl shadow-xl p-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center text-2xl">🛵</div>
                  <div>
                    <p className="font-semibold text-gray-900">Fast Delivery</p>
                    <p className="text-sm text-gray-500">2-4 hours</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Shop by Category</h2>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
            {categories.map((cat) => (
              <button key={cat.name} className="flex flex-col items-center gap-2 p-4 bg-gray-50 rounded-xl hover:bg-primary-50 transition-colors">
                <span className="text-3xl">{cat.icon}</span>
                <span className="font-medium text-gray-900">{cat.name}</span>
                <span className="text-sm text-gray-500">{cat.count} items</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="section-padding bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Featured Products</h2>
            <Link href="/products" className="text-primary-600 font-medium hover:underline flex items-center gap-1">
              View All <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <div key={product.id} className="bg-white rounded-2xl shadow-sm overflow-hidden group hover:shadow-md transition-shadow">
                <div className={`h-48 ${product.image} relative p-4`}>
                  <span className="absolute top-3 left-3 px-2 py-1 bg-secondary-500 text-white text-xs font-bold rounded">-{Math.round((1 - product.price/product.originalPrice) * 100)}%</span>
                  <button className="absolute top-3 right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm">
                    <span className="text-gray-400">♡</span>
                  </button>
                </div>
                <div className="p-4">
                  <div className="flex items-center gap-1 mb-2">
                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    <span className="text-sm text-gray-600">{product.rating}</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">{product.name}</h3>
                  <p className="text-sm text-gray-500 mb-3">{product.unit}</p>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xl font-bold text-gray-900">${product.price}</span>
                      <span className="text-sm text-gray-400 line-through ml-2">${product.originalPrice}</span>
                    </div>
                    <button 
                      onClick={() => handleAddToCart(product)}
                      className="w-10 h-10 bg-primary-600 text-white rounded-full flex items-center justify-center hover:bg-primary-700"
                    >
                      <ShoppingCart className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature) => (
              <div key={feature.title} className="flex items-center gap-4 p-6 bg-gray-50 rounded-2xl">
                <div className="w-14 h-14 bg-primary-100 rounded-full flex items-center justify-center">
                  <feature.icon className="w-7 h-7 text-primary-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{feature.title}</h3>
                  <p className="text-sm text-gray-500">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center">
                  <span className="text-xl">🥗</span>
                </div>
                <span className="text-white font-bold text-xl">Grover</span>
              </div>
              <p className="text-sm">Fresh groceries delivered to your door in minutes.</p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Shop</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/products">All Products</Link></li>
                <li><Link href="/deals">Deals</Link></li>
                <li><Link href="/categories">Categories</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/help">Help Center</Link></li>
                <li><Link href="/contact">Contact Us</Link></li>
                <li><Link href="/faq">FAQ</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-sm">
                <li>support@grover.com</li>
                <li>1-800-GROVER</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm">
            © 2024 Grover. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
