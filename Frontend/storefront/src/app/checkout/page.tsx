"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@vayva/ui";
import { useStore } from "@/context/StoreContext";
import { reportError } from "@/lib/error";
import { StorefrontService } from "@/services/storefront.service";
import { getReferralCookie, clearReferralCookie } from "@/components/affiliate/ReferralTracker";
import NextLink from "next/link";
const Link = NextLink;
import { CaretRight as ChevronRightIcon, WarningCircle as AlertCircleIcon } from "@phosphor-icons/react/ssr";
const ChevronRight = ChevronRightIcon;
const AlertCircle = AlertCircleIcon;

export default function CheckoutPage(): React.JSX.Element {
  const { store, cart } = useStore();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [phone, setPhone] = useState("");
  const [deliveryMethod, setDeliveryMethod] = useState<"DELIVERY" | "PICKUP">(
    "DELIVERY",
  );
  const [agreed, setAgreed] = useState(false);

  // Shipping quote state
  const [shippingCost, setShippingCost] = useState<number | null>(null);
  const [shippingLoading, setShippingLoading] = useState(false);
  const [shippingProvider, setShippingProvider] = useState<string>("FLAT_RATE");
  const [shippingEta, setShippingEta] = useState<number | null>(null);
  const quoteAbortRef = useRef<AbortController | null>(null);

  const subtotal = cart.reduce((sum: any, item: any) => sum + item.price * item.quantity,
    0,
  );
  const shipping = deliveryMethod === "DELIVERY" ? (shippingCost ?? 0) : 0;
  const total = subtotal + shipping;

  // Fetch shipping quote when address fields change
  const fetchShippingQuote = useCallback(async () => {
    if (deliveryMethod !== "DELIVERY" || !store?.id) return;
    if (!address.trim() && !city.trim()) {
      setShippingCost(null);
      return;
    }

    // Abort previous request
    quoteAbortRef.current?.abort();
    const controller = new AbortController();
    quoteAbortRef.current = controller;

    setShippingLoading(true);
    try {
      const res = await fetch("/api/shipping/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storeId: store.id,
          deliveryAddress: address,
          deliveryCity: city,
          deliveryState: state,
        }),
        signal: controller.signal,
      });

      if (controller.signal.aborted) return;

      const data = await res.json();
      if (data.success && typeof data.shipping === "number") {
        setShippingCost(data.shipping);
        setShippingProvider(data.provider || "FLAT_RATE");
        setShippingEta(data.etaMinutes || null);
      } else {
        setShippingCost(1500); // Fallback
        setShippingProvider("FLAT_RATE");
      }
    } catch (err: unknown) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      setShippingCost(1500); // Fallback on error
      setShippingProvider("FLAT_RATE");
    } finally {
      if (!controller.signal.aborted) {
        setShippingLoading(false);
      }
    }
  }, [deliveryMethod, store?.id, address, city, state]);

  // Debounce the quote fetch (800ms after user stops typing)
  useEffect(() => {
    if (deliveryMethod !== "DELIVERY") {
      setShippingCost(null);
      setShippingLoading(false);
      return;
    }

    const timer = setTimeout(fetchShippingQuote, 800);
    return () => clearTimeout(timer);
  }, [fetchShippingQuote, deliveryMethod]);

  if (!store) return <></>;

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreed) {
      setError(
        "You must agree to the Refund Policy & Privacy Policy to continue.",
      );
      return;
    }
    setSubmitting(true);
    setError(null);

    try {
      // Get referral code from cookie if available
      const referralCode = getReferralCookie();

      // 1. Create Order
      const orderData = {
        storeId: store.id,
        items: cart.map((item: any) => ({
          id: item.productId,
          quantity: item.quantity,
          metadata: item.variantId ? { variantId: item.variantId } : undefined,
        })),
        customer: {
          email,
          phone,
          note: `${firstName} ${lastName}`.trim()
            ? `${firstName} ${lastName}`.trim() +
              "\n" +
              `${address}, ${city}, ${state}`
            : `${address}, ${city}, ${state}`,
        },
        shippingCost: deliveryMethod === "PICKUP" ? 0 : shippingCost,
        deliveryMethod: deliveryMethod === "PICKUP" ? "pickup" : "delivery",
        paymentMethod: "PAYSTACK",
        referralCode: referralCode || undefined, // Include referral code if present
      };

      const order = await StorefrontService.createOrder(orderData);
      if (!order?.success || !order?.orderId) {
        throw new Error(order?.error || "Failed to create order");
      }

      // Track affiliate conversion if referral code was used
      if (referralCode) {
        try {
          await fetch("/api/affiliate/track-conversion", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              referralCode,
              orderId: order.orderId,
              orderAmount: total,
              customerEmail: email,
            }),
          });
          // Clear the referral cookie after successful conversion tracking
          clearReferralCookie();
        } catch (affiliateError) {
          // Silent fail - don't block checkout if affiliate tracking fails
          console.error("[Checkout] Failed to track affiliate conversion:", affiliateError);
        }
      }

      // 2. Initialize Payment
      const payment: any = await StorefrontService.initializePayment({
        orderId: order.orderId,
        email: email,
        callbackUrl: `${window.location.origin}/order/confirmation?store=${store.slug}&orderId=${order.orderId}`,
      });

      // 3. Clear Cart (or wait for confirmation?)
      // Usually we clear cart after successful payment redirect back,
      // but for simplicity in V1 we clear it now or on success page.
      // Let's clear on success page.

      // 4. Redirect to Paystack
      if (payment.data?.authorizationUrl) {
        window.location.href = payment.data.authorizationUrl;
      } else {
        throw new Error("Payment initialization failed: No URL returned");
      }
    } catch (err: unknown) {
      reportError(err, { scope: "Checkout.submit", app: "storefront" });
      setError(
        err instanceof Error
          ? err.message
          : "An error occurred during checkout. Please try again.",
      );
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background/40 backdrop-blur-sm flex flex-col md:flex-row font-sans">
      {/* Left: Form */}
      <div className="flex-1 bg-background/70 backdrop-blur-xl p-8 md:p-12 lg:p-20 order-2 md:order-1">
        <div className="max-w-xl mx-auto">
          <div className="mb-8">
            <Link
              href={`/?store=${store.slug}`}
              className="text-xl font-bold tracking-tight"
            >
              {store.name}
            </Link>
            <div className="flex items-center gap-2 text-xs text-gray-500 mt-4">
              <Link href={`/cart?store=${store.slug}`}>Cart</Link>
              <ChevronRight size={12} />
              <span className="text-black font-bold">Information</span>
              <ChevronRight size={12} />
              <span>Payment</span>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-lg flex items-center gap-3 text-red-600 text-sm">
              <AlertCircle size={18} />
              {error}
            </div>
          )}

          <form onSubmit={handlePlaceOrder} className="space-y-8">
            <div>
              <h2 className="text-lg font-bold mb-4">Contact</h2>
              <input
                id="checkout-email"
                type="email"
                value={email}
                onChange={(e: any) => setEmail(e.target.value)}
                className="w-full p-3 border border-gray-200 rounded-lg mb-2 focus:ring-1 focus:ring-black outline-none"
                required
              />
            </div>

            <div>
              <h2 className="text-lg font-bold mb-4">Delivery method</h2>
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <div
                  className={`p-4 flex justify-between items-center cursor-pointer border-b border-gray-100 ${deliveryMethod === "DELIVERY" ? "bg-background/40 backdrop-blur-sm" : ""}`}
                  onClick={() => setDeliveryMethod("DELIVERY")}
                >
                  <div className="flex items-center gap-3">
                    <input
                      id="delivery-method-ship"
                      type="radio"
                      checked={deliveryMethod === "DELIVERY"}
                      onChange={() => setDeliveryMethod("DELIVERY")}
                      className="accent-black"
                    />
                    <label
                      htmlFor="delivery-method-ship"
                      className="text-sm cursor-pointer"
                    >
                      Ship to my address
                    </label>
                  </div>
                  <span className="text-sm font-bold">
                    {shippingLoading
                      ? "Calculating..."
                      : shippingCost !== null
                        ? `₦${shippingCost.toLocaleString()}`
                        : "Enter address"}
                  </span>
                </div>
                <div
                  className={`p-4 flex justify-between items-center cursor-pointer ${deliveryMethod === "PICKUP" ? "bg-background/40 backdrop-blur-sm" : ""}`}
                  onClick={() => setDeliveryMethod("PICKUP")}
                >
                  <div className="flex items-center gap-3">
                    <input
                      id="delivery-method-pickup"
                      type="radio"
                      checked={deliveryMethod === "PICKUP"}
                      onChange={() => setDeliveryMethod("PICKUP")}
                      className="accent-black"
                    />
                    <label
                      htmlFor="delivery-method-pickup"
                      className="text-sm cursor-pointer"
                    >
                      Local pickup
                    </label>
                  </div>
                  <span className="text-sm font-bold">Free</span>
                </div>
              </div>
            </div>

            {deliveryMethod === "DELIVERY" && (
              <div>
                <h2 className="text-lg font-bold mb-4">Shipping address</h2>
                <div className="grid grid-cols-2 gap-4">
                  <input
                    id="checkout-first-name"
                    type="text"
                    value={firstName}
                    onChange={(e: any) => setFirstName(e.target.value)}
                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-1 focus:ring-black outline-none"
                    required
                  />
                  <input
                    id="checkout-last-name"
                    type="text"
                    value={lastName}
                    onChange={(e: any) => setLastName(e.target.value)}
                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-1 focus:ring-black outline-none"
                    required
                  />
                </div>
                <input
                  id="checkout-address"
                  type="text"
                  value={address}
                  onChange={(e: any) => setAddress(e.target.value)}
                  className="w-full p-3 border border-gray-200 rounded-lg mt-4 focus:ring-1 focus:ring-black outline-none"
                  required
                />
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <input
                    id="checkout-city"
                    type="text"
                    value={city}
                    onChange={(e: any) => setCity(e.target.value)}
                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-1 focus:ring-black outline-none"
                    required
                  />
                  <input
                    id="checkout-state"
                    type="text"
                    value={state}
                    onChange={(e: any) => setState(e.target.value)}
                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-1 focus:ring-black outline-none"
                    required
                  />
                </div>
                <input
                  id="checkout-phone"
                  type="tel"
                  placeholder="Phone (e.g. 08031234567)"
                  aria-label="Phone number"
                  value={phone}
                  onChange={(e: any) => setPhone(e.target.value)}
                  className="w-full p-3 border border-gray-200 rounded-lg mt-4 focus:ring-1 focus:ring-black outline-none"
                  required
                />
              </div>
            )}

            <div className="pt-6 border-t border-gray-100">
              <div className="flex items-start gap-2 mb-4">
                <input
                  type="checkbox"
                  id="agreed"
                  checked={agreed}
                  onChange={(e: any) => setAgreed(e.target.checked)}
                  className="mt-1 w-4 h-4 rounded border-gray-300 text-black focus:ring-black accent-black"
                />
                <label
                  htmlFor="agreed"
                  className="text-sm text-gray-500 cursor-pointer select-none"
                >
                  I agree to the{" "}
                  <Link
                    href={`/policies/refund-policy?store=${store.slug}`}
                    target="_blank"
                    className="underline text-gray-800"
                  >
                    Refund Policy
                  </Link>{" "}
                  and{" "}
                  <Link
                    href={`/policies/privacy-policy?store=${store.slug}`}
                    target="_blank"
                    className="underline text-gray-800"
                  >
                    Privacy Policy
                  </Link>
                  .
                </label>
              </div>

              <div className="flex items-center justify-between">
                <Link
                  href={`/cart?store=${store.slug}`}
                  className="text-sm text-gray-500 hover:text-black"
                >
                  Return to cart
                </Link>
                <Button
                  type="submit"
                  disabled={submitting || cart.length === 0 || !agreed}
                  className="bg-black text-white px-10 py-5 rounded-lg font-bold text-sm hover:bg-gray-900 transition-all disabled:opacity-50 shadow-lg shadow-black/10"
                >
                  {submitting
                    ? "Preparing your order..."
                    : "Pay Now with Paystack"}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Right: Summary */}
      <div className="w-full md:w-[450px] bg-background/40 backdrop-blur-sm border-l border-gray-200 p-8 md:p-12 order-1 md:order-2">
        <div className="max-w-md mx-auto sticky top-12">
          <div className="space-y-4 mb-8">
            {cart.map((item: any, idx: number) => (
              <div key={idx} className="flex gap-4">
                <div className="w-16 h-16 bg-background/70 backdrop-blur-xl border border-gray-200 rounded-lg relative overflow-hidden">
                  {item.image && (
                    <img
                      src={item.image}
                      alt={item.productName}
                      className="w-full h-full object-cover"
                    />
                  )}
                  <span className="absolute -top-2 -right-2 w-5 h-5 bg-background/40 backdrop-blur-sm0 text-white text-xs flex items-center justify-center rounded-full font-bold">
                    {item.quantity}
                  </span>
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-sm truncate max-w-[150px]">
                    {item.productName}
                  </h4>
                  <p className="text-xs text-gray-400">Qty: {item.quantity}</p>
                </div>
                <span className="font-bold text-sm">
                  ₦{item.price.toLocaleString()}
                </span>
              </div>
            ))}
          </div>

          <div className="space-y-2 py-6 border-t border-gray-200 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Subtotal</span>
              <span className="font-medium">₦{subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">
                Shipping
                {shippingEta && shippingProvider === "KWIK" ? (
                  <span className="text-xs text-gray-400 ml-1">
                    ({shippingEta} min)
                  </span>
                ) : null}
              </span>
              <span className="font-medium">
                {deliveryMethod === "PICKUP"
                  ? "Free"
                  : shippingLoading
                    ? "Calculating..."
                    : shippingCost !== null
                      ? `₦${shipping.toLocaleString()}`
                      : "—"}
              </span>
            </div>
          </div>

          <div className="flex justify-between pt-6 border-t border-gray-200">
            <span className="text-lg font-bold">Total</span>
            <div className="text-right">
              <span className="text-xs text-gray-400 mr-2 uppercase tracking-widest">
                NGN
              </span>
              <span className="text-2xl font-bold">
                ₦{total.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
