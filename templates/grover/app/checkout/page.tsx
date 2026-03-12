"use client";

import { Check, CreditCard, Truck, MapPin, Clock, ChevronRight, Lock } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const steps = ["Delivery", "Payment", "Review"];

const cart = [
  { name: "Organic Bananas", price: 5.98, quantity: 2, image: "🍌", unit: "2 bunches" },
  { name: "Fresh Avocados", price: 4.99, quantity: 1, image: "🥑", unit: "3 pack" },
  { name: "Whole Milk", price: 3.49, quantity: 1, image: "🥛", unit: "gallon" },
];

export default function CheckoutPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [deliveryAddress, setDeliveryAddress] = useState({
    street: "",
    apt: "",
    city: "",
    zip: "",
    instructions: "",
  });
  const [deliveryTime, setDeliveryTime] = useState("today-2hr");

  const subtotal = cart.reduce((sum, item) => sum + item.price, 0);
  const deliveryFee = 0;
  const serviceFee = 2.99;
  const tax = subtotal * 0.08;
  const total = subtotal + deliveryFee + serviceFee + tax;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <Link href="/" className="text-2xl font-bold text-green-600">Grover</Link>
        </div>
      </div>

      {/* Progress */}
      <div className="bg-white border-b">
        <div className="max-w-3xl mx-auto px-4 py-6">
          <div className="flex items-center justify-center gap-4">
            {steps.map((step, idx) => (
              <div key={step} className="flex items-center gap-2">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    idx <= currentStep ? "bg-green-600 text-white" : "bg-gray-200 text-gray-500"
                  }`}
                >
                  {idx < currentStep ? <Check className="w-4 h-4" /> : idx + 1}
                </div>
                <span className={`text-sm font-medium ${idx <= currentStep ? "text-gray-900" : "text-gray-500"}`}>
                  {step}
                </span>
                {idx < steps.length - 1 && <ChevronRight className="w-4 h-4 text-gray-300 mx-2" />}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {currentStep === 0 && (
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-green-600" />
                  Delivery Address
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Street Address</label>
                    <input
                      type="text"
                      value={deliveryAddress.street}
                      onChange={(e) => setDeliveryAddress({ ...deliveryAddress, street: e.target.value })}
                      className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:border-green-600"
                      placeholder="123 Main Street"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Apt, Suite, Floor (optional)</label>
                    <input
                      type="text"
                      value={deliveryAddress.apt}
                      onChange={(e) => setDeliveryAddress({ ...deliveryAddress, apt: e.target.value })}
                      className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:border-green-600"
                      placeholder="Apt 4B"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1.5">City</label>
                      <input
                        type="text"
                        value={deliveryAddress.city}
                        onChange={(e) => setDeliveryAddress({ ...deliveryAddress, city: e.target.value })}
                        className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:border-green-600"
                        placeholder="New York"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1.5">ZIP Code</label>
                      <input
                        type="text"
                        value={deliveryAddress.zip}
                        onChange={(e) => setDeliveryAddress({ ...deliveryAddress, zip: e.target.value })}
                        className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:border-green-600"
                        placeholder="10001"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Delivery Instructions (optional)</label>
                    <textarea
                      value={deliveryAddress.instructions}
                      onChange={(e) => setDeliveryAddress({ ...deliveryAddress, instructions: e.target.value })}
                      className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:border-green-600 h-24 resize-none"
                      placeholder="Leave at front door, buzzer code: 1234..."
                    />
                  </div>
                </div>

                <div className="mt-8">
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-green-600" />
                    Delivery Time
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { id: "today-2hr", label: "Today, 2:00 PM - 3:00 PM", price: "Free" },
                      { id: "today-4hr", label: "Today, 4:00 PM - 5:00 PM", price: "Free" },
                      { id: "tomorrow-9am", label: "Tomorrow, 9:00 AM - 10:00 AM", price: "Free" },
                      { id: "tomorrow-2pm", label: "Tomorrow, 2:00 PM - 3:00 PM", price: "Free" },
                    ].map((slot) => (
                      <button
                        key={slot.id}
                        onClick={() => setDeliveryTime(slot.id)}
                        className={`p-4 border rounded-xl text-left ${
                          deliveryTime === slot.id ? "border-green-600 bg-green-50" : "hover:border-gray-400"
                        }`}
                      >
                        <p className="font-medium">{slot.label}</p>
                        <p className="text-sm text-green-600">{slot.price}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => setCurrentStep(1)}
                  className="w-full mt-8 py-4 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700"
                >
                  Continue to Payment
                </button>
              </div>
            )}

            {currentStep === 1 && (
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-green-600" />
                  Payment Method
                </h2>
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-4 border-2 border-green-600 rounded-xl bg-green-50">
                    <CreditCard className="w-6 h-6" />
                    <div className="flex-1">
                      <p className="font-medium">Credit or Debit Card</p>
                      <p className="text-sm text-gray-500">Visa, Mastercard, Amex</p>
                    </div>
                    <Check className="w-5 h-5 text-green-600" />
                  </div>

                  <div className="space-y-4 mt-6">
                    <div>
                      <label className="block text-sm font-medium mb-1.5">Card Number</label>
                      <input
                        type="text"
                        className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:border-green-600"
                        placeholder="0000 0000 0000 0000"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1.5">Expiry Date</label>
                        <input
                          type="text"
                          className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:border-green-600"
                          placeholder="MM/YY"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1.5">CVC</label>
                        <input
                          type="text"
                          className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:border-green-600"
                          placeholder="123"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1.5">Name on Card</label>
                      <input
                        type="text"
                        className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:border-green-600"
                        placeholder="John Doe"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 mt-6">
                  <button
                    onClick={() => setCurrentStep(0)}
                    className="flex-1 py-4 border border-gray-300 font-medium rounded-xl hover:bg-gray-50"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => setCurrentStep(2)}
                    className="flex-1 py-4 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700"
                  >
                    Review Order
                  </button>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h2 className="text-xl font-bold mb-6">Review Your Order</h2>
                <div className="space-y-4 mb-6">
                  {cart.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center text-2xl">
                        {item.image}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-gray-500">{item.unit}</p>
                      </div>
                      <p className="font-medium">${item.price.toFixed(2)}</p>
                    </div>
                  ))}
                </div>
                <div className="border-t pt-4 mb-6">
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Delivery</span>
                    <span>Free</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Service Fee</span>
                    <span>${serviceFee.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Tax</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-xl font-bold mt-4 pt-4 border-t">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>
                <div className="flex gap-4">
                  <button
                    onClick={() => setCurrentStep(1)}
                    className="flex-1 py-4 border border-gray-300 font-medium rounded-xl hover:bg-gray-50"
                  >
                    Back
                  </button>
                  <button className="flex-1 py-4 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700">
                    Place Order
                  </button>
                </div>
              </div>
            )}

            {/* Trust badges */}
            <div className="flex items-center justify-center gap-8 text-sm text-gray-600">
              <span className="flex items-center gap-2">
                <Lock className="w-4 h-4" />
                Secure Checkout
              </span>
              <span className="flex items-center gap-2">
                <Truck className="w-4 h-4" />
                Free Delivery over $35
              </span>
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:sticky lg:top-24 h-fit">
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-lg font-bold mb-6">Order Summary</h2>
              <div className="space-y-4 mb-6">
                {cart.map((item, idx) => (
                  <div key={idx} className="flex gap-3">
                    <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center text-xl relative">
                      {item.image}
                      <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-600 text-white text-xs rounded-full flex items-center justify-center">
                        {item.quantity}
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{item.name}</p>
                      <p className="text-xs text-gray-500">{item.unit}</p>
                    </div>
                    <p className="font-medium text-sm">${item.price.toFixed(2)}</p>
                  </div>
                ))}
              </div>
              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Delivery</span>
                  <span>Free</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Service Fee</span>
                  <span>${serviceFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tax</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold pt-4 border-t">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
