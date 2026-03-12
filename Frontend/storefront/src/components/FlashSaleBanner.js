"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { StorefrontService } from "@/services/storefront.service";
import { Zap, Clock } from "lucide-react";
import Link from "next/link";
export function FlashSaleBanner({ storeId }) {
    const [sale, setSale] = useState(null);
    const [timeLeft, setTimeLeft] = useState("");
    useEffect(() => {
        // Initial Fetch
        StorefrontService.getActiveFlashSale(storeId).then(setSale);
    }, [storeId]);
    // Countdown Timer logic
    useEffect(() => {
        if (!sale)
            return;
        const timer = setInterval(() => {
            const now = new Date().getTime();
            const end = new Date(sale.endTime).getTime();
            const distance = end - now;
            if (distance < 0) {
                setSale(null); // Sale ended
                clearInterval(timer);
                return;
            }
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);
            setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
        }, 1000);
        return () => clearInterval(timer);
    }, [sale]);
    if (!sale)
        return null;
    return (_jsxs("div", { className: "bg-gradient-to-r from-red-600 to-orange-600 text-white py-3 px-4 shadow-lg animate-in slide-in-from-top duration-500 relative overflow-hidden", children: [_jsx("div", { className: "absolute inset-0 bg-white/20 -translate-x-full animate-shimmer" }), _jsxs("div", { className: "max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 relative z-10", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "bg-white/20 p-1.5 rounded-full animate-pulse", children: _jsx(Zap, { size: 18, className: "text-yellow-300 fill-yellow-300" }) }), _jsx("span", { className: "font-bold text-lg tracking-wide uppercase", children: sale.name }), _jsxs("span", { className: "bg-white text-red-600 text-xs font-black px-2 py-0.5 rounded ml-2", children: [sale.discount, "% OFF"] })] }), _jsxs("div", { className: "flex items-center gap-4", children: [_jsxs("div", { className: "flex items-center gap-2 font-mono text-lg font-bold bg-black/20 px-3 py-1 rounded-lg", children: [_jsx(Clock, { size: 16 }), timeLeft] }), _jsx(Link, { href: `/collections/all?store=${sale.storeId}&flash=true`, className: "text-sm font-bold underline decoration-2 underline-offset-4 hover:text-yellow-200 transition-colors", children: "Shop Now" })] })] })] }));
}
