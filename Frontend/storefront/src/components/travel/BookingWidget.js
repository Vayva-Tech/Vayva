"use client";
import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import { useState } from "react";
import { Users } from "lucide-react";
import { Button, Input } from "@vayva/ui";
// Mocking "product" prop for simplicity in this file
import { CheckoutModal } from "@/templates/one-product/components/CheckoutModal"; // Cross-template import
export function BookingWidget({ productId, price, store }) {
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [guests, setGuests] = useState(2);
    const [checking, setChecking] = useState(false);
    const [availability, setAvailability] = useState(null);
    const [showCheckout, setShowCheckout] = useState(false);
    const nights = (startDate && endDate) ? Math.max(1, Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24))) : 1;
    const totalPrice = price * nights;
    const checkAvailability = async () => {
        if (!startDate || !endDate)
            return;
        setChecking(true);
        try {
            const res = await fetch(`/api/bookings/availability?productId=${productId}&start=${startDate}&end=${endDate}`);
            const data = await res.json();
            setAvailability(data);
        }
        catch (e) {
            console.error(e);
        }
        finally {
            setChecking(false);
        }
    };
    return (_jsxs("div", { className: "bg-white p-6 rounded-xl shadow border border-gray-100 sticky top-24", children: [_jsxs("div", { className: "flex justify-between items-baseline mb-6", children: [_jsxs("span", { className: "text-2xl font-bold", children: ["\u20A6", price.toLocaleString()] }), _jsx("span", { className: "text-gray-500 text-sm", children: "/ night" })] }), startDate && endDate && (_jsxs("div", { className: "mb-4 text-sm bg-gray-50 p-2 rounded flex justify-between", children: [_jsxs("span", { children: ["Total (", nights, " nights)"] }), _jsxs("span", { className: "font-bold", children: ["\u20A6", totalPrice.toLocaleString()] })] })), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "grid grid-cols-2 gap-2", children: [_jsxs("div", { children: [_jsx("label", { className: "text-xs font-bold uppercase text-gray-500 block mb-1", children: "Check-in" }), _jsx(Input, { type: "date", value: startDate, onChange: (e) => { setStartDate(e.target.value); setAvailability(null); } })] }), _jsxs("div", { children: [_jsx("label", { className: "text-xs font-bold uppercase text-gray-500 block mb-1", children: "Check-out" }), _jsx(Input, { type: "date", value: endDate, onChange: (e) => { setEndDate(e.target.value); setAvailability(null); } })] })] }), _jsxs("div", { children: [_jsx("label", { className: "text-xs font-bold uppercase text-gray-500 block mb-1", children: "Guests" }), _jsxs("div", { className: "relative", children: [_jsx(Users, { className: "absolute left-3 top-2.5 text-gray-400 w-4 h-4" }), _jsx(Input, { type: "number", min: 1, value: guests, onChange: (e) => setGuests(parseInt(e.target.value)), className: "pl-9" })] })] }), availability !== null && (_jsxs("div", { className: `text-sm p-3 rounded-lg flex items-center gap-2 ${availability.isAvailable ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`, children: [_jsx("div", { className: `w-2 h-2 rounded-full ${availability.isAvailable ? 'bg-green-500' : 'bg-red-500'}` }), availability.isAvailable ? `${availability.available} rooms left!` : "Sold out for these dates."] })), _jsx(Button, { className: "w-full h-12 text-lg font-semibold", onClick: availability?.isAvailable ? () => setShowCheckout(true) : checkAvailability, variant: availability?.isAvailable ? "primary" : "secondary", children: checking ? "Checking..." : availability?.isAvailable ? "Reserve Now" : "Check Availability" }), _jsx(CheckoutModal, { isOpen: showCheckout, onClose: () => setShowCheckout(false), qty: 1, product: {
                            id: productId,
                            name: `Stay: ${startDate} to ${endDate} (${nights} nights)`,
                            price: totalPrice,
                            images: [], // passed from parent ideally, but okay to specific here
                            description: `Booking for ${guests} guests`,
                            storeId: store.id,
                            variants: [], // Required by type
                            isDigital: true
                        } })] })] }));
}
