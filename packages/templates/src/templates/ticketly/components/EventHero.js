import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Button } from "@vayva/ui";
import { Calendar, MapPin, Share2 } from "lucide-react";
export const EventHero = ({ event, onBuy }) => {
    const eventDate = event.eventDetails
        ? new Date(event.eventDetails.date)
        : new Date();
    return (_jsxs("section", { className: "relative bg-gray-900 text-white overflow-hidden", children: [_jsx("div", { className: "absolute inset-0 opacity-40", children: _jsx("img", { src: event.images?.[0], alt: event.name, className: "w-full h-full object-cover" }) }), _jsx("div", { className: "absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent" }), _jsxs("div", { className: "relative max-w-6xl mx-auto px-6 pt-32 pb-16 md:py-24 flex flex-col md:flex-row items-end md:items-center justify-between gap-8", children: [_jsxs("div", { className: "max-w-2xl", children: [_jsxs("div", { className: "inline-flex items-center gap-2 bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-6", children: [_jsx(Calendar, { size: 14 }), eventDate.toLocaleDateString("en-US", {
                                        weekday: "long",
                                        month: "long",
                                        day: "numeric",
                                    })] }), _jsx("h1", { className: "text-4xl md:text-6xl font-black tracking-tight leading-none mb-6", children: event.name }), _jsxs("div", { className: "flex flex-col sm:flex-row gap-4 text-gray-300 font-medium", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("div", { className: "bg-background/70 backdrop-blur-xl p-2 rounded-full", children: _jsx(MapPin, { size: 18 }) }), event.eventDetails?.venue || "TBA"] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("div", { className: "bg-background/70 backdrop-blur-xl p-2 rounded-full", children: _jsx(Share2, { size: 18 }) }), "Share Event"] })] })] }), _jsxs("div", { className: "hidden md:block bg-background/70 backdrop-blur-xl text-gray-900 p-6 rounded-2xl shadow-xl max-w-sm w-full", children: [_jsx("p", { className: "text-sm font-bold text-gray-500 mb-1", children: "Starting from" }), _jsxs("div", { className: "text-3xl font-black mb-6", children: ["\u20A6", event.price.toLocaleString()] }), _jsx(Button, { onClick: onBuy, className: "w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 rounded-xl text-lg transition-colors shadow-lg shadow-purple-200", children: "Get Tickets" }), _jsx("p", { className: "text-center text-xs text-gray-400 mt-4", children: event.eventDetails?.capacity
                                    ? `${event.eventDetails.capacity - event.eventDetails.ticketsSold} tickets remaining`
                                    : "Limited availability" })] })] })] }));
};
