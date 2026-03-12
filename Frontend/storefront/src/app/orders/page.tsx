"use client";

import React, { useState } from "react";
import { Button } from "@vayva/ui";
import { StoreShell } from "@/components/StoreShell";
import { useStore } from "@/context/StoreContext";
import { StorefrontService } from "@/services/storefront.service";
import { PublicOrder } from "@/types/storefront";

export default function OrderStatusPage(): React.JSX.Element {
  const { store } = useStore();
  const [ref, setRef] = useState("");
  const [phone, setPhone] = useState("");
  const [order, setOrder] = useState<PublicOrder | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!store) return <></>;

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setOrder(null);

    try {
      const result = await StorefrontService.getOrderStatus(ref, phone);
      if (result) {
        setOrder(result);
      } else {
        setError(
          "Order not found. Please check your reference and phone number.",
        );
      }
    } catch {
      setError("An error occurred. Please try again.");
    }
    setLoading(false);
  };

  return (
    <StoreShell>
      <div className="max-w-xl mx-auto px-4 py-20">
        <h1 className="text-3xl font-bold mb-8 text-center">Track Order</h1>

        <form
          onSubmit={handleSearch}
          className="bg-background/40 backdrop-blur-sm p-8 rounded-xl mb-12"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold mb-2">
                Order Reference
              </label>
              <input
                type="text"
                value={ref}
                onChange={(e: any) => setRef(e.target.value)}
                placeholder="e.g. ORD-12345"
                className="w-full p-3 border border-gray-200 rounded-lg outline-none focus:ring-1 focus:ring-black"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-bold mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e: any) => setPhone(e.target.value)}
                placeholder="e.g. +234..."
                className="w-full p-3 border border-gray-200 rounded-lg outline-none focus:ring-1 focus:ring-black"
                required
              />
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white py-4 rounded-lg font-bold hover:bg-gray-900 transition-colors disabled:opacity-50"
            >
              {loading ? "Searching..." : "Track Order"}
            </Button>
          </div>
          {error && (
            <p className="text-red-500 text-sm mt-4 text-center">{error}</p>
          )}
        </form>

        {order && (
          <div className="border border-gray-200 rounded-xl p-8">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-xl font-bold">Order {order.refCode}</h2>
              </div>
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-bold uppercase">
                {order.status}
              </span>
            </div>

            <div className="space-y-4">
              {order.items?.map((item: any, idx: number) => (
                <div key={idx} className="flex justify-between text-sm">
                  <span>
                    {item.quantity}x {item.title}
                  </span>
                  <span className="font-bold">
                    ₦{Number(item.price).toLocaleString()}
                  </span>
                </div>
              ))}
              <div className="pt-4 border-t border-gray-100 flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>₦{Number(order.total).toLocaleString()}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </StoreShell>
  );
}
