"use client";

import React, { useState, Suspense } from "react";
import { Button } from "@vayva/ui";
import { useSearchParams } from "next/navigation";
import { StorefrontService } from "@/services/storefront.service";
import { StoreShell } from "@/components/StoreShell";
import { MagnifyingGlass as SearchIcon, Package as PackageIcon, Clock as ClockIcon, CheckCircle as CheckCircleIcon, Truck as TruckIcon, WarningCircle as AlertCircleIcon, Phone as PhoneIcon } from "@phosphor-icons/react/ssr";
const Search = SearchIcon;
const Package = PackageIcon;
const Clock = ClockIcon;
const CheckCircle = CheckCircleIcon;
const Truck = TruckIcon;
const AlertCircle = AlertCircleIcon;
const Phone = PhoneIcon;

function OrderStatusContent(): React.JSX.Element {
  const searchParams = useSearchParams();

  const [ref, setRef] = useState(searchParams.get("ref") || "");
  const [phone, setPhone] = useState(searchParams.get("phone") || "");
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLookup = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!ref) return;
    if (!phone) {
      setError("Enter the phone number used at checkout to view this order.");
      return;
    }

    setLoading(true);
    setError(null);
    setOrder(null);

    try {
      const data = await StorefrontService.getOrderStatus(ref, phone);
      if (data) {
        setOrder(data);
      } else {
        setError(
          "No order found with these details. Please check and try again.",
        );
      }
    } catch {
      setError("An error occurred during lookup.");
    } finally {
      setLoading(false);
    }
  };

  // Auto-lookup if params exist
  React.useEffect(() => {
    if (searchParams.get("ref") && searchParams.get("phone")) {
      handleLookup();
    }
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "PAID":
        return <CheckCircle className="text-green-500" />;
      case "PENDING_PAYMENT":
        return <Clock className="text-orange-500" />;
      case "SHIPPED":
        return <Truck className="text-blue-500" />;
      default:
        return <Package className="text-gray-400" />;
    }
  };

  return (
    <StoreShell>
      <div className="max-w-2xl mx-auto px-4 py-12 lg:py-20 font-sans">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold tracking-tight mb-4">
            Track Your Order
          </h1>
          <p className="text-gray-500">
            Enter your order reference and phone number to see the current
            status.
          </p>
        </div>

        <div className="bg-background/70 backdrop-blur-xl p-8 rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/50 mb-12">
          <form onSubmit={handleLookup} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label
                  htmlFor="order-ref"
                  className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-1"
                >
                  Order Reference
                </label>
                <input
                  id="order-ref"
                  value={ref}
                  onChange={(e: any) => setRef(e.target.value.toUpperCase())}
                  className="w-full p-4 bg-background/40 backdrop-blur-sm border border-gray-100 rounded-xl focus:ring-1 focus:ring-black outline-none transition-all"
                  placeholder="VVA-XXXXX"
                  required
                />
              </div>
              <div className="space-y-2">
                <label
                  htmlFor="order-phone"
                  className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-1"
                >
                  Phone Number
                </label>
                <input
                  id="order-phone"
                  value={phone}
                  onChange={(e: any) => setPhone(e.target.value)}
                  className="w-full p-4 bg-background/40 backdrop-blur-sm border border-gray-100 rounded-xl focus:ring-1 focus:ring-black outline-none transition-all"
                  placeholder="080XXXXXXXX"
                  required
                />
              </div>
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-gray-900 transition-all disabled:opacity-50"
            >
              {loading ? (
                "Searching..."
              ) : (
                <>
                  <Search size={18} /> Track Order
                </>
              )}
            </Button>
          </form>

          {error && (
            <div className="mt-6 p-4 bg-red-50 text-red-600 rounded-xl flex items-center gap-3 text-sm animate-in fade-in slide-in-from-top-2">
              <AlertCircle size={18} />
              {error}
            </div>
          )}
        </div>

        {order && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="p-8 bg-black text-white rounded-3xl overflow-hidden relative">
              <div className="absolute top-0 right-0 p-8 opacity-10">
                <Package size={120} />
              </div>
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <p className="text-xs opacity-60 uppercase tracking-widest font-bold mb-1">
                      Status
                    </p>
                    <h2 className="text-2xl font-bold">
                      {order.status.replace("_", " ")}
                    </h2>
                  </div>
                  <div className="text-right">
                    <p className="text-xs opacity-60 uppercase tracking-widest font-bold mb-1">
                      Ref
                    </p>
                    <h2 className="text-2xl font-bold">{order.refCode}</h2>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle
                    size={16}
                    className={
                      order.paymentStatus === "SUCCESS"
                        ? "text-green-400"
                        : "text-gray-500"
                    }
                  />
                  <span>Payment {order.paymentStatus.toLowerCase()}</span>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="font-bold text-lg px-2">Timeline</h3>
              <div className="space-y-8 relative before:absolute before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-100">
                {order.timeline?.map((event: any, idx: number) => (
                  <div key={idx} className="flex gap-6 relative">
                    <div
                      className={`w-8 h-8 rounded-full border-4 border-white flex items-center justify-center z-10 shadow-sm ${idx === 0 ? "bg-black text-white scale-110" : "bg-gray-200 text-gray-400"}`}
                    >
                      {getStatusIcon(event.type)}
                    </div>
                    <div>
                      <p
                        className={`font-bold text-sm ${idx === 0 ? "text-black" : "text-gray-500"}`}
                      >
                        {event.text}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(event.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-6 border border-gray-100 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-background/40 backdrop-blur-sm rounded-full flex items-center justify-center">
                  <Phone size={18} className="text-gray-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">
                    Need help with this order?
                  </p>
                  <p className="text-sm font-bold">Contact Support</p>
                </div>
              </div>
              <a
                href={`https://wa.me/2348001234567?text=Hi, status update for ${order.refCode}`}
                target="_blank"
                className="text-sm font-bold text-black border-b border-black"
                rel="noreferrer"
              >
                WhatsApp
              </a>
            </div>
          </div>
        )}
      </div>
    </StoreShell>
  );
}

export default function OrderStatusPage(): React.JSX.Element {
  return (
    <Suspense
      fallback={<div className="p-20 text-center">Loading status...</div>}
    >
      <OrderStatusContent />
    </Suspense>
  );
}
