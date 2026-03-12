"use client";

import { Search, ShoppingBag, User, Menu, ArrowRight, Star } from "lucide-react";
import Link from "next/link";

const categories = [
  { name: "Women", image: "bg-gradient-to-br from-rose-100 to-pink-200" },
  { name: "Men", image: "bg-gradient-to-br from-blue-100 to-indigo-200" },
  { name: "Accessories", image: "bg-gradient-to-br from-amber-100 to-yellow-200" },
  { name: "Shoes", image: "bg-gradient-to-br from-gray-100 to-slate-200" },
];

const featured = [
  { id: 1, name: "Summer Dress Collection", price: 89, originalPrice: 129, tag: "New", image: "bg-gradient-to-br from-rose-100 to-pink-200" },
  { id: 2, name: "Classic Linen Shirt", price: 65, originalPrice: 95, tag: "Sale", image: "bg-gradient-to-br from-blue-100 to-indigo-200" },
  { id: 3, name: "Leather Crossbody Bag", price: 145, tag: "Best Seller", image: "bg-gradient-to-br from-amber-100 to-yellow-200" },
  { id: 4, name: "Minimalist Sneakers", price: 120, image: "bg-gradient-to-br from-gray-100 to-slate-200" },
];

export default function FashunHome() {
  return (
    <div className="min-h-screen bg-white">
      {/* Top Bar */}
      <div className="bg-dark-900 text-white text-center py-2 text-sm">
        Free shipping on orders over $100 | Use code: FASHUN2024
      </div>

      {/* Nav */}
      <nav className="border-b sticky top-0 bg-white z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button className="md:hidden p-2">
              <Menu className="w-6 h-6" />
            </button>
            <Link href="/" className="text-2xl font-bold tracking-tight">FASHUN</Link>
            <div className="hidden md:flex items-center gap-8">
              <Link href="/women" className="text-gray-700 hover:text-dark-900">Women</Link>
              <Link href="/men" className="text-gray-700 hover:text-dark-900">Men</Link>
              <Link href="/new" className="text-gray-700 hover:text-dark-900">New Arrivals</Link>
              <Link href="/sale" className="text-primary-600 font-medium">Sale</Link>
            </div>
            <div className="flex items-center gap-4">
              <button className="p-2 hover:bg-gray-100 rounded-full">
                <Search className="w-5 h-5" />
              </button>
              <Link href="/account" className="p-2 hover:bg-gray-100 rounded-full hidden md:block">
                <User className="w-5 h-5" />
              </Link>
              <button className="p-2 hover:bg-gray-100 rounded-full relative">
                <ShoppingBag className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary-600 text-white text-xs rounded-full flex items-center justify-center">2</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative h-[600px] md:h-[700px] bg-gray-100">
        <div className="absolute inset-0 bg-gradient-to-r from-dark-900/80 to-transparent z-10" />
        <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300" />
        <div className="relative z-20 h-full max-w-7xl mx-auto px-4 flex items-center">
          <div className="max-w-lg text-white">
            <span className="inline-block px-4 py-1 bg-primary-600 text-sm font-medium mb-4">New Collection</span>
            <h1 className="text-5xl md:text-6xl font-bold mb-4">Summer Style 2024</h1>
            <p className="text-xl mb-8 text-gray-200">Discover the latest trends in fashion. Up to 50% off selected items.</p>
            <div className="flex flex-wrap gap-4">
              <Link href="/shop" className="btn-primary">Shop Now</Link>
              <Link href="/lookbook" className="px-8 py-3 border-2 border-white text-white font-medium hover:bg-white hover:text-dark-900 transition-colors">View Lookbook</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="section-padding">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Shop by Category</h2>
          <div className="grid md:grid-cols-4 gap-6">
            {categories.map((cat) => (
              <Link key={cat.name} href={`/${cat.name.toLowerCase()}`} className="group">
                <div className={`h-80 ${cat.image} rounded-lg mb-4 overflow-hidden`}>
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-6xl opacity-50">👕</span>
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-center group-hover:text-primary-600 transition-colors">{cat.name}</h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="section-padding bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-3xl font-bold">Trending Now</h2>
            <Link href="/shop" className="flex items-center gap-2 text-primary-600 font-medium hover:underline">
              View All <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featured.map((item) => (
              <div key={item.id} className="group">
                <div className={`h-80 ${item.image} rounded-lg mb-4 relative overflow-hidden`}>
                  {item.tag && (
                    <span className={`absolute top-4 left-4 px-3 py-1 text-sm font-medium rounded ${item.tag === 'Sale' ? 'bg-primary-600 text-white' : item.tag === 'New' ? 'bg-dark-900 text-white' : 'bg-white text-dark-900'}`}>
                      {item.tag}
                    </span>
                  )}
                  <button className="absolute bottom-4 left-4 right-4 py-3 bg-white text-dark-900 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                    Quick Add
                  </button>
                </div>
                <h3 className="font-medium text-gray-900 mb-1">{item.name}</h3>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-lg">${item.price}</span>
                  {item.originalPrice && (
                    <span className="text-gray-400 line-through">${item.originalPrice}</span>
                  )}
                </div>
                <div className="flex gap-1 mt-2">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="section-padding bg-dark-900 text-white">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-3xl font-bold mb-4">Join the Fashun Family</h2>
          <p className="text-gray-400 mb-8">Subscribe for exclusive offers, early access to sales, and style tips.</p>
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input type="email" placeholder="Enter your email" className="flex-1 px-4 py-3 rounded bg-white/10 border border-white/20 text-white placeholder-gray-400" />
            <button className="px-8 py-3 bg-primary-600 font-medium rounded hover:bg-primary-700 transition-colors">Subscribe</button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t pt-12 pb-6">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-xl font-bold mb-4">FASHUN</h3>
              <p className="text-gray-600 text-sm">Modern fashion for the bold and beautiful.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Shop</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><Link href="/women">Women</Link></li>
                <li><Link href="/men">Men</Link></li>
                <li><Link href="/accessories">Accessories</Link></li>
                <li><Link href="/sale">Sale</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Help</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><Link href="/shipping">Shipping</Link></li>
                <li><Link href="/returns">Returns</Link></li>
                <li><Link href="/size-guide">Size Guide</Link></li>
                <li><Link href="/faq">FAQ</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>hello@fashun.com</li>
                <li>+1 (555) 123-4567</li>
              </ul>
            </div>
          </div>
          <div className="border-t pt-6 text-center text-sm text-gray-500">
            © 2024 Fashun. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
