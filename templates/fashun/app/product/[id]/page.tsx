"use client";

import { Heart, Share2, Truck, RotateCcw, Shield, ChevronDown, Plus, Minus, Star } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const product = {
  id: 1,
  name: "Silk Evening Gown",
  price: 1295,
  originalPrice: null,
  description: "Elegant silk evening gown with flowing silhouette. Features delicate spaghetti straps, subtle cowl neckline, and cascading draped skirt. Perfect for formal occasions and black-tie events.",
  details: [
    "100% Mulberry Silk",
    "Made in Italy",
    "Dry clean only",
    "Fully lined",
    "Concealed back zip",
  ],
  sizes: ["XS", "S", "M", "L", "XL"],
  colors: [
    { name: "Midnight Black", hex: "#000000" },
    { name: "Navy Blue", hex: "#1e3a5f" },
    { name: "Crimson Red", hex: "#c41e3a" },
  ],
  images: ["👗", "👗", "👗", "👗"],
  rating: 4.9,
  reviews: 127,
  inStock: true,
};

const relatedProducts = [
  { id: 2, name: "Cashmere Wrap", price: 485, image: "🧣" },
  { id: 3, name: "Pearl Earrings", price: 295, image: "💎" },
  { id: 4, name: "Satin Clutch", price: 425, image: "👛" },
];

export default function ProductPage({ params }: { params: { id: string } }) {
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState(product.colors[0]);
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);
  const [activeTab, setActiveTab] = useState("description");
  const [mainImage, setMainImage] = useState(0);

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="text-2xl font-bold tracking-tight">
              FASHUN
            </Link>
            <div className="flex items-center gap-4">
              <Link href="/shop" className="text-sm text-gray-600 hover:text-black">Continue Shopping</Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Breadcrumb */}
      <div className="border-b">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Link href="/" className="hover:text-black">Home</Link>
            <span>/</span>
            <Link href="/shop" className="hover:text-black">Shop</Link>
            <span>/</span>
            <Link href="/shop" className="hover:text-black">Dresses</Link>
            <span>/</span>
            <span className="text-black">{product.name}</span>
          </div>
        </div>
      </div>

      {/* Product Details */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="aspect-[3/4] bg-gray-100 rounded-lg flex items-center justify-center text-[200px]">
              {product.images[mainImage]}
            </div>
            <div className="grid grid-cols-4 gap-4">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setMainImage(idx)}
                  className={`aspect-square bg-gray-100 rounded-lg flex items-center justify-center text-4xl border-2 ${
                    mainImage === idx ? "border-black" : "border-transparent"
                  }`}
                >
                  {img}
                </button>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < Math.floor(product.rating)
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-600">
                  {product.rating} ({product.reviews} reviews)
                </span>
              </div>
              <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
              <div className="flex items-baseline gap-3">
                <span className="text-2xl font-semibold">${product.price}</span>
                {product.originalPrice && (
                  <span className="text-lg text-gray-400 line-through">
                    ${product.originalPrice}
                  </span>
                )}
              </div>
            </div>

            <p className="text-gray-600">{product.description}</p>

            {/* Color Selection */}
            <div>
              <h3 className="font-medium mb-3">
                Color: <span className="text-gray-600">{selectedColor.name}</span>
              </h3>
              <div className="flex gap-3">
                {product.colors.map((color) => (
                  <button
                    key={color.name}
                    onClick={() => setSelectedColor(color)}
                    className={`w-10 h-10 rounded-full border-2 ${
                      selectedColor.name === color.name
                        ? "border-black"
                        : "border-transparent"
                    }`}
                    style={{ backgroundColor: color.hex }}
                    title={color.name}
                  />
                ))}
              </div>
            </div>

            {/* Size Selection */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium">Select Size</h3>
                <Link href="/size-guide" className="text-sm text-gray-500 underline">
                  Size Guide
                </Link>
              </div>
              <div className="grid grid-cols-5 gap-3">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`py-3 border rounded-lg text-sm font-medium ${
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

            {/* Quantity */}
            <div>
              <h3 className="font-medium mb-3">Quantity</h3>
              <div className="flex items-center gap-4">
                <div className="flex items-center border rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-4 py-2 hover:bg-gray-50"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="px-4 py-2 font-medium">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-4 py-2 hover:bg-gray-50"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                {product.inStock ? (
                  <span className="text-green-600 text-sm">In Stock</span>
                ) : (
                  <span className="text-red-600 text-sm">Out of Stock</span>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4 pt-4">
              <button className="flex-1 py-4 bg-black text-white font-medium rounded-lg hover:bg-gray-800 transition-colors">
                Add to Cart - ${product.price * quantity}
              </button>
              <button
                onClick={() => setIsFavorite(!isFavorite)}
                className="p-4 border rounded-lg hover:bg-gray-50"
              >
                <Heart
                  className={`w-6 h-6 ${
                    isFavorite ? "fill-red-500 text-red-500" : "text-gray-600"
                  }`}
                />
              </button>
              <button className="p-4 border rounded-lg hover:bg-gray-50">
                <Share2 className="w-6 h-6 text-gray-600" />
              </button>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-4 py-6 border-y">
              <div className="flex items-center gap-3">
                <Truck className="w-5 h-5 text-gray-400" />
                <span className="text-sm">Free Shipping</span>
              </div>
              <div className="flex items-center gap-3">
                <RotateCcw className="w-5 h-5 text-gray-400" />
                <span className="text-sm">Easy Returns</span>
              </div>
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-gray-400" />
                <span className="text-sm">Secure Payment</span>
              </div>
            </div>

            {/* Tabs */}
            <div className="border-b">
              <div className="flex gap-8">
                {["description", "details", "shipping"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`py-4 text-sm font-medium capitalize border-b-2 ${
                      activeTab === tab
                        ? "border-black text-black"
                        : "border-transparent text-gray-500"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            <div className="py-4">
              {activeTab === "description" && (
                <p className="text-gray-600">{product.description}</p>
              )}
              {activeTab === "details" && (
                <ul className="space-y-2">
                  {product.details.map((detail, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-gray-600">
                      <span className="w-1 h-1 bg-gray-400 rounded-full" />
                      {detail}
                    </li>
                  ))}
                </ul>
              )}
              {activeTab === "shipping" && (
                <div className="space-y-4 text-gray-600">
                  <p>Free standard shipping on all orders over $500</p>
                  <p>Express delivery available at checkout</p>
                  <p>Returns accepted within 30 days of delivery</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Related Products */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-bold mb-8">Complete the Look</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {relatedProducts.map((item) => (
              <Link key={item.id} href={`/product/${item.id}`} className="group">
                <div className="aspect-square bg-white rounded-lg flex items-center justify-center text-6xl mb-3">
                  {item.image}
                </div>
                <h3 className="font-medium group-hover:underline">{item.name}</h3>
                <p className="text-gray-600">${item.price}</p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
