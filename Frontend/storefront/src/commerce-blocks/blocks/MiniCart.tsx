"use client";

import React, { useState } from "react";
import NextLink from "next/link";
import { useStore } from "@/context/StoreContext";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@vayva/ui";

export default function MiniCart() {
  const { cart, removeFromCart } = useStore();
  const [isOpen, setIsOpen] = useState(false);

  const totalItems = cart.reduce((sum: any, item: any) => sum + item.quantity, 0);
  const subtotal = cart.reduce((sum: any, item: any) => sum + item.price * item.quantity,
    0,
  );

  return (
    <div className="relative">
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-3 rounded-2xl bg-white shadow-xl border border-border/40 hover:bg-primary/5 hover:text-primary transition-all group"
        aria-label={isOpen ? "Close cart" : "Open cart"}
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
          />
        </svg>
        {totalItems > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-white text-[10px] font-black flex items-center justify-center rounded-full shadow-lg border-2 border-white animate-in zoom-in duration-300">
            {totalItems}
          </span>
        )}
      </Button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-40 bg-black/5"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="absolute right-0 top-full mt-4 w-80 bg-white border border-border/40 rounded-[32px] shadow-2xl overflow-hidden z-50 flex flex-col"
            >
              <div className="p-6 border-b border-border/40 flex items-center justify-between">
                <h3 className="text-sm font-black uppercase tracking-widest text-text-primary">
                  Your Cart
                </h3>
                <span className="text-[10px] font-bold text-text-tertiary">
                  {totalItems} Items
                </span>
              </div>

              <div className="max-h-80 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                {cart.length === 0 ? (
                  <div className="py-12 text-center space-y-3">
                    <div className="w-12 h-12 bg-white/40 rounded-full flex items-center justify-center mx-auto opacity-50">
                      <svg
                        className="w-6 h-6 text-text-tertiary"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                        />
                      </svg>
                    </div>
                    <p className="text-xs font-bold text-text-tertiary uppercase">
                      Cart is empty
                    </p>
                  </div>
                ) : (
                  cart.map((item: any) => (
                    <div
                      key={`${item.productId}-${item.variantId}`}
                      className="flex gap-4 group/item"
                    >
                      <div className="w-16 h-16 bg-white/40 rounded-xl overflow-hidden shrink-0 border border-border/20">
                        {item.image && (
                          <img
                            src={item.image}
                            alt={item.productName}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                      <div className="flex-1 min-w-0 py-1">
                        <p className="text-[11px] font-bold text-text-primary truncate">
                          {item.productName}
                        </p>
                        <p className="text-[10px] font-medium text-text-tertiary mt-0.5">
                          Qty: {item.quantity}
                        </p>
                        <p className="text-xs font-black text-primary mt-1">
                          ₦{item.price.toLocaleString()}
                        </p>
                      </div>
                      <Button
                        onClick={() => removeFromCart(item.productId)}
                        className="p-2 text-text-tertiary hover:text-red-500 opacity-0 group-hover/item:opacity-100 transition-all"
                        aria-label={`Remove ${item.productName} from cart`}
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h14"
                          />
                        </svg>
                      </Button>
                    </div>
                  ))
                )}
              </div>

              {cart.length > 0 && (
                <div className="p-6 bg-white/30 border-t border-border/40 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-widest text-text-tertiary">
                      Subtotal
                    </span>
                    <span className="text-sm font-black text-text-primary">
                      ₦{subtotal.toLocaleString()}
                    </span>
                  </div>
                  <NextLink
                    href="/checkout"
                    className="flex items-center justify-center w-full h-12 bg-primary text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] shadow-lg shadow-primary/20 hover:bg-primary-hover active:scale-[0.98] transition-all"
                  >
                    Checkout
                  </NextLink>
                  <NextLink
                    href="/cart"
                    className="block text-center text-[10px] font-bold text-text-tertiary hover:text-text-primary transition-colors uppercase tracking-widest"
                  >
                    View Full Cart
                  </NextLink>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
