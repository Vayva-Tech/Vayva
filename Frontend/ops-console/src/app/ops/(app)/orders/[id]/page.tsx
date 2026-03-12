"use client";

interface OrderItem {
  id: string;
  title: string;
  quantity: number;
  price: number | { toNumber(): number };
}

interface OrderEvent {
  id: string;
  event: string;
  createdAt: string;
}

interface Order {
  id: string;
  orderNumber?: string;
  items: OrderItem[];
  OrderEvent?: OrderEvent[];
  total: number;
  status: string;
  storeId?: string;
  store?: { name: string };
  user: {
    email: string;
    firstName: string;
    lastName: string;
    mobileNumber?: string;
  };
  address?: {
    line1: string;
    city: string;
    state: string;
    postalCode?: string;
  };
  paymentMethod?: string;
  paymentStatus?: string;
  shipment?: {
    partner?: string;
    trackingNumber?: string;
    status?: string;
    estimatedDeliveryAt?: string;
  };
  createdAt: string;
  updatedAt?: string;
  Customer?: {
    user: {
      firstName: string;
      lastName: string;
      email: string;
      mobileNumber?: string;
    };
  };
  customerEmail?: string;
  customerPhone?: string;
  PaymentTransaction?: { id: string; status: string; amount: number; reference?: string }[];
  fulfillmentStatus?: string;
  Shipment?: {
    id: string;
    partner?: string;
    trackingNumber?: string;
    status?: string;
    estimatedDeliveryAt?: string;
    addressLine1?: string;
    addressCity?: string;
  }[];
}

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Package as Box, User, CreditCard, Truck, ClockCounterClockwise as History, Calendar, MapPin, ArrowCounterClockwise as RefreshCw } from "@phosphor-icons/react/ssr";
import { Button } from "@vayva/ui";
import { OpsPageShell } from "@/components/ops/OpsPageShell";

export default function OrderDetailPage(): React.JSX.Element {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    try {
      const res = await fetch(`/api/ops/orders/${id}`);
      if (res.status === 401) { window.location.href = "/ops/login"; return; }
      if (!res.ok) throw new Error("Failed to load order");
      const json = await res.json();
      setOrder(json.data);
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : String(err) || "An unknown error occurred",
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="p-8">
        <div className="bg-red-50 text-red-700 p-4 rounded-lg">
          Error: {error || "Order not found"}
        </div>
        <Button
          onClick={() => router.back()}
          variant="link"
          className="mt-4 text-indigo-600 hover:underline p-0 h-auto"
        >
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <OpsPageShell
      title={`Order #${order.orderNumber}`}
      description={`Placed on ${new Date(order.createdAt).toLocaleString()} via ${order.store?.name}`}
      headerActions={
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => fetchOrder()}
            className="rounded-full h-10 w-10"
            aria-label="Refresh order"
          >
            <RefreshCw className={`h-5 w-5 ${loading ? "animate-spin" : ""}`} />
          </Button>
          <Link
            href={`/ops/merchants/${order.storeId}?tab=orders&orderId=${order.id}`}
            className="px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100"
          >
            View in Merchant Context
          </Link>
        </div>
      }
    >
      <div className="max-w-7xl mx-auto space-y-6">

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Items Card */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <Box size={18} />
                Order Items
              </h3>
              <span className="text-sm text-gray-500">
                {order.items?.length || 0} items
              </span>
            </div>
            <div className="divide-y divide-gray-100">
              {order.items?.map((item: OrderItem) => (
                <div
                  key={item.id}
                  className="px-6 py-4 flex justify-between items-center hover:bg-gray-50"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
                      <Box size={20} />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {item.title}
                      </p>
                      <p className="text-sm text-gray-500">
                        Qty: {item.quantity}
                      </p>
                    </div>
                  </div>
                  <p className="font-medium text-gray-900">
                    ₦{Number(item.price).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end">
              <div className="text-right">
                <p className="text-sm text-gray-500">Total</p>
                <p className="text-xl font-bold text-gray-900">
                  ₦{Number(order.total).toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <History size={18} />
                Timeline
              </h3>
            </div>
            <div className="p-6">
              <ul className="space-y-6 border-l-2 border-gray-100 ml-3 pl-6 relative">
                {order.OrderEvent?.map((evt, idx) => (
                  <li key={idx} className="relative">
                    <div className="absolute -left-[2.15rem] mt-1.5 h-3 w-3 rounded-full bg-gray-300 ring-4 ring-white"></div>
                    <p className="text-sm font-medium text-gray-900">
                      {evt.event}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {new Date(evt.createdAt).toLocaleString()}
                    </p>
                  </li>
                ))}
                {/* Creation Event (Implicit) */}
                <li className="relative">
                  <div className="absolute -left-[2.15rem] mt-1.5 h-3 w-3 rounded-full bg-indigo-500 ring-4 ring-white"></div>
                  <p className="text-sm font-medium text-gray-900">
                    Order Created
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {new Date(order.createdAt).toLocaleString()}
                  </p>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Sidebar Column */}
        <div className="space-y-6">
          {/* Customer */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <User size={18} /> Customer
            </h3>
            {order.Customer ? (
              <div className="space-y-2">
                <p className="font-medium">
                  {order?.Customer?.user.firstName} {order?.Customer?.user.lastName}
                </p>
                <p className="text-sm text-gray-500">{order?.Customer?.user.email}</p>
                <p className="text-sm text-gray-500">
                  {order?.Customer?.user.mobileNumber || "N/A"}
                </p>
              </div>
            ) : (
              <p className="text-sm text-gray-400 italic">No customer linked</p>
            )}
            <div className="mt-4 pt-4 border-t border-gray-100">
              <h4 className="text-xs font-semibold text-gray-500 uppercase">
                Input Details
              </h4>
              <p className="text-sm mt-1">{order.customerEmail || "N/A"}</p>
              <p className="text-sm">{order.customerPhone || "N/A"}</p>
            </div>
          </div>

          {/* Payment */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <CreditCard size={18} /> Payment
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Status</span>
                <span
                  className={`font-medium ${order.paymentStatus === "SUCCESS" ? "text-green-600" : "text-amber-600"}`}
                >
                  {order.paymentStatus}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Method</span>
                <span className="font-medium text-gray-900 capitalize">
                  {order.paymentMethod?.replace("_", " ")}
                </span>
              </div>
              {order.PaymentTransaction?.[0] && (
                <div className="pt-3 border-t border-gray-100">
                  <p className="text-xs text-gray-400">Transaction Ref</p>
                  <p className="text-xs font-mono bg-gray-100 px-2 py-1 rounded mt-1 truncate">
                    {order.PaymentTransaction[0].reference}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Delivery */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Truck size={18} /> Delivery
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Status</span>
                <span className="font-medium text-gray-900">
                  {order.fulfillmentStatus}
                </span>
              </div>
              {order.Shipment && order.Shipment[0] && (
                <>
                  <div className="pt-3 border-t border-gray-100">
                    <p className="text-xs text-gray-400 mb-1">
                      Shipping Address
                    </p>
                    <div className="flex gap-2 text-sm text-gray-600">
                      <MapPin size={16} className="shrink-0 mt-0.5" />
                      <div>
                        <p>{order.Shipment[0].addressLine1}</p>
                        <p>{order.Shipment[0].addressCity}</p>
                      </div>
                    </div>
                  </div>
                  <div className="pt-3">
                    <Link
                      href={`/ops/deliveries/${order.Shipment[0].id}`} // Future Proof
                      className="text-indigo-600 text-sm hover:underline"
                    >
                      View Shipment
                    </Link>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      </div>
    </OpsPageShell>
  );
}
