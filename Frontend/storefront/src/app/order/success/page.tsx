"use client";

import * as React from "react";
import { Button } from "@vayva/ui";
import { StoreShell } from "@/components/StoreShell";
import { useStore } from "@/context/StoreContext";
import Link from "next/link";
import { CheckCircle, ShoppingBag, ArrowRight } from "@phosphor-icons/react/ssr";
import { motion } from "framer-motion";
import { urls } from "@vayva/shared";

export default function OrderSuccessPage(): React.JSX.Element {
  const { store } = useStore();

  if (!store) return <></>;

  return (
    <StoreShell>
      <div className="max-w-xl mx-auto px-4 py-20 text-center relative">
        {/* Background Sparkles/Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-green-500/10 blur-[80px] rounded-full -z-10" />

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", damping: 15 }}
          className="inline-flex items-center justify-center w-24 h-24 bg-green-50 text-green-600 rounded-[32px] mb-8 shadow-inner border border-green-100"
        >
          <CheckCircle size={48} strokeWidth={1.5} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h1 className="text-4xl font-black text-gray-900 mb-4 tracking-tight">
            Order Confirmed!
          </h1>
          <p className="text-gray-500 mb-10 text-lg leading-relaxed">
            Thank you for your purchase. We've received your order and we'll
            notify you as soon as it's dispatched.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-background/70 backdrop-blur-xl border border-gray-100 p-8 rounded-[32px] mb-10 shadow-xl shadow-gray-200/50 text-left"
        >
          <div className="flex justify-between items-center mb-6">
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                Order Reference
              </p>
              <p className="text-2xl font-mono font-bold text-gray-900 tracking-wider font-bold">
                ORD-77291B
              </p>
            </div>
            <div className="bg-background/40 backdrop-blur-sm px-3 py-1 rounded-full border border-gray-100">
              <span className="text-[10px] font-bold text-gray-500 uppercase">
                Paid
              </span>
            </div>
          </div>

          <div className="space-y-3 pt-6 border-t border-gray-50">
            <p className="text-sm text-gray-500">
              A confirmation email has been sent to your inbox.
            </p>
            <p className="text-sm text-gray-500">
              You can track your order status in real-time below.
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col gap-4"
        >
          <Link href={`/orders?store=${store.slug}`}>
            <Button className="w-full bg-black text-white h-16 rounded-2xl font-bold hover:bg-gray-900 transition-all shadow-lg shadow-black/10 flex items-center justify-center gap-2 group">
              Track Order Status
              <ArrowRight
                size={18}
                className="group-hover:translate-x-1 transition-transform"
              />
            </Button>
          </Link>
          <Link href={`/?store=${store.slug}`}>
            <Button className="w-full bg-background/70 backdrop-blur-xl text-gray-600 h-16 rounded-2xl font-bold hover:bg-white/60 border border-gray-100 transition-all flex items-center justify-center gap-2">
              <ShoppingBag size={18} />
              Continue Shopping
            </Button>
          </Link>
        </motion.div>
        <div className="mt-12 pt-8 border-t border-gray-100 flex flex-col items-center gap-2">
          <p className="text-xs text-gray-500">Powered by Vayva eCommerce</p>
          <a
            href={`${urls.merchantBase()}/start`}
            className="text-xs font-bold text-blue-600 hover:underline"
          >
            Run your own business? Start for free.
          </a>
        </div>
      </div>
    </StoreShell>
  );
}
