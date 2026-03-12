"use client";

import { Search, ShoppingCart, Heart, Star, Plus, Minus, ChevronRight, Flame, Clock, Truck, Shield, ArrowRight, Filter, MapPin, Phone, User } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const categories = [
  { id: "fruits", name: "Fresh Fruits", icon: "🍎", color: "red", items: 42 },
  { id: "vegetables", name: "Vegetables", icon: "🥬", color: "green", items: 56 },
  { id: "dairy", name: "Dairy & Eggs", icon: "🥛", color: "blue", items: 34 },
  { id: "meat", name: "Meat & Fish", icon: "🥩", color: "red", items: 28 },
  { id: "bakery", name: "Bakery", icon: "🥐", color: "orange", items: 45 },
  { id: "beverages", name: "Beverages", icon: "🥤", color: "purple", items: 67 },
  { id: "snacks", name: "Snacks", icon: "🍿", color: "yellow", items: 89 },
  { id: "household", name: "Household", icon: "🧽", color: "gray", items: 123 }
];

const products = [
  {
    id: 1,
    name: "Organic Bananas",
    brand: "Nature's Best",
    price: 2.99,
    originalPrice: 3.49,
    unit: "bunch",
    image: "🍌",
    rating: 4.8,
    reviews: 234,
    tag: "Best Seller",
    inStock: true
  },
  {
    id: 2,
    name: "Fresh Avocados",
    brand: "California Farms",
    price: 4.99,
    originalPrice: null,
    unit: "3 pack",
    image: "🥑",
    rating: 4.9,
    reviews: 567,
    tag: "Organic",
    inStock: true
  },
  {
    id: 3,
    name: "Whole Milk",
    brand: "Dairy Pure",
    price: 3.49,
    originalPrice: 3.99,
    unit: "1 gallon",
    image: "🥛",
    rating: 4.7,
    reviews: 890,
    tag: null,
    inStock: true
  },
  {
    id: 4,
    name: "Sourdough Bread",
    brand: "Artisan Bakery",
    price: 5.99,
    originalPrice: null,
    unit: "loaf",
    image: "🍞",
    rating: 4.6,
    reviews: 123,
    tag: "Fresh Daily",
    inStock: true
  },
  {
    id: 5,
    name: "Organic Eggs",
    brand: "Happy Hens",
    price: 6.99,
    originalPrice: 7.99,
    unit: "12 count",
    image: "🥚",
    rating: 4.9,
    reviews: 445,
    tag: "Free Range",
    inStock: true
  },
  {
    id: 6,
    name: "Fresh Salmon Fillet",
    brand: "Ocean Fresh",
    price: 12.99,
    originalPrice: 15.99,
    unit: "1 lb",
    image: "🐟",
    rating: 4.7,
    reviews: 89,
    tag: "Wild Caught",
    inStock: true
  },
  {
    id: 7,
    name: "Strawberries",
    brand: "Berry Farms",
    price: 4.49,
    originalPrice: null,
    unit: "1 lb",
    image: "🍓",
    rating: 4.5,
    reviews: 334,
    tag: "Seasonal",
    inStock: true
  },
  {
    id: 8,
    name: "Greek Yogurt",
    brand: "Yogurt Co",
    price: 1.99,
    originalPrice: 2.49,
    unit: "6 oz",
    image: "🥣",
    rating: 4.8,
    reviews: 678,
    tag: "Protein",
    inStock: true
  }
];

const deals = [
  { name: "Weekly Specials", discount: "Up to 40% off", emoji: "🏷️" },
  { name: "Buy 1 Get 1 Free", discount: "Select items", emoji: "🎁" },
  { name: "Fresh Picks", discount: "Farm to table", emoji: "🌾" },
  { name: "Bulk Savings", discount: "Save more", emoji: "📦" }
];

const cartItems = [
  { id: 1, name: "Organic Bananas", price: 2.99, quantity: 2, image: "🍌" },
  { id: 2, name: "Fresh Avocados", price: 4.99, quantity: 1, image: "🥑" }
];

