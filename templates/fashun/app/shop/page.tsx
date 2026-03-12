"use client";

import { Search, ShoppingBag, Heart, User, Menu, X, ChevronDown, Filter, Grid3X3, LayoutGrid } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const categories = [
  { name: "All", count: 156 },
  { name: "New Arrivals", count: 24 },
  { name: "Dresses", count: 42 },
  { name: "Tops", count: 38 },
  { name: "Bottoms", count: 31 },
  { name: "Outerwear", count: 21 },
];

const filters = {
  sizes: ["XS", "S", "M", "L", "XL", "XXL"],
  colors: [
    { name: "Black", hex: "#000000" },
    { name: "White", hex: "#FFFFFF" },
    { name: "Navy", hex: "#1e3a5f" },
    { name: "Beige", hex: "#d4c4b0" },
    { name: "Brown", hex: "#6b4423" },
    { name: "Red", hex: "#c41e3a" },
  ],
  priceRanges: [
    { label: "Under $100", min: 0, max: 100 },
    { label: "$100 - $300", min: 100, max: 300 },
    { label: "$300 - $500", min: 300, max: 500 },
    { label: "$500+", min: 500, max: Infinity },
  ],
};

const products = [
  {
    id: 1,
    name: "Silk Evening Gown",
    price: 1295,
    originalPrice: null,
    category: "Dresses",
    image: "👗",
    colors: ["Black", "Navy", "Red"],
    sizes: ["XS", "S", "M", "L"],
    isNew: true,
    isBestseller: true,
  },
  {
    id: 2,
    name: "Cashmere Turtleneck",
    price: 485,
    originalPrice: 650,
    category: "Tops",
    image: "🧥",
    colors: ["Beige", "Brown", "Black"],
    sizes: ["S", "M", "L", "XL"],
    isNew: false,
    isBestseller: true,
  },
  {
    id: 3,
    name: "Tailored Wool Coat",
    price: 895,
    originalPrice: null,
    category: "Outerwear",
    image: "🧥",
    colors: ["Camel", "Black", "Navy"],
    sizes: ["XS", "S", "M", "L", "XL"],
    isNew: true,
    isBestseller: false,
  },
  {
    id: 4,
    name: "Pleated Midi Skirt",
    price: 345,
    originalPrice: null,
    category: "Bottoms",
    image: "👗",
    colors: ["Black", "Navy", "Beige"],
    sizes: ["XS", "S", "M", "L"],
    isNew: false,
    isBestseller: true,
  },
  {
    id: 5,
    name: "Structured Blazer",
    price: 675,
    originalPrice: 850,
    category: "Outerwear",
    image: "🧥",
    colors: ["Black", "Navy", "White"],
    sizes: ["XS", "S", "M", "L", "XL"],
    isNew: false,
    isBestseller: false,
  },
  {
    id: 6,
    name: "Cocktail Mini Dress",
    price: 795,
    originalPrice: null,
    category: "Dresses",
    image: "👗",
    colors: ["Red", "Black", "Navy"],
    sizes: ["XS", "S", "M", "L"],
    isNew: true,
    isBestseller: false,
  },
  {
    id: 7,
    name: "Silk Blouse",
    price: 425,
    originalPrice: null,
    category: "Tops",
    image: "👚",
    colors: ["White", "Beige", "Navy", "Black"],
    sizes: ["XS", "S", "M", "L", "XL"],
    isNew: false,
    isBestseller: true,
  },
  {
    id: 8,
    name: "Wide Leg Trousers",
    price: 385,
    originalPrice: null,
    category: "Bottoms",
    image: "👖",
    colors: ["Black", "Navy", "Beige"],
    sizes: ["XS", "S", "M", "L", "XL"],
    isNew: false,
    isBestseller: false,
  },
];

