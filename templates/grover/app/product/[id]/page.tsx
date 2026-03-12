"use client";

import { Search, ShoppingCart, Heart, Star, Plus, Minus, ChevronRight, Flame, Clock, Truck, Shield, ArrowLeft, Share2, Info } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const product = {
  id: 1,
  name: "Organic Bananas",
  brand: "Nature's Best",
  price: 2.99,
  originalPrice: 3.49,
  unit: "bunch",
  weight: "1.5 lbs",
  image: "🍌",
  rating: 4.8,
  reviews: 234,
  tag: "Best Seller",
  inStock: true,
  description: "Sweet, ripe organic bananas sourced from sustainable farms. Perfect for smoothies, baking, or a healthy snack on the go.",
  origin: "Ecuador",
  shelfLife: "5-7 days",
  nutrition: {
    calories: 105,
    protein: "1.3g",
    carbs: "27g",
    fiber: "3.1g",
    sugar: "14g",
  },
};

const relatedProducts = [
  { id: 2, name: "Fresh Avocados", price: 4.99, unit: "3 pack", image: "🥑" },
  { id: 3, name: "Organic Apples", price: 5.99, unit: "2 lbs", image: "🍎" },
  { id: 4, name: "Fresh Strawberries", price: 3.99, unit: "1 lb", image: "🍓" },
];

export default function ProductPage({ params }: { params: { id: string } }) {
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="text-2xl font-bold text-green-600">Grover</Link>
            <div className="flex items-center gap-4">
              <Link href="/shop" className="text-gray-600 hover:text-gray-900">Continue Shopping</Link>
              <Link href="/cart" className="relative p-2 bg-green-100 rounded-full">
                <ShoppingCart className="w-5 h-5 text-green-700" />
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-green-600 text-white text-xs rounded-full flex items-center justify-center">3</span>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Link href="/" className="hover:text-gray-900">Home</Link>
            <ChevronRight className="w-4 h-4" />
            <Link href="/shop" className="hover:text-gray-900">Shop</Link>
            <ChevronRight className="w-4 h-4" />
            <Link href="/category/fruits" className="hover:text-gray-900">Fresh Fruits</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-gray-900">{product.name}</span>
          </div>
        </div>
      </div>

      {/* Product Details */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Image */}
          <div className="bg-white rounded-2xl p-8 flex items-center justify-center">
            <div className="text-[200px]">{product.image}</div>
          </div>

          {/* Info */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded">{product.tag}</span>
                <span className="text-sm text-gray-500">{product.brand}</span>
              </div>
              <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  <span className="font-semibold">{product.rating}</span>
                  <span className="text-gray-500">({product.reviews} reviews)</span>
                </div>
                <span className="text-green-600 font-medium">In Stock</span>
              </div>
            </div>

            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-bold text-green-600">${product.price}</span>
              {product.originalPrice && (
                <span className="text-xl text-gray-400 line-through">${product.originalPrice}</span>
              )}
              <span className="text-gray-500">/ {product.unit}</span>
            </div>

            <p className="text-gray-600">{product.description}</p>

            {/* Quantity */}
            <div>
              <label className="block text-sm font-medium mb-2">Quantity</label>
              <div className="flex items-center gap-4">
                <div className="flex items-center border rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-4 py-2 hover:bg-gray-50"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="px-4 py-2 font-medium w-12 text-center">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-4 py-2 hover:bg-gray-50"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <span className="text-gray-500">{product.weight} per {product.unit}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4">
              <button className="flex-1 py-4 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition-colors">
                Add to Cart - ${(product.price * quantity).toFixed(2)}
              </button>
              <button
                onClick={() => setIsFavorite(!isFavorite)}
                className="p-4 border-2 border-gray-200 rounded-xl hover:border-gray-300"
              >
                <Heart className={`w-6 h-6 ${isFavorite ? "fill-red-500 text-red-500" : "text-gray-600"}`} />
              </button>
              <button className="p-4 border-2 border-gray-200 rounded-xl hover:border-gray-300">
                <Share2 className="w-6 h-6 text-gray-600" />
              </button>
            </div>

            {/* Delivery Info */}
            <div className="bg-green-50 rounded-xl p-4 space-y-2">
              <div className="flex items-center gap-2 text-green-700">
                <Truck className="w-5 h-5" />
                <span className="font-medium">Free delivery on orders over $35</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Clock className="w-5 h-5" />
                <span>Delivery in as little as 2 hours</span>
              </div>
            </div>

            {/* Details Tabs */}
            <div className="border-t pt-6">
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <span className="text-gray-500 text-sm">Origin</span>
                  <p className="font-medium">{product.origin}</p>
                </div>
                <div>
                  <span className="text-gray-500 text-sm">Shelf Life</span>
                  <p className="font-medium">{product.shelfLife}</p>
                </div>
              </div>

              <h3 className="font-semibold mb-3">Nutrition Facts (per 100g)</h3>
              <div className="grid grid-cols-3 gap-4 bg-gray-50 rounded-xl p-4">
                <div>
                  <span className="text-gray-500 text-sm">Calories</span>
                  <p className="font-semibold">{product.nutrition.calories}</p>
                </div>
                <div>
                  <span className="text-gray-500 text-sm">Protein</span>
                  <p className="font-semibold">{product.nutrition.protein}</p>
                </div>
                <div>
                  <span className="text-gray-500 text-sm">Carbs</span>
                  <p className="font-semibold">{product.nutrition.carbs}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products */}
      <div className="bg-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-bold mb-8">Frequently Bought Together</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {relatedProducts.map((item) => (
              <Link key={item.id} href={`/product/${item.id}`} className="group">
                <div className="bg-gray-100 rounded-xl aspect-square flex items-center justify-center text-6xl mb-3 group-hover:bg-gray-200 transition-colors">
                  {item.image}
                </div>
                <h3 className="font-medium group-hover:text-green-600">{item.name}</h3>
                <p className="text-gray-500 text-sm">{item.unit}</p>
                <p className="font-semibold text-green-600">${item.price}</p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
