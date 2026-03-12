"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { useStore } from "@/context/StoreContext";
import { Clock, MapPin } from "lucide-react";
import { Button } from "@vayva/ui";
export function ServicePDP({ product }) {
    const { addToCart } = useStore(); // In reality, this would likely go to a Booking Flow, not Cart
    const [date, setDate] = useState(new Date());
    const metadata = product.metadata;
    // Mock booking handler
    const handleBookNow = () => {
        alert(`Booking initiated for ${product.name} on ${date?.toDateString()}`);
        // Here we would integrate with the booking API
    };
    return (_jsxs("div", { className: "max-w-4xl mx-auto grid md:grid-cols-3 gap-8", children: [_jsxs("div", { className: "md:col-span-2 space-y-6", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-3xl font-bold text-gray-900", children: product.name }), _jsxs("div", { className: "flex items-center gap-4 text-gray-500 mt-2", children: [metadata?.durationMinutes && (_jsxs("span", { className: "flex items-center gap-1", children: [_jsx(Clock, { className: "w-4 h-4" }), " ", metadata.durationMinutes, " mins"] })), metadata?.location && (_jsxs("span", { className: "flex items-center gap-1", children: [_jsx(MapPin, { className: "w-4 h-4" }), " ", metadata.location.replace("_", " ")] }))] })] }), _jsxs("div", { className: "prose text-gray-600 border-t pt-6", children: [_jsx("h3", { className: "text-lg font-semibold text-gray-900 mb-2", children: "About this service" }), _jsx("p", { children: product.description })] })] }), _jsx("div", { className: "md:col-span-1", children: _jsxs("div", { className: "border rounded-xl p-6 shadow-sm sticky top-24", children: [_jsxs("div", { className: "text-2xl font-bold mb-4", children: ["\u20A6", product.price.toLocaleString()] }), _jsxs("div", { className: "space-y-4", children: [_jsx("label", { htmlFor: "service-booking-date", className: "text-sm font-medium", children: "Select Date" }), _jsx("div", { className: "border rounded-md p-2", children: _jsx("input", { id: "service-booking-date", type: "date", className: "w-full text-sm outline-none", onChange: (e) => setDate(new Date(e.target.value)) }) }), _jsx(Button, { onClick: handleBookNow, className: "w-full bg-gray-900 text-white py-3 rounded-lg font-bold hover:bg-gray-800 transition-colors h-auto", "aria-label": "Book appointment", children: "Book Appointment" }), _jsx("p", { className: "text-xs text-center text-gray-500", children: "No payment required today" })] })] }) })] }));
}
