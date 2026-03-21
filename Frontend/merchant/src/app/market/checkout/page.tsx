"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MarketShell } from "@/components/market/market-shell";
import { Icon, Button, Input, Badge } from "@vayva/ui";
import { apiJson } from "@/lib/api-client-shared";
import { toast } from "sonner";

interface Cart {
  items: {
    id: string;
    quantity: number;
    product: { name: string; price: number; images: string[] };
  }[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
}

interface Address {
  fullName: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
}

export default function CheckoutPage() {
  const router = useRouter();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [step, setStep] = useState<"shipping" | "payment">("shipping");
  const [address, setAddress] = useState<Address>({
    fullName: "", phone: "", street: "", city: "", state: "", country: "Nigeria", postalCode: "",
  });

  useEffect(() => {
    void fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      const data = await apiJson<Cart>("/api/market/cart");
      if (!data || data.items.length === 0) {
        router.push("/market/cart");
        return;
      }
      setCart(data);
    } catch {
      toast.error("Failed to load cart");
    } finally {
      setLoading(false);
    }
  };

  const placeOrder = async () => {
    if (!address.fullName || !address.phone || !address.street || !address.city) {
      toast.error("Please fill in all required shipping details");
      return;
    }
    try {
      setProcessing(true);
      const result = await apiJson<{ orderId: string; paymentUrl: string }>("/api/market/orders", {
        method: "POST",
        body: JSON.stringify({ shippingAddress: address, paymentMethod: "paystack" }),
      });
      toast.success("Order placed successfully!");
      router.push(`/market/order-confirmation?orderId=${result.orderId}`);
    } catch {
      toast.error("Failed to place order");
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <MarketShell>
        <div className="max-w-4xl mx-auto py-8 px-4">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-100 rounded w-1/4" />
            <div className="h-64 bg-gray-100 rounded" />
          </div>
        </div>
      </MarketShell>
    );
  }

  return (
    <MarketShell>
      <div className="max-w-4xl mx-auto py-8 px-4">
        <h1 className="text-2xl font-bold mb-6">Checkout</h1>
        
        {/* Progress */}
        <div className="flex items-center gap-4 mb-8">
          <div className={`flex items-center gap-2 ${step === "shipping" ? "text-green-500" : "text-gray-500"}`}>
            <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center text-sm font-bold">1</div>
            <span className="font-medium">Shipping</span>
          </div>
          <div className="flex-1 h-px bg-border" />
          <div className={`flex items-center gap-2 ${step === "payment" ? "text-green-500" : "text-gray-500"}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step === "payment" ? "bg-green-500 text-white" : "bg-gray-100"}`}>2</div>
            <span className="font-medium">Payment</span>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            {step === "shipping" ? (
              <div className="space-y-4">
                <h2 className="font-semibold text-lg">Shipping Address</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  <Input placeholder="Full Name *" value={address.fullName} onChange={(e) => setAddress({ ...address, fullName: e.target.value })} />
                  <Input placeholder="Phone Number *" value={address.phone} onChange={(e) => setAddress({ ...address, phone: e.target.value })} />
                </div>
                <Input placeholder="Street Address *" value={address.street} onChange={(e) => setAddress({ ...address, street: e.target.value })} />
                <div className="grid md:grid-cols-2 gap-4">
                  <Input placeholder="City *" value={address.city} onChange={(e) => setAddress({ ...address, city: e.target.value })} />
                  <Input placeholder="State *" value={address.state} onChange={(e) => setAddress({ ...address, state: e.target.value })} />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <Input placeholder="Country" value={address.country} onChange={(e) => setAddress({ ...address, country: e.target.value })} />
                  <Input placeholder="Postal Code" value={address.postalCode} onChange={(e) => setAddress({ ...address, postalCode: e.target.value })} />
                </div>
                <Button className="w-full" onClick={() => setStep("payment")}>Continue to Payment</Button>
              </div>
            ) : (
              <div className="space-y-4">
                <h2 className="font-semibold text-lg">Payment Method</h2>
                <div className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center gap-3 p-3 border rounded-lg bg-green-500/5">
                    <Icon name="CreditCard" size={24} />
                    <div>
                      <p className="font-medium">Pay with Card</p>
                      <p className="text-sm text-gray-500">Secure payment via Paystack</p>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setStep("shipping")}>Back</Button>
                  <Button className="flex-1" onClick={placeOrder} disabled={processing}>
                    {processing ? "Processing..." : `Pay ₦${cart?.total.toLocaleString()}`}
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="border rounded-lg p-4 sticky top-4">
              <h2 className="font-semibold mb-4">Order Summary</h2>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {cart?.items.map((item) => (
                  <div key={item.id} className="flex gap-3">
                    <div className="w-16 h-16 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                      {item.product.images[0] && <img src={item.product.images[0]} alt={item.product.name} className="w-full h-full object-cover" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{item.product.name}</p>
                      <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                      <p className="text-sm">₦{(item.product.price * item.quantity).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="border-t mt-4 pt-4 space-y-2 text-sm">
                <div className="flex justify-between"><span>Subtotal</span><span>₦{cart?.subtotal.toLocaleString()}</span></div>
                <div className="flex justify-between"><span>Shipping</span><span>{cart?.shipping ? `₦${cart?.shipping.toLocaleString()}` : "Free"}</span></div>
                <div className="flex justify-between"><span>Tax</span><span>₦{cart?.tax.toLocaleString()}</span></div>
                <div className="border-t pt-2 flex justify-between font-semibold text-lg">
                  <span>Total</span><span>₦{cart?.total.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MarketShell>
  );
}
