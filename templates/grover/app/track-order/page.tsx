"use client";

import { MapPin, Clock, Phone, MessageSquare, ChevronLeft, Star, Check, Package, Truck, Home } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const orderStatus = {
  id: "ORD-12345678",
  status: "out_for_delivery",
  estimatedArrival: "2:30 PM - 3:30 PM",
  driver: {
    name: "Michael R.",
    rating: 4.9,
    deliveries: 1247,
    phone: "+1 (555) 123-4567",
    vehicle: "Toyota Prius • ABC 123",
  },
  items: [
    { name: "Organic Bananas", quantity: 2, price: 5.98, image: "🍌" },
    { name: "Fresh Avocados", quantity: 1, price: 4.99, image: "🥑" },
    { name: "Whole Milk", quantity: 1, price: 3.49, image: "🥛" },
  ],
  timeline: [
    { status: "Order Placed", time: "12:15 PM", completed: true, icon: Check },
    { status: "Order Confirmed", time: "12:18 PM", completed: true, icon: Check },
    { status: "Preparing", time: "12:25 PM", completed: true, icon: Package },
    { status: "Ready for Pickup", time: "1:45 PM", completed: true, icon: Package },
    { status: "Out for Delivery", time: "2:10 PM", completed: true, icon: Truck, active: true },
    { status: "Delivered", time: "Estimated 2:30 PM", completed: false, icon: Home },
  ],
};

export default function TrackOrderPage() {
  const [tipAmount, setTipAmount] = useState<number | null>(5);
  const customTip = 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2 text-green-600">
              <ChevronLeft className="w-5 h-5" />
              <span className="font-semibold">Back to Home</span>
            </Link>
            <span className="text-lg font-bold text-green-600">Grover</span>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Tracking */}
          <div className="lg:col-span-2 space-y-6">
            {/* Status Header */}
            <div className="bg-green-600 text-white rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <Truck className="w-6 h-6" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">Out for Delivery</h1>
                  <p className="text-green-100">Your order is on the way!</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-green-100">
                <Clock className="w-5 h-5" />
                <span>Estimated arrival: {orderStatus.estimatedArrival}</span>
              </div>
            </div>

            {/* Map Placeholder */}
            <div className="bg-gray-200 rounded-2xl h-80 flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-green-100 to-blue-100" />
              <div className="relative text-center">
                <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Truck className="w-8 h-8 text-white" />
                </div>
                <p className="font-medium text-gray-700">Live tracking map</p>
                <p className="text-sm text-gray-500">Driver is 0.8 miles away</p>
              </div>
              {/* Simulated route */}
              <div className="absolute bottom-4 left-4 right-4 bg-white rounded-xl p-4 shadow-lg">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">123 Main Street, Apt 4B</p>
                    <p className="text-sm text-gray-500">New York, NY 10001</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">8 min</p>
                    <p className="text-sm text-gray-500">0.8 mi</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Driver Info */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="font-bold text-lg mb-4">Your Delivery Partner</h2>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center text-3xl">
                  👤
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{orderStatus.driver.name}</h3>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      {orderStatus.driver.rating}
                    </span>
                    <span>{orderStatus.driver.deliveries.toLocaleString()} deliveries</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">{orderStatus.driver.vehicle}</p>
                </div>
                <div className="flex gap-2">
                  <button className="p-3 bg-green-100 rounded-full hover:bg-green-200">
                    <Phone className="w-5 h-5 text-green-600" />
                  </button>
                  <button className="p-3 bg-gray-100 rounded-full hover:bg-gray-200">
                    <MessageSquare className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="font-bold text-lg mb-6">Order Status</h2>
              <div className="space-y-6">
                {orderStatus.timeline.map((step, idx) => (
                  <div key={idx} className="flex gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                      step.completed
                        ? step.active
                          ? "bg-green-600 text-white"
                          : "bg-green-100 text-green-600"
                        : "bg-gray-100 text-gray-400"
                    }`}>
                      <step.icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className={`font-medium ${step.active ? "text-green-600" : ""}`}>
                          {step.status}
                        </h3>
                        <span className="text-sm text-gray-500">{step.time}</span>
                      </div>
                      {step.active && (
                        <p className="text-sm text-gray-600 mt-1">
                          Your order is on its way to you
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tip Driver */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="font-bold text-lg mb-4">Tip Your Driver</h2>
              <p className="text-gray-600 text-sm mb-4">
                100% of tips go to your delivery partner. Tips are optional but appreciated.
              </p>
              <div className="grid grid-cols-4 gap-3 mb-4">
                {[3, 5, 7, 10].map((amount) => (
                  <button
                    key={amount}
                    onClick={() => setTipAmount(amount)}
                    className={`py-3 rounded-xl font-medium ${
                      tipAmount === amount
                        ? "bg-green-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    ${amount}
                  </button>
                ))}
              </div>
              <div className="flex gap-3">
                <input
                  type="number"
                  placeholder="Custom amount"
                  className="flex-1 px-4 py-3 border rounded-xl focus:outline-none focus:border-green-600"
                />
                <button className="px-6 py-3 bg-green-600 text-white font-medium rounded-xl hover:bg-green-700">
                  Add Tip
                </button>
              </div>
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:sticky lg:top-24 h-fit">
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-bold text-lg">Order Details</h2>
                <span className="text-sm text-gray-500">{orderStatus.id}</span>
              </div>
              
              <div className="space-y-4 mb-6">
                {orderStatus.items.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-2xl">
                      {item.image}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{item.name}</p>
                      <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-medium text-sm">${item.price.toFixed(2)}</p>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span>$14.46</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Delivery</span>
                  <span>Free</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Service Fee</span>
                  <span>$2.99</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tax</span>
                  <span>$1.16</span>
                </div>
                <div className="flex justify-between text-lg font-bold pt-4 border-t">
                  <span>Total</span>
                  <span>$18.61</span>
                </div>
              </div>

              <button className="w-full mt-6 py-3 border border-gray-300 rounded-xl font-medium hover:bg-gray-50">
                View Receipt
              </button>
            </div>

            {/* Need Help */}
            <div className="bg-white rounded-2xl p-6 shadow-sm mt-4">
              <h3 className="font-semibold mb-2">Need Help?</h3>
              <p className="text-sm text-gray-600 mb-4">
                Having issues with your delivery? We&apos;re here to help.
              </p>
              <button className="w-full py-3 bg-gray-100 rounded-xl font-medium hover:bg-gray-200">
                Contact Support
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
