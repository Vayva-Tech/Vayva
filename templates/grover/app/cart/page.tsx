"use client";

import { Trash2, Plus, Minus, ArrowLeft, Truck, Clock, MapPin, Tag, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const initialCart = [
  {
    id: 1,
    name: "Organic Bananas",
    brand: "Nature's Best",
    price: 2.99,
    quantity: 2,
    unit: "bunch",
    image: "🍌",
    weight: "1.5 lbs",
  },
  {
    id: 2,
    name: "Fresh Avocados",
    brand: "California Farms",
    price: 4.99,
    quantity: 1,
    unit: "3 pack",
    image: "🥑",
    weight: "1.2 lbs",
  },
  {
    id: 5,
    name: "Whole Milk",
    brand: "Dairy Pure",
    price: 3.49,
    quantity: 1,
    unit: "gallon",
    image: "🥛",
    weight: "8.6 lbs",
  },
];

export default function CartPage() {
  const [cart, setCart] = useState(initialCart);
  const [promoCode, setPromoCode] = useState("");

  const updateQuantity = (id: number, delta: number) => {
    setCart((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, quantity: Math.max(1, item.quantity + delta) }
          : item
      )
    );
  };

  const removeItem = (id: number) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryFee = subtotal > 35 ? 0 : 5.99;
  const serviceFee = 2.99;
  const tax = subtotal * 0.08;
  const total = subtotal + deliveryFee + serviceFee + tax;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="text-2xl font-bold text-green-600">Grover</Link>
            <Link href="/shop" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
              <ArrowLeft className="w-4 h-4" />
              Continue Shopping
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Shopping Cart ({cart.length} items)</h1>

        {cart.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center">
            <div className="text-6xl mb-4">🛒</div>
            <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
            <p className="text-gray-600 mb-6">Add some fresh groceries to get started</p>
            <Link href="/shop" className="inline-block px-8 py-3 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700">
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cart.map((item) => (
                <div key={item.id} className="bg-white rounded-xl p-6 flex gap-4">
                  <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center text-4xl shrink-0">
                    {item.image}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between mb-1">
                      <h3 className="font-semibold">{item.name}</h3>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-gray-400 hover:text-red-500"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                    <p className="text-sm text-gray-500 mb-2">{item.brand} • {item.weight}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center border rounded-lg">
                        <button
                          onClick={() => updateQuantity(item.id, -1)}
                          className="px-3 py-2 hover:bg-gray-50"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="px-3 py-2 font-medium min-w-[40px] text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, 1)}
                          className="px-3 py-2 hover:bg-gray-50"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                      <span className="font-bold text-lg">${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              ))}

              {/* Promo Code */}
              <div className="bg-white rounded-xl p-6">
                <label className="block text-sm font-medium mb-2">Promo Code</label>
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    placeholder="Enter code"
                    className="flex-1 px-4 py-3 border rounded-lg focus:outline-none focus:border-green-600"
                  />
                  <button className="px-6 py-3 border border-green-600 text-green-600 font-medium rounded-lg hover:bg-green-50">
                    Apply
                  </button>
                </div>
              </div>

              {/* Delivery Info */}
              <div className="bg-green-50 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-3">
                  <Truck className="w-5 h-5 text-green-600" />
                  <span className="font-medium text-green-800">Delivery Information</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-green-700 mb-2">
                  <Clock className="w-4 h-4" />
                  <span>Delivery in as little as 2 hours</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-green-700">
                  <MapPin className="w-4 h-4" />
                  <span>Delivering to: 123 Main St, New York, NY</span>
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:sticky lg:top-24 h-fit">
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h2 className="text-xl font-bold mb-6">Order Summary</h2>
                
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Delivery Fee</span>
                    <span>{deliveryFee === 0 ? "Free" : `$${deliveryFee.toFixed(2)}`}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Service Fee</span>
                    <span>${serviceFee.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Tax</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>
                </div>

                {subtotal < 35 && (
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-4">
                    <p className="text-sm text-orange-700">
                      Add ${(35 - subtotal).toFixed(2)} more for free delivery!
                    </p>
                  </div>
                )}

                <div className="border-t pt-4 mb-6">
                  <div className="flex justify-between text-xl font-bold">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>

                <Link
                  href="/checkout"
                  className="block w-full py-4 bg-green-600 text-white text-center font-semibold rounded-xl hover:bg-green-700 transition-colors"
                >
                  Proceed to Checkout
                </Link>

                <p className="text-center text-sm text-gray-500 mt-4">
                  Taxes and fees calculated at checkout
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
