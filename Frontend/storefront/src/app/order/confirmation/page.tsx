"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { StoreShell } from "@/components/StoreShell";
import { CheckCircle as CheckCircleIcon, Clock as ClockIcon, XCircle as XCircleIcon, CaretRight as ChevronRightIcon, Package as PackageIcon, MapPin as MapPinIcon, Phone as PhoneIcon } from "@phosphor-icons/react/ssr";
const CheckCircle = CheckCircleIcon;
const Clock = ClockIcon;
const XCircle = XCircleIcon;
const ChevronRight = ChevronRightIcon;
const Package = PackageIcon;
const MapPin = MapPinIcon;
const Phone = PhoneIcon;
import NextLink from "next/link";
const Link = NextLink;

function OrderConfirmationContent(): React.JSX.Element {
  const searchParams = useSearchParams();
  const reference = searchParams.get("reference");
  const orderId = searchParams.get("orderId"); // We might have orderId or reference
  const storeSlug = searchParams.get("store");

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [_error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!reference && !orderId) {
        setLoading(false);
        return;
      }

      try {
        const params = new URLSearchParams();
        if (orderId) params.set("orderId", orderId);
        if (reference) params.set("reference", reference);
        const response = await fetch(`/api/orders/status?${params.toString()}`);
        if (response.ok) {
          setOrder(await response.json());
        } else {
          setError("Order not found");
        }
      } catch {
        setError("Failed to load order details");
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [reference, orderId]);

  if (loading)
    return <div className="py-20 text-center">Verifying your payment...</div>;

  if (!order) {
    return (
      <StoreShell>
        <div className="max-w-2xl mx-auto px-4 py-20 text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-6" />
          <h1 className="text-3xl font-bold mb-4">Order Not Found</h1>
          <p className="text-gray-500 mb-8">
            We couldn't find the order you're looking for. If you just paid, it
            might take a moment to reflect.
          </p>
          <Link
            href={`/?store=${storeSlug}`}
            className="bg-black text-white px-8 py-4 rounded-lg font-bold"
          >
            Return Home
          </Link>
        </div>
      </StoreShell>
    );
  }

  const isPaid = order.paymentStatus === "SUCCESS" || order.status === "PAID";
  const deliveryMethod = String(order.deliveryMethod || "").toLowerCase();
  const isPickup = deliveryMethod.includes("pickup");

  return (
    <StoreShell>
      <div className="max-w-3xl mx-auto px-4 py-12 lg:py-20 font-sans">
        {/* Header Section */}
        <div className="mb-12">
          <div className="flex items-center gap-2 text-xs text-gray-500 mb-6">
            <span>Cart</span> <ChevronRight size={12} />{" "}
            <span>Information</span> <ChevronRight size={12} />{" "}
            <span className="text-black font-bold">Confirmation</span>
          </div>

          <div className="flex items-start gap-4">
            {isPaid ? (
              <div className="w-12 h-12 bg-green-50 text-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                <CheckCircle size={24} />
              </div>
            ) : (
              <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-full flex items-center justify-center flex-shrink-0">
                <Clock size={24} />
              </div>
            )}
            <div>
              <p className="text-sm text-gray-500 uppercase tracking-widest font-bold mb-1">
                Order {order.refCode}
              </p>
              <h1 className="text-3xl font-bold tracking-tight">
                {isPaid
                  ? "Thank you for your purchase!"
                  : "Order is pending payment"}
              </h1>
              <p className="text-gray-500 mt-2">
                {isPaid
                  ? `We've received your order and we're getting it ready.`
                  : "Your payment is being processed. Refresh this page in a moment to see the updated status."}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Order Details */}
          <div className="space-y-8">
            <div className="p-6 bg-background/40 backdrop-blur-sm rounded-2xl border border-gray-100">
              <h2 className="font-bold mb-4 flex items-center gap-2">
                <Package size={18} />
                Order Details
              </h2>
              <div className="space-y-4">
                {order.items?.map((item: any, idx: number) => (
                  <div key={idx} className="flex justify-between text-sm">
                    <span className="text-gray-600">
                      {item.title} x {item.quantity}
                    </span>
                    <span className="font-medium text-black">
                      ₦{Number(item.price).toLocaleString()}
                    </span>
                  </div>
                ))}
                <div className="pt-4 border-t border-gray-200 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Subtotal</span>
                    <span>₦{Number(order.subtotal).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Shipping</span>
                    <span>₦{Number(order.shippingTotal).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold pt-2">
                    <span>Total</span>
                    <span>₦{Number(order.total).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 bg-background/70 backdrop-blur-xl rounded-2xl border border-gray-100 shadow-sm">
              <h2 className="font-bold mb-4 flex items-center gap-2">
                <MapPin size={18} />
                {isPickup ? "Pickup Location" : "Shipping Address"}
              </h2>
              <p className="text-sm text-gray-600 leading-relaxed">
                {isPickup
                  ? "Pickup details will be shared by the merchant."
                  : order.customer?.note || "Address not listed"}
              </p>
            </div>
          </div>

          {/* Next Steps */}
          <div className="space-y-8">
            <div className="p-6 bg-black text-white rounded-3xl shadow-xl shadow-black/10">
              <h2 className="font-bold text-lg mb-4">What's next?</h2>
              <ul className="space-y-4 text-sm opacity-90">
                <li className="flex gap-3">
                  <div className="w-5 h-5 bg-background/70 backdrop-blur-xl rounded-full flex items-center justify-center text-[10px] font-bold mt-0.5">
                    1
                  </div>
                  <span>
                    You'll receive a confirmation email with your receipt
                    shortly.
                  </span>
                </li>
                <li className="flex gap-3">
                  <div className="w-5 h-5 bg-background/70 backdrop-blur-xl rounded-full flex items-center justify-center text-[10px] font-bold mt-0.5">
                    2
                  </div>
                  <span>
                    {isPickup
                      ? "We will notify you when your order is ready for pickup."
                      : "Once shipped, we'll send you a tracking number via WhatsApp."}
                  </span>
                </li>
              </ul>

              <div className="mt-8 pt-8 border-t border-white/10">
                <Link
                  href={`/order/status?ref=${order.refCode}&store=${storeSlug}`}
                  className="w-full bg-background/70 backdrop-blur-xl text-black py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-gray-100 transition-colors"
                >
                  Track Your Order
                </Link>
              </div>
            </div>

            <div className="p-6 border border-gray-100 rounded-2xl">
              <h2 className="font-bold mb-4 flex items-center gap-2">
                <Phone size={18} />
                Need help?
              </h2>
              <p className="text-sm text-gray-500 mb-4">
                If you have any questions about your order, feel free to reach
                out to us.
              </p>
              <a
                href={`https://wa.me/2348001234567?text=Hi, I have a question about my order ${order.refCode}`}
                target="_blank"
                className="text-sm font-bold text-green-600 underline"
                rel="noreferrer"
              >
                Chat with us on WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>
    </StoreShell>
  );
}

export default function OrderConfirmationPage(): React.JSX.Element {
  return (
    <Suspense
      fallback={<div className="p-20 text-center">Loading confirmation...</div>}
    >
      <OrderConfirmationContent />
    </Suspense>
  );
}
