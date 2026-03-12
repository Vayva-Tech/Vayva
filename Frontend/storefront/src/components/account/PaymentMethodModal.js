"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { LOCALES } from "@/data/locales";
import { X, CreditCard } from "lucide-react";
import { Button } from "@vayva/ui";
export function PaymentMethodModal({ lang, isOpen, onClose, onSave, }) {
    const t = LOCALES[lang].account.payments.form;
    const [holder, setHolder] = useState("");
    const [number, setNumber] = useState("");
    const [expiry, setExpiry] = useState("");
    const [cvv, setCvv] = useState("");
    if (!isOpen)
        return null;
    const handleSubmit = (e) => {
        e.preventDefault();
        // Test: just take last 4 of numeric input
        const numeric = number.replace(/\D/g, "");
        const last4 = numeric.slice(-4) || "1234";
        onSave({
            holder,
            last4,
            expiry,
            isDefault: false,
        });
        // Reset
        setHolder("");
        setNumber("");
        setExpiry("");
        setCvv("");
        onClose();
    };
    return (_jsxs("div", { className: "fixed inset-0 z-50 flex items-center justify-center p-4", children: [_jsx("div", { className: "absolute inset-0 bg-black/40 backdrop-blur-sm", onClick: onClose }), _jsxs("div", { className: "bg-white rounded-3xl w-full max-w-lg relative z-10 shadow-2xl animate-fade-in-up", children: [_jsxs("div", { className: "p-6 border-b border-gray-100 flex items-center justify-between", children: [_jsxs("h2", { className: "text-lg font-bold flex items-center gap-2", children: [_jsx(CreditCard, { size: 20 }), t.title] }), _jsx(Button, { variant: "ghost", size: "icon", onClick: onClose, className: "p-2 hover:bg-gray-100 rounded-full transition-colors h-auto", "aria-label": "Close payment method modal", children: _jsx(X, { size: 20 }) })] }), _jsxs("form", { onSubmit: handleSubmit, className: "p-6 space-y-4", children: [_jsxs("div", { children: [_jsx("label", { htmlFor: "card-holder", className: "block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2", children: t.holder }), _jsx("input", { id: "card-holder", required: true, type: "text", value: holder, onChange: (e) => setHolder(e.target.value), className: "w-full p-3 bg-gray-50 border border-gray-100 rounded-xl" })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "card-number", className: "block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2", children: t.number }), _jsx("input", { id: "card-number", required: true, type: "text", maxLength: 19, placeholder: "0000 0000 0000 0000", value: number, onChange: (e) => setNumber(e.target.value), className: "w-full p-3 bg-gray-50 border border-gray-100 rounded-xl font-mono" })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("label", { htmlFor: "card-expiry", className: "block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2", children: t.expiry }), _jsx("input", { id: "card-expiry", required: true, type: "text", placeholder: "MM/YY", maxLength: 5, value: expiry, onChange: (e) => setExpiry(e.target.value), className: "w-full p-3 bg-gray-50 border border-gray-100 rounded-xl text-center" })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "card-cvv", className: "block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2", children: t.cvv }), _jsx("input", { id: "card-cvv", required: true, type: "password", maxLength: 3, placeholder: "123", value: cvv, onChange: (e) => setCvv(e.target.value), className: "w-full p-3 bg-gray-50 border border-gray-100 rounded-xl text-center" })] })] }), _jsxs("div", { className: "pt-4 flex gap-3", children: [_jsx(Button, { type: "button", variant: "ghost", onClick: onClose, className: "flex-1 py-4 font-bold text-gray-500 hover:bg-gray-50 rounded-xl h-auto", "aria-label": "Cancel", children: t.cancel }), _jsx(Button, { type: "submit", className: "flex-1 py-4 bg-black text-white font-bold rounded-xl hover:bg-gray-900 transition-colors h-auto", "aria-label": "Save payment method", children: t.save })] })] })] })] }));
}
