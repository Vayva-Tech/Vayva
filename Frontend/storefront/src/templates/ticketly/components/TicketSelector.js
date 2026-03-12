import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { Button } from "@vayva/ui";
import { Minus, Plus, Ticket } from "lucide-react";
export const TicketSelector = ({ event, onSelect }) => {
    const [quantities, setQuantities] = useState({});
    const handleQtyChange = (id, delta) => {
        setQuantities((prev) => {
            const current = prev[id] || 0;
            const newVal = Math.max(0, current + delta);
            return { ...prev, [id]: newVal };
        });
    };
    const totalTickets = Object.values(quantities).reduce((a, b) => a + b, 0);
    const totalPrice = (event.eventDetails?.ticketTypes || []).reduce((acc, type) => {
        return acc + type.price * (quantities[type.id] || 0);
    }, 0);
    return (_jsx("div", { id: "tickets", className: "bg-background/70 backdrop-blur-xl py-12 px-6", children: _jsxs("div", { className: "max-w-4xl mx-auto", children: [_jsxs("div", { className: "flex items-center gap-3 mb-8", children: [_jsx("div", { className: "bg-purple-100 text-purple-600 p-3 rounded-xl", children: _jsx(Ticket, { size: 24 }) }), _jsx("h2", { className: "text-2xl font-bold", children: "Select Tickets" })] }), _jsx("div", { className: "space-y-4", children: event.eventDetails?.ticketTypes.map((type) => (_jsxs("div", { className: "border border-gray-200 rounded-xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4", children: [_jsxs("div", { className: "flex-1 text-center sm:text-left", children: [_jsx("h3", { className: "font-bold text-lg", children: type.name }), _jsxs("p", { className: "text-purple-600 font-bold", children: ["\u20A6", type.price.toLocaleString()] }), _jsx("p", { className: "text-xs text-gray-500 mt-1", children: type.capacity && type.capacity < 100
                                            ? "Almost sold out!"
                                            : "Available" })] }), _jsxs("div", { className: "flex items-center gap-4 bg-background/40 backdrop-blur-sm p-2 rounded-lg", children: [_jsx(Button, { onClick: () => handleQtyChange(type.id, -1), className: "w-8 h-8 flex items-center justify-center bg-background/70 backdrop-blur-xl rounded shadow-sm hover:bg-white/60 disabled:opacity-50", disabled: !quantities[type.id], children: _jsx(Minus, { size: 16 }) }), _jsx("span", { className: "font-bold w-6 text-center", children: quantities[type.id] || 0 }), _jsx(Button, { onClick: () => handleQtyChange(type.id, 1), className: "w-8 h-8 flex items-center justify-center bg-background/70 backdrop-blur-xl rounded shadow-sm hover:bg-white/60", children: _jsx(Plus, { size: 16 }) })] })] }, type.id))) }), totalTickets > 0 && (_jsx("div", { className: "fixed bottom-0 left-0 right-0 bg-background/70 backdrop-blur-xl border-t border-gray-100 p-4 shadow-lg md:relative md:shadow-none md:border-t-0 md:bg-transparent md:p-0 md:mt-8 animate-in slide-in-from-bottom duration-300 z-40", children: _jsxs("div", { className: "flex items-center justify-between gap-6 max-w-4xl mx-auto", children: [_jsxs("div", { className: "hidden md:block", children: [_jsx("div", { className: "text-sm text-gray-500", children: "Total" }), _jsxs("div", { className: "text-2xl font-black", children: ["\u20A6", totalPrice.toLocaleString()] })] }), _jsxs(Button, { onClick: () => onSelect("mixed", totalTickets, totalPrice), className: "flex-1 md:flex-none md:w-64 bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-purple-200 transition-colors", children: ["Checkout (\u20A6", totalPrice.toLocaleString(), ")"] })] }) }))] }) }));
};
