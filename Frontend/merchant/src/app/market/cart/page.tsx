"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { MarketShell } from "@/components/market/market-shell";
import { Icon, Button, Input } from "@vayva/ui";
import { apiJson } from "@/lib/api-client-shared";
import { toast } from "sonner";

interface CartItem {
  id: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    images: string[];
    inStock: boolean;
    seller: {
      id: string;
      name: string;
    };
  };
}

interface Cart {
  id: string;
  items: CartItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  itemCount: number;
}

export default function CartPage() {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const data = await apiJson<Cart>("/market/cart");
      setCart(data);
    } catch (error) {
      toast.error("Failed to load cart");
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    if (quantity < 1) return;
    try {
      await apiJson(`/api/market/cart/items/${itemId}`, {
        method: "PUT",
        body: JSON.stringify({ quantity }),
      });
      void fetchCart();
    } catch {
      toast.error("Failed to update quantity");
    }
  };

  const removeItem = async (itemId: string) => {
    try {
      await apiJson(`/api/market/cart/items/${itemId}`, { method: "DELETE" });
      toast.success("Item removed");
      void fetchCart();
    } catch {
      toast.error("Failed to remove item");
    }
  };

  const clearCart = async () => {
    try {
      await apiJson("/market/cart", { method: "DELETE" });
      toast.success("Cart cleared");
      void fetchCart();
    } catch {
      toast.error("Failed to clear cart");
    }
  };

  if (loading) {
    return (
      <MarketShell>
        <div className="max-w-4xl mx-auto py-8 px-4">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-100 rounded w-1/4" />
            <div className="h-32 bg-gray-100 rounded" />
            <div className="h-32 bg-gray-100 rounded" />
          </div>
        </div>
      </MarketShell>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <MarketShell>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
          <Icon name="ShoppingCart" size={64} className="text-gray-500 mb-6" />
          <h1 className="text-2xl font-bold mb-2">Your cart is empty</h1>
          <p className="text-gray-500 mb-6">Browse the marketplace to discover amazing products</p>
          <Link href="/market">
            <Button>Continue Shopping</Button>
          </Link>
        </div>
      </MarketShell>
    );
  }

  return (
    <MarketShell>
      <div className="max-w-6xl mx-auto py-8 px-4">
        <h1 className="text-2xl font-bold mb-6">Shopping Cart ({cart.itemCount} items)</h1>
        
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cart.items.map((item) => (
              <div key={item.id} className="flex gap-4 p-4 border rounded-lg">
                <Link href={`/market/products/${item.product.slug}`}>
                  <div className="w-24 h-24 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
                    {item.product.images[0] ? (
                      <img src={item.product.images[0]} alt={item.product.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <Icon name="Image" size={24} className="text-gray-500" />
                      </div>
                    )}
                  </div>
                </Link>
                <div className="flex-1 min-w-0">
                  <Link href={`/market/products/${item.product.slug}`}>
                    <h3 className="font-medium hover:text-green-500 transition-colors">{item.product.name}</h3>
                  </Link>
                  <p className="text-sm text-gray-500">by {item.product.seller.name}</p>
                  <p className="font-semibold mt-1">₦{item.product.price.toLocaleString()}</p>
                  {!item.product.inStock && (
                    <p className="text-xs text-red-500 mt-1">Out of stock</p>
                  )}
                  <div className="flex items-center gap-2 mt-3">
                    <Button size="sm" variant="outline" onClick={() => updateQuantity(item.id, item.quantity - 1)}>-</Button>
                    <Input type="number" value={item.quantity} onChange={(e) => updateQuantity(item.id, parseInt(e.target.value) || 1)} className="w-16 text-center" />
                    <Button size="sm" variant="outline" onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</Button>
                    <Button size="sm" variant="ghost" className="text-red-500 ml-auto" onClick={() => removeItem(item.id)}>
                      <Icon name="Trash2" size={16} />
                    </Button>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold">₦{(item.product.price * item.quantity).toLocaleString()}</p>
                </div>
              </div>
            ))}
            
            <Button variant="outline" onClick={clearCart} className="w-full">
              <Icon name="Trash" size={16} className="mr-2" /> Clear Cart
            </Button>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="border rounded-lg p-4 sticky top-4">
              <h2 className="font-semibold mb-4">Order Summary</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>₦{cart.subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>{cart.shipping > 0 ? `₦${cart.shipping.toLocaleString()}` : "Free"}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax</span>
                  <span>₦{cart.tax.toLocaleString()}</span>
                </div>
                <div className="border-t pt-2 flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span>₦{cart.total.toLocaleString()}</span>
                </div>
              </div>
              <Link href="/market/checkout">
                <Button className="w-full mt-4">Proceed to Checkout</Button>
              </Link>
              <Link href="/market">
                <Button variant="outline" className="w-full mt-2">Continue Shopping</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </MarketShell>
  );
}
