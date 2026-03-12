"use client";

import { Trash2, Plus, Minus, ArrowRight, Truck, Shield, Gift } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const initialCart = [
  {
    id: 1,
    name: "Silk Evening Gown",
    price: 1295,
    size: "M",
    color: "Midnight Black",
    quantity: 1,
    image: "👗",
  },
  {
    id: 2,
    name: "Cashmere Turtleneck",
    price: 485,
    size: "S",
    color: "Beige",
    quantity: 1,
    image: "🧥",
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
  const shipping = subtotal > 500 ? 0 : 25;
  const total = subtotal + shipping;

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
              <Link href="/shop" className="text-sm text-gray-600 hover:text-black">
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Shopping Bag</h1>

        {cart.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-xl text-gray-600 mb-4">Your bag is empty</p>
            <Link href="/shop" className="inline-block px-8 py-3 bg-black text-white rounded-lg">
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-6">
              {cart.map((item) => (
                <div key={item.id} className="flex gap-6 py-6 border-b">
                  <div className="w-32 h-40 bg-gray-100 rounded-lg flex items-center justify-center text-5xl shrink-0">
                    {item.image}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between mb-2">
                      <h3 className="font-medium text-lg">{item.name}</h3>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-gray-400 hover:text-red-500"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                    <p className="text-gray-500 text-sm mb-1">Size: {item.size}</p>
                    <p className="text-gray-500 text-sm mb-4">Color: {item.color}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center border rounded-lg">
                        <button
                          onClick={() => updateQuantity(item.id, -1)}
                          className="px-3 py-2 hover:bg-gray-50"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="px-3 py-2 font-medium">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, 1)}
                          className="px-3 py-2 hover:bg-gray-50"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                      <span className="text-lg font-semibold">
                        ${item.price * item.quantity}
                      </span>
                    </div>
                  </div>
                </div>
              ))}

              {/* Promo Code */}
              <div className="flex gap-4">
                <input
                  type="text"
                  placeholder="Promo code"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  className="flex-1 px-4 py-3 border rounded-lg focus:outline-none focus:border-black"
                />
                <button className="px-6 py-3 border rounded-lg hover:bg-gray-50">
                  Apply
                </button>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:sticky lg:top-24 h-fit">
              <div className="bg-gray-50 rounded-xl p-6">
                <h2 className="text-lg font-semibold mb-6">Order Summary</h2>
                
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span>${subtotal}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Shipping</span>
                    <span>{shipping === 0 ? "Free" : `$${shipping}`}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Tax</span>
                    <span>Calculated at checkout</span>
                  </div>
                </div>

                <div className="border-t pt-4 mb-6">
                  <div className="flex justify-between text-xl font-bold">
                    <span>Estimated Total</span>
                    <span>${total}</span>
                  </div>
                </div>

                <Link
                  href="/checkout"
                  className="block w-full py-4 bg-black text-white text-center font-medium rounded-lg hover:bg-gray-800 transition-colors"
                >
                  Proceed to Checkout
                </Link>

                <div className="mt-6 space-y-3">
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <Truck className="w-4 h-4" />
                    <span>Free shipping on orders over $500</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <Shield className="w-4 h-4" />
                    <span>Secure checkout</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <Gift className="w-4 h-4" />
                    <span>Gift wrapping available</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
