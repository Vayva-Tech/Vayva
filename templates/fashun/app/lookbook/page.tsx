"use client";

import { Search, ShoppingBag, Heart, User, Menu, ArrowRight, Calendar } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const collections = [
  {
    id: 1,
    title: "Spring/Summer 2024",
    subtitle: "Ethereal Elegance",
    description: "Light fabrics, flowing silhouettes, and a palette inspired by dawn skies",
    season: "SS24",
    images: ["👗", "👠", "👛", "🧥"],
    featured: true,
  },
  {
    id: 2,
    title: "Fall/Winter 2024",
    subtitle: "Urban Sophistication",
    description: "Rich textures, structured tailoring, and deep jewel tones",
    season: "FW24",
    images: ["🧥", "👢", "👜", "🎩"],
    featured: true,
  },
  {
    id: 3,
    title: "Resort Collection",
    subtitle: "Coastal Dreams",
    description: "Relaxed luxury for sun-soaked escapes",
    season: "Resort",
    images: ["👙", "🩴", "🕶️", "👒"],
    featured: false,
  },
  {
    id: 4,
    title: "Bridal Edit",
    subtitle: "Timeless Romance",
    description: "Exquisite pieces for your special day",
    season: "Bridal",
    images: ["👰", "💐", "💎", "👠"],
    featured: false,
  },
];

export default function LookbookPage() {
  const [activeCollection, setActiveCollection] = useState(collections[0]);

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <button className="lg:hidden">
                <Menu className="w-6 h-6" />
              </button>
              <Link href="/" className="text-2xl font-bold tracking-tight">
                FASHUN
              </Link>
              <div className="hidden lg:flex items-center gap-6 text-sm">
                <Link href="/shop" className="text-gray-600 hover:text-black">Shop</Link>
                <Link href="/new-arrivals" className="text-gray-600 hover:text-black">New Arrivals</Link>
                <Link href="/lookbook" className="font-medium">Lookbook</Link>
                <Link href="/about" className="text-gray-600 hover:text-black">About</Link>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button className="hidden sm:block">
                <Search className="w-5 h-5" />
              </button>
              <Link href="/account">
                <User className="w-5 h-5" />
              </Link>
              <Link href="/wishlist">
                <Heart className="w-5 h-5" />
              </Link>
              <Link href="/cart" className="relative">
                <ShoppingBag className="w-5 h-5" />
                <span className="absolute -top-2 -right-2 w-5 h-5 bg-black text-white text-xs rounded-full flex items-center justify-center">
                  0
                </span>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative h-[70vh] bg-gray-900 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/60" />
        <div className="relative text-center text-white px-4">
          <span className="text-sm tracking-[0.3em] uppercase mb-4 block">Spring/Summer 2024</span>
          <h1 className="text-5xl md:text-7xl font-bold mb-6">The Lookbook</h1>
          <p className="text-xl text-gray-200 max-w-xl mx-auto mb-8">
            Explore our latest collections through curated editorials
          </p>
          <button className="px-8 py-3 bg-white text-black font-medium rounded-full hover:bg-gray-100 transition-colors">
            View Collection
          </button>
        </div>
      </section>

      {/* Collection Selector */}
      <section className="border-b">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex overflow-x-auto gap-8 py-6">
            {collections.map((collection) => (
              <button
                key={collection.id}
                onClick={() => setActiveCollection(collection)}
                className={`flex-shrink-0 text-left ${
                  activeCollection.id === collection.id ? "opacity-100" : "opacity-60"
                }`}
              >
                <span className="text-xs tracking-wider text-gray-500">{collection.season}</span>
                <h3 className="font-semibold whitespace-nowrap">{collection.title}</h3>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Collection */}
      <section className="py-20 max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <span className="text-sm tracking-[0.2em] uppercase text-gray-500">
            {activeCollection.season} Collection
          </span>
          <h2 className="text-4xl font-bold mt-2 mb-4">{activeCollection.subtitle}</h2>
          <p className="text-gray-600 max-w-xl mx-auto">{activeCollection.description}</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {activeCollection.images.map((image, idx) => (
            <div
              key={idx}
              className={`relative aspect-[3/4] bg-gray-100 rounded-lg overflow-hidden group cursor-pointer ${
                idx === 0 ? "md:col-span-2 md:row-span-2" : ""
              }`}
            >
              <div className="absolute inset-0 flex items-center justify-center text-[80px] md:text-[120px]">
                {image}
              </div>
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
              <button className="absolute bottom-4 left-4 right-4 py-3 bg-white text-black font-medium rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                Shop This Look
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* All Collections Grid */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold mb-12">All Collections</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {collections.map((collection) => (
              <div
                key={collection.id}
                className="group cursor-pointer"
                onClick={() => setActiveCollection(collection)}
              >
                <div className="aspect-[16/10] bg-gray-200 rounded-xl overflow-hidden mb-4 relative">
                  <div className="absolute inset-0 flex items-center justify-center text-[100px] group-hover:scale-105 transition-transform">
                    {collection.images[0]}
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-6 left-6 text-white">
                    <span className="text-sm tracking-wider">{collection.season}</span>
                    <h3 className="text-2xl font-bold">{collection.subtitle}</h3>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold">{collection.title}</h4>
                    <p className="text-sm text-gray-600">{collection.description}</p>
                  </div>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Behind the Scenes */}
      <section className="py-20 max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Behind the Scenes</h2>
          <p className="text-gray-600">A glimpse into our creative process</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { title: "Atelier Moments", image: "✂️" },
            { title: "Fitting Sessions", image: "📏" },
            { title: "Photoshoot Day", image: "📸" },
          ].map((item, idx) => (
            <div key={idx} className="relative aspect-square bg-gray-100 rounded-xl overflow-hidden group">
              <div className="absolute inset-0 flex items-center justify-center text-[80px]">
                {item.image}
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
              <div className="absolute bottom-6 left-6 text-white">
                <h3 className="font-semibold text-lg">{item.title}</h3>
                <p className="text-sm text-gray-300">View Gallery</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black text-white">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <h4 className="font-bold mb-4">SHOP</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/shop" className="hover:text-white">All Products</Link></li>
                <li><Link href="/new-arrivals" className="hover:text-white">New Arrivals</Link></li>
                <li><Link href="/sale" className="hover:text-white">Sale</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">HELP</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/size-guide" className="hover:text-white">Size Guide</Link></li>
                <li><Link href="/shipping" className="hover:text-white">Shipping & Returns</Link></li>
                <li><Link href="/faq" className="hover:text-white">FAQ</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">COMPANY</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/about" className="hover:text-white">About Us</Link></li>
                <li><Link href="/careers" className="hover:text-white">Careers</Link></li>
                <li><Link href="/contact" className="hover:text-white">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">NEWSLETTER</h4>
              <p className="text-sm text-gray-400 mb-4">Subscribe for exclusive offers</p>
              <input
                type="email"
                placeholder="Your email"
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded text-white placeholder:text-gray-500 focus:outline-none focus:border-white"
              />
            </div>
          </div>
          <div className="border-t border-white/20 mt-8 pt-8 text-center text-sm text-gray-400">
            © 2024 Fashun. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
