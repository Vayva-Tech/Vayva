"use client";

import React from "react";
import { Button } from "@vayva/ui";
import { StoreShell } from "@/components/StoreShell";
import { useStore } from "@/context/StoreContext";
import NextLink from "next/link";
const Link = NextLink;

export default function CartPage(): React.JSX.Element {
  const { store, cart, removeFromCart } = useStore();

  const subtotal = cart.reduce((sum: any, item: any) => sum + item.price * item.quantity,
    0,
  );

  if (!store) return <></>;

  return (
    <StoreShell>
      <div className="max-w-3xl mx-auto px-4 py-20">
        <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>

        {cart.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-8">Your cart is currently empty.</p>
            <Link href={`/collections/all?store=${store.slug}`}>
              <Button className="bg-black text-white px-8 py-4 rounded-full font-bold text-sm tracking-wide hover:bg-gray-900 transition-colors">
                Continue Shopping
              </Button>
            </Link>
          </div>
        ) : (
          <div>
            <div className="space-y-6 mb-8">
              {cart.map((item: any, idx: number) => (
                <div
                  key={idx}
                  className="flex gap-4 border-b border-gray-100 pb-6 last:border-0"
                >
                  <div className="w-24 h-32 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                    {item.image && (
                      <img
                        src={item.image}
                        alt={item.productName}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold">{item.productName}</h3>
                      <span className="font-bold">
                        ₦{(item.price * item.quantity).toLocaleString()}
                      </span>
                    </div>
                    <div className="text-sm text-gray-500 mb-4">
                      Quantity: {item.quantity}
                    </div>
                    <Button
                      onClick={() => removeFromCart(item.productId)}
                      className="text-xs text-red-500 underline hover:text-red-600"
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-200 pt-8">
              <div className="flex justify-between text-lg font-bold mb-8">
                <span>Subtotal</span>
                <span>₦{subtotal.toLocaleString()}</span>
              </div>
              <Link href={`/checkout?store=${store.slug}`}>
                <Button className="w-full bg-black text-white py-4 rounded-full font-bold hover:bg-gray-900 transition-colors">
                  Proceed to Checkout
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </StoreShell>
  );
}
