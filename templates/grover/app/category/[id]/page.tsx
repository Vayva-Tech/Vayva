"use client";

import { Search, ShoppingCart, Heart, Star, Plus, Filter, ChevronDown, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const category = {
  name: "Fresh Fruits",
  description: "Farm-fresh fruits delivered to your door",
  icon: "🍎",
  itemCount: 156,
};

const subcategories = [
  { name: "Bananas", count: 12 },
  { name: "Apples", count: 18 },
  { name: "Citrus", count: 24 },
  { name: "Berries", count: 15 },
  { name: "Tropical", count: 20 },
  { name: "Stone Fruits", count: 14 },
];

const filters = {
  brands: ["Nature's Best", "Organic Farms", "California Fresh", "Tropical Delight"],
  priceRanges: [
    { label: "Under $5", min: 0, max: 5 },
    { label: "$5 - $10", min: 5, max: 10 },
    { label: "$10 - $20", min: 10, max: 20 },
    { label: "$20+", min: 20, max: Infinity },
  ],
  dietary: ["Organic", "Non-GMO", "Locally Grown", "Imported"],
};

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
    organic: true,
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
    organic: true,
  },
  {
    id: 3,
    name: "Red Apples",
    brand: "Nature's Best",
    price: 5.99,
    originalPrice: 6.99,
    unit: "2 lbs",
    image: "🍎",
    rating: 4.7,
    reviews: 189,
    tag: null,
    organic: false,
  },
  {
    id: 4,
    name: "Fresh Strawberries",
    brand: "Organic Farms",
    price: 3.99,
    originalPrice: null,
    unit: "1 lb",
    image: "🍓",
    rating: 4.6,
    reviews: 423,
    tag: "Organic",
    organic: true,
  },
  {
    id: 5,
    name: "Seedless Grapes",
    brand: "California Farms",
    price: 4.49,
    originalPrice: 5.49,
    unit: "2 lbs",
    image: "🍇",
    rating: 4.8,
    reviews: 312,
    tag: null,
    organic: false,
  },
  {
    id: 6,
    name: "Pineapple",
    brand: "Tropical Delight",
    price: 3.49,
    originalPrice: null,
    unit: "each",
    image: "🍍",
    rating: 4.7,
    reviews: 278,
    tag: null,
    organic: false,
  },
  {
    id: 7,
    name: "Organic Blueberries",
    brand: "Nature's Best",
    price: 5.99,
    originalPrice: 6.99,
    unit: "6 oz",
    image: "🫐",
    rating: 4.9,
    reviews: 892,
    tag: "Best Seller",
    organic: true,
  },
  {
    id: 8,
    name: "Mango",
    brand: "Tropical Delight",
    price: 2.49,
    originalPrice: null,
    unit: "each",
    image: "🥭",
    rating: 4.6,
    reviews: 445,
    tag: null,
    organic: false,
  },
];

export default function CategoryPage({ params }: { params: { id: string } }) {
  const [sortBy, setSortBy] = useState("featured");
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="text-2xl font-bold text-green-600">Grover</Link>
            <div className="flex items-center gap-4">
              <Link href="/shop" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
                <ArrowLeft className="w-4 h-4" />
                Back to Shop
              </Link>
              <Link href="/cart" className="relative p-2 bg-green-100 rounded-full">
                <ShoppingCart className="w-5 h-5 text-green-700" />
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-green-600 text-white text-xs rounded-full flex items-center justify-center">3</span>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Category Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center gap-4 mb-4">
            <span className="text-4xl">{category.icon}</span>
            <div>
              <h1 className="text-3xl font-bold">{category.name}</h1>
              <p className="text-gray-600">{category.description} • {category.itemCount} items</p>
            </div>
          </div>
          
          {/* Subcategories */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            <button className="px-4 py-2 bg-green-600 text-white rounded-full text-sm font-medium whitespace-nowrap">
              All {category.name}
            </button>
            {subcategories.map((sub) => (
              <button
                key={sub.name}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm font-medium whitespace-nowrap hover:bg-gray-200"
              >
                {sub.name} ({sub.count})
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Sidebar Filters */}
          <aside className="hidden lg:block w-64 shrink-0">
            <div className="sticky top-24 space-y-6">
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  Filters
                </h3>
              </div>

              <div>
                <h4 className="font-medium mb-3">Brand</h4>
                <div className="space-y-2">
                  {filters.brands.map((brand) => (
                    <label key={brand} className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" className="rounded border-gray-300" />
                      <span className="text-sm text-gray-600">{brand}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-3">Price Range</h4>
                <div className="space-y-2">
                  {filters.priceRanges.map((range) => (
                    <label key={range.label} className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="price" className="border-gray-300" />
                      <span className="text-sm text-gray-600">{range.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-3">Dietary Preferences</h4>
                <div className="space-y-2">
                  {filters.dietary.map((item) => (
                    <label key={item} className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" className="rounded border-gray-300" />
                      <span className="text-sm text-gray-600">{item}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Product Grid */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <span className="text-sm text-gray-600">{products.length} products</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border rounded-lg text-sm focus:outline-none focus:border-green-600"
              >
                <option value="featured">Sort by: Featured</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
              {products.map((product) => (
                <div key={product.id} className="bg-white rounded-xl p-4 hover:shadow-lg transition-shadow group">
                  <div className="relative aspect-square bg-gray-100 rounded-xl mb-3 flex items-center justify-center text-5xl">
                    {product.image}
                    {product.tag && (
                      <span className={`absolute top-2 left-2 px-2 py-1 text-xs font-semibold rounded ${
                        product.tag === "Best Seller" ? "bg-orange-100 text-orange-700" : "bg-green-100 text-green-700"
                      }`}>
                        {product.tag}
                      </span>
                    )}
                    {product.organic && (
                      <span className="absolute top-2 right-2 w-6 h-6 bg-green-600 rounded-full flex items-center justify-center text-xs">
                        🌿
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 mb-1">
                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    <span className="text-xs text-gray-500">{product.rating} ({product.reviews})</span>
                  </div>
                  <p className="text-xs text-gray-500 mb-1">{product.brand}</p>
                  <h3 className="font-medium text-sm mb-1 group-hover:text-green-600">{product.name}</h3>
                  <p className="text-xs text-gray-400 mb-2">{product.unit}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-baseline gap-2">
                      <span className="font-bold text-green-600">${product.price}</span>
                      {product.originalPrice && (
                        <span className="text-xs text-gray-400 line-through">${product.originalPrice}</span>
                      )}
                    </div>
                    <button className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
