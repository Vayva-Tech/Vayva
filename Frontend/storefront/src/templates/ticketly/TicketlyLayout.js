import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { Button } from "@vayva/ui";
import { EventHeader } from "./components/EventHeader";
import { EventHero } from "./components/EventHero";
import { TicketSelector } from "./components/TicketSelector";
import { CheckoutOverlay } from "./components/CheckoutOverlay";
import { TicketSuccess } from "./components/TicketSuccess";
export const TicketlyLayout = ({ store, products }) => {
    // For demo, we just pick the first event to show as "Main Event"
    // In real app, this would be an event detail page or a list
    const mainEvent = products[0];
    const [isCheckingOut, setIsCheckingOut] = useState(false);
    const [checkoutData, setCheckoutData] = useState(null);
    const [successData, setSuccessData] = useState(null);
    const handleBuyClick = () => {
        // Scroll to tickets
        document.getElementById("tickets")?.scrollIntoView({ behavior: "smooth" });
    };
    const handleTicketSelect = (id, count, total) => {
        setCheckoutData({ total, count, productId: id });
        setIsCheckingOut(true);
    };
    const handlePaymentComplete = (data) => {
        setIsCheckingOut(false);
        setSuccessData(data);
    };
    if (!mainEvent)
        return _jsx("div", { children: "No events found." });
    return (_jsxs("div", { className: "min-h-screen bg-background/70 backdrop-blur-xl font-sans text-gray-900", children: [_jsx(EventHeader, { storeName: store.name }), _jsxs("main", { children: [_jsx(EventHero, { event: mainEvent, onBuy: handleBuyClick }), _jsx(TicketSelector, { event: mainEvent, onSelect: handleTicketSelect }), _jsx("section", { className: "bg-background/40 backdrop-blur-sm py-16 px-6", children: _jsxs("div", { className: "max-w-6xl mx-auto", children: [_jsxs("h2", { className: "text-2xl font-bold mb-8", children: ["More from ", store.name] }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-6", children: products.slice(1).map((evt) => (_jsxs("div", { className: "bg-background/70 backdrop-blur-xl rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow", children: [_jsx("div", { className: "h-48 bg-gray-200", children: _jsx("img", { src: evt.images?.[0], className: "w-full h-full object-cover" }) }), _jsxs("div", { className: "p-6", children: [_jsx("div", { className: "text-purple-600 text-xs font-bold uppercase tracking-wider mb-2", children: new Date(evt.eventDetails?.date || "").toLocaleDateString() }), _jsx("h3", { className: "font-bold text-lg mb-2", children: evt.name }), _jsx("p", { className: "text-sm text-gray-500 mb-4", children: evt.eventDetails?.venue }), _jsx(Button, { className: "text-sm font-bold border border-gray-200 px-4 py-2 rounded-lg hover:border-purple-600 hover:text-purple-600 transition-colors", children: "See Details" })] })] }, evt.id))) })] }) })] }), _jsx("footer", { className: "bg-gray-900 text-white py-12 px-6", children: _jsxs("div", { className: "max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center opacity-50 text-sm", children: [_jsxs("p", { children: ["\u00A9 ", new Date().getFullYear(), " ", store.name, ". Powered by Ticketly."] }), _jsxs("div", { className: "flex gap-4 mt-4 md:mt-0", children: [_jsx("span", { children: "Terms" }), _jsx("span", { children: "Privacy" })] })] }) }), isCheckingOut && checkoutData && (_jsx(CheckoutOverlay, { total: checkoutData.total, count: checkoutData.count, storeId: store.id, productId: checkoutData.productId, onClose: () => setIsCheckingOut(false), onComplete: handlePaymentComplete })), successData && (_jsx(TicketSuccess, { event: mainEvent, attendee: successData.attendee, bankDetails: successData.bankDetails, storeName: successData.storeName, orderNumber: successData.orderNumber, onClose: () => setSuccessData(null) }))] }));
};
