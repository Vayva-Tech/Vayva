"use client";

import { useEffect, useState } from "react";
import { StorefrontService } from "@/services/storefront.service";
import { Lightning as Zap, Clock } from "@phosphor-icons/react/ssr";
import Link from "next/link";

export function FlashSaleBanner({
  storeId,
}: {
  storeId: string;
}): React.JSX.Element {
  const [sale, setSale] = useState<any>(null);
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    // Initial Fetch
    StorefrontService.getActiveFlashSale(storeId).then(setSale);
  }, [storeId]);

  // Countdown Timer logic
  useEffect(() => {
    if (!sale) return;

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const endTime =
        sale && typeof sale === "object" && "endTime" in sale
          ? (sale as { endTime?: unknown }).endTime
          : undefined;
      const end = new Date(String(endTime ?? "")).getTime();
      const distance = end - now;

      if (distance < 0) {
        setSale(null); // Sale ended
        clearInterval(timer);
        return;
      }

      const hours = Math.floor(
        (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
      );
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
    }, 1000);

    return () => clearInterval(timer);
  }, [sale]);

  if (!sale) return <></>;

  return (
    <div className="bg-gradient-to-r from-red-600 to-orange-600 text-white py-3 px-4 shadow-lg animate-in slide-in-from-top duration-500 relative overflow-hidden">
      {/* Shimmer Effect */}
      <div className="absolute inset-0 bg-white/20 -translate-x-full animate-shimmer" />

      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 relative z-10">
        <div className="flex items-center gap-3">
          <div className="bg-white/20 p-1.5 rounded-full animate-pulse">
            <Zap size={18} className="text-yellow-300 fill-yellow-300" />
          </div>
          <span className="font-bold text-lg tracking-wide uppercase">
            {sale?.name}
          </span>
          <span className="bg-white text-red-600 text-xs font-black px-2 py-0.5 rounded ml-2">
            {sale?.discount}% OFF
          </span>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 font-mono text-lg font-bold bg-black/20 px-3 py-1 rounded-lg">
            <Clock size={16} />
            {timeLeft}
          </div>

          <Link
            href={`/collections/all?store=${sale.storeId}&flash=true`}
            className="text-sm font-bold underline decoration-2 underline-offset-4 hover:text-yellow-200 transition-colors"
          >
            Shop Now
          </Link>
        </div>
      </div>
    </div>
  );
}
