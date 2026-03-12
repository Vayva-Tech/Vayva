"use client";

import { Camera, ArrowRight, Heart, Eye, Calendar } from "lucide-react";
import Link from "next/link";

const galleries = [
  { id: 1, title: "Wedding Collection", photos: 48, views: 2847, image: "💍", featured: true },
  { id: 2, title: "Portrait Series", photos: 36, views: 1923, image: "👤", featured: false },
  { id: 3, title: "Landscape Adventures", photos: 52, views: 4521, image: "🏔️", featured: true },
  { id: 4, title: "Urban Architecture", photos: 28, views: 1567, image: "🏙️", featured: false },
  { id: 5, title: "Food & Culinary", photos: 42, views: 2134, image: "🍽️", featured: false },
  { id: 6, title: "Fashion Editorial", photos: 64, views: 3892, image: "👗", featured: true },
];

export default function GalleriesPage() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Navigation */}
      <nav className="bg-gray-800 border-b border-gray-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-pink-500 rounded-lg flex items-center justify-center">
                <Camera className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">PhotoFrame</span>
            </Link>
            <div className="hidden md:flex items-center gap-8">
              <Link href="/galleries" className="text-pink-500 font-medium">Galleries</Link>
              <Link href="/services" className="text-gray-400 hover:text-white">Services</Link>
              <Link href="/booking" className="text-gray-400 hover:text-white">Book Now</Link>
              <Link href="/about" className="text-gray-400 hover:text-white">About</Link>
            </div>
            <Link href="/booking" className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600">
              Book a Shoot
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Photo Galleries</h1>
          <p className="text-xl text-gray-400 mb-8">
            Explore our curated collections of stunning photography
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 pb-20">
        {/* Gallery Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {galleries.map((gallery) => (
            <div key={gallery.id} className="group cursor-pointer">
              <div className="aspect-square bg-gradient-to-br from-gray-700 to-gray-600 rounded-xl flex items-center justify-center text-8xl relative overflow-hidden group-hover:scale-105 transition-transform">
                {gallery.image}
                {gallery.featured && (
                  <span className="absolute top-4 left-4 px-3 py-1 bg-pink-500 text-white text-xs font-bold rounded-full">
                    Featured
                  </span>
                )}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-6">
                  <div className="flex items-center gap-2 text-white">
                    <Eye className="w-6 h-6" />
                    <span>{gallery.views.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-2 text-white">
                    <Heart className="w-6 h-6" />
                    <span>{gallery.photos}</span>
                  </div>
                </div>
              </div>
              <div className="mt-4">
                <h3 className="text-xl font-semibold group-hover:text-pink-500 transition-colors">{gallery.title}</h3>
                <p className="text-gray-400">{gallery.photos} photos</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