export default function ShopPage() {
  const [activeCategory, setActiveCategory] = useState("fruits");
  const [cart, setCart] = useState<Record<number, number>>({});
  const [favorites, setFavorites] = useState<number[]>([]);

  const addToCart = (productId: number) => {
    setCart(prev => ({
      ...prev,
      [productId]: (prev[productId] || 0) + 1
    }));
  };

  const toggleFavorite = (id: number) => {
    setFavorites(prev => 
      prev.includes(id) ? prev.filter(fid => fid !== id) : [...prev, id]
    );
  };

  const cartCount = Object.values(cart).reduce((a, b) => a + b, 0);
  const cartTotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center">
                <span className="text-2xl">🥬</span>
              </div>
              <span className="text-xl font-bold text-green-700">Grover</span>
            </Link>
            
            <div className="hidden md:flex items-center gap-6 flex-1 max-w-xl mx-8">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search for groceries..."
                  className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-2 text-sm text-gray-600">
                <MapPin className="w-4 h-4" />
                <span>Deliver to: New York, NY</span>
              </div>
              <Link href="/auth/login" className="text-gray-600 hover:text-gray-900">
                <User className="w-6 h-6" />
              </Link>
              <button className="relative">
                <ShoppingCart className="w-6 h-6 text-gray-600" />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 w-5 h-5 bg-green-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
                    {cartCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="bg-green-50 border-b">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-6 text-sm">
            <span className="flex items-center gap-2 text-green-700">
              <Truck className="w-4 h-4" />
              Free delivery on orders over $35
            </span>
            <span className="flex items-center gap-2 text-green-700">
              <Clock className="w-4 h-4" />
              Delivery in 2 hours or less
            </span>
            <span className="flex items-center gap-2 text-green-700">
              <Shield className="w-4 h-4" />
              100% freshness guarantee
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/shop" className="text-green-700 font-medium">Shop</Link>
            <Link href="/deals" className="text-gray-600 hover:text-green-700">Deals</Link>
            <Link href="/recipes" className="text-gray-600 hover:text-green-700">Recipes</Link>
          </div>
        </div>
      </div>

      <section className="section-padding">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            {deals.map((deal) => (
              <div key={deal.name} className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-4 text-white cursor-pointer hover:shadow-lg transition-shadow">
                <span className="text-3xl mb-2 block">{deal.emoji}</span>
                <h3 className="font-bold text-lg">{deal.name}</h3>
                <p className="text-green-100 text-sm">{deal.discount}</p>
              </div>
            ))}
          </div>

          <div className="flex gap-8">
            {/* Sidebar Categories */}
            <div className="hidden md:block w-64 flex-shrink-0">
              <div className="bg-white rounded-xl border border-gray-200 p-4 sticky top-24">
                <h3 className="font-bold text-gray-900 mb-4">Categories</h3>
                <div className="space-y-2">
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setActiveCategory(category.id)}
                      className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${
                        activeCategory === category.id
                          ? "bg-green-50 text-green-700"
                          : "hover:bg-gray-50 text-gray-700"
                      }`}
                    >
                      <span className="text-2xl">{category.icon}</span>
                      <div className="text-left">
                        <span className="font-medium block">{category.name}</span>
                        <span className="text-xs text-gray-500">{category.items} items</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {categories.find(c => c.id === activeCategory)?.name}
                </h2>
                <div className="flex items-center gap-4">
                  <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50">
                    <Filter className="w-4 h-4" />
                    Filter
                  </button>
                  <select className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-green-500">
                    <option>Sort by: Popular</option>
                    <option>Price: Low to High</option>
                    <option>Price: High to Low</option>
                    <option>Newest First</option>
                  </select>
                </div>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {products.map((product) => (
                  <div key={product.id} className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-lg transition-shadow group">
                    {product.tag && (
                      <span className="inline-block px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full mb-3">
                        {product.tag}
                      </span>
                    )}
                    <div className="flex justify-center mb-4">
                      <span className="text-6xl">{product.image}</span>
                    </div>
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="text-sm text-gray-500">{product.brand}</p>
                        <h3 className="font-medium text-gray-900 group-hover:text-green-700 transition-colors">{product.name}</h3>
                      </div>
                      <button
                        onClick={() => toggleFavorite(product.id)}
                        className="text-gray-400 hover:text-red-500"
                      >
                        <Heart className={`w-5 h-5 ${favorites.includes(product.id) ? "fill-current text-red-500" : ""}`} />
                      </button>
                    </div>
                    <div className="flex items-center gap-1 mb-3">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="text-sm text-gray-600">{product.rating}</span>
                      <span className="text-sm text-gray-400">({product.reviews})</span>
                    </div>
                    <div className="flex items-end justify-between">
                      <div>
                        <div className="flex items-baseline gap-2">
                          <span className="text-xl font-bold text-gray-900">${product.price}</span>
                          {product.originalPrice && (
                            <span className="text-sm text-gray-400 line-through">${product.originalPrice}</span>
                          )}
                        </div>
                        <span className="text-sm text-gray-500">/ {product.unit}</span>
                      </div>
                      <button
                        onClick={() => addToCart(product.id)}
                        className="w-10 h-10 bg-green-500 text-white rounded-lg flex items-center justify-center hover:bg-green-600 transition-colors"
                      >
                        <Plus className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-white border-t py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center">
                  <span className="text-2xl">🥬</span>
                </div>
                <span className="text-xl font-bold text-green-700">Grover</span>
              </div>
              <p className="text-sm text-gray-600">Fresh groceries delivered to your door in 2 hours or less.</p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Shop</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/shop" className="text-gray-600 hover:text-green-700">All Products</Link></li>
                <li><Link href="/deals" className="text-gray-600 hover:text-green-700">Today's Deals</Link></li>
                <li><Link href="/recipes" className="text-gray-600 hover:text-green-700">Recipes</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Help</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/faq" className="text-gray-600 hover:text-green-700">FAQs</Link></li>
                <li><Link href="/delivery" className="text-gray-600 hover:text-green-700">Delivery Info</Link></li>
                <li><Link href="/contact" className="text-gray-600 hover:text-green-700">Contact Us</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Connect</h4>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Phone className="w-4 h-4" />
                <span>1-800-GROVER</span>
              </div>
            </div>
          </div>
          <div className="border-t pt-8 text-center text-sm text-gray-500">
            © 2024 Grover. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