export default function ShopPage() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedPrice, setSelectedPrice] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const toggleFavorite = (id: number) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((fid) => fid !== id) : [...prev, id]
    );
  };

  const filteredProducts = products.filter((product) => {
    if (activeCategory !== "All" && product.category !== activeCategory) return false;
    return true;
  });

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
                <Link href="/shop" className="font-medium">Shop</Link>
                <Link href="/new-arrivals" className="text-gray-600 hover:text-black">New Arrivals</Link>
                <Link href="/lookbook" className="text-gray-600 hover:text-black">Lookbook</Link>
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

      {/* Page Header */}
      <div className="bg-gray-50 border-b">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-2">Shop All</h1>
          <p className="text-gray-600">Discover our curated collection of luxury fashion</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Sidebar Filters - Desktop */}
          <aside className="hidden lg:block w-64 shrink-0">
            <div className="sticky top-24">
              <div className="mb-8">
                <h3 className="font-semibold mb-4">Categories</h3>
                <div className="space-y-2">
                  {categories.map((cat) => (
                    <button
                      key={cat.name}
                      onClick={() => setActiveCategory(cat.name)}
                      className={`w-full flex items-center justify-between py-2 text-sm ${
                        activeCategory === cat.name
                          ? "font-medium text-black"
                          : "text-gray-600 hover:text-black"
                      }`}
                    >
                      <span>{cat.name}</span>
                      <span className="text-gray-400">({cat.count})</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-8">
                <h3 className="font-semibold mb-4">Size</h3>
                <div className="flex flex-wrap gap-2">
                  {filters.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(selectedSize === size ? null : size)}
                      className={`w-10 h-10 text-sm border rounded ${
                        selectedSize === size
                          ? "border-black bg-black text-white"
                          : "border-gray-200 hover:border-gray-400"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-8">
                <h3 className="font-semibold mb-4">Color</h3>
                <div className="flex flex-wrap gap-3">
                  {filters.colors.map((color) => (
                    <button
                      key={color.name}
                      onClick={() => setSelectedColor(selectedColor === color.name ? null : color.name)}
                      className={`w-8 h-8 rounded-full border-2 ${
                        selectedColor === color.name
                          ? "border-black"
                          : "border-transparent"
                      }`}
                      style={{ backgroundColor: color.hex }}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>

              <div className="mb-8">
                <h3 className="font-semibold mb-4">Price</h3>
                <div className="space-y-2">
                  {filters.priceRanges.map((range) => (
                    <label key={range.label} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="price"
                        checked={selectedPrice === range.label}
                        onChange={() => setSelectedPrice(range.label)}
                        className="accent-black"
                      />
                      <span className="text-sm text-gray-600">{range.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Mobile Filter Toggle */}
          <div className="lg:hidden w-full mb-4">
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="w-full flex items-center justify-between py-3 border-b"
            >
              <span className="font-medium">Filters</span>
              <Filter className="w-5 h-5" />
            </button>
          </div>

          {/* Product Grid */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <span className="text-sm text-gray-600">
                Showing {filteredProducts.length} products
              </span>
              <select className="text-sm border-gray-200 rounded-lg focus:border-black focus:ring-0">
                <option>Sort by: Featured</option>
                <option>Price: Low to High</option>
                <option>Price: High to Low</option>
                <option>Newest First</option>
              </select>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
              {filteredProducts.map((product) => (
                <div key={product.id} className="group">
                  <div className="relative aspect-[3/4] bg-gray-100 rounded-lg mb-3 overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center text-6xl">
                      {product.image}
                    </div>
                    {product.isNew && (
                      <span className="absolute top-2 left-2 px-2 py-1 bg-black text-white text-xs font-medium">
                        NEW
                      </span>
                    )}
                    {product.originalPrice && (
                      <span className="absolute top-2 right-2 px-2 py-1 bg-red-500 text-white text-xs font-medium">
                        SALE
                      </span>
                    )}
                    <button
                      onClick={() => toggleFavorite(product.id)}
                      className="absolute bottom-2 right-2 w-10 h-10 bg-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                    >
                      <Heart
                        className={`w-5 h-5 ${
                          favorites.includes(product.id)
                            ? "fill-red-500 text-red-500"
                            : "text-gray-600"
                        }`}
                      />
                    </button>
                    <button className="absolute bottom-2 left-2 px-4 py-2 bg-black text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity">
                      Quick Add
                    </button>
                  </div>
                  <h3 className="font-medium text-sm mb-1 group-hover:underline cursor-pointer">
                    {product.name}
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">${product.price}</span>
                    {product.originalPrice && (
                      <span className="text-gray-400 line-through text-sm">
                        ${product.originalPrice}
                      </span>
                    )}
                  </div>
                  <p className="text-gray-500 text-xs mt-1">{product.colors.length} colors</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-black text-white mt-16">
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
